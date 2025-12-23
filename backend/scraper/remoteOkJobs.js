import axios from "axios";
import Job from "../models/Job.js";

const REMOTE_OK_API = "https://remoteok.com/api";

/**
 * Parse salary string into structured format
 */
function parseSalary(salaryStr) {
  if (!salaryStr) return null;

  const result = {
    displayText: salaryStr,
    currency: "USD",
    period: "yearly",
  };

  // Try to extract numbers
  const numbers = salaryStr.match(/[\d,]+/g);
  if (numbers && numbers.length >= 1) {
    result.min = parseInt(numbers[0].replace(/,/g, ""), 10);
    if (numbers.length >= 2) {
      result.max = parseInt(numbers[1].replace(/,/g, ""), 10);
    }
  }

  return result;
}

/**
 * Determine experience level from tags and title
 */
function determineExperienceLevel(title, tags = []) {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());

  if (lowerTitle.includes("intern") || lowerTags.includes("intern")) {
    return "intern";
  }
  if (lowerTitle.includes("junior") || lowerTitle.includes("entry") || lowerTags.includes("junior")) {
    return "entry";
  }
  if (lowerTitle.includes("senior") || lowerTitle.includes("sr.") || lowerTags.includes("senior")) {
    return "senior";
  }
  if (lowerTitle.includes("lead") || lowerTitle.includes("principal") || lowerTags.includes("lead")) {
    return "lead";
  }
  if (lowerTitle.includes("vp") || lowerTitle.includes("director") || lowerTitle.includes("head of")) {
    return "executive";
  }

  return "mid"; // Default to mid-level
}

/**
 * Determine location type from location string
 */
function determineLocationType(location) {
  if (!location) return "remote";

  const lower = location.toLowerCase();

  if (lower.includes("hybrid")) return "hybrid";
  if (lower.includes("onsite") || lower.includes("on-site") || lower.includes("office")) return "onsite";

  return "remote";
}

/**
 * Scrape jobs from RemoteOK API
 */
export async function scrapeRemoteOkJobs() {
  try {
    console.log("🌍 Fetching RemoteOK jobs matches - DISABLED by user request");
    return { saved: 0, updated: 0, errors: 0 };

    const response = await axios.get(REMOTE_OK_API, {
      headers: {
        "User-Agent": "KordAI/1.0 (job aggregator)",
        "Accept": "application/json",
      },
      timeout: 30000,
    });

    const data = response.data;

    // First item is metadata, skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];

    if (jobs.length === 0) {
      console.log("⚠️ No jobs returned from RemoteOK API");
      return { saved: 0, updated: 0, errors: 0 };
    }

    let saved = 0;
    let updated = 0;
    let errors = 0;

    for (const job of jobs) {
      if (!job.position || !job.company) {
        continue;
      }

      try {
        const jobData = {
          title: job.position,

          // Company information
          company: {
            name: job.company,
            logo: job.company_logo || null,
            website: job.url ? new URL(job.url).origin : null,
          },
          companyName: job.company, // Legacy field

          // Location
          location: job.location || "Remote",
          locationType: determineLocationType(job.location),

          // Job details
          type: "full-time",
          experienceLevel: determineExperienceLevel(job.position, job.tags),

          // Salary
          salary: parseSalary(job.salary),
          salaryText: job.salary || "",

          // Tags and skills
          tags: (job.tags || []).map(t => t.toLowerCase().trim()),
          skills: job.tags || [],

          // Application
          applyUrl: job.url || job.apply_url,

          // Source tracking
          source: "RemoteOK",
          sourceId: job.id?.toString(),
          sourceUrl: job.url,

          // Dates
          scrapedAt: new Date(),
          postedAt: job.date ? new Date(job.date) : null,

          // Status
          status: "active",
        };

        // Use upsert to avoid duplicates
        const result = await Job.updateOne(
          {
            $or: [
              { sourceId: jobData.sourceId, source: "RemoteOK" },
              { title: jobData.title, companyName: jobData.companyName, applyUrl: jobData.applyUrl },
            ],
          },
          {
            $set: jobData,
            $setOnInsert: {
              metrics: { views: 0, likes: 0, applications: 0, shares: 0 },
            },
          },
          { upsert: true }
        );

        if (result.upsertedCount) {
          saved++;
        } else if (result.modifiedCount) {
          updated++;
        }
      } catch (jobErr) {
        errors++;
        if (jobErr.code !== 11000) { // Ignore duplicate key errors
          console.error(`❌ Error processing job "${job.position}":`, jobErr.message);
        }
      }
    }

    console.log(`✅ RemoteOK sync complete: ${saved} new, ${updated} updated, ${errors} errors`);
    return { saved, updated, errors };

  } catch (err) {
    console.error("❌ RemoteOK fetch error:", err.message);
    throw err;
  }
}

/**
 * Get scraper status
 */
export function getScraperStatus() {
  return {
    source: "RemoteOK",
    apiUrl: REMOTE_OK_API,
    schedule: "Every 6 hours",
  };
}
