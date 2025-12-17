import axios from "axios";
import Job from "../models/Job.js";
import { fetchYCCompany } from "../services/fetchYCCompany.js";


const REMOTE_OK_API = "https://remoteok.com/api";

export async function scrapeRemoteOkJobs() {
  try {
    console.log("🌍 Fetching RemoteOK jobs...");

    const response = await axios.get(REMOTE_OK_API, {
      headers: {
        "User-Agent": "Foundwell/1.0",
      },
      timeout: 20000,
    });

    const data = response.data;

    // First item is metadata, skip it
    const jobs = data.slice(1);

    let saved = 0;

    for (const job of jobs) {
      if (!job.position || !job.company) continue;

      const jobData = {
        title: job.position,
        company: job.company,
        location: job.location || "Remote",
        applyUrl: job.url,
        source: "RemoteOK",
        tags: job.tags || [],
        salary: job.salary || "",
      };

      const res = await Job.updateOne(
        {
          title: jobData.title,
          company: jobData.company,
          applyUrl: jobData.applyUrl,
        },
        { $set: jobData },
        { upsert: true }
      );

      if (res.upsertedCount || res.modifiedCount) {
        saved++;
      }
    }

    console.log(`✅ Saved ${saved} RemoteOK jobs`);
  } catch (err) {
    console.error("❌ RemoteOK fetch error:", err.message);
  }
}
