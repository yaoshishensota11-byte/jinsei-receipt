// Xなどでリンクを共有したときのプレビュー画像（1200×630）を public/og.png に作る。
// 見本の人生のレシートを r.html で描き、タイトルと並べて撮影する。
// 使い方: npx vite --port 5199 を起動してから node scripts/ogimage.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:5199";
const SAMPLE = "6.j.og2.111301011103200120000101011101210011100111101";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto(`${BASE}/r.html#${SAMPLE}`);
await p.waitForSelector("canvas#receipt");
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
const receipt = await p.evaluate(() => document.querySelector("canvas#receipt").toDataURL("image/png"));
// 同じページの中で組み直す（Webフォントが読み込まれたまま使える）
await p.evaluate((src) => {
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
      html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #f3efe6; }
      .og { position: relative; width: 1200px; height: 630px; font-family: "BIZ UDGothic", sans-serif; color: #2b2b2b; }
      .og .copy { position: absolute; left: 72px; top: 140px; width: 620px; }
      .og h1 { font-size: 80px; margin: 0 0 28px; letter-spacing: 0.02em; white-space: nowrap; }
      .og p { font-size: 38px; line-height: 1.45; margin: 0 0 24px; color: #8b1a1a; font-weight: 700; }
      .og small { font-size: 26px; color: #6b6b6b; line-height: 1.6; display: block; }
      .og img { position: absolute; right: 90px; top: 40px; width: 400px; transform: rotate(4deg); box-shadow: 0 12px 40px rgba(0,0,0,.18); }
    </style>`,
  );
  document.body.innerHTML = `<div class="og">
    <div class="copy"><h1>人生のレシート</h1><p>同じ一生でも、生まれた国で<br>稼げるお金はどれだけ違う？</p>
    <small>生まれる国から始まる、<br>一生ぶんのお金のシミュレーション</small></div>
    <img src="${src}" alt="">
  </div>`;
}, receipt);
await p.waitForTimeout(300);
await p.screenshot({ path: "public/og.png" });
await b.close();
console.log("public/og.png を書き出しました");
