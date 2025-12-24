import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./services/googleAuth.service.js";

import { connectDB, getConnectionStatus } from "./db.js";
import waitlistRoute from "./routes/waitlist.js";
import jobsRoute from "./routes/jobs.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import emailTrackerRoute from "./routes/emailTracker.js";
import multiResumesRoute from "./routes/resumes.js";
import { scrapeRemoteOkJobs } from "./scraper/remoteOkJobs.js";

// --------------------
// ENV SETUP
// --------------------
dotenv.config();

// --------------------
// APP INIT
// --------------------
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// CORS CONFIGURATION (FIXED)
// --------------------
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://joinkord.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  maxAge: 86400,
};

// CRITICAL: Enable CORS + PREFLIGHT
app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// --------------------
// COOKIE & SESSION
// --------------------
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "kord_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// --------------------
// PASSPORT INIT
// --------------------
app.use(passport.initialize());
app.use(passport.session());



// --------------------
// BODY PARSER
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------
// RATE LIMITING
// --------------------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts." },
  standardHeaders: true,
  legacyHeaders: false,
});

const jobsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// --------------------
// REQUEST LOGGING (DEV)
// --------------------
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// --------------------
// ROUTES (VERSIONED)
// --------------------
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/waitlist", waitlistRoute);
app.use("/api/v1/jobs", jobsLimiter, jobsRoute);
app.use("/api/v1/resume", jobsLimiter, resumeRoutes);
app.use("/api/v1/email-tracker", jobsLimiter, emailTrackerRoute);
app.use("/api/v1/resumes", jobsLimiter, multiResumesRoute);

// API ROOT
app.get("/api/v1", (req, res) => {
  res.json({
    name: "Kord AI API",
    version: "1.0.0",
    status: "running",
  });
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: dbStatus.isConnected ? "healthy" : "degraded",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// --------------------
// STATIC FRONTEND (OPTIONAL)
// --------------------
const possibleFrontendPaths = [
  path.join(__dirname, "../frontend/dist"),
  path.join(process.cwd(), "frontend/dist"),
  path.join(process.cwd(), "dist"),
];

let frontendDistPath = null;

for (const p of possibleFrontendPaths) {
  if (fs.existsSync(path.join(p, "index.html"))) {
    frontendDistPath = p;
    break;
  }
}

if (frontendDistPath) {
  console.log(`📦 Serving frontend from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
}

// SPA Fallback: always serve index.html for non-API routes
// Note: In Express 5, '*' is no longer supported. Use /(.*)/ instead.
app.get(/(.*)/, (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") {
    return next();
  }

  if (frontendDistPath && fs.existsSync(path.join(frontendDistPath, "index.html"))) {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  } else {
    res.status(404).send(`
      <h1>Backend Connected</h1>
      <p>Frontend build not found.</p>
      <p>1. If developing locally, use <code>npm run dev</code> in the frontend folder.</p>
      <p>2. If testing production, run <code>npm run build</code> in the frontend folder first.</p>
    `);
  }
});

// --------------------
// 404 HANDLER
// --------------------
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.statusCode || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// --------------------
// START SERVER
// --------------------
async function startServer() {
  await connectDB();

  const PORT = process.env.PORT || 7070;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  startBackgroundTasks();
}

// --------------------
// BACKGROUND TASKS
// --------------------
function startBackgroundTasks() {
  setTimeout(async () => {
    try {
      await scrapeRemoteOkJobs();
      console.log("🕷️ Initial scrape complete");
    } catch (err) {
      console.error("❌ Scrape failed:", err.message);
    }
  }, 5000);

  cron.schedule("0 */6 * * *", scrapeRemoteOkJobs);
}

startServer();
