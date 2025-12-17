import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchYCCompany(slug) {
  try {
    const url = `https://www.ycombinator.com/companies/${slug}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);
    const founders = [];

    // YC founder cards
    $("section").find("h3").each((_, el) => {
      const name = $(el).text().trim();
      const bio = $(el).next("p").text().trim();

      if (name && bio) {
        founders.push({
          name,
          role: "Founder",
          bio,
          linkedin: null
        });
      }
    });

    return founders;
  } catch (err) {
    console.error("YC fetch failed:", slug);
    return [];
  }
}
