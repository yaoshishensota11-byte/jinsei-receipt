// 国ごとの統計データ。日本は data/*.json（国内の公的統計）をそのまま使い、
// 他の国は data/world/countries.json の値から同じ形のデータを組み立てる（country.ts）。
import incomeJson from "../../data/income.json";
import livingJson from "../../data/living.json";
import lifeJson from "../../data/lifetable.json";
import eduJson from "../../data/education.json";
import householdJson from "../../data/household.json";
import eventsJson from "../../data/events.json";
import type { Edu, Sex } from "./types";

type EduTable = Record<Edu, number[]>;
export interface IncomeData {
  ageBands: number[];
  regular: Record<Sex, EduTable>;
  nonRegular: Record<Sex, number[]>;
  selfEmployedMedianAnnual: number;
}
export interface IncomeBand {
  id: string;
  label: string;
  min: number;
  max: number;
  share: number;
}
export interface Region {
  id: string;
  label: string;
  birthShare: number;
  wageIndex: number;
  rentIndex: number;
  disasterRisk: number;
  urban?: boolean;
}
export interface Living {
  singleMonthly: Record<string, number>;
  familyMonthlyByHeadAge: Record<"under30" | "30s" | "40s" | "50s" | "60s" | "70plus", number>;
  retiredCoupleMonthly: { expense: number; income: number };
  educationCostPerChild: {
    public_total_k_to_hs: number;
    private_total_k_to_hs: number;
    university_national_4y: number;
    university_private_4y: number;
  };
  weddingCost: number;
  childbirthNetCost: number;
  funeralCost: number;
  housePriceNewBuilt: { tokyo: number; national: number };
  rentMonthly: { tokyo: number; osaka: number; regional_city: number; rural: number };
}
export interface LifeTable {
  lifeExpectancy0: Record<Sex, number>;
  qx: Record<Sex, number[]>;
  causeShare: Record<"under40" | "40to64" | "65plus", Record<string, number>>;
}
export interface Education {
  highSchoolEntryRate: number;
  highSchoolDropoutRate: number;
  universityEntryRate: number;
  vocationalEntryRate: number;
  graduateSchoolEntryRate: number;
  universityDropoutRate: number;
  universityEntryByHouseholdIncome: Record<"under400" | "400to600" | "600to800" | "800to1000" | "over1000", number>;
  scholarshipUseRate: number;
  privateUniversityShare: number;
}
export interface Events {
  marriageByAge: Record<"20s" | "30s" | "40s" | "50plus", number>;
  lifetimeUnmarriedRate: Record<Sex, number>;
  divorceRateAnnual: number;
  birthsPerCouple: number;
  unemploymentRate: number;
  layoffAnnual: number;
  jobChangeRateAnnual: number;
  promotionToManagerBy45: number;
  cancerLifetimeRisk: Record<Sex, number>;
  cancerIncidenceByAge: Record<"30s" | "40s" | "50s" | "60s" | "70plus", number>;
  longTermCareNeedRateByAge: Record<"65to74" | "75to84" | "85plus", number>;
  parentCareStartProbByChildAge: Record<"40s" | "50s" | "60s", number>;
  inheritanceAverage: number;
  inheritanceProbability: number;
  majorDisasterAnnualByRiskUnit: number;
  lotteryJackpotOdds: number;
  lotteryParticipationRate: number;
  startupFiveYearSurvival: number;
  startupBigSuccessRate: number;
  investmentReturn: { meanAnnual: number; stdevAnnual: number };
  depositRate: number;
  pensionMonthly: { kosei_avg: number; kokumin_avg: number };
  retirementAllowance: { university: number; high_school: number };
  taxAndSocialInsuranceRate: number;
}

export interface Currency {
  code: string;
  nameJa: string;
  symbol: string;
  jpyPerUnit: number;
}

/** 日本以外の国だけが持つ、制度の違いを表す値 */
export interface Institutions {
  iso3: string;
  incomeGroup: "LIC" | "LMC" | "UMC" | "HIC";
  under5MortalityPer1000: number;
  pensionCoverage: number;
  pensionReplacementRate: number;
  /** 医療費の自己負担の重さ（日本＝1） */
  medicalBurden: number;
  effectiveTaxRate: number;
  informalShare: number;
  /** 結婚が日本より何歳早いか（男・女） */
  marriageAgeShift: Record<Sex, number>;
  tfr: number;
  remittance: number;
}

export class CountryData {
  constructor(
    readonly iso3: string,
    readonly nameJa: string,
    readonly currency: Currency,
    /** お金の規模（日本＝1）。円で書かれた定数にこれを掛けると、その国の通貨での目安になる */
    readonly k: number,
    readonly income: IncomeData,
    readonly living: Living,
    readonly lifetable: LifeTable,
    readonly education: Education,
    readonly household: { incomeBandsWithChildren: IncomeBand[]; regions: Region[] },
    readonly ev: Events,
    /** 日本なら null（日本の制度でそのまま計算する） */
    readonly inst: Institutions | null,
  ) {}

  get isJapan(): boolean {
    return this.inst === null;
  }

  /** 年齢 → 年収（正社員、学歴別） */
  regularWage(sex: Sex, edu: Edu, age: number): number {
    const tbl = this.income.regular[sex][edu] ?? this.income.regular[sex].high_school;
    return this.bandLookup(tbl, age);
  }
  nonRegularWage(sex: Sex, age: number): number {
    return this.bandLookup(this.income.nonRegular[sex], age);
  }
  private bandLookup(tbl: number[], age: number): number {
    const bands = this.income.ageBands;
    // 帯の中央年齢で線形補間して、誕生日ごとの段差をなくす
    const mids = bands.map((b) => b + 2.5);
    if (age <= mids[0]) return num(tbl[0]) * Math.max(0.75, 1 - (mids[0] - age) * 0.05);
    for (let i = 0; i < mids.length - 1; i++) {
      if (age < mids[i + 1]) {
        const t = (age - mids[i]) / (mids[i + 1] - mids[i]);
        return num(tbl[i]) * (1 - t) + num(tbl[i + 1] ?? tbl[i]) * t;
      }
    }
    return num(tbl[tbl.length - 1]);
  }

  qx(sex: Sex, age: number): number {
    const arr = this.lifetable.qx[sex];
    if (age >= arr.length) return 1;
    return Math.min(1, Math.max(0, num(arr[age])));
  }

  familyMonthly(headAge: number): number {
    const f = this.living.familyMonthlyByHeadAge;
    if (headAge < 30) return f.under30;
    if (headAge < 40) return f["30s"];
    if (headAge < 50) return f["40s"];
    if (headAge < 60) return f["50s"];
    if (headAge < 70) return f["60s"];
    return f["70plus"];
  }

  singleMonthlyTotal(): number {
    return Object.values(this.living.singleMonthly).reduce((a, b) => a + num(b), 0);
  }

  rentFor(region: Region): number {
    const r = this.living.rentMonthly;
    if (!this.isJapan) return r.regional_city * region.rentIndex;
    if (region.id === "tokyo") return r.tokyo;
    if (region.id === "osaka" || region.id === "nagoya") return r.osaka;
    if (region.id === "city") return r.regional_city;
    return r.rural;
  }

  cancerAnnual(age: number): number {
    const c = this.ev.cancerIncidenceByAge;
    if (age < 30) return c["30s"] * 0.25;
    if (age < 40) return c["30s"];
    if (age < 50) return c["40s"];
    if (age < 60) return c["50s"];
    if (age < 70) return c["60s"];
    return c["70plus"];
  }

  careNeed(age: number): number {
    const c = this.ev.longTermCareNeedRateByAge;
    if (age < 65) return 0.004;
    if (age < 75) return c["65to74"];
    if (age < 85) return c["75to84"];
    return c["85plus"];
  }

  /** 1年あたりの初婚の起こりやすさ（その国の結婚年齢に合わせて年齢をずらす） */
  marriageHazard(age: number, sex: Sex): number {
    const shift = this.inst?.marriageAgeShift[sex] ?? 0;
    const a = age + shift;
    const m = this.ev.marriageByAge;
    if (a < 18) return 0;
    const base = a < 30 ? m["20s"] : a < 40 ? m["30s"] : a < 50 ? m["40s"] : m["50plus"];
    // 生涯未婚率が日本より低い国が多いので、日本以外は少し結婚しやすくする
    return base * (this.isJapan ? 1 : 1.35);
  }

  /** 世帯年収 → 子どもの大学進学率 */
  univRateForIncome(hh: number): number {
    const u = this.education.universityEntryByHouseholdIncome;
    const x = hh / this.k;
    if (x < 4_000_000) return u.under400;
    if (x < 6_000_000) return u["400to600"];
    if (x < 8_000_000) return u["600to800"];
    if (x < 10_000_000) return u["800to1000"];
    return u.over1000;
  }

  /** 給与にかかる税・社会保険 */
  tax(gross: number, formal: boolean): number {
    if (gross <= 0) return 0;
    if (this.isJapan) return taxJapan(gross);
    const inst = this.inst!;
    // 平均的な正規労働者の実効税率を基準に、収入が多いほど重くする
    const rel = gross / Math.max(1, this.regularWage("male", "high_school", 40));
    const rate = inst.effectiveTaxRate * Math.min(1.8, Math.max(0.3, Math.pow(rel, 0.35)));
    return gross * rate * (formal ? 1 : 0.25);
  }
  pensionTax(p: number): number {
    if (this.isJapan) return Math.max(0, p - 1_100_000) * 0.1 + p * 0.06;
    return p * this.inst!.effectiveTaxRate * 0.4;
  }

  /** お金の表示。日本は円、他の国は現地通貨（約◯円） */
  fmt(n: number, withJpy = true): string {
    if (this.isJapan) return yen(n);
    const local = jaUnits(n) + this.currency.nameJa;
    return withJpy ? `${local}（約${yen(n * this.currency.jpyPerUnit)}）` : local;
  }
  toJpy(n: number): number {
    return n * this.currency.jpyPerUnit;
  }
}

function num(x: unknown): number {
  return typeof x === "number" && isFinite(x) ? x : 0;
}

/** 日本の所得税・住民税・社会保険の簡易計算 */
export function taxJapan(gross: number): number {
  if (gross <= 0) return 0;
  const social = Math.min(gross, 14_000_000) * 0.15;
  const kyuyo = Math.min(1_950_000, Math.max(550_000, gross * 0.2 + 440_000));
  const taxable = Math.max(0, gross - kyuyo - social - 480_000);
  const brackets: [number, number][] = [
    [1_950_000, 0.05],
    [3_300_000, 0.1],
    [6_950_000, 0.2],
    [9_000_000, 0.23],
    [18_000_000, 0.33],
    [40_000_000, 0.4],
    [Infinity, 0.45],
  ];
  let it = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (taxable > prev) it += (Math.min(taxable, cap) - prev) * rate;
    prev = cap;
  }
  return social + it * 1.021 + taxable * 0.1;
}

/** 万・億の単位で丸める（通貨名は付けない） */
export function jaUnits(n: number): string {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e8) return `${sign}${(a / 1e8).toFixed(a >= 1e9 ? 1 : 2)}億`;
  if (a >= 1e4) return `${sign}${Math.round(a / 1e4).toLocaleString("ja-JP")}万`;
  return `${sign}${Math.round(a).toLocaleString("ja-JP")}`;
}

export function yen(n: number): string {
  return jaUnits(n) + "円";
}

export const JAPAN = new CountryData(
  "JPN",
  "日本",
  { code: "JPY", nameJa: "円", symbol: "¥", jpyPerUnit: 1 },
  1,
  incomeJson as unknown as IncomeData,
  livingJson as unknown as Living,
  lifeJson as unknown as LifeTable,
  eduJson as unknown as Education,
  householdJson as unknown as CountryData["household"],
  eventsJson as unknown as Events,
  null,
);
