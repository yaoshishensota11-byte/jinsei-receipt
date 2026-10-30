// 紹介ページの「生涯で稼ぐお金の中央値」（8か国）を、いまのゲームで計算する。単位は万円。
// 使い方: npx tsx scripts/lpmedians.ts   （scripts/lpregen.sh から呼ばれる）
import { autoplay } from "../src/engine/sim";
import { countryData } from "../src/engine/world";
const out: string[] = [];
for (const iso of ["USA", "DEU", "JPN", "CHN", "BRA", "IND", "NGA", "ETH"]) {
  const D = countryData(iso);
  const v: number[] = [];
  for (let i = 0; i < 400; i++) {
    const l = autoplay(`med${iso}${i}`, D, iso === "JPN" ? "j" : "m");
    v.push(D.toJpy(l.summary().incomeTotal.salary ?? 0));
  }
  v.sort((a, b) => a - b);
  out.push(`${iso} ${D.nameJa} ${Math.round(v[200] / 1e4)}`);
}
console.log(out.join("\n"));
