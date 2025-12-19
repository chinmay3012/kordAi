import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import rateLimit from "express-rate-limit";

import { connectDB, getConnectionStatus } from "./db.js";
import waitlistRoute from "./routes/waitlist.js";
import jobsRoute from "./routes/jobs.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import { scrapeRemoteOkJobs } from "./scraper/remoteOkJobs.js";

// --------------------
// ENV SETUP
// --------------------
dotenv.config();

// --------------------
// APP INIT
// --------------------
const app = express();

// --------------------
// CORS CONFIGURATION
// --------------------
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://joinkord.onrender.com",
    process.env.FRONTEND_URL, // Allow configurable frontend URL
  ].filter(Boolean), // Remove undefined values

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization", // CRITICAL: Allow Authorization header for JWT
    "X-Requested-With",
    "Accept",
  ],

  exposedHeaders: [
    "X-Total-Count", // For pagination
    "X-Page",
    "X-Limit",
  ],

  credentials: true, // Allow cookies if needed

  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// --------------------
// BODY PARSER
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------
// RATE LIMITING
// --------------------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit auth attempts
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const jobsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting
app.use(generalLimiter);

// --------------------
// REQUEST LOGGING (Development)
// --------------------
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// --------------------
// ROUTES
// --------------------
app.use("/auth", authLimiter, authRoutes);
app.use("/api/v1/waitlist", waitlistRoute);
app.use("/api/v1/jobs", jobsLimiter, jobsRoute);
app.use("/api/v1/resume", jobsLimiter, resumeRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Kord AI API",
    version: "1.0.0",
    status: "running",
    docs: "/api/v1/docs",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = getConnectionStatus();

  res.json({
    status: dbStatus.isConnected ? "healthy" : "degraded",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.readyStateLabel,
      name: dbStatus.database,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  });
});

// Database status endpoint
app.get("/api/v1/status", (req, res) => {
  res.json(getConnectionStatus());
});

// --------------------
// 404 HANDLER
// --------------------
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal Server Error"
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// STARTUP
// --------------------
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const PORT = process.env.PORT || 7070;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("📴 HTTP server closed");
        await mongoose.disconnect();
        console.log("📴 Database connection closed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("⚠️ Could not close connections in time, forcing shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Start background tasks
    startBackgroundTasks();

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// --------------------
// BACKGROUND TASKS
// --------------------
function startBackgroundTasks() {
  // Initial scrape on startup (delayed by 5 seconds)
  setTimeout(async () => {
    console.log("🕷️ Running initial RemoteOK fetch...");
    try {
      await scrapeRemoteOkJobs();
    } catch (err) {
      console.error("❌ Initial scrape failed:", err.message);
    }
  }, 5000);

  // Scheduled scrape every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("⏰ Scheduled RemoteOK fetch...");
    try {
      await scrapeRemoteOkJobs();
    } catch (err) {
      console.error("❌ Scheduled scrape failed:", err.message);
    }
  });

  // Cleanup expired jobs daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("🧹 Running daily cleanup...");
    try {
      const Job = mongoose.model("Job");
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const result = await Job.updateMany(
        { scrapedAt: { $lt: sixtyDaysAgo }, status: "active" },
        { $set: { status: "expired" } }
      );

      console.log(`🧹 Marked ${result.modifiedCount} old jobs as expired`);
    } catch (err) {
      console.error("❌ Cleanup failed:", err.message);
    }
  });

  console.log("📅 Background tasks scheduled");
}

// --------------------
// PROCESS SAFETY
// --------------------
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// Start the server
startServer();
