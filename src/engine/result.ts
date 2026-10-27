// 結果（レシート・詳細ページ）用のデータ組み立てと、URLへの符号化。
// URLには「シード」と「各選択場面で何番目を選んだか」だけを入れる。
// エンジンは決定的なので、これだけで人生をまるごと再現できる（サーバー不要）。
import { Life, cohort, rankOf, BIRTH_YEAR, yen, kidFemale, type Heritage, type LineageEntry } from "./sim";
import { pickCountry, type Mode } from "./world";
import { streamRng } from "./rng";
import { EXPENSE_LABEL, type ExpenseCat, type LifeEvent } from "./types";

export const CODEC_VERSION = "7";

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
  /** 生涯で稼いだお金（本人の稼ぎだけ。パートナーの稼ぎ・年金・手当は含めない。現地通貨） */
  lifetimeIncome: number;
  deathLine: string;
  closing: string;
  /** 何代目か（1代目は 1） */
  generation: number;
  /** 2代目以降：「2代目（1代目の第一子）」 */
  generationLabel: string;
  /** 2代目以降：これまでの代と、この代（円に直した金額） */
  lineage: { gen: number; sex: string; years: string; earnedJpy: number; leftJpy: number }[];
}

/** 選択の並び（options の何番目か）を作る */
export function picksOf(l: Life): number[] {
  return l.choiceLog.map((c) => c.pickIndex ?? 0);
}

// 版7（子どもからの電話、親が残した家の選択を追加）：`7.<モード j|m|w>.<シード>.<選んだ番号の並び>`。国はモードとシードから決まる
// 子どもに生まれ直したときは、後ろに「~<何番目の子か>.<選んだ番号の並び>」を代ごとに足す（3代目まで）
export function encodeResult(l: Life): string {
  const picks = picksOf(l).join("");
  return l.heir ? `${l.heir.code}~${l.heir.idx}.${picks}` : `${CODEC_VERSION}.${l.mode}.${l.seed}.${picks}`;
}

export interface Decoded {
  mode: Mode;
  seed: string;
  picks: number[];
  /** 2代目以降（何番目の子に生まれ直したか、その代で選んだ番号） */
  next: { idx: number; picks: number[] }[];
}

export function decodeResult(code: string): Decoded | null {
  const m = /^(\d+)\.([jmw])\.([a-z0-9-]{1,40})\.([0-9]{0,120})((?:~\d\.[0-9]{0,120}){0,2})$/.exec(code.trim());
  if (!m || m[1] !== CODEC_VERSION) return null;
  const next = m[5]
    .split("~")
    .slice(1)
    .map((x) => {
      const [i, p] = x.split(".");
      return { idx: Number(i), picks: [...p].map(Number) };
    });
  return { mode: m[2] as Mode, seed: m[3], picks: [...m[4]].map(Number), next };
}

/** 何代まで続けられるか */
export const MAX_GEN = 3;

/** 亡くなった人の idx 番目の子として、次の代の人生を作る */
export function childOf(l: Life, idx: number): Life {
  const k = l.kids[idx];
  const gen = (l.heir?.gen ?? 1) + 1;
  const sex = kidFemale(l.seed, idx) ? "female" : "male";
  const parentIdx = l.sex === "male" ? 0 : 1;
  const ages: [number, number] = [0, 0];
  ages[parentIdx] = k.born;
  ages[parentIdx === 0 ? 1 : 0] = Math.max(18, k.otherAge ?? k.born + (parentIdx === 0 ? -2 : 2));
  // もう一人の親：前の代の人生の中で亡くなっていればその年に、最後まで一緒にいれば前の代のあなたより先には亡くならない
  const died = k.otherSince !== undefined ? l.partnerDeaths[k.otherSince] : undefined;
  const together = !!l.partner && l.partner.alive && l.partnerSince === k.otherSince;
  // 家庭の年収：生まれた年の、前の代の夫婦の稼ぎ
  const rec = l.records.find((y) => y.age === k.born);
  const hh = rec ? (rec.income.salary ?? 0) + (rec.income.partner ?? 0) : 0;
  const bands = l.D.household.incomeBandsWithChildren;
  const band = bands.find((b) => hh >= b.min && hh < b.max) ?? (hh < bands[0].min ? bands[0] : bands[bands.length - 1]);
  // 遺産：最後に残したお金（家を含む）を子どもの数で分ける。借金も相続放棄せず、子どもの数で分けて引き継ぐ
  const n = Math.max(1, l.kids.length);
  const total = l.balance;
  const home = Math.max(0, Math.min(l.homeValue, total));
  const s = l.summary();
  const lineage: LineageEntry[] = [
    ...(l.heir?.lineage ?? []),
    { gen: gen - 1, sex: l.sex, birthYear: l.birthYear, deathAge: l.age, region: l.region.label, earned: s.incomeTotal.salary ?? 0, left: s.finalBalance },
  ];
  const h: Heritage = {
    gen,
    idx,
    code: encodeResult(l),
    nth: ["第一子", "第二子", "第三子", "第四子", "第五子"][idx] ?? "子ども",
    sex,
    regionId: l.region.id,
    bandId: band.id,
    parentAges: ages,
    parentIdx,
    parentDies: l.age - k.born,
    otherDies: died !== undefined ? died - k.born : null,
    otherSafeUntil: together ? l.age - k.born + 1 : 0,
    sibs: l.kids.map((o, j) => ({ sex: (kidFemale(l.seed, j) ? "female" : "male") as "female" | "male", born: o.born - k.born })).filter((_, j) => j !== idx),
    estate: Math.max(0, total - home) / n,
    debt: Math.max(0, -total) / n,
    homeShare: home / n,
    hadHome: l.homeValue > 0,
    lineage,
  };
  return new Life(`${l.seed}k${idx}`, l.D, l.mode, l.birthYear + k.born, h);
}

/** 子どもとして生まれ直したとき、受け継ぐお金の目安（家を含む。借金ならマイナス。現地通貨） */
export function estateFor(l: Life): number {
  return l.balance / Math.max(1, l.kids.length);
}

/** URLの版が今より古いか（ゲームの内容が変わり、同じ人生を再現できなくなったもの） */
export function isOldVersion(code: string): boolean {
  const m = /^(\d+)\./.exec(code.trim());
  return !!m && Number(m[1]) < Number(CODEC_VERSION);
}

/** 生まれる前の人生を作る（モードから国が決まる） */
export function newLife(seed: string, mode: Mode): Life {
  return new Life(seed, pickCountry(seed, mode), mode);
}

/** 番号の並びから人生を再現 */
export function replayByIndex(seed: string, picks: number[], mode: Mode = "j"): Life {
  return playPicks(newLife(seed, mode), picks);
}

/** 共有コードから、何代目までも含めて人生を再現する（子どもの番号が合わないときは null） */
export function replayCode(d: Decoded): Life | null {
  let l = replayByIndex(d.seed, d.picks, d.mode);
  for (const n of d.next) {
    if (!l.kids[n.idx]) return null;
    l = playPicks(childOf(l, n.idx), n.picks);
  }
  return l;
}

/** 作ってある人生を、選んだ番号の並びどおりに最後まで進める */
export function playPicks(l: Life, picks: number[]): Life {
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
      return has("要介護") && !l.choiceLog.some((c) => c.id === "parentCare" && ["facility", "home", "liveIn", "quit", "share"].includes(c.optionId))
        ? "自分の介護サービス"
        : "親の介護、そして自分の";
    case "fun":
      return l.lottery ? "宝くじ代を含む" : "趣味と付き合い";
    case "events":
      return has("災害") || has("地震") ? "災害の修理を含む" : "冠婚葬祭と臨時の出費";
    case "selfEdu":
      return l.choiceLog.some((c) => /loan|night/.test(c.optionId)) ? "奨学金と学費" : "学び直しの費用";
    case "love": {
      const wed = has("結婚式を挙げた");
      const pay = has("持参金") || has("婚資");
      return [has("付き合いはじめた") ? "デート代" : "", wed ? "結婚式" : "", pay ? "持参金・婚資" : ""].filter(Boolean).join("と") || "出会いと結婚";
    }
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
  const order: ExpenseCat[] = ["housing", "food", "tax", "kids", "car", "fun", "other", "utilities", "medical", "care", "selfEdu", "events", "love", "inflation"];
  const items: ReceiptItem[] = order
    .map((k) => ({ label: EXPENSE_LABEL[k], amount: Math.round(s.expenseTotal[k] ?? 0), memo: memoFor(l, k, s.expenseTotal[k] ?? 0) }))
    // 1万円未満の項目は省く（米ドルなど1単位が大きい通貨でも同じ基準になるよう、円に直して比べる）
    .filter((it) => l.D.toJpy(it.amount) >= 10_000)
    .sort((a, b) => b.amount - a.amount);
  const subtotal = items.reduce((t, i) => t + i.amount, 0);
  const inv = Math.round(s.incomeTotal.invest ?? 0);
  const depositLines = [
    { label: "本人の稼ぎ", amount: Math.round(s.incomeTotal.salary ?? 0) },
    { label: "パートナーの稼ぎ", amount: Math.round(s.incomeTotal.partner ?? 0) },
    { label: "年金・退職金", amount: Math.round(s.incomeTotal.pension ?? 0) },
    { label: l.inherited < 0 ? "親から受け継いだ借金" : "親から受け継いだお金", amount: Math.round(l.inherited) },
    { label: "手当・相続・臨時", amount: Math.round((s.incomeTotal.windfall ?? 0) - l.inherited) },
    { label: "運用損益", amount: inv },
    // 親から受け継いだお金・借金は、少なくても行を残す（子どもに生まれ直したことが分かるように）
  ].filter((d) => Math.abs(l.D.toJpy(d.amount)) >= 10_000 || (d.label.startsWith("親から受け継いだ") && Math.abs(d.amount) >= 1));
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
    lifetimeIncome: Math.round(s.incomeTotal.salary ?? 0),
    deathLine: `${s.deathAge}歳で閉店（${s.deathCause}）`,
    closing: "またのご来店は、ございません。",
    generation: l.heir?.gen ?? 1,
    generationLabel: l.heir ? `${l.heir.gen}代目（${l.heir.gen - 1}代目の${l.heir.nth}）` : "",
    lineage: l.heir
      ? [
          ...l.heir.lineage,
          { gen: l.heir.gen, sex: l.sex, birthYear: l.birthYear, deathAge: s.deathAge, region: s.regionLabel, earned: s.incomeTotal.salary ?? 0, left: s.finalBalance },
        ].map((e) => ({
          gen: e.gen,
          sex: e.sex === "male" ? "男性" : "女性",
          years: `${e.birthYear}〜${e.birthYear + e.deathAge}`,
          earnedJpy: l.D.toJpy(e.earned),
          leftJpy: l.D.toJpy(e.left),
        }))
      : [],
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

/** 生涯で稼いだお金を円に直した額（レシート画像の一言と、Xの投稿文に使う） */
export function lifetimeIncomeJpy(d: ReceiptData): number {
  return d.lifetimeIncome * d.currency.jpyPerUnit;
}

/** Xに投稿する文。生まれた国と、生涯で稼いだお金を添える */
export function shareText(d?: ReceiptData): string {
  if (!d) return SHARE_TEXT;
  const who = d.generation > 1 ? `${d.countryName}に生まれた${d.generation}代目。` : `${d.countryName}に生まれ、`;
  return `${who}生涯で稼いだお金は約${yen(lifetimeIncomeJpy(d))}。${SHARE_TEXT}`;
}

/**
 * Xの投稿画面を開くURL。
 * スマホのXアプリは x.com/intent/post を開くと文やURLが入らないことがあるため、
 * 昔からある twitter.com/intent/tweet を使い、URLも本文に入れる。
 */
export function shareIntentUrl(url: string, d?: ReceiptData): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText(d)}\n${url}`)}`;
}

export { yen, BIRTH_YEAR };
