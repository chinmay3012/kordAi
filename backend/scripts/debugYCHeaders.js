import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPath = path.join(__dirname, "../data/yc_companies_raw.json");

const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

console.log("🔑 Keys in first row:\n");
console.log(Object.keys(raw[0]));
