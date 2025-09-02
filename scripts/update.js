// scripts/update.js
// 日本郵便のCSVをダウンロードしてJSONに変換するスクリプト

const https = require("https");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const iconv = require("iconv-lite");
const parse = require("csv-parse/sync");

const URL = "https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip";
const OUTPUT_DIR = path.join(__dirname, "..", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "postcodes.json");

// ダウンロード
function downloadZip(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => resolve(Buffer.concat(data)));
      res.on("error", reject);
    });
  });
}

(async () => {
  try {
    console.log("📥 郵便番号データをダウンロード中...");
    const buffer = await downloadZip(URL);

    console.log("📂 ZIPを展開中...");
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    // CSVは1ファイルだけ（KEN_ALL.CSV）
    const csvEntry = entries.find((e) => e.entryName.toLowerCase().endsWith(".csv"));
    const csvBuffer = csvEntry.getData();
    const csvText = iconv.decode(csvBuffer, "Shift_JIS");

    console.log("📝 CSVを解析中...");
    const records = parse.parse(csvText);

    // 郵便番号 + 住所（漢字 & カナ）を抽出
    const postcodes = records.map((r) => ({
      zip: r[2],          // 郵便番号（7桁）
      pref: r[6],         // 都道府県（漢字）
      city: r[7],         // 市区町村（漢字）
      town: r[8],         // 町域（漢字）
      prefKana: r[3],     // 都道府県（カナ）
      cityKana: r[4],     // 市区町村（カナ）
      townKana: r[5],     // 町域（カナ）
    })).filter((r) => r.zip);

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(postcodes, null, 2));

    console.log(`✅ ${postcodes.length} 件の郵便番号を保存しました → ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("❌ エラー:", err);
    process.exit(1);
  }
})();
