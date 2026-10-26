// ブラウザでのテストプレイ。内部高速モード（?turbo=N）＋自動選択で、最後のレシートまで通す。
// 使い方: npx vite --port 5199 & node scripts/uitest.mjs [回数=10] [turbo=60]
import { chromium } from "playwright";

const N = Number(process.argv[2] ?? 10);
const TURBO = Number(process.argv[3] ?? 60);
const BASE = process.env.BASE ?? "http://localhost:5199";
const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : {});
let failures = 0;
for (let i = 0; i < N; i++) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("fonts.g") && errors.push(m.text()));
  const seed = `ui${i}t`;
  // 日本・主要国・世界のモードを順番に試す
  const mode = ["j", "m", "w"][i % 3];
  const t0 = Date.now();
  await page.goto(`${BASE}/?seed=${seed}&turbo=${TURBO}&auto&mode=${mode}`);
  let emptyChoice = false;
  // 選択場面が空でないかを見張る
  const watch = setInterval(async () => {
    try {
      // 同じ瞬間に数える（別々に数えるとシートの出入りと競合する）
      const empty = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((el) => el.querySelectorAll(".opt").length === 0));
      if (empty) emptyChoice = true;
    } catch {}
  }, 150);
  try {
    await page.waitForSelector("#rc", { timeout: 180_000 });
    // 結果のデータが用意されるまで待つ（比較集団の計算が重いときは少し遅れる）
    await page.waitForFunction(() => !!window.__result, null, { timeout: 15_000 });
    await page.waitForTimeout(200);
  } catch (e) {
    errors.push("結果画面に到達しない: " + e.message.split("\n")[0]);
  }
  clearInterval(watch);
  const res = await page.evaluate(() => {
    const r = window.__result;
    const g = window.__game;
    return {
      url: r?.url,
      change: r?.data?.change,
      stamp: r?.data?.stamp?.text,
      age: g?.life?.age,
      country: g?.life?.D?.nameJa,
      place: g?.life?.region?.label,
      choices: g?.life?.choiceLog?.length,
      playMs: g?.playMs,
      overflow: document.documentElement.scrollWidth > 390,
    };
  });
  if (i < 3) await page.screenshot({ path: `docs/result-${mode}.png`, fullPage: true });
  const ok = !errors.length && !emptyChoice && res.url && Number.isFinite(res.change) && !res.overflow;
  if (!ok) failures++;
  console.log(
    `${ok ? "✔" : "✖"} ${seed}[${mode}] ${res.country}・${res.place} ${((Date.now() - t0) / 1000).toFixed(1)}s 等倍換算${(res.playMs / 60000).toFixed(1)}分 享年${res.age} 選択${res.choices}回 [${res.stamp}]` +
      (errors.length ? ` errors=${errors.join(" | ")}` : "") +
      (emptyChoice ? " 空の選択肢あり" : "") +
      (res.overflow ? " 横はみ出し" : ""),
  );
  await page.close();
}
await browser.close();
console.log(failures ? `✖ ${failures}/${N} 失敗` : `✔ ${N}回すべて完走`);
process.exit(failures ? 1 : 0);
