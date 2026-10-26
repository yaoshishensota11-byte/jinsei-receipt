// 0〜5歳の出来事。本人がお金を使ったり稼いだりする時期ではないので、お金は動かさず、成長の場面だけを出す。
// 国（日本かどうか）・都市か農村か・国の所得水準で、出る出来事が変わる。毎年1〜2個。
import type { Rng } from "./rng";
import type { Life } from "./sim";

interface Early {
  age: number;
  text: (l: Life, r: Rng) => string;
  when?: (l: Life) => boolean;
  /** 条件に合えば必ず出す（七五三など、決まった年の行事） */
  always?: boolean;
}

const jp = (l: Life) => l.D.isJapan;
const rural = (l: Life) => l.region.urban === false;
const poor = (l: Life) => !l.D.isJapan && (l.D.inst?.incomeGroup === "LIC" || l.D.inst?.incomeGroup === "LMC");
const girl = (l: Life) => l.sex === "female";

const EARLY: Early[] = [
  // 0歳
  { age: 0, text: () => "初めて笑った。家族みんなが顔をのぞきこんだ。" },
  { age: 0, text: () => "夜泣きが続き、家族は寝不足の日々が続いた。" },
  { age: 0, text: () => "寝返りを打てるようになった。" },
  { age: 0, text: () => "予防接種を受けた。大泣きした。" },
  { age: 0, text: () => "お宮参りに出かけ、家族で写真を撮った。", when: jp },
  // 1歳
  { age: 1, text: () => "初めて自分の足で歩いた。" },
  { age: 1, text: (_l, r) => `初めて言葉を話した。最初の言葉は「${r.pick(["ママ", "パパ", "まんま", "ワンワン"])}」だった。` },
  { age: 1, text: () => "一升餅を背負って、1歳の誕生日を祝ってもらった。", when: jp },
  { age: 1, text: () => "1歳の誕生日を、親戚が集まって祝ってくれた。", when: (l) => !jp(l) },
  // 2歳
  { age: 2, text: () => "「いやだ！」が口ぐせになった。" },
  { age: 2, text: () => "熱を出して、夜中に病院へ連れて行かれた。" },
  { age: 2, text: () => "公園の砂場で、毎日のように泥だらけになって遊んだ。", when: (l) => !rural(l) },
  { age: 2, text: () => "畑に出る親について行き、虫をつかまえて遊んだ。", when: rural },
  // 3歳
  { age: 3, text: (_l, r) => (r.chance(0.5) ? "保育園に通いはじめた。最初の日は大泣きした。" : "幼稚園に通いはじめた。制服が少し大きかった。"), when: jp, always: true },
  { age: 3, text: () => "七五三のお祝いで、着物を着て写真を撮った。", when: (l) => jp(l) && girl(l), always: true },
  { age: 3, text: () => "保育園に通いはじめた。", when: (l) => !jp(l) && !poor(l) },
  { age: 3, text: () => "親が働いているあいだ、祖母や近所の家に預けられて過ごした。", when: poor },
  { age: 3, text: () => "三輪車に乗れるようになった。" },
  // 4歳
  { age: 4, text: () => "お気に入りの絵本を、何度も「読んで」とせがんだ。" },
  { age: 4, text: () => "電車や車の名前を、全部覚えてしまった。", when: (l) => !rural(l) },
  { age: 4, text: () => "家の家畜の世話を、見よう見まねで手伝った。", when: (l) => rural(l) && !jp(l) },
  { age: 4, text: () => "家族について、水くみや薪拾いを手伝いはじめた。", when: (l) => poor(l) && rural(l) },
  { age: 4, text: () => "友だちとけんかして、初めて「ごめんね」を言えた。" },
  // 5歳
  { age: 5, text: () => "七五三のお祝いで、はかまを着て写真を撮った。", when: (l) => jp(l) && !girl(l), always: true },
  { age: 5, text: () => "小学校の入学を前に、ランドセルを買ってもらった。", when: jp, always: true },
  { age: 5, text: () => "ひらがなが読めるようになった。", when: jp },
  { age: 5, text: () => "初めての運動会で、かけっこを走りきった。", when: jp },
  { age: 5, text: () => "小学校に入る前に、文字や数を覚えはじめた。", when: (l) => !jp(l) },
  { age: 5, text: () => "補助輪なしで自転車に乗れるようになった。" },
];

/** その年（0〜5歳）の出来事の文 */
export function earlyEvents(l: Life, r: Rng): string[] {
  const a = l.age;
  const ok = EARLY.filter((e) => e.age === a && (!e.when || e.when(l)));
  const fixed = ok.filter((e) => e.always);
  const rest = ok.filter((e) => !e.always);
  const out = fixed.map((e) => e.text(l, r));
  // 毎年1〜2個（決まった行事がある年は、ほかは1個まで）
  let n = Math.max(0, r.int(1, 2) - fixed.length);
  if (fixed.length && n === 0 && r.chance(0.5)) n = 1;
  while (n-- > 0 && rest.length) out.push(rest.splice(Math.floor(r.next() * rest.length), 1)[0].text(l, r));
  return out;
}
