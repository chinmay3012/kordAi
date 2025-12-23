import { chromium } from "playwright";
import Job from "../models/Job.js";

const YC_JOBS_URL = "https://www.ycombinator.com/jobs";

export async function scrapeYCJobs() {
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(YC_JOBS_URL, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    // wait for job cards to render
    await page.waitForTimeout(3000);

    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll("a[href^='/jobs/']");
      const results = [];

      jobCards.forEach(card => {
        const title = card.querySelector("h3")?.innerText;
        const company = card.querySelector("p")?.innerText;
        const location = card.querySelector("span")?.innerText;
        const link = "https://www.ycombinator.com" + card.getAttribute("href");

        if (title && company) {
          results.push({
            title,
            company: { name: company },
            location,
            applyUrl: link,
            source: "ycombinator",
            status: "active"
          });
        }
      });

      return results;
    });

    // Enrich with slogan and about from JSON if available
    let companyData = [];
    try {
      const fs = await import("fs");
      const path = await import("path");
      const jsonPath = path.join(process.cwd(), "data", "yc_companies_clean.json");
      if (fs.existsSync(jsonPath)) {
        companyData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      }
    } catch (e) {
      console.warn("Could not load yc_companies_clean.json for enrichment");
    }

    let savedCount = 0;

    for (const job of jobs) {
      // Find matching company in JSON
      const enriched = companyData.find(c => c.company?.name === job.company.name);
      if (enriched) {
        job.company.slogan = enriched.company.slogan;
        job.company.about = enriched.company.about;
        if (!job.founders || job.founders.length === 0) {
          job.founders = enriched.founders;
        }
      }

      const res = await Job.updateOne(
        { title: job.title, "company.name": job.company.name },
        { $set: job },
        { upsert: true }
      );

      if (res.upsertedCount || res.modifiedCount) {
        savedCount++;
      }
    }

    console.log(`✅ Scraped and enriched ${savedCount} YC jobs`);
  } catch (err) {
    console.error("❌ YC Scraper Error:", err);
  } finally {
    if (browser) await browser.close();
  }
}
