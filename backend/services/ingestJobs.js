import Job from "../models/Job.js";

export async function ingestJobs(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return;

  try {
    await Job.insertMany(jobs, { ordered: false });
    console.log(`✅ Ingested ${jobs.length} jobs`);
  } catch (err) {
    console.error("⚠️ Partial ingest (duplicates skipped)");
  }
}
