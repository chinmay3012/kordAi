import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import rateLimit from "express-rate-limit";

import waitlistRoute from "./routes/waitlist.js";
import jobsRoute from "./routes/jobs.js";
import Job from "./models/Job.js";
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
// CORS (FIXED FOR PROD)
// --------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // local dev
      "https://joinkord.onrender.com",  // live frontend
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Handle preflight requests
app.options("*", cors());

// --------------------
// BODY PARSER
// --------------------
app.use(express.json());

// --------------------
// RATE LIMITING
// --------------------
const jobsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

// --------------------
// ROUTES
// --------------------
app.use("/api/v1/waitlist", waitlistRoute);
app.use("/api/v1/jobs", jobsLimiter, jobsRoute);

app.get("/", (req, res) => {
  res.send("Kord AI backend running 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// --------------------
// MONGODB CONNECTION
// --------------------
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

await connectDB();

// --------------------
// SCRAPER BOOTSTRAP
// --------------------
(async () => {
  console.log("🕷️ Running RemoteOK ingestor...");
  await scrapeRemoteOkJobs();
})();

cron.schedule("0 */6 * * *", async () => {
  console.log("⏰ Scheduled RemoteOK fetch...");
  await scrapeRemoteOkJobs();
});

// --------------------
// SERVER START
// --------------------
const PORT = process.env.PORT || 7070;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// --------------------
// PROCESS SAFETY
// --------------------
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});
