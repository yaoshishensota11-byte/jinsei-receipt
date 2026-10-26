// 結果（レシート・詳細ページ）用のデータ組み立てと、URLへの符号化。
// URLには「シード」と「各選択場面で何番目を選んだか」だけを入れる。
// エンジンは決定的なので、これだけで人生をまるごと再現できる（サーバー不要）。
import { Life, cohort, rankOf, BIRTH_YEAR, yen } from "./sim";
import { pickCountry, type Mode } from "./world";
import { streamRng } from "./rng";
import { EXPENSE_LABEL, type ExpenseCat, type LifeEvent } from "./types";

export const CODEC_VERSION = "2";

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
  /** 表示する通貨（日本は円） */
  currency: { code: string; nameJa: string; symbol: string; jpyPerUnit: number };
  countryName: string;
  /** 物価の上昇で目減りした貯金（現地通貨）。目減りがなければ 0 */
  inflationLoss: number;
  deathLine: string;
  closing: string;
}

/** 選択の並び（options の何番目か）を作る */
export function picksOf(l: Life): number[] {
  return l.choiceLog.map((c) => c.pickIndex ?? 0);
}

// 版2：`2.<モード j|m|w>.<シード>.<選んだ番号の並び>`。国はモードとシードから決まる
export function encodeResult(l: Life): string {
  return `${CODEC_VERSION}.${l.mode}.${l.seed}.${picksOf(l).join("")}`;
}

export function decodeResult(code: string): { mode: Mode; seed: string; picks: number[] } | null {
  const m = /^(\d+)\.([jmw])\.([a-z0-9-]{1,40})\.([0-9]{0,120})$/.exec(code.trim());
  if (!m || m[1] !== CODEC_VERSION) return null;
  return { mode: m[2] as Mode, seed: m[3], picks: [...m[4]].map(Number) };
}

/** 生まれる前の人生を作る（モードから国が決まる） */
export function newLife(seed: string, mode: Mode): Life {
  return new Life(seed, pickCountry(seed, mode), mode);
}

/** 番号の並びから人生を再現 */
export function replayByIndex(seed: string, picks: number[], mode: Mode = "j"): Life {
  const l = newLife(seed, mode);
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

/** はんこ。基準額は円で決め、その国のお金の規模（k）に合わせる */
export function stampOf(balance: number, k = 1): ReceiptData["stamp"] {
  balance /= k;
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
      return l.D.toJpy(amount) > 80_000_000 ? "国にはずいぶん貢献した" : "給料から毎月、静かに引かれた";
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
      return l.region.id === "tokyo" || (!l.D.isJapan && l.region.urban) ? "電車・バスとスマホ代" : "車は暮らしの足";
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
    case "inflation": {
      const spells = ev.filter((e) => e.text.includes("実際に記録された上昇率")).length;
      return spells > 0 ? `物価の高騰${spells}回。働いても残らない` : "物価が上がり、少しずつ目減り";
    }
    case "other":
      return "服・家具・日用品";
  }
}

export function buildReceipt(l: Life): ReceiptData {
  const s = l.summary();
  const c = cohort(l.D);
  const order: ExpenseCat[] = ["housing", "food", "tax", "kids", "car", "fun", "other", "utilities", "medical", "care", "selfEdu", "events", "inflation"];
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
    customer: l.D.isJapan
      ? `${s.regionLabel}生まれ・${sexWord}・家庭${s.familyBandLabel.replace("年収", "")}`
      : `${l.D.nameJa}・${s.regionLabel}生まれ・${sexWord}・${s.familyBandLabel.replace(/（.*$/, "")}`,
    items,
    subtotal,
    deposit: Math.round(s.lifetimeIncome + inv),
    depositLines,
    change: s.finalBalance,
    rankIncome: rankOf(c.income, s.lifetimeIncome),
    rankBalance: rankOf(c.balance, s.finalBalance),
    cohortSize: c.income.length,
    stamp: stampOf(s.finalBalance, l.D.k),
    currency: l.D.currency,
    countryName: l.D.nameJa,
    inflationLoss: Math.round(s.expenseTotal.inflation ?? 0),
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

/** 物価で消えた貯金を円に直した額。1万円未満は 0（共有の文やレシートの一言に出さない） */
export function inflationLossJpy(d: ReceiptData): number {
  const v = d.inflationLoss * d.currency.jpyPerUnit;
  return v >= 10_000 ? v : 0;
}

/** Xに投稿する文。物価で貯金が消えた人生は、その額を一言添える */
export function shareText(d?: ReceiptData): string {
  const v = d ? inflationLossJpy(d) : 0;
  return v > 0 ? `${d!.countryName}に生まれ、物価で消えた貯金は約${yen(v)}。${SHARE_TEXT}` : SHARE_TEXT;
}

export function shareIntentUrl(url: string, d?: ReceiptData): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(shareText(d))}&url=${encodeURIComponent(url)}`;
}

export { yen, BIRTH_YEAR };
