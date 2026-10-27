// 0〜5歳の出来事。本人がお金を使ったり稼いだりする時期ではないので、お金は動かさず、成長の場面だけを出す。
// 国（日本かどうか）・都市か農村か・国の所得水準で、出る出来事が変わる。毎年1〜2個。
//
// 行事を必ず出すか、確率で出すかの決まり：
// - その国でほぼ全員が経験するもの（日本のランドセル、小学校入学など）は必ず出す（rite: 1）
// - 家庭によって違うもの（七五三、保育園と幼稚園のどちらに通うか など）は確率で出す（rite: 0〜1 の割合）
// ほかの国の行事は rites.ts に、この決まりで書いている（6歳の入学の行事もあるので、6歳まで呼ぶ）。
import type { Rng } from "./rng";
import { RITES } from "./rites";
import type { Life } from "./sim";

interface Early {
  age: number;
  text: (l: Life, r: Rng) => string;
  when?: (l: Life) => boolean;
  /** 決まった年の行事。この確率で、ほかの出来事とは別に出る（ほぼ全員が経験するものは 1、家庭によって違うものは 1 未満） */
  rite?: number;
  /** その国の行事（rites.ts）で同じ種類のものが出た年は、これを出さない */
  tag?: "bday1" | "nursery";
}

const jp = (l: Life) => l.D.isJapan;
const rural = (l: Life) => l.region.urban === false;
const poor = (l: Life) => !l.D.isJapan && (l.D.inst?.incomeGroup === "LIC" || l.D.inst?.incomeGroup === "LMC");
const girl = (l: Life) => l.sex === "female";

const EARLY: Early[] = [
  // 0歳
  { age: 0, text: (_l, r) => r.pick(["初めて笑った。家族みんなが顔をのぞきこんだ。", "あやされて、声を出して笑うようになった。", "家族の顔を見ると、にっこり笑うようになった。"]) },
  { age: 0, text: (_l, r) => r.pick(["夜泣きが続き、家族は寝不足の日々が続いた。", "夜中に何度も目を覚まし、家族が交代で抱っこした。"]) },
  { age: 0, text: () => "寝返りを打てるようになった。" },
  { age: 0, text: () => "予防接種を受けた。大泣きした。" },
  { age: 0, text: () => "お宮参りに出かけ、家族で写真を撮った。", when: jp },
  // 1歳
  { age: 1, text: (_l, r) => r.pick(["初めて自分の足で歩いた。", "よちよちと、数歩だけ歩けた。家族が大喜びした。", "つかまり立ちから、ついに一人で歩き出した。"]) },
  { age: 1, text: (_l, r) => `初めて言葉を話した。最初の言葉は「${r.pick(["ママ", "パパ", "まんま", "ワンワン"])}」だった。` },
  { age: 1, text: () => "一升餅を背負って、1歳の誕生日を祝ってもらった。", when: jp },
  { age: 1, text: () => "1歳の誕生日を、親戚が集まって祝ってくれた。", when: (l) => !jp(l), tag: "bday1" },
  // 2歳
  { age: 2, text: (_l, r) => r.pick(["「いやだ！」が口ぐせになった。", "何でも「自分でやる！」と言うようになった。", "「なんで？」と何度も聞くようになった。"]) },
  { age: 2, text: (_l, r) => r.pick(["熱を出して、夜中に病院へ連れて行かれた。", "風邪をこじらせて、何日か寝込んだ。", "転んでおでこをぶつけ、大泣きした。"]) },
  { age: 2, text: () => "公園の砂場で、毎日のように泥だらけになって遊んだ。", when: (l) => !rural(l) },
  { age: 2, text: () => "畑に出る親について行き、虫をつかまえて遊んだ。", when: rural },
  // 3歳
  { age: 3, text: (_l, r) => (r.chance(0.5) ? r.pick(["保育園に通いはじめた。最初の日は大泣きした。", "保育園に通いはじめた。すぐに友だちができた。"]) : r.pick(["幼稚園に通いはじめた。制服が少し大きかった。", "幼稚園に通いはじめた。黄色い帽子がお気に入りになった。"])), when: jp, rite: 0.85 },
  { age: 3, text: () => "七五三のお祝いで、着物を着て写真を撮った。", when: (l) => jp(l) && girl(l), rite: 0.75 },
  { age: 3, text: () => "保育園に通いはじめた。", when: (l) => !jp(l) && !poor(l), tag: "nursery" },
  { age: 3, text: () => "親が働いているあいだ、祖母や近所の家に預けられて過ごした。", when: poor, tag: "nursery" },
  { age: 3, text: () => "三輪車に乗れるようになった。" },
  // 4歳
  { age: 4, text: (_l, r) => r.pick(["お気に入りの絵本を、何度も「読んで」とせがんだ。", "お絵かきに夢中になり、家の壁にまで描いてしまった。", "歌って踊るのが大好きになった。"]) },
  { age: 4, text: () => "電車や車の名前を、全部覚えてしまった。", when: (l) => !rural(l) },
  { age: 4, text: () => "家の家畜の世話を、見よう見まねで手伝った。", when: (l) => rural(l) && !jp(l) },
  { age: 4, text: () => "家族について、水くみや薪拾いを手伝いはじめた。", when: (l) => poor(l) && rural(l) },
  { age: 4, text: (_l, r) => r.pick(["友だちとけんかして、初めて「ごめんね」を言えた。", "仲よしの友だちができた。毎日いっしょに遊んだ。", "初めておつかいに行き、パンを買ってこられた。"]) },
  // 5歳
  { age: 5, text: () => "七五三のお祝いで、はかまを着て写真を撮った。", when: (l) => jp(l) && !girl(l), rite: 0.75 },
  { age: 5, text: (_l, r) => r.pick(["小学校の入学を前に、ランドセルを買ってもらった。", "祖父母からランドセルを贈ってもらった。何度も背負ってみた。"]), when: jp, rite: 1 },
  { age: 5, text: () => "ひらがなが読めるようになった。", when: jp },
  { age: 5, text: () => "初めての運動会で、かけっこを走りきった。", when: jp },
  { age: 5, text: () => "小学校に入る前に、文字や数を覚えはじめた。", when: (l) => !jp(l) && l.D.iso3 !== "GBR" }, // イギリスは4歳で小学校の準備クラスに入る（rites.ts）
  { age: 5, text: (_l, r) => r.pick(["補助輪なしで自転車に乗れるようになった。", "鉄棒の前回りができるようになった。", "初めて歯が抜けた。"]) },
];

/** その年（0〜6歳）の出来事の文。6歳は国の行事だけ */
export function earlyEvents(l: Life, r: Rng): string[] {
  const a = l.age;
  // その国の行事（確率で出る）。同じ年に3つ以上出たら、2つまでにする
  const rites = (RITES[l.D.iso3] ?? []).filter((x) => x.age === a && r.chance(x.p));
  while (rites.length > 2) rites.splice(Math.floor(r.next() * rites.length), 1);
  const tags = new Set(rites.map((x) => x.tag).filter(Boolean));
  const ok = EARLY.filter((e) => e.age === a && (!e.when || e.when(l)) && !(e.tag && tags.has(e.tag)));
  // 決まった年の行事も、毎回出るとは限らない（確率で出る）
  const fixed = ok.filter((e) => e.rite !== undefined && r.chance(e.rite));
  const rest = ok.filter((e) => e.rite === undefined);
  const out = [...rites.map((x) => r.pick(x.texts)), ...fixed.map((e) => e.text(l, r))];
  const nFixed = rites.length + fixed.length;
  // 毎年1〜2個（決まった行事がある年は、ほかは1個まで）
  let n = Math.max(0, r.int(1, 2) - nFixed);
  if (nFixed && n === 0 && r.chance(0.5)) n = 1;
  while (n-- > 0 && rest.length) out.push(rest.splice(Math.floor(r.next() * rest.length), 1)[0].text(l, r));
  return out;
}
