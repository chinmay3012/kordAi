import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");

// find first CSV file in data folder
const csvFile = fs
  .readdirSync(dataDir)
  .find(file => file.endsWith(".csv"));

if (!csvFile) {
  console.error("❌ No CSV file found in /data");
  process.exit(1);
}

const csvPath = path.join(dataDir, csvFile);
console.log("📄 Using CSV file:", csvFile);

const results = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    fs.writeFileSync(
      path.join(dataDir, "yc_companies_raw.json"),
      JSON.stringify(results, null, 2)
    );
    console.log("✅ CSV → JSON conversion done");
  });
