// 国ごとのリスク（物価の暴騰・犯罪・政情不安・紛争・感染症・干ばつ・洪水・地震）と、
// 国ごとの「その国らしい出来事」（data/world/country_events.json）を、1年ごとに起こす。
import risksJson from "../../data/world/risks.json";
import eventsJson from "../../data/world/country_events.json";
import cpiJson from "../../data/world/cpi_annual.json";
import type { Rng } from "./rng";
import type { Scene } from "./scenes";
import type { Life } from "./sim";

export interface Risk {
  inflationMean: number;
  inflationCrisisShare: number;
  homicidePer100k: number;
  ipvPast12mWomen: number;
  politicalStability: number;
  conflictRisk: number;
  floodRisk: number;
  droughtRisk: number;
  earthquakeRisk: number;
  epidemicRisk: number;
}

const RISKS = risksJson as unknown as Record<string, Partial<Risk>>;
const DEFAULT: Risk = {
  inflationMean: 0.05,
  inflationCrisisShare: 0,
  homicidePer100k: 5,
  ipvPast12mWomen: 0.1,
  politicalStability: 0,
  conflictRisk: 0,
  floodRisk: 0.3,
  droughtRisk: 0.3,
  earthquakeRisk: 0.1,
  epidemicRisk: 0.2,
};
const num = (x: unknown, d: number) => (typeof x === "number" && isFinite(x) ? x : d);

export function riskOf(iso3: string): Risk {
  const r = RISKS[iso3] ?? {};
  const out = { ...DEFAULT };
  for (const k of Object.keys(DEFAULT) as (keyof Risk)[]) out[k] = num(r[k], DEFAULT[k]);
  return out;
}

/**
 * パートナーからの暴力が「始まる」1年あたりの確率（性別ごと）。
 * 生涯の被害経験の割合が分かる国（日本：内閣府調査）はそれを使う。
 * それ以外は「過去1年に受けた女性の割合」を生涯の割合（およそその2倍強）に直し、男性は女性の35%とする。
 */
export function ipvHazard(iso3: string, sex: "male" | "female"): number {
  const raw = RISKS[iso3] as Partial<Risk> & { ipvLifetimeWomen?: number; ipvLifetimeMen?: number };
  const women = num(raw?.ipvLifetimeWomen, Math.min(0.6, riskOf(iso3).ipvPast12mWomen * 2.2));
  const lifetime = sex === "female" ? women : num(raw?.ipvLifetimeMen, women * 0.35);
  // 結婚している期間（およそ40年）で割る
  return 1 - Math.pow(1 - Math.min(0.6, lifetime), 1 / 40);
}

// 国ごとの、年ごとの物価上昇率（%）。World Bank WDI と IMF WEO から（build/cpi_series.py）
const CPI = cpiJson as unknown as Record<string, Record<string, number>>;
const cpiYears = new Map<string, number[]>();
function yearsOf(iso3: string): number[] {
  let ys = cpiYears.get(iso3);
  if (!ys) {
    ys = Object.keys(CPI[iso3] ?? {}).map(Number).sort((a, b) => a - b);
    cpiYears.set(iso3, ys);
  }
  return ys;
}

/**
 * 今年の物価上昇率を、その国で実際に記録された年の値から決める。
 * 人生はこれからの年に進むので、過去の何年分かをひと続きのまま借りてくる（高い物価が何年も続いた時代は、そのまま続く）。
 * 平均でおよそ8年ごとに、別の時代に切り替わる。データのない国は null。
 */
function inflationOf(l: Life, r: Rng): { rate: number; year: number } | null {
  const ys = yearsOf(l.D.iso3);
  if (ys.length < 5) return null;
  const next = l.inflSrcYear === null ? null : ys.find((y) => y > l.inflSrcYear!);
  const jump = r.chance(1 / 8);
  const year = next === undefined || next === null || jump ? ys[Math.floor(r.next() * ys.length)] : next;
  l.inflSrcYear = year;
  // ハイパーインフレの1年がすべてを決めないよう、300%で頭打ちにする
  return { rate: Math.min(3, CPI[l.D.iso3][String(year)] / 100), year };
}

/** 統計にもとづく、選択のない出来事 */
export function riskYear(l: Life, r: Rng): void {
  const a = l.age;
  if (a < 18) return;
  const k = riskOf(l.D.iso3);
  const cash = Math.max(0, l.cash);

  // 物価の上昇。その国で実際に記録された年の上昇率で、現金の価値が目減りする
  const infl = inflationOf(l, r);
  if (infl) {
    const p = infl.rate;
    l.lastInflation = p;
    // 預金の利息で年5%ほどは取り戻せるとみなし、それを超える上昇の分だけ価値が減る
    const lossRate = Math.min(0.75, (Math.max(0, p - 0.05) / (1 + p)) * 0.8) * (l.protectCash ? 0.3 : 1);
    const loss = cash * lossRate;
    if (loss > 0) l.spend("inflation", loss);
    // 知らせは、激しい上昇が「始まった年」と「収まった年」だけにする（毎年出すと、出来事の一覧が埋まってしまう）
    if (p >= 0.25) {
      if (l.inflSpell === 0) {
        l.inflSpellFrom = infl.year;
        if (cash > 0) l.mark("inflation");
        const tenths = Math.round(lossRate * 10);
        l.log(
          "money",
          `物価が1年で${Math.round(p * 100)}%上がった（${l.D.nameJa}で${infl.year}年に実際に記録された上昇率）。` +
            (cash <= 0 ? "" : tenths >= 1 ? `貯金の価値が${tenths}割ほど減った。` : "貯金の価値が少し減った。") +
            (l.protectCash && cash > 0 ? "ドルや金で持っていた分は守られた。" : ""),
          loss > 0 ? -loss : undefined,
          true,
        );
      }
      l.inflSpell++;
    } else {
      if (l.inflSpell >= 2) {
        l.log("money", `物価の激しい上昇が${l.inflSpell}年続き、ようやく落ち着いた（${l.D.nameJa}の${l.inflSpellFrom}年からの動きと同じ）。`);
      }
      l.inflSpell = 0;
      if (p >= 0.08 && cash > 0 && !l.inflationNoticed) {
        l.inflationNoticed = true;
        l.log("money", "物価が毎年のように上がり、手元のお金の価値が少しずつ目減りしていく。");
      }
    }
  } else if (cash > 0 && r.chance(k.inflationCrisisShare * 0.5)) {
    // 年ごとのデータがない国は、過去に物価が暴騰した年の割合から
    const loss = cash * r.range(0.3, 0.7) * (l.protectCash ? 0.4 : 1);
    l.spend("inflation", loss);
    l.log("money", `物価が急に跳ね上がり、通貨の価値が下がった。貯金の価値が${Math.round((loss / cash) * 10)}割ほど減った。`, -loss, true);
    l.mark("inflation");
  } else if (cash > 0 && k.inflationMean > 0.08) {
    const rate = Math.min(0.2, (k.inflationMean - 0.05) * 0.6) * (l.protectCash ? 0.3 : 1);
    l.spend("inflation", cash * rate);
    if (!l.inflationNoticed) {
      l.inflationNoticed = true;
      l.log("money", "物価が毎年のように上がり、手元のお金の価値が少しずつ目減りしていく。");
    }
  }

  // 盗難・強盗（殺人率を治安の目安にする）
  if (r.chance(Math.min(0.08, 0.006 + k.homicidePer100k * 0.0018))) {
    const c = l.y(r.range(30_000, 300_000));
    l.spend("other", c);
    l.log(
      "money",
      r.pick([
        l.vary("theft1", ["家に泥棒が入り、家電と現金を盗まれた。", "留守のあいだに空き巣に入られた。"]),
        l.vary("theft2", ["道でスマホと財布を奪われた。", "バスの中で財布をすられた。"]),
        l.vary("theft3", ["仕事道具を盗まれ、買い直した。", "自転車を盗まれ、買い直した。"]),
      ]),
      -c,
    );
    l.mark("theft");
  }

  // 政情不安（政治の安定度が低い国ほど）
  if (k.politicalStability < -0.5 && l.job !== "none" && l.job !== "retired" && r.chance(0.02 * -k.politicalStability)) {
    const lost = l.salaryOf(a) * 0.25;
    l.spend("other", lost);
    l.log("work", l.vary("unrest", ["政情が不安定になり、デモや封鎖で仕事が数か月止まった。", "抗議デモで道路が封鎖され、しばらく働きに出られなかった。", "政治の混乱で、勤め先が数か月閉まった。"]), -lost, true);
    l.mark("unrest");
  }

  // 紛争による避難
  if (k.conflictRisk > 0 && r.chance(k.conflictRisk * 0.012)) {
    const c = l.y(r.range(200_000, 800_000)) + Math.max(0, l.cash) * 0.3;
    l.spend("housing", c);
    if (l.home === "own") l.home = "rent";
    l.log("disaster", "地域で武力衝突が起き、家族で避難した。暮らしを立て直すのに時間がかかった。", -c, true);
    l.mark("displaced");
  }

  // 感染症の流行
  if (r.chance(k.epidemicRisk * 0.015)) {
    const c = l.y(r.range(20_000, 150_000)) + (l.job !== "none" && l.job !== "retired" ? l.salaryOf(a) * 0.15 : 0);
    l.spend("medical", c);
    l.log("health", "感染症が流行し、家族が寝込んだ。しばらく働けなかった。", -c);
    l.mark("epidemic");
  }

  // 干ばつ（農村部）
  if (l.region.urban === false && !l.D.isJapan && r.chance(k.droughtRisk * 0.035)) {
    const c = Math.max(l.salaryOf(a), l.y(500_000)) * 0.3;
    l.spend("other", c);
    l.log("disaster", l.vary("drought", ["雨が降らず、作物がほとんど育たなかった。食べ物の値段も上がった。", "日照りが続き、畑が枯れた。家畜の水にも困った。", "雨季に雨が少なく、収穫が半分ほどになった。"]), -c, true);
    l.mark("drought");
  }

  // 洪水・地震（日本の地震は既存の災害で扱うので、日本以外のみ）
  if (!l.D.isJapan) {
    if (r.chance(k.floodRisk * 0.015)) {
      const c = l.y(r.range(100_000, 600_000));
      l.spend("events", c);
      l.log("disaster", "大雨で川があふれ、家が浸水した。", -c, true);
      l.mark("disaster");
    } else if (r.chance(k.earthquakeRisk * 0.004)) {
      const c = l.y(r.range(300_000, 2_000_000));
      l.spend("events", c);
      l.log("disaster", "大きな地震で家が壊れ、修理が必要になった。", -c, true);
      l.mark("disaster");
    }
  }
}

// ───────────────── 国ごとの出来事（データから） ─────────────────

interface EventEffect {
  type: "cost" | "income" | "cashLossPct" | "incomeDropPct" | "careerMult" | "health" | "moveCost" | "protectCash";
  value: number | boolean;
}
interface CountryEvent {
  id: string;
  iso3: string[];
  minAge: number;
  maxAge: number;
  annualProb: number;
  requires: string | null;
  title: string;
  situation: string;
  options: { id: string; label: string; desc: string; effects: EventEffect[]; result: string }[];
}
const EVENTS = eventsJson as unknown as CountryEvent[];

function matches(e: CountryEvent, l: Life): boolean {
  const ig = l.D.inst?.incomeGroup ?? "HIC";
  const tags = new Set(e.iso3);
  const place =
    tags.has(l.D.iso3) ||
    tags.has("*ALL") ||
    tags.has("*" + ig) ||
    (tags.has("*RURAL") && l.region.urban === false) ||
    (tags.has("*URBAN") && l.region.urban !== false);
  if (!place) return false;
  if (l.age < e.minAge || l.age > e.maxAge) return false;
  // 条件は「+」でつなげられる（すべて満たすときだけ起きる）
  return (e.requires ?? "").split("+").every((q) => requirement(q, l));
}

/** 出来事が起きる条件。状況と食い違う出来事（持っていない家の話、いない子どもの話など）を出さないため */
function requirement(q: string, l: Life): boolean {
  const kid = /^kid:(\d+)-(\d+)$/.exec(q);
  if (kid) return l.kids.some((x) => l.age - x.born >= Number(kid[1]) && l.age - x.born <= Number(kid[2]) && !l.kidWithEx(x));
  switch (q) {
    case "":
      return true;
    case "working":
      return l.job !== "none" && l.job !== "retired" && l.school === "done";
    case "nonregular":
      return l.job === "nonregular";
    case "married":
      return !!l.partner?.alive;
    case "newlywed":
      return !!l.partner?.alive && l.age - l.partnerSince <= 1;
    case "dating":
      return l.dating && !l.partner;
    case "hasKids":
      return l.kids.some((x) => l.age - x.born < 18 && !l.kidWithEx(x));
    case "rural":
      return l.region.urban === false;
    case "urban":
      return l.region.urban !== false;
    case "ownsHome":
      return l.home === "own";
    case "mortgage":
      return l.home === "own" && l.loan > 0;
    case "renting":
      return l.home === "rent";
    case "notOwner":
      return l.home !== "own";
    // 高校などに在学中（大学入試・進路の話）
    case "student":
      return l.school === "hs" || l.school === "hs_night" || l.school === "kosen";
    case "inUniv":
      return l.school === "univ" || l.school === "univ_work" || l.school === "univ_night" || l.school === "grad";
    // 離れて暮らす親が生きている
    case "parentAway":
      return l.home !== "parents" && l.parents.some((p) => p.alive);
    default:
      throw new Error(`国ごとの出来事の条件が分からない: ${q}`);
  }
}

function applyEffects(l: Life, effects: EventEffect[]): number {
  let money = 0;
  for (const ef of effects) {
    const v = typeof ef.value === "number" ? ef.value : 0;
    switch (ef.type) {
      case "cost":
        l.spend("other", l.y(v));
        money -= l.y(v);
        break;
      case "income":
        l.addIncome("windfall", l.y(v));
        money += l.y(v);
        break;
      case "cashLossPct": {
        const loss = Math.max(0, l.cash) * Math.min(1, v) * (l.protectCash ? 0.5 : 1);
        l.spend("other", loss);
        money -= loss;
        break;
      }
      case "incomeDropPct": {
        const loss = l.salaryOf(l.age) * Math.min(1, v);
        l.spend("other", loss);
        money -= loss;
        break;
      }
      case "careerMult":
        l.careerMult = Math.min(2.6, Math.max(0.5, l.careerMult * (v || 1)));
        break;
      case "health":
        l.illMult = Math.min(2, Math.max(0.6, l.illMult * (v || 1)));
        break;
      case "moveCost":
        l.spend("housing", l.y(v));
        money -= l.y(v);
        if (l.home === "own") l.home = "rent";
        break;
      case "protectCash":
        l.protectCash = ef.value === true || v > 0;
        break;
    }
  }
  return money;
}

/** その年に起きる「その国らしい出来事」を1つまで選ぶ（一度起きたものは繰り返さない） */
export function countryEventScene(l: Life, r: Rng): Scene | null {
  if (l.age < 6) return null;
  const pool = EVENTS.filter((e) => !l.usedEvents.has(e.id) && matches(e, l));
  for (const e of pool) {
    if (!r.chance(Math.min(0.2, e.annualProb))) continue;
    l.usedEvents.add(e.id);
    return {
      id: `c_${e.id}`,
      title: e.title,
      situation: e.situation,
      stillValid: (l) => (e.requires ?? "").split("+").every((q) => requirement(q, l)),
      options: e.options.map((o) => ({
        id: o.id,
        label: o.label,
        desc: o.desc,
        apply: (l: Life) => {
          // 手元のお金が減る出来事でも、お金がなければ減らない。結果の文が「減った」「取られた」と言うときだけ、一言そえる
          const nothing = (o.effects ?? []).some((x) => x.type === "cashLossPct") && l.cash <= 0;
          const m = applyEffects(l, o.effects ?? []);
          const result = o.result || `${o.label}ことにした。`;
          const note = !nothing ? "" : /詐欺|だまさ|取られ/.test(result) ? "ただ、手元にお金がなく、取られずに済んだ。" : /減|値段|値上|物価|倍/.test(result) ? "ただ、もともと貯金はほとんどなかった。" : "";
          l.logPre("life", result + note, m || undefined);
        },
      })),
    };
  }
  return null;
}

export const COUNTRY_EVENT_COUNT = EVENTS.length;
