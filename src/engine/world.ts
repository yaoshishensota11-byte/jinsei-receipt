// 世界の国データ（data/world/countries.json）から、日本と同じ形の CountryData を組み立てる。
// 方針：日本の詳細な統計を「形」として使い、お金の規模（k）と制度の値をその国のものに置き換える。
import countriesJson from "../../data/world/countries.json";
import { CountryData, JAPAN, jaUnits, type Events, type IncomeBand, type Institutions, type Region } from "./data";
import { Rng, hashStr } from "./rng";
import type { Edu, Sex } from "./types";

export interface WorldCountry {
  iso3: string;
  nameJa: string;
  major: boolean;
  incomeGroup: "LIC" | "LMC" | "UMC" | "HIC";
  births: number;
  currency: { code: string; nameJa: string; symbol: string; jpyPerUnit: number };
  gniPerCapitaLCU: number;
  consumptionPerCapitaLCU: number;
  incomeShareQuintiles: number[];
  urbanShare: number;
  places: { nameJa: string; urban: boolean; share: number; incomeIndex: number }[];
  lifeExpectancy: Record<Sex, number>;
  under5MortalityPer1000: number;
  tfr: number;
  meanAgeFirstMarriage: Record<Sex, number>;
  secondaryNetEnrollment: number;
  tertiaryGrossEnrollment: number;
  tertiaryAnnualCostShareOfGni: number;
  unemploymentRate: number;
  informalEmploymentShare: number;
  pensionCoverage: number;
  pensionReplacementRate: number;
  outOfPocketHealthShare: number;
  effectiveTaxRateAvgWorker: number;
  rentShareOfIncome: number;
  housePriceToIncome: number;
  disasterRisk: number;
  remittanceShareGdp: number;
  estimated?: string[];
}

export const COUNTRIES = countriesJson as unknown as WorldCountry[];
const JP = COUNTRIES.find((c) => c.iso3 === "JPN")!;
export const MAJOR = COUNTRIES.filter((c) => c.major);

export type Mode = "j" | "m" | "w";
export const MODE_LABEL: Record<Mode, string> = { j: "日本で生まれる", m: "主要20か国のどこかで", w: "世界のどこかで" };

/** モードとシードから、生まれる国を決める（同じシード＋モードなら同じ国） */
export function pickCountry(seed: string, mode: Mode): CountryData {
  if (mode === "j") return JAPAN;
  const r = new Rng(hashStr(`${seed}|country|${mode}`));
  // 主要国モードは20か国から均等に、世界モードは実際の出生数の割合で選ぶ
  const c = mode === "m" ? r.pick(MAJOR) : r.weighted(COUNTRIES, COUNTRIES.map((x) => x.births));
  return countryData(c.iso3);
}

const cache = new Map<string, CountryData>();
export function countryData(iso3: string): CountryData {
  if (iso3 === "JPN") return JAPAN;
  const hit = cache.get(iso3);
  if (hit) return hit;
  const c = COUNTRIES.find((x) => x.iso3 === iso3);
  if (!c) throw new Error(`国が見つかりません: ${iso3}`);
  const d = build(c);
  cache.set(iso3, d);
  return d;
}

export function worldCountry(iso3: string): WorldCountry | undefined {
  return COUNTRIES.find((x) => x.iso3 === iso3);
}

// 学歴による賃金差は、所得の低い国ほど大きい（日本の曲線に対する倍率）
const EDU_PREMIUM: Record<WorldCountry["incomeGroup"], Record<Edu, number>> = {
  HIC: { junior_high: 1, high_school: 1, vocational: 1, university: 1, graduate: 1 },
  UMC: { junior_high: 0.85, high_school: 1, vocational: 1.1, university: 1.35, graduate: 1.5 },
  LMC: { junior_high: 0.7, high_school: 1, vocational: 1.15, university: 1.6, graduate: 1.9 },
  LIC: { junior_high: 0.6, high_school: 1, vocational: 1.2, university: 1.9, graduate: 2.3 },
};
const DROPOUT: Record<WorldCountry["incomeGroup"], number> = { HIC: 1, UMC: 1.5, LMC: 2, LIC: 2.6 };
const CANCER: Record<WorldCountry["incomeGroup"], number> = { HIC: 1, UMC: 0.75, LMC: 0.55, LIC: 0.45 };

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const fin = (x: unknown, d: number) => (typeof x === "number" && isFinite(x) ? x : d);

function build(c: WorldCountry): CountryData {
  const k = c.gniPerCapitaLCU / JP.gniPerCapitaLCU;
  // 消費の割合の違いは、そのままだと貯蓄が極端になるので弱めて反映する
  const consumptionRatio = clamp(Math.pow(c.consumptionPerCapitaLCU / c.gniPerCapitaLCU / (JP.consumptionPerCapitaLCU / JP.gniPerCapitaLCU), 0.6), 0.75, 1.3);
  const prem = EDU_PREMIUM[c.incomeGroup] ?? EDU_PREMIUM.LMC;
  const J = JAPAN;
  const scale = (o: Record<string, number>, f: number) => Object.fromEntries(Object.entries(o).map(([key, v]) => [key, v * f]));

  // 収入：日本の年齢カーブを k 倍し、学歴差を国の水準に合わせる
  const regular = {} as CountryData["income"]["regular"];
  for (const sex of ["male", "female"] as Sex[]) {
    regular[sex] = {} as Record<Edu, number[]>;
    for (const edu of Object.keys(J.income.regular[sex]) as Edu[]) {
      regular[sex][edu] = J.income.regular[sex][edu].map((v) => v * k * prem[edu]);
    }
  }
  const informal = 1 - 0.3 * c.informalEmploymentShare;
  const income: CountryData["income"] = {
    ageBands: J.income.ageBands,
    regular,
    nonRegular: { male: J.income.nonRegular.male.map((v) => v * k * informal), female: J.income.nonRegular.female.map((v) => v * k * informal) },
    selfEmployedMedianAnnual: J.income.selfEmployedMedianAnnual * k * informal,
  };

  // 生活費：日本の家計の形を k 倍し、消費の割合の違いを反映
  const lk = k * consumptionRatio;
  const rentScale = clamp(c.rentShareOfIncome / JP.rentShareOfIncome, 0.5, 2);
  const L = J.living;
  const univYear = c.tertiaryAnnualCostShareOfGni * c.gniPerCapitaLCU;
  const living: CountryData["living"] = {
    singleMonthly: scale(L.singleMonthly, lk),
    familyMonthlyByHeadAge: scale(L.familyMonthlyByHeadAge, lk) as CountryData["living"]["familyMonthlyByHeadAge"],
    retiredCoupleMonthly: { expense: L.retiredCoupleMonthly.expense * lk, income: L.retiredCoupleMonthly.income * lk },
    educationCostPerChild: {
      public_total_k_to_hs: L.educationCostPerChild.public_total_k_to_hs * lk * (c.incomeGroup === "LIC" ? 0.7 : 1),
      private_total_k_to_hs: L.educationCostPerChild.private_total_k_to_hs * lk,
      university_national_4y: univYear * 4 * 0.6,
      university_private_4y: univYear * 4 * 1.5,
    },
    weddingCost: L.weddingCost * lk,
    childbirthNetCost: L.childbirthNetCost * lk,
    funeralCost: L.funeralCost * lk,
    housePriceNewBuilt: {
      tokyo: L.housePriceNewBuilt.tokyo * k * clamp(c.housePriceToIncome / JP.housePriceToIncome, 0.5, 3),
      national: L.housePriceNewBuilt.national * k * clamp(c.housePriceToIncome / JP.housePriceToIncome, 0.5, 3),
    },
    rentMonthly: { tokyo: 0, osaka: 0, regional_city: L.rentMonthly.regional_city * k * rentScale, rural: 0 },
  };

  // 寿命：日本の死亡率を標準にした Brass ロジットで、その国の平均寿命に合わせる
  const qx = { male: brass(J.lifetable.qx.male, c.lifeExpectancy.male), female: brass(J.lifetable.qx.female, c.lifeExpectancy.female) };
  const poor = c.incomeGroup === "LIC" || c.incomeGroup === "LMC";
  const cs = J.lifetable.causeShare;
  const causeShare = poor
    ? {
        under40: cs.under40,
        "40to64": cs["40to64"],
        "65plus": { ...cs["65plus"], senility: (cs["65plus"].senility ?? 0) * 0.3, other: (cs["65plus"].other ?? 0) + (cs["65plus"].senility ?? 0) * 0.7 },
      }
    : cs;

  const jpTert = Math.max(0.05, JP.tertiaryGrossEnrollment);
  const tertScale = clamp(c.tertiaryGrossEnrollment / jpTert, 0.03, 1.4);
  const E = J.education;
  const education: CountryData["education"] = {
    ...E,
    highSchoolEntryRate: c.secondaryNetEnrollment,
    highSchoolDropoutRate: E.highSchoolDropoutRate * (DROPOUT[c.incomeGroup] ?? 1.5),
    universityDropoutRate: E.universityDropoutRate * (DROPOUT[c.incomeGroup] ?? 1.5),
    universityEntryRate: c.tertiaryGrossEnrollment,
    graduateSchoolEntryRate: E.graduateSchoolEntryRate * tertScale,
    universityEntryByHouseholdIncome: scale(E.universityEntryByHouseholdIncome, tertScale) as CountryData["education"]["universityEntryByHouseholdIncome"],
  };
  // 上限を超えないように
  for (const key of Object.keys(education.universityEntryByHouseholdIncome) as (keyof typeof education.universityEntryByHouseholdIncome)[])
    education.universityEntryByHouseholdIncome[key] = Math.min(0.95, education.universityEntryByHouseholdIncome[key]);

  // 家庭の豊かさ：その国の所得五分位
  const hhMean = c.consumptionPerCapitaLCU * (2 + Math.min(4, c.tfr)) * 0.95;
  const names = ["とても貧しい家庭", "貧しい家庭", "ふつうの家庭", "ゆとりのある家庭", "裕福な家庭"];
  const ids = ["low", "lower_mid", "mid", "upper_mid", "high"];
  const q = c.incomeShareQuintiles.length === 5 ? c.incomeShareQuintiles : [0.06, 0.11, 0.16, 0.22, 0.45];
  const means = q.map((s) => s * 5 * hhMean);
  const cur = shortCurrency(c.currency.nameJa);
  const bands: IncomeBand[] = means.map((m, i) => ({
    id: ids[i],
    label: `${names[i]}（年収 約${jaUnits(m)}${cur}）`,
    min: i === 0 ? 0 : (means[i - 1] + m) / 2,
    max: i === 4 ? m * 2 : (m + means[i + 1]) / 2,
    share: 0.2,
  }));
  const regions: Region[] = c.places.map((p, i) => ({
    id: `p${i}`,
    label: p.nameJa,
    birthShare: p.share,
    wageIndex: clamp(p.incomeIndex, 0.35, 2.5),
    rentIndex: clamp(p.incomeIndex, 0.35, 2.5),
    disasterRisk: clamp(c.disasterRisk / 0.5, 0.1, 3) * 1.1,
    urban: p.urban,
  }));

  const ev: Events = {
    ...J.ev,
    unemploymentRate: c.unemploymentRate,
    layoffAnnual: J.ev.layoffAnnual * clamp(c.unemploymentRate / Math.max(0.01, JP.unemploymentRate), 0.5, 3),
    inheritanceAverage: J.ev.inheritanceAverage * k,
    retirementAllowance: {
      university: J.ev.retirementAllowance.university * k * (c.incomeGroup === "HIC" ? 0.8 : 0.3),
      high_school: J.ev.retirementAllowance.high_school * k * (c.incomeGroup === "HIC" ? 0.8 : 0.3),
    },
    cancerIncidenceByAge: scale(J.ev.cancerIncidenceByAge, CANCER[c.incomeGroup] ?? 0.6) as Events["cancerIncidenceByAge"],
    birthsPerCouple: c.tfr,
  };

  const inst: Institutions = {
    iso3: c.iso3,
    incomeGroup: c.incomeGroup,
    under5MortalityPer1000: c.under5MortalityPer1000,
    pensionCoverage: clamp(c.pensionCoverage, 0, 1),
    pensionReplacementRate: clamp(fin(c.pensionReplacementRate, 0.4), 0.1, 0.9),
    medicalBurden: clamp(Math.pow(Math.max(0.02, c.outOfPocketHealthShare) / Math.max(0.05, JP.outOfPocketHealthShare), 0.8), 0.6, 3),
    effectiveTaxRate: clamp(fin(c.effectiveTaxRateAvgWorker, 0.15), 0.02, 0.5),
    informalShare: c.informalEmploymentShare,
    marriageAgeShift: {
      male: JP.meanAgeFirstMarriage.male - c.meanAgeFirstMarriage.male,
      female: JP.meanAgeFirstMarriage.female - c.meanAgeFirstMarriage.female,
    },
    tfr: c.tfr,
    remittance: c.remittanceShareGdp,
  };

  return new CountryData(
    c.iso3,
    c.nameJa,
    { code: c.currency.code, nameJa: cur, symbol: c.currency.symbol, jpyPerUnit: c.currency.jpyPerUnit },
    k,
    income,
    living,
    { lifeExpectancy0: c.lifeExpectancy, qx, causeShare },
    education,
    { incomeBandsWithChildren: bands, regions },
    ev,
    inst,
  );
}

/** 「ナイジェリア ナイラ」→「ナイラ」のように、通貨名だけを取り出す */
function shortCurrency(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

/** 標準の死亡率表を、平均寿命 e0 に合うようにずらす（Brass ロジット、β=1） */
function brass(stdQx: number[], e0: number): number[] {
  const lStd: number[] = [1];
  for (let x = 0; x < stdQx.length; x++) lStd.push(lStd[x] * (1 - Math.min(1, stdQx[x])));
  const logit = (l: number) => 0.5 * Math.log((1 - l) / l);
  const ys = lStd.map((l) => (l <= 0 ? 10 : l >= 1 ? -10 : logit(l)));
  const lxOf = (alpha: number) => ys.map((y, i) => (i === 0 ? 1 : 1 / (1 + Math.exp(2 * (alpha + y)))));
  const e0Of = (lx: number[]) => lx.slice(1).reduce((s, l, i) => s + (lx[i] + l) / 2, 0);
  let lo = -3;
  let hi = 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (e0Of(lxOf(mid)) > e0) lo = mid;
    else hi = mid;
  }
  const lx = lxOf((lo + hi) / 2);
  return stdQx.map((_, x) => (lx[x] > 0 ? clamp(1 - lx[x + 1] / lx[x], 0, 1) : 1));
}

export { JAPAN };
