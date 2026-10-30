// 人生の章：年齢の区切りで一度止まり、その時期のまとめを見せる。
// まとめには「同じ国に生まれた300人（ゲームの中の比べる集団）」と比べた、起きたこと・起きなかったことを添える。
// 比べる集団は、どれも同じ統計から動かした人生なので、割合はゲームの中の試算。亡くなる割合だけは生命表から直接出す。
import type { Life, Cohort } from "./sim";
import type { LifeEvent } from "./types";

export interface Chapter {
  no: number;
  title: string;
  from: number;
  to: number;
}

export const CHAPTERS: Chapter[] = [
  { no: 1, title: "子ども時代", from: 0, to: 12 },
  { no: 2, title: "学ぶころ", from: 13, to: 22 },
  { no: 3, title: "働きはじめ", from: 23, to: 34 },
  { no: 4, title: "働き盛り", from: 35, to: 49 },
  { no: 5, title: "実りのころ", from: 50, to: 64 },
  { no: 6, title: "老後", from: 65, to: 200 },
];

export const chapterAt = (age: number): Chapter => CHAPTERS.find((c) => age >= c.from && age <= c.to) ?? CHAPTERS[CHAPTERS.length - 1];

/** 印ごとの言い方（「300人のうち◯人が〜」に続く） */
const TAG_TEXT: Record<string, string> = {
  cancer: "がんの治療を受けた",
  heartBrain: "心臓や脳の病気で入院した",
  care: "要介護の認定を受けた",
  disaster: "災害で家や家財に被害を受けた",
  jobLoss: "仕事を失った",
  divorce: "離婚した",
  partnerDeath: "パートナーを亡くした",
  parentDeath: "親を亡くした",
  theft: "盗難や強盗にあった",
  unrest: "政情不安で仕事が止まった",
  displaced: "武力衝突で家族と避難した",
  epidemic: "感染症で家族が寝込んだ",
  drought: "干ばつで作物を失った",
  inflation: "物価の急上昇で貯金が目減りした",
  scam: "詐欺でお金を取られた",
  road: "交通事故で大けがをした",
  childWork: "子どものうちから働いた",
  futoko: "学校に行けない時期があった",
  alcohol: "お酒がやめられなくなった",
  kidAbroad: "子どもが外国へ移り住んだ",
  unbanked: "口座を持てなかった",
  bankrupt: "自己破産した",
  pro: "プロのスポーツ選手になった",
};

export interface Compare {
  text: string;
  /** 300人のうち何人か */
  count: number;
}

export interface ChapterSummary {
  chapter: Chapter;
  /** 章の最後の年齢（亡くなった章なら亡くなった年齢） */
  end: number;
  income: number;
  expense: number;
  startBal: number;
  endBal: number;
  /** 章の終わりの貯えが、比べる集団の上位何％か（0〜1）。お金の出入りがない章は null */
  rank: number | null;
  events: LifeEvent[];
  /** あなたに起きなかったこと（多い順） */
  missed: Compare[];
  /** あなたに起きた、比較的めずらしいこと */
  rare: Compare[];
  /** この国で同じ年に生まれた人のうち、章の終わりまでに亡くなる割合（生命表から） */
  deathShare: number;
  /** 比べる集団の人数 */
  n: number;
}

// 選択の場面（国ごとの出来事）は数えない。確率に推計の値が多く、「起きた・起きなかった」と言い切れないため
const tagText = (tag: string): string | null => TAG_TEXT[tag] ?? null;

/** 章のまとめを作る */
export function chapterSummary(l: Life, ch: Chapter, co: Cohort): ChapterSummary {
  const end = Math.min(ch.to, l.age);
  const recs = l.records.filter((r) => r.age >= ch.from && r.age <= end);
  const sum = (o: Partial<Record<string, number>>, skip?: string) => Object.entries(o).reduce((t, [k, v]) => t + (k === skip ? 0 : v ?? 0), 0);
  const income = recs.reduce((t, r) => t + sum(r.income, "invest"), 0);
  const expense = recs.reduce((t, r) => t + sum(r.expense), 0);
  const before = l.records.find((r) => r.age === ch.from - 1);
  const startBal = before ? before.balance : 0;
  const endBal = recs.length ? recs[recs.length - 1].balance : startBal;

  // 比べる相手は、章の終わりの年齢まで生きていた人
  const alive = co.lives.filter((c) => c.death >= end);
  let rank: number | null = null;
  if (income > 0 && alive.length >= 30) {
    const bals = alive.map((c) => c.bal[end] ?? 0).sort((a, b) => a - b);
    let lo = 0;
    while (lo < bals.length && bals[lo] <= endBal) lo++;
    rank = 1 - lo / bals.length;
  }

  // 印ごとに、章の間に経験した人の数を数える
  const inCh = (tags: [string, number][]) => new Set(tags.filter(([, a]) => a >= ch.from && a <= end).map(([t]) => t));
  const counts = new Map<string, number>();
  for (const c of alive) for (const t of inCh(c.tags)) counts.set(t, (counts.get(t) ?? 0) + 1);
  const mine = inCh(l.tags);
  const n = alive.length;
  const missed: Compare[] = [];
  const rare: Compare[] = [];
  for (const [t, k] of [...counts].sort((a, b) => b[1] - a[1])) {
    const text = tagText(t);
    if (!text) continue;
    if (!mine.has(t) && k / n >= 0.05) missed.push({ text, count: k });
  }
  for (const t of mine) {
    const text = tagText(t);
    const k = counts.get(t) ?? 0;
    if (text && k / Math.max(1, n) < 0.15) rare.push({ text, count: k });
  }
  rare.sort((a, b) => a.count - b.count);

  // 生命表：生まれてから章の終わりまで生きられない割合
  let surv = 1;
  for (let a = 0; a <= end; a++) surv *= 1 - l.D.qx(l.sex, a);

  return {
    chapter: ch,
    end,
    income,
    expense,
    startBal,
    endBal,
    rank,
    events: recs.flatMap((r) => r.events).filter((e) => e.major && e.kind !== "death"),
    missed: missed.slice(0, 3),
    rare: rare.slice(0, 2),
    deathShare: 1 - surv,
    n,
  };
}

/** 「◯人に1人」 */
export function oneIn(share: number): string {
  if (share <= 0) return "ほとんどいない";
  const k = 1 / share;
  return k >= 10 ? `約${Math.round(k / (k >= 100 ? 10 : 1)) * (k >= 100 ? 10 : 1)}人に1人` : `約${Math.round(share * 100)}%`;
}
