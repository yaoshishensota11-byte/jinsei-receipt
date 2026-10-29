// 家族の声のテスト：いろいろな国の人生で、声の数と内容を確かめる。
// 使い方: npx tsx scripts/voicetest.ts [人数=200]
import { Life } from "../src/engine/sim";
import { Rng, hashStr } from "../src/engine/rng";
import { COUNTRIES, countryData } from "../src/engine/world";
import { snap, voicesFor, type Snap } from "../src/engine/voices";

const N = Number(process.argv[2] ?? 200);
const counts: number[] = [];
const seen = new Map<string, number>();
let problems = 0;
for (let i = 0; i < N; i++) {
  const c = COUNTRIES[i % COUNTRIES.length];
  const l = new Life(`vt${i}`, countryData(c.iso3), "w");
  let prev: Snap | null = null;
  let n = 0;
  let guard = 0;
  while (!l.dead && guard++ < 600) {
    if (l.pending) {
      const r = new Rng(hashStr(`${l.seed}|${l.pending.id}|${l.age}`));
      l.choose(r.pick(l.pending.options).id);
      continue;
    }
    const rec = l.advance();
    if (!rec) continue;
    const vs = voicesFor(l, prev, rec);
    prev = snap(l);
    if (vs.length > 2) problems++;
    for (const v of vs) {
      if (!v.who || !v.text) problems++;
      seen.set(`${v.who}「${v.text}」`, (seen.get(`${v.who}「${v.text}」`) ?? 0) + 1);
    }
    n += vs.length;
  }
  counts.push(n);
}
counts.sort((a, b) => a - b);
console.log(`人数 ${N}  声の数 中央値 ${counts[N >> 1]}  最小 ${counts[0]}  最大 ${counts[N - 1]}`);
console.log([...seen].sort((a, b) => b[1] - a[1]).slice(0, 60).map(([k, v]) => `${v}\t${k}`).join("\n"));
if (problems) {
  console.log(`✖ 問題 ${problems}件`);
  process.exit(1);
}
console.log("✔ 問題なし");
