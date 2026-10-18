// data/*.json（公的統計）を型付きで読み込み、エンジンが使いやすい形の関数にする。
import incomeJson from "../../data/income.json";
import livingJson from "../../data/living.json";
import lifeJson from "../../data/lifetable.json";
import eduJson from "../../data/education.json";
import savingsJson from "../../data/savings.json";
import householdJson from "../../data/household.json";
import eventsJson from "../../data/events.json";
import type { Edu, Sex } from "./types";

type EduTable = Record<Edu, number[]>;
interface IncomeData {
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
}

export const income = incomeJson as unknown as IncomeData;
export const living = livingJson as unknown as {
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
};
export const lifetable = lifeJson as unknown as {
  lifeExpectancy0: Record<Sex, number>;
  qx: Record<Sex, number[]>;
  causeShare: Record<"under40" | "40to64" | "65plus", Record<string, number>>;
};
export const education = eduJson as unknown as {
  highSchoolEntryRate: number;
  highSchoolDropoutRate: number;
  universityEntryRate: number;
  vocationalEntryRate: number;
  graduateSchoolEntryRate: number;
  universityDropoutRate: number;
  universityEntryByHouseholdIncome: Record<"under400" | "400to600" | "600to800" | "800to1000" | "over1000", number>;
  scholarshipUseRate: number;
  privateUniversityShare: number;
};
export const savings = savingsJson as unknown as {
  byAge: Record<string, { noAssetsRate: number; median: number; mean: number }>;
  percentileBins: number[];
  shareByAgeBins: Record<string, number[]>;
};
export const household = householdJson as unknown as {
  incomeBandsWithChildren: IncomeBand[];
  regions: Region[];
};
export const ev = eventsJson as unknown as {
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
};

/** 年齢 → 年収（正社員、学歴別） */
export function regularWage(sex: Sex, edu: Edu, age: number): number {
  const tbl = income.regular[sex][edu] ?? income.regular[sex].high_school;
  return bandLookup(tbl, age);
}
export function nonRegularWage(sex: Sex, age: number): number {
  return bandLookup(income.nonRegular[sex], age);
}
function bandLookup(tbl: number[], age: number): number {
  const bands = income.ageBands;
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
function num(x: unknown): number {
  return typeof x === "number" && isFinite(x) ? x : 0;
}

export function qx(sex: Sex, age: number): number {
  const arr = lifetable.qx[sex];
  if (age >= arr.length) return 1;
  return Math.min(1, Math.max(0, num(arr[age])));
}

export function familyMonthly(headAge: number): number {
  const f = living.familyMonthlyByHeadAge;
  if (headAge < 30) return f.under30;
  if (headAge < 40) return f["30s"];
  if (headAge < 50) return f["40s"];
  if (headAge < 60) return f["50s"];
  if (headAge < 70) return f["60s"];
  return f["70plus"];
}

export function singleMonthlyTotal(): number {
  return Object.values(living.singleMonthly).reduce((a, b) => a + num(b), 0);
}

export function rentFor(regionId: string): number {
  const r = living.rentMonthly;
  if (regionId === "tokyo") return r.tokyo;
  if (regionId === "osaka" || regionId === "nagoya") return r.osaka;
  if (regionId === "city") return r.regional_city;
  return r.rural;
}

export function cancerAnnual(age: number): number {
  const c = ev.cancerIncidenceByAge;
  if (age < 30) return c["30s"] * 0.25;
  if (age < 40) return c["30s"];
  if (age < 50) return c["40s"];
  if (age < 60) return c["50s"];
  if (age < 70) return c["60s"];
  return c["70plus"];
}

export function careNeed(age: number): number {
  const c = ev.longTermCareNeedRateByAge;
  if (age < 65) return 0.004;
  if (age < 75) return c["65to74"];
  if (age < 85) return c["75to84"];
  return c["85plus"];
}

/** 年齢の金融資産分布（savings.json）から、ある残高が同年代の何％点かを返す */
export function savingsPercentile(age: number, amount: number): number {
  const key = age < 30 ? "20s" : age < 40 ? "30s" : age < 50 ? "40s" : age < 60 ? "50s" : age < 70 ? "60s" : "70s";
  const bins = savings.percentileBins;
  const shares = savings.shareByAgeBins[key] ?? savings.shareByAgeBins["70s"];
  if (!shares) return 0.5;
  const total = shares.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  for (let i = 0; i < bins.length; i++) {
    const lo = bins[i];
    const hi = bins[i + 1] ?? lo * 2;
    if (amount < hi || i === bins.length - 1) {
      const t = i === bins.length - 1 ? Math.min(1, (amount - lo) / lo) : (amount - lo) / (hi - lo);
      return Math.min(0.999, Math.max(0, (acc + shares[i] * Math.max(0, Math.min(1, t))) / total));
    }
    acc += shares[i];
  }
  return 0.999;
}
