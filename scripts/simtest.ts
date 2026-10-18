// 内部高速モードでのテストプレイ。画面を使わず、選択はシードから決定的にランダムで選ぶ。
// 使い方: npx tsx scripts/simtest.ts [回数=200]
import { Life, autoplay, replay, cohort, rankOf } from "../src/engine/sim";
import { Rng, hashStr } from "../src/engine/rng";
import { encodeResult, decodeResult, replayByIndex, buildReceipt } from "../src/engine/result";

const N = Number(process.argv[2] ?? 200);
const problems: string[] = [];
const ages: number[] = [];
const incomes: number[] = [];
const balances: number[] = [];
const choiceCounts: number[] = [];
const optionHits = new Map<string, number>();
let events = 0;

function check(l: Life, tag: string) {
  for (const y of l.records) {
    for (const v of [...Object.values(y.income), ...Object.values(y.expense), y.balance]) {
      if (typeof v !== "number" || !isFinite(v)) problems.push(`${tag}: ${y.age}歳で数値異常 ${v}`);
    }
    for (const [k, v] of Object.entries(y.expense)) if ((v ?? 0) < 0) problems.push(`${tag}: ${y.age}歳 ${k} がマイナス`);
    if (y.balance < -150_000_000) problems.push(`${tag}: ${y.age}歳 残高が異常に低い ${y.balance}`);
    if (y.balance > 5_000_000_000) problems.push(`${tag}: ${y.age}歳 残高が異常に高い ${y.balance}`);
    events += y.events.length;
  }
}

const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const seed = `t${i}x`;
  const l = new Life(seed);
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
    const again = replay(seed, picks).summary();
    if (again.finalBalance !== s.finalBalance || again.deathAge !== s.deathAge) problems.push(`${seed}: 再現できない`);
    const dec = decodeResult(encodeResult(l));
    const viaUrl = dec && replayByIndex(dec.seed, dec.picks).summary();
    if (!viaUrl || viaUrl.finalBalance !== s.finalBalance) problems.push(`${seed}: URLから再現できない`);
    const rc = buildReceipt(l);
    if (rc.items.length < 3 || !isFinite(rc.change)) problems.push(`${seed}: レシートが不正`);
    ages.push(s.deathAge);
    incomes.push(s.lifetimeIncome);
    balances.push(s.finalBalance);
    choiceCounts.push(s.choices.length);
  } catch (e) {
    problems.push(`${seed}: 例外 ${(e as Error).stack}`);
  }
}
const ms = Date.now() - t0;
const q = (arr: number[], p: number) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length * p)];
const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
const man = (v: number) => `${Math.round(v / 1e4).toLocaleString()}万`;
console.log(`▶ ${N}人生 / ${ms}ms（1人生 ${(ms / N).toFixed(1)}ms）`);
console.log(`寿命 平均${avg(ages).toFixed(1)} 中央${q(ages, 0.5)} 10%点${q(ages, 0.1)} 90%点${q(ages, 0.9)}`);
console.log(`生涯収入(世帯) 中央${man(q(incomes, 0.5))} 10%${man(q(incomes, 0.1))} 90%${man(q(incomes, 0.9))}`);
console.log(`最終残高 中央${man(q(balances, 0.5))} 10%${man(q(balances, 0.1))} 90%${man(q(balances, 0.9))} 最小${man(Math.min(...balances))} 最大${man(Math.max(...balances))}`);
console.log(`赤字で終わる割合 ${((balances.filter((b) => b < 0).length / N) * 100).toFixed(1)}%`);
console.log(`選択回数 平均${avg(choiceCounts).toFixed(2)} 最小${Math.min(...choiceCounts)}  / 出来事 平均${(events / N).toFixed(1)}件`);
const t1 = Date.now();
const c = cohort();
console.log(`比較集団 ${c.income.length}人 ${Date.now() - t1}ms / 例: 中央値の順位 ${(rankOf(c.income, q(incomes, 0.5)) * 100).toFixed(0)}%`);
if (process.argv.includes("--options")) console.log([...optionHits.entries()].sort().map(([k, v]) => `${k}=${v}`).join("  "));
if (process.argv.includes("--sample")) {
  const l = autoplay("sample-1");
  for (const y of l.records) for (const e of y.events) console.log(`${e.age}歳 ${e.text}`);
  console.log(l.summary());
}
if (problems.length) {
  console.log(`✖ 問題 ${problems.length}件`);
  console.log(problems.slice(0, 20).join("\n"));
  process.exit(1);
}
console.log("✔ 問題なし");
