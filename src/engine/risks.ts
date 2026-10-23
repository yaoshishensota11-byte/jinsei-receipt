// 国ごとのリスク（物価の暴騰・犯罪・政情不安・紛争・感染症・干ばつ・洪水・地震）と、
// 国ごとの「その国らしい出来事」（data/world/country_events.json）を、1年ごとに起こす。
import risksJson from "../../data/world/risks.json";
import eventsJson from "../../data/world/country_events.json";
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
 * パートナーからの暴力が「始まる」1年あたりの確率。
 * 統計は「過去1年に受けた女性の割合」なので、生涯で経験する割合（およそその2倍強）に直してから年あたりに割る。
 */
export function ipvHazard(iso3: string): number {
  const lifetime = Math.min(0.6, riskOf(iso3).ipvPast12mWomen * 2.2);
  return 1 - Math.pow(1 - lifetime, 1 / 40);
}

/** 統計にもとづく、選択のない出来事 */
export function riskYear(l: Life, r: Rng): void {
  const a = l.age;
  if (a < 18) return;
  const k = riskOf(l.D.iso3);
  const cash = Math.max(0, l.cash);

  // 物価の暴騰（お金が大量に刷られ、通貨の価値が急に下がる）。過去にそうした年の割合から
  if (cash > 0 && r.chance(k.inflationCrisisShare * 0.5)) {
    const loss = cash * r.range(0.3, 0.7) * (l.protectCash ? 0.4 : 1);
    l.spend("other", loss);
    l.log("money", `物価が急に跳ね上がり、通貨の価値が下がった。貯金の価値が${Math.round((loss / cash) * 10)}割ほど減った。`, -loss, true);
  } else if (cash > 0 && k.inflationMean > 0.08) {
    // 物価が上がり続ける国では、現金のまま持っていると少しずつ目減りする
    const rate = Math.min(0.2, (k.inflationMean - 0.05) * 0.6) * (l.protectCash ? 0.3 : 1);
    l.spend("other", cash * rate);
    if (!l.inflationNoticed) {
      l.inflationNoticed = true;
      l.log("money", "物価が毎年のように上がり、手元のお金の価値が少しずつ目減りしていく。");
    }
  }

  // 盗難・強盗（殺人率を治安の目安にする）
  if (r.chance(Math.min(0.08, 0.006 + k.homicidePer100k * 0.0018))) {
    const c = l.y(r.range(30_000, 300_000));
    l.spend("other", c);
    l.log("money", r.pick(["家に泥棒が入り、家電と現金を盗まれた。", "道でスマホと財布を奪われた。", "仕事道具を盗まれ、買い直した。"]), -c);
  }

  // 政情不安（政治の安定度が低い国ほど）
  if (k.politicalStability < -0.5 && l.job !== "none" && l.job !== "retired" && r.chance(0.02 * -k.politicalStability)) {
    const lost = l.salaryOf(a) * 0.25;
    l.spend("other", lost);
    l.log("work", "政情が不安定になり、デモや封鎖で仕事が数か月止まった。", -lost, true);
  }

  // 紛争による避難
  if (k.conflictRisk > 0 && r.chance(k.conflictRisk * 0.012)) {
    const c = l.y(r.range(200_000, 800_000)) + Math.max(0, l.cash) * 0.3;
    l.spend("housing", c);
    if (l.home === "own") l.home = "rent";
    l.log("disaster", "地域で武力衝突が起き、家族で避難した。暮らしを立て直すのに時間がかかった。", -c, true);
  }

  // 感染症の流行
  if (r.chance(k.epidemicRisk * 0.015)) {
    const c = l.y(r.range(20_000, 150_000)) + (l.job !== "none" && l.job !== "retired" ? l.salaryOf(a) * 0.15 : 0);
    l.spend("medical", c);
    l.log("health", "感染症が流行し、家族が寝込んだ。しばらく働けなかった。", -c);
  }

  // 干ばつ（農村部）
  if (l.region.urban === false && !l.D.isJapan && r.chance(k.droughtRisk * 0.035)) {
    const c = Math.max(l.salaryOf(a), l.y(500_000)) * 0.3;
    l.spend("other", c);
    l.log("disaster", "雨が降らず、作物がほとんど育たなかった。食べ物の値段も上がった。", -c, true);
  }

  // 洪水・地震（日本の地震は既存の災害で扱うので、日本以外のみ）
  if (!l.D.isJapan) {
    if (r.chance(k.floodRisk * 0.015)) {
      const c = l.y(r.range(100_000, 600_000));
      l.spend("events", c);
      l.log("disaster", "大雨で川があふれ、家が浸水した。", -c, true);
    } else if (r.chance(k.earthquakeRisk * 0.004)) {
      const c = l.y(r.range(300_000, 2_000_000));
      l.spend("events", c);
      l.log("disaster", "大きな地震で家が壊れ、修理が必要になった。", -c, true);
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
  switch (e.requires) {
    case "working":
      return l.job !== "none" && l.job !== "retired" && l.school === "done";
    case "married":
      return !!l.partner;
    case "hasKids":
      return l.kids.some((x) => l.age - x.born < 18);
    case "rural":
      return l.region.urban === false;
    case "urban":
      return l.region.urban !== false;
    case "ownsHome":
      return l.home === "own";
    default:
      return true;
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
      options: e.options.map((o) => ({
        id: o.id,
        label: o.label,
        desc: o.desc,
        apply: (l: Life) => {
          const m = applyEffects(l, o.effects ?? []);
          l.logPre("life", o.result || `${o.label}ことにした。`, m || undefined);
        },
      })),
    };
  }
  return null;
}

export const COUNTRY_EVENT_COUNT = EVENTS.length;
