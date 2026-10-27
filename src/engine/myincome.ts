// 「自分の年収と比べる」：遊んだ人の実際の年収が、ゲームの中の世界・日本の働く人の中でどのあたりかを出す。
// 分布は scripts/incomedist.ts で作った data/world/income_percentiles.json（25〜59歳の働く人の年収、円換算）。
import dist from "../../data/world/income_percentiles.json";
import type { Life } from "./sim";

/** 年収（円）より少ない人の割合（0〜1）。百分位のあいだは直線でつなぐ */
function below(p: number[], jpy: number): number {
  if (jpy <= p[0]) return 0;
  if (jpy >= p[p.length - 1]) return 1;
  for (let i = 1; i < p.length; i++) {
    if (jpy < p[i]) {
      const t = (jpy - p[i - 1]) / Math.max(1, p[i] - p[i - 1]);
      return (i - 1 + t) / (p.length - 1);
    }
  }
  return 1;
}

/** 「上位◯%」の文字 */
export function topText(b: number): string {
  const top = (1 - b) * 100;
  if (top < 1) return "上位1%未満";
  if (top > 99) return "下位1%未満";
  return top <= 50 ? `上位${Math.round(top)}%` : `下位${Math.round(100 - top)}%`;
}

export interface MyIncome {
  world: number;
  japan: number;
  /** この人生の、働いた年のふつうの年収（円。25〜59歳で稼ぎがあった年の中央値） */
  lifeTypical: number;
}

export function compareMyIncome(jpy: number, l: Life): MyIncome {
  const years = l.records.filter((y) => (y.income.salary ?? 0) > 0);
  const main = years.filter((y) => y.age >= 25 && y.age <= 59);
  const vals = (main.length ? main : years).map((y) => l.D.toJpy(y.income.salary ?? 0)).sort((a, b) => a - b);
  return {
    world: below(dist.world.p, jpy),
    japan: below(dist.japan.p, jpy),
    lifeTypical: vals.length ? vals[Math.floor(vals.length / 2)] : 0,
  };
}
