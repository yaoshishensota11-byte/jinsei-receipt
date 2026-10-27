// 紹介ページの「こんな人生が、ありました。」のレシート画像（public/lp/img/g-*.webp）を、gallery.json のURLから作り直す。
// 使い方: npx vite --port 5199 を起動してから node scripts/lpgalleryimg.mjs（共有URLの版を上げたら、lpgallery.ts のあとに実行）
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = process.env.BASE ?? "http://localhost:5199";
const gallery = JSON.parse(readFileSync("public/lp/gallery.json", "utf8"));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
for (const g of gallery) {
  await p.goto(`${BASE}/r.html#${g.code}`);
  await p.waitForSelector("canvas#receipt");
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const png = await p.evaluate(() => document.querySelector("canvas#receipt").toDataURL("image/png"));
  const tmp = `public/lp/img/_g.png`;
  writeFileSync(tmp, Buffer.from(png.split(",")[1], "base64"));
  // 幅560にそろえて、上から700の高さで切る（レシートの頭の部分を見せる）
  execFileSync("python3", ["-I", "-c", `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
im = im.resize((560, round(im.height * 560 / im.width)), Image.LANCZOS).crop((0, 0, 560, 700))
im.save(sys.argv[2], "WEBP", quality=82, method=6)
`, tmp, `public/lp/img/g-${g.key}.webp`]);
  execFileSync("rm", [tmp]);
  console.log("g-" + g.key);
}
await b.close();
