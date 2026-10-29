// 代ごとの差の集計：「子どもに生まれ直す」で3代目まで動かし、親の稼ぎの差が子・孫にどれだけ残るかを国ごとに数える。
// 使い方: npx tsx scripts/genstats.ts > docs/generations.md（data/world/generation_stats.json も書き出す）
// 見るもの（どれもゲームの中の試算。円に直した本人の生涯の稼ぎ）：
//   ・1代目の稼ぎが上半分の家と下半分の家で、2代目・3代目の稼ぎ（中央値）が何倍ちがうか
//   ・1代目と2代目の稼ぎの順位が、どれくらい同じか（順位の相関。1に近いほど親の順位がそのまま子に引き継がれる）
import { writeFileSync } from "node:fs";
import { Life, autoplayLife } from "../src/engine/sim";
import { COUNTRIES, countryData } from "../src/engine/world";
import { childOf } from "../src/engine/result";

const FAMILIES = 160;
const med = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
/** 順位の相関（スピアマン） */
function rankCorr(x: number[], y: number[]): number {
  const rank = (v: number[]) => {
    const idx = v.map((val, i) => [val, i] as const).sort((a, b) => a[0] - b[0]);
    const r = new Array(v.length);
    idx.forEach(([, i], k) => (r[i] = k));
    return r as number[];
  };
  const rx = rank(x);
  const ry = rank(y);
  const n = x.length;
  const mx = (n - 1) / 2;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - mx);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - mx) ** 2;
  }
  return num / Math.sqrt(dx * dy || 1);
}

interface Row {
  iso3: string;
  name: string;
  group: string;
  families: number;
  gen1: number;
  gen2: number;
  gen3: number;
  /** 1代目の稼ぎが上半分の家と下半分の家の、2代目・3代目の稼ぎの比（何倍） */
  gap2: number;
  gap3: number;
  corr12: number;
}

const rows: Row[] = [];
for (const c of COUNTRIES) {
  const D = countryData(c.iso3);
  const fam: { e1: number; e2: number; e3: number | null }[] = [];
  for (let i = 0; i < FAMILIES * 4 && fam.length < FAMILIES; i++) {
    const l1 = autoplayLife(new Life(`gs${c.iso3.toLowerCase()}${i.toString(36)}`, D, "w"));
    if (!l1.kids.length) continue;
    const l2 = autoplayLife(childOf(l1, 0));
    const l3 = l2.kids.length ? autoplayLife(childOf(l2, 0)) : null;
    const earn = (l: Life) => D.toJpy(l.summary().incomeTotal.salary ?? 0);
    fam.push({ e1: earn(l1), e2: earn(l2), e3: l3 ? earn(l3) : null });
  }
  if (fam.length < 20) continue;
  const cut = med(fam.map((f) => f.e1));
  const top = fam.filter((f) => f.e1 >= cut);
  const low = fam.filter((f) => f.e1 < cut);
  const ratio = (a: number[], b: number[]) => (med(b) > 0 ? med(a) / med(b) : NaN);
  const g3top = top.filter((f) => f.e3 !== null).map((f) => f.e3!);
  const g3low = low.filter((f) => f.e3 !== null).map((f) => f.e3!);
  rows.push({
    iso3: c.iso3,
    name: D.nameJa,
    group: D.inst?.incomeGroup ?? "HIC",
    families: fam.length,
    gen1: med(fam.map((f) => f.e1)),
    gen2: med(fam.map((f) => f.e2)),
    gen3: med(fam.filter((f) => f.e3 !== null).map((f) => f.e3!)),
    gap2: ratio(top.map((f) => f.e2), low.map((f) => f.e2)),
    gap3: g3top.length >= 10 && g3low.length >= 10 ? ratio(g3top, g3low) : NaN,
    corr12: rankCorr(
      fam.map((f) => f.e1),
      fam.map((f) => f.e2),
    ),
  });
  process.stderr.write(`${c.iso3} `);
}
process.stderr.write("\n");

writeFileSync("data/world/generation_stats.json", JSON.stringify({ families: FAMILIES, rows }, null, 1) + "\n");

const man = (v: number) => (v >= 1e8 ? `${(v / 1e8).toFixed(2)}億円` : `${Math.round(v / 1e4).toLocaleString("ja-JP")}万円`);
const f2 = (v: number) => (isFinite(v) ? v.toFixed(2) : "—");
const GROUP: Record<string, string> = { LIC: "低所得国", LMC: "低中所得国", UMC: "高中所得国", HIC: "高所得国" };
const avg = (a: number[]) => (a.length ? a.reduce((t, v) => t + v, 0) / a.length : NaN);
const out: string[] = [];
out.push("# 代ごとの差の集計（ゲームの中の試算）");
out.push("");
out.push(`各国 ${FAMILIES} 家系を「子どもに生まれ直す」で3代目まで動かした（どの代も、いちばん上の子に生まれ直す）。金額は本人が生涯で稼いだお金（円に直した中央値）。`);
out.push("");
out.push("- **上下の差（2代目・3代目）**：1代目の稼ぎが上半分の家の子・孫は、下半分の家の子・孫の何倍稼いだか（1.00なら差は残っていない）");
out.push("- **順位の引き継ぎ**：1代目と2代目の稼ぎの順位の相関（0〜1。1に近いほど、親の順位がそのまま子に引き継がれる）");
out.push("");
out.push("## 国の所得水準ごとの平均");
out.push("");
out.push("| 所得水準 | 国の数 | 上下の差（2代目） | 上下の差（3代目） | 順位の引き継ぎ |");
out.push("|---|---|---|---|---|");
for (const g of ["LIC", "LMC", "UMC", "HIC"]) {
  const rs = rows.filter((r) => r.group === g);
  if (!rs.length) continue;
  out.push(`| ${GROUP[g]} | ${rs.length} | ${f2(avg(rs.map((r) => r.gap2).filter(isFinite)))}倍 | ${f2(avg(rs.map((r) => r.gap3).filter(isFinite)))}倍 | ${f2(avg(rs.map((r) => r.corr12)))} |`);
}
out.push("");
out.push("## 国ごと（上下の差（2代目）が大きい順）");
out.push("");
out.push("| 国 | 所得水準 | 1代目 | 2代目 | 3代目 | 上下の差（2代目） | 上下の差（3代目） | 順位の引き継ぎ |");
out.push("|---|---|---|---|---|---|---|---|");
for (const r of [...rows].sort((a, b) => (b.gap2 || 0) - (a.gap2 || 0)))
  out.push(`| ${r.name} | ${GROUP[r.group]} | ${man(r.gen1)} | ${man(r.gen2)} | ${man(r.gen3)} | ${f2(r.gap2)}倍 | ${f2(r.gap3)}倍 | ${f2(r.corr12)} |`);
out.push("");
out.push("ゲームの中で、親から子に引き継がれるのは：住む地域、家庭の年収（親の稼ぎ）、親の年齢ときょうだい、遺産・借金・実家、お金の振り分けで子の教育に回したお金です。国の統計をもとにした試算で、実際の世代間の所得の移動を測った統計ではありません。");
console.log(out.join("\n"));
