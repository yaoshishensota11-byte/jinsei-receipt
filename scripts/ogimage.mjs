// Xなどでリンクを共有したときのプレビュー画像（1200×630）を作る。
// ゲーム・結果ページ用の public/og.png と、紹介ページ用の public/lp/og.png に同じ画像を書き出す。
// 紹介ページと同じ見た目（レジから出てくるレシート、問いかけ、ドット絵の人）にそろえる。
// 使い方: npx vite --port 5199 を起動してから node scripts/ogimage.mjs（先に scripts/lpassets.mjs で画像を作っておく）
import { copyFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:5199";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// 紹介ページを開いて、Webフォント（BIZ UDゴシック・DotGothic16）を読み込んだまま組み直す
await p.goto(`${BASE}/lp/index.html`);
await p.evaluate(() => document.fonts.ready);
await p.evaluate(async () => {
  const people = await (await fetch("img/people.json")).json();
  const walk = ["toddle", "randoseru", "uniform", "suit", "bride", "work", "elder"];
  const sprite = (k, s) => `<span class="og-pp" style="width:${(people[k].w / 2) * s}px;height:${people[k].h * s}px;background-image:url(img/p-${k}.png);background-size:${people[k].w * s}px ${people[k].h * s}px"></span>`;
  document.head.querySelectorAll("style").forEach((el) => el.remove());
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
      html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
      body { background: #e6e1d6; background-image: radial-gradient(#dcd6c9 1.5px, transparent 1.5px); background-size: 9px 9px; }
      .og { position: relative; width: 1200px; height: 630px; font-family: "BIZ UDGothic", sans-serif; color: #23201c; overflow: hidden; }
      .og-bar { position: absolute; z-index: 3; left: 0; right: 0; top: 0; height: 58px; background: #2a2622; color: #f3efe6; display: flex; align-items: center; gap: 12px; padding: 0 40px; font-size: 24px; font-weight: 700; box-shadow: 0 3px 0 #3a3530; }
      .og-bar img { width: 36px; height: 36px; border-radius: 9px; }
      .og-lamp { width: 10px; height: 10px; border-radius: 50%; background: #5bd47a; box-shadow: 0 0 10px #5bd47a; }
      .og-free { margin-left: auto; font-size: 19px; font-weight: 400; color: #e9e4d8; }
      .og-paper { position: absolute; z-index: 2; left: 52px; top: 58px; width: 640px; height: 546px; background: #fbfaf6; background-image: radial-gradient(rgba(120,100,60,.05) 1px, transparent 1px); background-size: 5px 5px; box-shadow: 0 18px 40px rgba(60,50,30,.2); padding: 24px 40px 0; box-sizing: border-box; }
      .og-paper::after { content: ""; position: absolute; left: 0; right: 0; bottom: -12px; height: 12px; background: conic-gradient(from 135deg at 50% 0, #fbfaf6 90deg, transparent 0) 0 0 / 20px 12px repeat-x; }
      .og-shop { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 3px dashed #b8b2a6; padding-bottom: 8px; }
      .og-shop b { font-size: 30px; letter-spacing: .06em; }
      .og-shop span { font-family: "DotGothic16", monospace; font-size: 17px; color: #6f6a61; }
      .og-wel { margin-top: 14px; font-family: "DotGothic16", monospace; font-size: 22px; color: #6f6a61; }
      .og h1 { margin: 2px 0 0; font-size: 62px; line-height: 1.2; letter-spacing: .01em; white-space: nowrap; font-weight: 700; }
      .og h1 i { display: inline-block; width: 6px; height: 52px; background: #c8302c; margin-left: 6px; vertical-align: -6px; }
      .og-rows { margin-top: 16px; border-top: 3px solid #23201c; padding-top: 6px; }
      .og-r { display: flex; align-items: baseline; gap: 10px; font-size: 24px; padding: 2px 0; }
      .og-r .og-d { flex: 1; border-bottom: 3px dotted #b8b2a6; transform: translateY(-7px); }
      .og-r b { font-size: 27px; }
      .og-r.og-jp { color: #c8302c; font-weight: 700; }
      .og-rows small { display: block; font-size: 15px; color: #6f6a61; margin-top: 4px; }
      .og-rc { position: absolute; z-index: 1; right: 64px; top: 30px; width: 330px; height: 430px; overflow: hidden; transform: rotate(3deg); filter: drop-shadow(0 14px 22px rgba(60,50,30,.25)); -webkit-mask-image: linear-gradient(#000 82%, transparent); mask-image: linear-gradient(#000 82%, transparent); }
      .og-rc img { width: 100%; display: block; }
      .og-walk { position: absolute; left: 732px; right: 34px; bottom: 28px; height: 136px; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 4px solid #23201c; padding: 0 4px; }
      .og-pp { display: block; image-rendering: pixelated; background-repeat: no-repeat; }
    </style>`,
  );
  document.body.innerHTML = `<div class="og">
    <div class="og-bar"><img src="/icon-192.png" alt="">人生のレシート<span class="og-lamp"></span><span class="og-free">無料・登録なし・約20分</span></div>
    <div class="og-paper">
      <div class="og-shop"><b>人生商店</b><span>LIFE STORE</span></div>
      <div class="og-wel">いらっしゃいませ。</div>
      <h1>あなたは、どこで<br>お金を使う？<i></i></h1>
      <div class="og-rows">
        <div class="og-r"><span>アメリカ</span><span class="og-d"></span><b>3.93億円</b></div>
        <div class="og-r og-jp"><span>日本</span><span class="og-d"></span><b>1.67億円</b></div>
        <div class="og-r"><span>エチオピア</span><span class="og-d"></span><b>412万円</b></div>
        <small>生涯で稼ぐお金（本人・中央値）※ゲーム内の試算</small>
      </div>
    </div>
    <div class="og-rc"><img src="img/r-jpn.webp" alt=""></div>
    <div class="og-walk">${walk.map((k) => sprite(k, 1.4)).join("")}</div>
  </div>`;
  await Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((ok) => (im.onload = im.onerror = ok)))));
});
await p.waitForTimeout(600);
await p.screenshot({ path: "public/og.png" });
copyFileSync("public/og.png", "public/lp/og.png");
await b.close();
console.log("public/og.png と public/lp/og.png を書き出しました");
