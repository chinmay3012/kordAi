import { chromium } from "playwright";
import Job from "../models/Job.js";

const SEARCH_URLS = [
  {
    keyword: "backend",
    url: "https://cutshort.io/search-jobs?free_text=backend",
  },
  {
    keyword: "frontend",
    url: "https://cutshort.io/search-jobs?free_text=frontend+engineers",
  },
  {
    keyword: "fullstack",
    url: "https://cutshort.io/search-jobs?free_text=full-stack-developer",
  },
  {
    keyword: "data",
    url: "https://cutshort.io/search-jobs?free_text=data-scientist",
  },
];

export async function scrapeCutshortJobs() {
  let browser;
  let totalSaved = 0;

  try {
    browser = await chromium.launch({
      headless: false, // keep visible for debugging
      slowMo: 50,
    });

    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    });

    for (const source of SEARCH_URLS) {
      console.log(`🕷️ Scraping Cutshort: ${source.keyword}`);

      await page.goto(source.url, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });

      // let jobs render
      await page.waitForTimeout(5000);

      const jobs = await page.evaluate(() => {
        const results = [];
        const cards = document.querySelectorAll("a[href^='/job/']");

        cards.forEach(card => {
          const title =
            card.querySelector("h2")?.innerText ||
            card.querySelector("h3")?.innerText;

          const company =
            card.querySelector(".company-name")?.innerText ||
            card.querySelector("p")?.innerText;

          const location =
            card.querySelector(".location")?.innerText || "";

          const href = card.getAttribute("href");

          if (title && company && href) {
            results.push({
              title: title.trim(),
              company: company.trim(),
              location: location.trim(),
              applyUrl: "https://cutshort.io" + href,
              source: "Cutshort",
            });
          }
        });

        return results;
      });

      console.log(`🔍 Found ${jobs.length} jobs for ${source.keyword}`);

      for (const job of jobs) {
        const res = await Job.updateOne(
          {
            title: job.title,
            company: job.company,
            applyUrl: job.applyUrl,
          },
          { $set: job },
          { upsert: true }
        );

        if (res.upsertedCount || res.modifiedCount) {
          totalSaved++;
        }
      }
    }

    console.log(`✅ Total Cutshort jobs saved: ${totalSaved}`);
  } catch (err) {
    console.error("❌ Cutshort scraper error:", err);
  } finally {
    if (browser) await browser.close();
  }
}
