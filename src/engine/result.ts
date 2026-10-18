// 結果（レシート・詳細ページ）用のデータ組み立てと、URLへの符号化。
// URLには「シード」と「各選択場面で何番目を選んだか」だけを入れる。
// エンジンは決定的なので、これだけで人生をまるごと再現できる（サーバー不要）。
import { Life, cohort, rankOf, BIRTH_YEAR, yen } from "./sim";
import { streamRng } from "./rng";
import { EXPENSE_LABEL, type ExpenseCat, type LifeEvent } from "./types";

export const CODEC_VERSION = "1";

export interface ReceiptItem {
  label: string;
  amount: number;
  memo: string;
}
export interface ReceiptData {
  receiptNo: string;
  visitDate: string;
  closeDate: string;
  customer: string;
  items: ReceiptItem[];
  subtotal: number;
  deposit: number;
  depositLines: { label: string; amount: number }[];
  change: number;
  rankIncome: number; // 上位◯%（0〜1）
  rankBalance: number;
  cohortSize: number;
  stamp: { text: string; tone: "red" | "blue" | "green" | "gold" | "gray" };
  deathLine: string;
  closing: string;
}

/** 選択の並び（options の何番目か）を作る */
export function picksOf(l: Life): number[] {
  return l.choiceLog.map((c) => c.pickIndex ?? 0);
}

export function encodeResult(l: Life): string {
  return `${CODEC_VERSION}.${l.seed}.${picksOf(l).join("")}`;
}

export function decodeResult(code: string): { seed: string; picks: number[] } | null {
  const m = /^(\d+)\.([a-z0-9-]{1,40})\.([0-9]{0,16})$/.exec(code.trim());
  if (!m || m[1] !== CODEC_VERSION) return null;
  return { seed: m[2], picks: [...m[3]].map(Number) };
}

/** 番号の並びから人生を再現 */
export function replayByIndex(seed: string, picks: number[]): Life {
  const l = new Life(seed);
  let i = 0;
  let guard = 0;
  while (!l.dead && guard++ < 500) {
    if (l.pending) {
      const idx = Math.min(picks[i++] ?? 0, l.pending.options.length - 1);
      l.choose(l.pending.options[idx].id);
      continue;
    }
    l.advance();
  }
  return l;
}

export function detailUrl(l: Life, base: string): string {
  return `${base.replace(/\/$/, "")}/r.html#${encodeResult(l)}`;
}

function dateOf(seed: string, year: number, stream: string): string {
  const r = streamRng(seed, stream, 0);
  const m = r.int(1, 12);
  const d = r.int(1, [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]);
  return `${year}年${m}月${d}日`;
}

export function stampOf(balance: number): ReceiptData["stamp"] {
  if (balance < -3_000_000) return { text: "赤字閉店", tone: "gray" };
  // ほぼ使い切って終わった（少しの借りは公的扶助や遺品整理で精算される範囲）
  if (balance < 5_000_000) return { text: "人生完済", tone: "red" };
  if (balance < 20_000_000) return { text: "ギリギリ黒字", tone: "blue" };
  if (balance < 100_000_000) return { text: "老後安泰", tone: "green" };
  return { text: "大黒字御礼", tone: "gold" };
}

function memoFor(l: Life, cat: ExpenseCat, amount: number): string {
  const s = l.summary();
  const ev = l.records.flatMap((y) => y.events);
  const has = (t: string) => ev.some((e) => e.text.includes(t));
  switch (cat) {
    case "tax":
      return amount > 80_000_000 ? "国にはずいぶん貢献した" : "給料から毎月、静かに引かれた";
    case "housing":
      if (has("住宅ローンを完済")) return "35年ローン、完済";
      if (s.ownsHome) return l.loan > 0 ? "ローンは途中のまま" : "マイホーム";
      if (l.coLiveParents || l.home === "parents" || has("実家に戻った") || has("実家に移り住んだ")) return "実家に助けられた";
      return "家賃を払い続けた";
    case "kids":
      return s.kids > 0 ? `子ども${s.kids}人分。いちばん高い買い物` : "—";
    case "food":
      return "毎日のごはん";
    case "utilities":
      return "電気・ガス・水道";
    case "car":
      return l.region.id === "tokyo" ? "電車とスマホ代" : "車は暮らしの足";
    case "medical":
      return has("がん") ? "がん治療を含む" : has("入院") ? "入院も経験した" : "通院と薬";
    case "care":
      return has("要介護") && !l.choiceLog.some((c) => c.id === "parentCare" && ["facility", "home", "quit", "share"].includes(c.optionId))
        ? "自分の介護サービス"
        : "親の介護、そして自分の";
    case "fun":
      return l.lottery ? "宝くじ代を含む" : "趣味と付き合い";
    case "events":
      return has("災害") || has("地震") ? "災害の修理を含む" : "冠婚葬祭と臨時の出費";
    case "selfEdu":
      return l.choiceLog.some((c) => /loan|night/.test(c.optionId)) ? "奨学金と学費" : "学び直しの費用";
    case "other":
      return "服・家具・日用品";
  }
}

export function buildReceipt(l: Life): ReceiptData {
  const s = l.summary();
  const c = cohort();
  const order: ExpenseCat[] = ["housing", "food", "tax", "kids", "car", "fun", "other", "utilities", "medical", "care", "selfEdu", "events"];
  const items: ReceiptItem[] = order
    .map((k) => ({ label: EXPENSE_LABEL[k], amount: Math.round(s.expenseTotal[k] ?? 0), memo: memoFor(l, k, s.expenseTotal[k] ?? 0) }))
    .filter((it) => it.amount >= 10_000)
    .sort((a, b) => b.amount - a.amount);
  const subtotal = items.reduce((t, i) => t + i.amount, 0);
  const inv = Math.round(s.incomeTotal.invest ?? 0);
  const depositLines = [
    { label: "本人の稼ぎ", amount: Math.round(s.incomeTotal.salary ?? 0) },
    { label: "パートナーの稼ぎ", amount: Math.round(s.incomeTotal.partner ?? 0) },
    { label: "年金・退職金", amount: Math.round(s.incomeTotal.pension ?? 0) },
    { label: "手当・相続・臨時", amount: Math.round(s.incomeTotal.windfall ?? 0) },
    { label: "運用損益", amount: inv },
  ].filter((d) => Math.abs(d.amount) >= 10_000);
  const sexWord = s.sex === "male" ? "男性" : "女性";
  return {
    receiptNo: s.seed.toUpperCase(),
    visitDate: dateOf(s.seed, s.birthYear, "visit"),
    closeDate: dateOf(s.seed, s.birthYear + s.deathAge, "close"),
    customer: `${s.regionLabel}生まれ・${sexWord}・家庭${s.familyBandLabel.replace("年収", "")}`,
    items,
    subtotal,
    deposit: Math.round(s.lifetimeIncome + inv),
    depositLines,
    change: s.finalBalance,
    rankIncome: rankOf(c.income, s.lifetimeIncome),
    rankBalance: rankOf(c.balance, s.finalBalance),
    cohortSize: c.income.length,
    stamp: stampOf(s.finalBalance),
    deathLine: `${s.deathAge}歳で閉店（${s.deathCause}）`,
    closing: "またのご来店は、ございません。",
  };
}

export interface TurningPoint {
  age: number;
  text: string;
  amount?: number;
}

/** 転機：選択と、金額の大きい出来事・人生の節目 */
export function turningPoints(l: Life, max = 8): TurningPoint[] {
  const all: (LifeEvent & { score: number })[] = [];
  for (const y of l.records)
    for (const e of y.events) {
      if (!e.major) continue;
      const score = Math.abs(e.amount ?? 0) / 1e6 + (e.kind === "choice" ? 3 : 0) + (["family", "luck", "disaster", "health"].includes(e.kind) ? 2 : 0);
      all.push({ ...e, score });
    }
  return all
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .sort((a, b) => a.age - b.age)
    .map((e) => ({ age: e.age, text: e.text, amount: e.amount }));
}

export const SHARE_TEXT = "あなたはどこでお金を使う？ #人生のレシート";

export function shareIntentUrl(url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`;
}

export { yen, BIRTH_YEAR };
