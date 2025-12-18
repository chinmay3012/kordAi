import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPath = path.join(__dirname, "../data/yc_companies_raw.json");
const cleanPath = path.join(__dirname, "../data/yc_companies_clean.json");

if (!fs.existsSync(rawPath)) {
  console.error("❌ yc_companies_raw.json not found");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

const companyMap = {};

for (const row of raw) {
  const companyName = row.name?.trim();
  if (!companyName) continue;

  const key = companyName.toLowerCase();

  if (!companyMap[key]) {
    companyMap[key] = {
      source: "ycombinator",
      company: {
        name: companyName,
        slogan: row.slogan || null,
        about: row.About || null,
        website: row.website || null,
        yc_url: row.link || null,
      },
      founders: [],
      apply: {
        url: row.Job || null,
      },
      meta: {
        job_name: row.job_name || null,
        salary: row.salary || null,
      },
      createdAt: new Date(),
    };
  }

  // add founder
  if (row.founder_name) {
    companyMap[key].founders.push({
      name: row.founder_name,
      social: row.founders_linkedIn || null,
    });
  }
}

// 🔥 Deduplicate founders
for (const key in companyMap) {
  companyMap[key].founders = [
    ...new Map(
      companyMap[key].founders.map(f => [f.name.toLowerCase(), f])
    ).values(),
  ];
}

const cleaned = Object.values(companyMap);

fs.writeFileSync(cleanPath, JSON.stringify(cleaned, null, 2));

console.log(`✅ Normalized ${cleaned.length} YC companies`);
