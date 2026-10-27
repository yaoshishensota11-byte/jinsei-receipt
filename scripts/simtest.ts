// 内部高速モードでのテストプレイ。画面を使わず、選択はシードから決定的にランダムで選ぶ。
// 使い方: npx tsx scripts/simtest.ts [回数=200]
import { Life, autoplay, autoplayLife, replay, cohort, rankOf } from "../src/engine/sim";
import { Rng, hashStr } from "../src/engine/rng";
import { encodeResult, decodeResult, replayByIndex, replayCode, childOf, buildReceipt, newLife, MAX_GEN } from "../src/engine/result";
import type { Mode } from "../src/engine/world";

const N = Number(process.argv[2] ?? 200);
// モード：j=日本 m=主要20か国 w=世界（例: npx tsx scripts/simtest.ts 200 w）
const MODE = ((process.argv[3] ?? "j").match(/^[jmw]$/) ? process.argv[3] : "j") as Mode;
const byCountry = new Map<string, { n: number; ages: number[]; bal: number[] }>();
const problems: string[] = [];
const ages: number[] = [];
const incomes: number[] = [];
const balances: number[] = [];
const choiceCounts: number[] = [];
const optionHits = new Map<string, number>();
let events = 0;
let heirLives = 0;
let heirDebts = 0;

function check(l: Life, tag: string) {
  for (const y of l.records) {
    for (const v of [...Object.values(y.income), ...Object.values(y.expense), y.balance]) {
      if (typeof v !== "number" || !isFinite(v)) problems.push(`${tag}: ${y.age}歳で数値異常 ${v}`);
    }
    for (const [k, v] of Object.entries(y.expense)) if ((v ?? 0) < 0) problems.push(`${tag}: ${y.age}歳 ${k} がマイナス`);
    // 円に直した規模で判定（他の国は k で割る）
    const b = y.balance / l.D.k;
    if (b < -150_000_000) problems.push(`${tag}: ${l.D.iso3} ${y.age}歳 残高が異常に低い ${Math.round(b / 1e4)}万円相当`);
    if (b > 5_000_000_000) problems.push(`${tag}: ${l.D.iso3} ${y.age}歳 残高が異常に高い ${Math.round(b / 1e4)}万円相当`);
    events += y.events.length;
  }
}

const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const seed = `t${i}x`;
  const l = newLife(seed, MODE);
  const picks: string[] = [];
  const r = new Rng(hashStr(seed + "picks"));
  let guard = 0;
  try {
    while (!l.dead && guard++ < 400) {
      if (l.pending) {
        if (l.pending.options.length === 0) problems.push(`${seed}: ${l.pending.id} の選択肢が空`);
        if (l.pending.options.some((o) => !o.label || !o.desc)) problems.push(`${seed}: ${l.pending.id} に空の選択肢`);
        const o = r.pick(l.pending.options);
        optionHits.set(`${l.pending.id}:${o.id}`, (optionHits.get(`${l.pending.id}:${o.id}`) ?? 0) + 1);
        picks.push(o.id);
        l.choose(o.id);
      } else l.advance();
    }
    if (!l.dead) problems.push(`${seed}: 終わらない人生`);
    check(l, seed);
    const s = l.summary();
    // 再現性
    const again = replay(seed, picks, l.D, MODE).summary();
    if (again.finalBalance !== s.finalBalance || again.deathAge !== s.deathAge) problems.push(`${seed}: 再現できない`);
    const dec = decodeResult(encodeResult(l));
    const viaUrl = dec && replayByIndex(dec.seed, dec.picks, dec.mode).summary();
    if (!viaUrl || viaUrl.finalBalance !== s.finalBalance) problems.push(`${seed}: URLから再現できない`);
    const rc = buildReceipt(l);
    if (rc.items.length < 1 || !isFinite(rc.change)) problems.push(`${seed}: レシートが不正`);
    // 子どもに生まれ直す：3代目まで続け、どの代もURLから同じ人生に戻れるか
    if (i % 4 === 0) {
      let cur = l;
      while (cur.kids.length && (cur.heir?.gen ?? 1) < MAX_GEN) {
        const idx = i % cur.kids.length;
        const child = autoplayLife(childOf(cur, idx));
        const h = child.heir!;
        heirLives++;
        if (child.birthYear !== cur.birthYear + cur.kids[idx].born) problems.push(`${seed}: ${h.gen}代目の生まれ年が合わない`);
        const parentDeath = child.records.flatMap((y) => y.events).find((e) => e.text.includes(`${h.gen - 1}代目のあなた）が`));
        if (h.parentDies <= child.age && !parentDeath) problems.push(`${seed}: ${h.gen}代目で親が亡くならない`);
        if (parentDeath && parentDeath.age !== h.parentDies) problems.push(`${seed}: ${h.gen}代目で親の亡くなる年が違う`);
        if (h.estate > 0 && h.parentDies <= child.age && Math.abs(child.inherited - h.estate - (child.home === "own" && h.homeShare > 0 ? 0 : h.homeShare)) > 1 && child.inherited < h.estate) problems.push(`${seed}: ${h.gen}代目の相続が合わない`);
        if (h.debt > 0 && h.parentDies <= child.age && Math.abs(child.inherited + h.debt) > 1) problems.push(`${seed}: ${h.gen}代目で借金を引き継いでいない`);
        if (h.debt > 0) heirDebts++;
        check(child, `${seed}#${h.gen}`);
        const back = (() => { const d = decodeResult(encodeResult(child)); return d && replayCode(d); })();
        if (!back || back.summary().finalBalance !== child.summary().finalBalance || back.heir?.gen !== h.gen) problems.push(`${seed}: ${h.gen}代目をURLから再現できない`);
        if (buildReceipt(child).lineage.length !== h.gen) problems.push(`${seed}: ${h.gen}代目の家系の行が足りない`);
        cur = child;
      }
    }
    ages.push(s.deathAge);
    // 国をまたいで比べられるよう、円の規模に直して集計する
    incomes.push(s.lifetimeIncome / l.D.k);
    balances.push(s.finalBalance / l.D.k);
    const bc = byCountry.get(l.D.iso3) ?? { n: 0, ages: [], bal: [] };
    bc.n++;
    bc.ages.push(s.deathAge);
    bc.bal.push(s.finalBalance * l.D.currency.jpyPerUnit);
    byCountry.set(l.D.iso3, bc);
    choiceCounts.push(s.choices.length);
  } catch (e) {
    problems.push(`${seed}: 例外 ${(e as Error).stack}`);
  }
}
const ms = Date.now() - t0;
const q = (arr: number[], p: number) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length * p)];
const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
const man = (v: number) => `${Math.round(v / 1e4).toLocaleString()}万`;
console.log(`モード ${MODE}（金額は円の規模に換算）`);
console.log(`▶ ${N}人生 / ${ms}ms（1人生 ${(ms / N).toFixed(1)}ms）`);
console.log(`寿命 平均${avg(ages).toFixed(1)} 中央${q(ages, 0.5)} 10%点${q(ages, 0.1)} 90%点${q(ages, 0.9)}`);
console.log(`生涯収入(世帯) 中央${man(q(incomes, 0.5))} 10%${man(q(incomes, 0.1))} 90%${man(q(incomes, 0.9))}`);
console.log(`最終残高 中央${man(q(balances, 0.5))} 10%${man(q(balances, 0.1))} 90%${man(q(balances, 0.9))} 最小${man(Math.min(...balances))} 最大${man(Math.max(...balances))}`);
console.log(`赤字で終わる割合 ${((balances.filter((b) => b < 0).length / N) * 100).toFixed(1)}%`);
console.log(`選択回数 平均${avg(choiceCounts).toFixed(2)} 最小${Math.min(...choiceCounts)}  / 出来事 平均${(events / N).toFixed(1)}件`);
if (MODE !== "j") {
  const rows = [...byCountry.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 12);
  console.log("国別（上位12）: " + rows.map(([k, v]) => `${k}×${v.n} 寿命${Math.round(avg(v.ages))} 残高中央${man(q(v.bal, 0.5))}円`).join(" / "));
}
const t1 = Date.now();
const c = cohort();
console.log(`比較集団 ${c.income.length}人 ${Date.now() - t1}ms / 例: 中央値の順位 ${(rankOf(c.income, q(incomes, 0.5)) * 100).toFixed(0)}%`);
console.log(`子どもに生まれ直した人生 ${heirLives}人（2・3代目）、うち借金を引き継いだ ${heirDebts}人`);
if (process.argv.includes("--options")) console.log([...optionHits.entries()].sort().map(([k, v]) => `${k}=${v}`).join("  "));
if (process.argv.includes("--sample")) {
  const l = autoplay("sample-1");
  for (const y of l.records) for (const e of y.events) console.log(`${e.age}歳 ${e.text}`);
  console.log(l.summary());
}
// 紹介ページの「こんな人生」が、今の版のURLで開けるか（版を上げたら scripts/lpgallery.ts で作り直す）
{
  const fs = await import("node:fs");
  const gallery = JSON.parse(fs.readFileSync(new URL("../public/lp/gallery.json", import.meta.url), "utf8")) as { key: string; code: string }[];
  for (const g of gallery) {
    const dec = decodeResult(g.code);
    if (!dec) problems.push(`紹介ページの「${g.key}」のURLが古い版（scripts/lpgallery.ts で作り直す）`);
    else if (!replayByIndex(dec.seed, dec.picks, dec.mode).records.length) problems.push(`紹介ページの「${g.key}」を再現できない`);
  }
}

if (problems.length) {
  console.log(`✖ 問題 ${problems.length}件`);
  console.log(problems.slice(0, 20).join("\n"));
  process.exit(1);
}
console.log("✔ 問題なし");
