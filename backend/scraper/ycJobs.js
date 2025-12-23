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

    let savedCount = 0;

    for (const job of jobs) {
      const res = await Job.updateOne(
        { title: job.title, "company.name": job.company.name },
        { $set: job },
        { upsert: true }
      );

      if (res.upsertedCount || res.modifiedCount) {
        savedCount++;
      }
    }

    console.log(`✅ Scraped ${savedCount} YC jobs`);
  } catch (err) {
    console.error("❌ YC Scraper Error:", err);
  } finally {
    if (browser) await browser.close();
  }
}
