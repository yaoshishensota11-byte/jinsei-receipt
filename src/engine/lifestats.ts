// 第11部で集めた、国ごとの「暮らしの支えと危険」の統計（data/world/life_stats.json）。
// 交通事故・お産・病気で休む間の補償・困ったときの国の支え・ひとり親の貧困。
import statsJson from "../../data/world/life_stats.json";

interface LifeStats {
  /** 交通事故で亡くなる人（人口10万人あたり、WHO） */
  roadDeathsPer100k?: number;
  /** 妊娠・出産で亡くなる女性（出生10万あたり、国連の共同推計） */
  maternalDeathsPer100kBirths?: number;
  /** 所得が一番低い2割のうち、社会扶助などを受けている割合（世界銀行 ASPIRE） */
  socialAssistanceQ1?: number;
  /** 何らかの社会保障の給付を受けている人の割合（ILO） */
  socialProtection?: number;
  /** 病気で働けない間の国の補償（1=ある・0.5=一部の人だけ・0=ない、ILO・ISSA） */
  sicknessBenefit?: number;
  /** ひとり親世帯の相対的貧困率（OECD など） */
  singleParentPoverty?: number;
}

const STATS = statsJson as unknown as Record<string, LifeStats>;
const of = (iso3: string): LifeStats => STATS[iso3] ?? {};

/**
 * 交通事故で重いけが（1か月以上の治療）をする1年あたりの確率。
 * 日本の重傷者は死者のおよそ10倍（警察庁 2024年：死者2,663人・重傷者27,285人）。この比を、各国の死者の割合に掛ける。
 */
export function roadInjuryRate(iso3: string): number {
  return Math.min(0.01, ((of(iso3).roadDeathsPer100k ?? 15) * 10) / 100_000);
}

export const maternalDeaths = (iso3: string): number | null => of(iso3).maternalDeathsPer100kBirths ?? null;

export const singleParentPoverty = (iso3: string): number | null => of(iso3).singleParentPoverty ?? null;

/**
 * 病気で働けない間、給料の一部が国の制度で補償されるか。
 * 制度がある国は正社員・公務員、一部の人だけの国は大企業と公務員を対象にする。
 * 統計がない国は、非正規で働く人の割合から決める（推計）。
 */
export function sickPayCovered(iso3: string, job: string, informalShare: number): boolean {
  const s = of(iso3).sicknessBenefit ?? (informalShare < 0.3 ? 1 : informalShare < 0.7 ? 0.5 : 0);
  if (s >= 1) return job === "big" || job === "sme" || job === "civil";
  if (s > 0) return job === "big" || job === "civil";
  return false;
}

/** 暮らしに困ったとき、国の給付（社会扶助・生活保護）を受けられる割合。統計がなければ社会保障の給付の割合 */
export function publicAidRate(iso3: string): number {
  const s = of(iso3);
  return s.socialAssistanceQ1 ?? s.socialProtection ?? 0.3;
}

/** 5〜17歳のうち、児童労働をしている子の割合（家の仕事を含む本来の定義、UNICEF・ILO）。統計がない国は null */
export const childLabourShare = (iso3: string): number | null => (STATS[iso3] as LifeStatsExtra | undefined)?.childLabour ?? null;

/** 15歳以上のうち、アルコール使用障害の人の割合（WHO、12か月）。統計がない国は null */
export const alcoholDisorderShare = (iso3: string): number | null => (STATS[iso3] as LifeStatsExtra | undefined)?.alcoholUseDisorder ?? null;

/** その国で生まれ、外国に住んでいる人の割合と、主な行き先（国連 International Migrant Stock 2024） */
export function emigration(iso3: string): { share: number; dest: [string, number][] } | null {
  const s = STATS[iso3] as LifeStatsExtra | undefined;
  if (!s?.emigrantShare || !s.emigrantDest?.length) return null;
  return { share: s.emigrantShare, dest: s.emigrantDest.filter(([n]) => DEST_JA[n]).map(([n, c]) => [DEST_JA[n], c]) };
}

interface LifeStatsExtra extends LifeStats {
  childLabour?: number;
  alcoholUseDisorder?: number;
  emigrantShare?: number;
  emigrantDest?: [string, number][];
}

const DEST_JA: Record<string, string> = {
  Australia: "オーストラリア", Belgium: "ベルギー", Burundi: "ブルンジ", Canada: "カナダ", "Hong Kong": "香港", India: "インド",
  Japan: "日本", Jordan: "ヨルダン", Malaysia: "マレーシア", Mexico: "メキシコ", Niger: "ニジェール", Rwanda: "ルワンダ",
  "Saudi Arabia": "サウジアラビア", Spain: "スペイン", Sudan: "スーダン", Switzerland: "スイス", Taiwan: "台湾", Thailand: "タイ",
  Turkey: "トルコ", Uganda: "ウガンダ", "United Arab Emirates": "アラブ首長国連邦", "United Kingdom": "イギリス", "United States": "アメリカ",
};
