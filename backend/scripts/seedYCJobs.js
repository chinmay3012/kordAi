import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Job from "../models/Job.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "../data/yc_companies_clean.json");

if (!fs.existsSync(dataPath)) {
  console.error("❌ yc_companies_clean.json not found");
  process.exit(1);
}

const ycCompanies = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  // delete ONLY old YC jobs (safe)
  await Job.deleteMany({ source: "ycombinator" });
  console.log("🧹 Old YC jobs removed");

  const jobs = ycCompanies.map(c => {
    const ycSlug = c.company?.yc_url
      ? c.company.yc_url.split("/companies/")[1]
      : null;

    return {
      source: "ycombinator",
      title: "Hiring at YC startup",
      company: c.company.name,
      companyDescription: c.company.about,
      applyUrl: c.apply.url,
      salary: c.meta?.salary || null,
      ycSlug,
      founders: c.founders.map(f => ({
        name: f.name,
        linkedin: f.social || null,
      })),
      scrapedAt: new Date(),
    };
  });

  await Job.insertMany(jobs, { ordered: false });
  console.log(`🚀 Inserted ${jobs.length} YC jobs`);

  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding error:", err.message);
  process.exit(1);
});
