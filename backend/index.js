import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import waitlistRoute from "./routes/waitlist.js";


// import { scrapeYCJobs } from "./scraper/ycJobs.js";
// import { scrapeCutshortJobs } from "./scraper/cutshortJobs.js";

import { scrapeRemoteOkJobs } from "./scraper/remoteOkJobs.js";
import jobsRoute from "./routes/jobs.js";

import Job from "./models/Job.js";
import rateLimit from "express-rate-limit";

// --------------------
// ENV SETUP
// --------------------
dotenv.config();

// --------------------
// APP INIT
// --------------------
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());
app.use("/api/v1/waitlist", waitlistRoute);

const jobsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 60, // 60 req/min per IP
  });


  app.use("/api/v1/jobs", jobsLimiter, jobsRoute);




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
// ROUTES
// --------------------
app.get("/", (req, res) => {
  res.send("Foundwell backend running 🚀");
});

// Quick DB sanity test
app.get("/test-job", async (req, res) => {
  const job = await Job.create({
    title: "Test Job",
    company: "Foundwell",
    location: "Remote",
    applyUrl: "https://example.com",
    source: "Test"
  });

  res.json(job);
});

// --------------------
// SCRAPER BOOTSTRAP
// --------------------
(async () => {
    console.log("🕷️ Running RemoteOK ingestor...");
    await scrapeRemoteOkJobs();
  })();
  
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("⏰ Scheduled RemoteOK fetch...");
    await scrapeRemoteOkJobs();
  });
  
app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  });
  

// --------------------
// SERVER START
// --------------------
const PORT = process.env.PORT || 7070;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
  });
  
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });
  