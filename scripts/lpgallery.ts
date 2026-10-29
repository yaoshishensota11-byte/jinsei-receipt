// 紹介ページの「こんな人生がありました」に載せる人生を、ゲームの中から探す。
// 使い方: npx tsx scripts/lpgallery.ts > public/lp/gallery.json
// 共有URLの版が上がったら、作り直す（古い版のURLは開けなくなるため）。
import { autoplay, type Life } from "../src/engine/sim";
import { pickCountry } from "../src/engine/world";
import { encodeResult, buildReceipt } from "../src/engine/result";

type Pick = { key: string; title: string; mode: "j" | "m" | "w"; test: (l: Life, text: string) => boolean; line: (l: Life) => string };
const yenS = (l: Life, n: number) => {
  const v = l.D.toJpy(n);
  return v >= 1e8 ? `約${(v / 1e8).toFixed(2)}億円` : `約${Math.round(v / 1e4).toLocaleString("ja-JP")}万円`;
};
const events = (l: Life) => l.records.flatMap((y) => y.events.map((e) => e.text)).join("\n");

const PICKS: Pick[] = [
  {
    key: "tokyo",
    title: "東京で、大企業に勤めて老後安泰",
    mode: "j",
    test: (l) => l.region.id === "tokyo" && l.summary().finalBalance > 5e7 && l.choiceLog.some((c) => c.optionId === "big"),
    line: (l) => `生涯で稼いだお金は${yenS(l, l.summary().incomeTotal.salary ?? 0)}。最後に${yenS(l, l.summary().finalBalance)}が残った。`,
  },
  {
    key: "migrate",
    title: "インドの農村から、海外へ出稼ぎに",
    mode: "w",
    test: (l, t) => l.D.iso3 === "IND" && !l.region.urban && t.includes("出稼ぎ") && l.D.toJpy(l.summary().finalBalance) > 1e6 && l.summary().deathAge >= 60,
    line: (l) => `出稼ぎで家計を支えた。生涯で稼いだお金は${yenS(l, l.summary().incomeTotal.salary ?? 0)}。`,
  },
  {
    key: "inflation",
    title: "物価の高騰に、何度も貯金を削られた",
    mode: "w",
    test: (l, t) => (t.match(/実際に記録された上昇率/g) ?? []).length >= 2 && l.D.toJpy(l.summary().expenseTotal.inflation ?? 0) > 1e6,
    line: (l) => `物価で消えた貯金は${yenS(l, l.summary().expenseTotal.inflation ?? 0)}。${l.D.nameJa}で実際に起きた上昇率のとおりに。`,
  },
  {
    key: "brideprice",
    title: "婚資を払って結婚し、子だくさんに",
    mode: "w",
    test: (l, t) => t.includes("婚資（ブライドプライス）を払った") && l.kids.length >= 4,
    line: (l) => `子ども${l.kids.length}人。恋愛・結婚にかかったお金は${yenS(l, l.summary().expenseTotal.love ?? 0)}。`,
  },
  {
    key: "care",
    title: "実家に残り、親の介護を引き受けた",
    mode: "j",
    test: (l, t) => t.includes("同じ家で暮らしながら、働きつつ親の介護"),
    line: (l) => `介護にかかったお金は${yenS(l, l.summary().expenseTotal.care ?? 0)}。最後に${yenS(l, l.summary().finalBalance)}が残った。`,
  },
  {
    key: "usa",
    title: "アメリカで高い給料、それでも残らない",
    mode: "m",
    test: (l) => l.D.iso3 === "USA" && (l.summary().incomeTotal.salary ?? 0) * l.D.currency.jpyPerUnit > 3e8 && l.summary().finalBalance < 1e5,
    line: (l) => {
      const f = l.summary().finalBalance;
      return `生涯で稼いだお金は${yenS(l, l.summary().incomeTotal.salary ?? 0)}。それでも最後は${f < 0 ? `${yenS(l, -f)}の借金` : yenS(l, f)}。`;
    },
  },
];

const out: unknown[] = [];
for (const p of PICKS) {
  for (let i = 0; i < 20000; i++) {
    const seed = `g${p.key.slice(0, 3)}${i.toString(36)}`;
    const D = pickCountry(seed, p.mode);
    if (p.key === "migrate" && D.iso3 !== "IND") continue;
    if (p.key === "usa" && D.iso3 !== "USA") continue;
    if (p.key === "brideprice" && D.inst?.incomeGroup === "HIC") continue;
    const l = autoplay(seed, D, p.mode);
    if (!p.test(l, events(l))) continue;
    const s = l.summary();
    const d = buildReceipt(l);
    out.push({
      key: p.key,
      title: p.title,
      code: encodeResult(l),
      country: l.D.nameJa,
      place: s.regionLabel,
      sex: s.sex === "male" ? "男性" : "女性",
      deathAge: s.deathAge,
      stamp: d.stamp.text,
      line: p.line(l),
    });
    break;
  }
}
console.log(JSON.stringify(out, null, 1));
