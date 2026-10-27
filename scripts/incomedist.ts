// 「自分の年収と比べる」で使う、働く人の年収の分布（円に直した値の百分位）を作る。
// ゲームの「世界」「日本」で人生を動かし、25〜59歳で本人の稼ぎがあった年の年収を集める（統計をもとにした試算）。
// 使い方: npx tsx scripts/incomedist.ts > data/world/income_percentiles.json
import { autoplay } from "../src/engine/sim";
import { pickCountry } from "../src/engine/world";

function collect(mode: "w" | "j", n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = `inc${mode}${i}`;
    const D = pickCountry(seed, mode);
    const l = autoplay(seed, D, mode);
    for (const y of l.records) {
      const v = y.income.salary ?? 0;
      if (y.age >= 25 && y.age <= 59 && v > 0) out.push(D.toJpy(v));
    }
  }
  return out.sort((a, b) => a - b);
}
/** 0〜100% の百分位（1%きざみ）と、99.5%・99.9% */
function percentiles(v: number[]): number[] {
  const qs = [...Array.from({ length: 101 }, (_, i) => i / 100)];
  return qs.map((q) => Math.round(v[Math.min(v.length - 1, Math.floor(q * (v.length - 1)))]));
}
const world = collect("w", 6000);
const japan = collect("j", 3000);
console.log(
  JSON.stringify(
    {
      note: "ゲームの中で人生を動かしたときの、25〜59歳の働く人の年収（本人の稼ぎ、円換算）の百分位。p[i] は下から i% の人の年収",
      world: { samples: world.length, p: percentiles(world) },
      japan: { samples: japan.length, p: percentiles(japan) },
    },
    null,
    0,
  ),
);
