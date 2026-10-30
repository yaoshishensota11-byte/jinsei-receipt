// 人生シミュレーション本体。1年ずつ進み、選択場面で止まる。
// 同じ seed と同じ選択の並びなら、まったく同じ人生になる。
import { Rng, streamRng, hashStr } from "./rng";
import { accountShare, alcoholDisorderShare, childLabourShare, emigration, maternalDeaths, publicAidRate, sickPayCovered, singleParentPoverty } from "./lifestats";
import { JAPAN, type CountryData, type Region, type IncomeBand } from "./data";
import { MICROS } from "./micro";
import { riskYear, countryEventScene, ipvHazard } from "./risks";
import { kidsScene, kidsAgainScene, fertilityScene, strainScene, dvScene, heldHouseScene, type Scene } from "./scenes";
import { drawMarriageMode, meetScene, loveScene, arrangedScene, betrothedScene, type MarriageMode } from "./marriage";
import { leaveHomeScene, kidLeaveScene, kidAtHome, kidShownHome } from "./home";
import { earlyEvents } from "./early";
import type {
  Choice,
  ChoiceId,
  ChoiceOption,
  Edu,
  EventKind,
  ExpenseCat,
  IncomeCat,
  Job,
  LifeEvent,
  LifeSummary,
  Sex,
  YearRecord,
  Alloc,
} from "./types";

export const MAX_AGE = 110;
export const BIRTH_YEAR = 2026;

type School =
  | "child"
  | "hs" // 全日制高校
  | "hs_night" // 定時制（働きながら）
  | "kosen"
  | "vocational"
  | "univ"
  | "univ_work" // 奨学金＋アルバイトで大学
  | "univ_night" // 働きながら夜間・通信
  | "grad"
  | "done";

type Home = "parents" | "rent" | "own";
type InvestStyle = "none" | "index" | "stocks";

interface Partner {
  sex: Sex;
  age: number;
  edu: Edu;
  work: "regular" | "part" | "none";
  alive: boolean;
}

interface Parent {
  age: number; // 本人誕生時の年齢
  alive: boolean;
}

/** 前の代から受け継ぐもの（「子どもに生まれ直す」で、亡くなった人の子どもとして生まれるとき） */
export interface Heritage {
  /** 何代目か（2・3） */
  gen: number;
  /** 前の代の何番目の子か */
  idx: number;
  /** 前の代までの共有コード */
  code: string;
  /** 第一子・第二子… */
  nth: string;
  sex: Sex;
  regionId: string;
  bandId: string;
  /** 父・母の、本人誕生時の年齢 */
  parentAges: [number, number];
  /** 前の代のあなたは、父(0)か母(1)か */
  parentIdx: 0 | 1;
  /** 前の代のあなたが亡くなる年（本人の年齢） */
  parentDies: number;
  /** もう一人の親が亡くなる年（前の代の人生で分かっていれば） */
  otherDies: number | null;
  /** もう一人の親は、この年齢までは亡くならない（前の代のあなたが亡くなったとき、まだ生きていた） */
  otherSafeUntil: number;
  sibs: { sex: Sex; born: number }[];
  /** 受け継ぐお金（家を除く） */
  estate: number;
  /** 受け継ぐ借金（前の代のあなたが借金を残したとき。相続放棄はせず、子どもの数で分けて引き継ぐ） */
  debt: number;
  /** 実家のうち自分の分の価値 */
  homeShare: number;
  /** 前の代のあなたは家を持っていた */
  hadHome: boolean;
  /** 前の代が「家族」に振り分けて、この子の教育にかけたお金による、勉強の得意さの上乗せ（0〜0.12） */
  eduBoost?: number;
  /** これまでの代（古い順） */
  lineage: LineageEntry[];
}
export interface LineageEntry {
  gen: number;
  sex: Sex;
  birthYear: number;
  deathAge: number;
  region: string;
  /** 本人が生涯で稼いだお金（現地通貨） */
  earned: number;
  /** 最後に残したお金（現地通貨） */
  left: number;
}

/** 子どもの性別（ドット絵と同じ決め方。乱数の流れを変えないよう、シードと番号から決める） */
export function kidFemale(seed: string, i: number): boolean {
  const key = seed + "kid" + i;
  let h = 2166136261;
  for (let j = 0; j < key.length; j++) h = Math.imul(h ^ key.charCodeAt(j), 16777619);
  return (h >>> 0) % 2 === 0;
}

const CAUSE_LABEL: Record<string, string> = {
  accident: "不慮の事故",
  cancer: "がん",
  heart: "心疾患",
  stroke: "脳血管疾患",
  senility: "老衰",
  pneumonia: "肺炎",
  other: "その他の病気",
};

const BAND_MORTALITY: Record<string, number> = { low: 1.15, lower_mid: 1.06, mid: 1, upper_mid: 0.93, high: 0.86 };
const BAND_DROPOUT: Record<string, number> = { low: 2.6, lower_mid: 1.5, mid: 1, upper_mid: 0.7, high: 0.5 };
const BAND_INHERIT: Record<string, { p: number; mult: number }> = {
  low: { p: 0.25, mult: 0.25 },
  lower_mid: { p: 0.45, mult: 0.5 },
  mid: { p: 0.6, mult: 1 },
  upper_mid: { p: 0.75, mult: 1.8 },
  high: { p: 0.9, mult: 3.5 },
};
const REGION_LIVING: Record<string, number> = { tokyo: 1.08, osaka: 1.0, nagoya: 1.0, city: 0.97, rural: 0.93 };
const REGION_HOUSE: Record<string, number> = { tokyo: 1, osaka: 0.8, nagoya: 0.78, city: 0.7, rural: 0.58 };
const REGION_CAR: Record<string, number> = { tokyo: 0.25, osaka: 0.45, nagoya: 0.8, city: 0.85, rural: 0.95 };

/** 円の表示（日本円のまま表示したいとき用） */
export function yen(n: number): string {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e8) return `${sign}${(a / 1e8).toFixed(a >= 1e9 ? 1 : 2)}億円`;
  if (a >= 1e4) return `${sign}${Math.round(a / 1e4).toLocaleString("ja-JP")}万円`;
  return `${sign}${Math.round(a).toLocaleString("ja-JP")}円`;
}

export class Life {
  readonly seed: string;
  readonly birthYear: number;
  age = 0;
  dead = false;
  deathCause = "";
  pending: Choice | null = null;
  records: YearRecord[] = [];
  choiceLog: { id: ChoiceId; optionId: string; label: string; age: number; pickIndex: number; alloc?: Alloc }[] = [];
  /** お金の振り分け（25〜60歳、5年に一度決める。決めるまでは null で、今までどおり余ったお金は貯金になる） */
  alloc: Alloc | null = null;
  /** 去年の「自由に使えるお金」（手取りから、出ていったお金を引いた残り） */
  lastFree = 0;
  /** 自分の学びに回したお金のたまり（一定の額ごとに、給料が上がるかどうかが決まる） */
  selfFund = 0;
  /** 振り分けの「自分」で給料が上がった回数（一生で3回まで） */
  selfRaises = 0;

  // 生まれ
  sex: Sex;
  region: Region;
  band: IncomeBand;
  /** 生まれた国の統計 */
  readonly D: CountryData;
  /** 遊び方：j=日本 / m=主要国 / w=世界 */
  readonly mode: string;
  aptitude: number; // 勉強の得意さ（0〜1、隠し値）
  thrift: number; // 金遣い（0.85〜1.25）
  /** きょうだいの人数（画面には出さない。兄姉は誕生時に、弟妹は生まれた年に出来事として出る） */
  siblings: number;
  /** きょうだい一人ずつ。born は本人が何歳のときに生まれたか（兄姉はマイナス） */
  sibs: { sex: Sex; born: number }[] = [];
  lottery: boolean;
  parents: Parent[];

  // 学校と仕事
  school: School = "child";
  schoolEnd = 15;
  edu: Edu = "junior_high";
  job: Job = "none";
  jobStart = 0;
  careerMult = 1;
  regularYears = 0;
  workYears = 0;
  unemployedUntil = -1;
  manager = false;
  founderYear = -1;
  founderBig = false;
  retireAge = 65;
  postRetireWork = false;
  pensionStart = 65;
  pensionMult = 1;
  lastRegularWage = 0;

  // 家族と住まい
  partner: Partner | null = null;
  partnerSince = -1;
  marriageBoostUntil = -1;
  marriageBoost = 1;
  noMarry = false;
  /** 結婚のしかた（自分で見つける／縁談／許嫁）。国の割合で生まれたときに決まる */
  marriageMode: MarriageMode = "love";
  /** 縁談や許嫁との結婚の話が来る年齢 */
  arrangedAge = 25;
  /** この年齢までは結婚の話が来ない（「まだ結婚しない」を選んだあとなど） */
  marriageDelayUntil = -1;
  /** 恋人と付き合っている（結婚の前の段階） */
  dating = false;
  datingSince = -1;
  kids: {
    born: number;
    privateSchool: boolean;
    univ: boolean;
    away: boolean;
    decided?: boolean;
    loan?: boolean;
    /** 巣立つ年齢になっても実家から通って働いている */
    stayHome?: boolean;
    /** 家を出た年齢（自分の年齢） */
    leftAge?: number;
    /** 外国へ移り住んだ先（国連の移住統計の主な行き先から） */
    abroad?: string;
    /** 巣立ちの場面で、どうするかを決めた */
    leaveAsked?: boolean;
    /** 生まれたときの、もう一人の親（パートナー）の年齢 */
    otherAge?: number;
    /** もう一人の親と一緒になった年（自分の年齢）。パートナーを見分けるのに使う */
    otherSince?: number;
    /** お金の振り分けで、この子の教育に回したお金（現地通貨） */
    eduSpend?: number;
  }[] = [];
  /** パートナーが亡くなった年（一緒になった年 → 亡くなった年。どちらも自分の年齢） */
  partnerDeaths: Record<number, number> = {};
  /** 前の代から受け継いだもの（1代目は null） */
  heir: Heritage | null = null;
  /** 親から受け継いだお金 */
  inherited = 0;
  /** 親が残した家のうち自分の分（住むか売るかを決めるまで持っておく） */
  heldHouse = 0;
  /** 実家から通って働いている間、「そろそろ家を出る？」と考えるのはこの年齢から */
  leaveAskAfter = 0;
  home: Home = "parents";
  loan = 0;
  loanAnnual = 0;
  housePrice = 0;
  coLiveParents = false;

  // お金
  cash = 0;
  invest = 0;
  investStyle: InvestStyle = "none";
  investRate = 0;
  scholarship = 0;
  scholarshipAnnual = 0;
  selfStudyUntil = -1;

  // 健康
  cancerAge = -100;
  illMult = 1;
  selfCare = false;
  frugal = false;

  // 親の介護
  careMode: "" | "facility" | "home" | "liveIn" | "quit" | "share" = "";
  careUntil = -1;
  careTriggered = false;

  cur: YearRecord | null = null;
  keepHouseCost = false;
  private preIncome: Partial<Record<IncomeCat, number>> = {};
  private preExpense: Partial<Record<ExpenseCat, number>> = {};

  constructor(seed: string, country: CountryData = JAPAN, mode = "j", birthYear = BIRTH_YEAR, heir?: Heritage) {
    this.seed = seed;
    this.D = country;
    this.mode = mode;
    this.birthYear = birthYear;
    const r = this.rng("birth", 0);
    this.sex = r.chance(0.512) ? "male" : "female";
    const regions = this.D.household.regions;
    this.region = r.weighted(regions, regions.map((x) => x.birthShare));
    const bands = this.D.household.incomeBandsWithChildren;
    this.band = r.weighted(bands, bands.map((b) => b.share));
    // 前の代の子として生まれるときは、性別・地域・家庭の収入を前の代の人生から決める（乱数は同じだけ引いておく）
    if (heir) {
      this.heir = heir;
      this.sex = heir.sex;
      this.region = regions.find((x) => x.id === heir.regionId) ?? this.region;
      this.band = bands.find((b) => b.id === heir.bandId) ?? this.band;
    }
    const bandIdx = bands.indexOf(this.band);
    // 家庭の所得と学力の相関はゆるく入れる（決定論にはしない）
    this.aptitude = Math.min(1, Math.max(0, r.normal(0.42 + bandIdx * 0.04, 0.22) + (heir?.eduBoost ?? 0)));
    this.thrift = r.range(0.88, 1.22);
    // きょうだいの数はその国の出生率に合わせる
    const tfr = this.D.inst?.tfr ?? 1.9;
    this.siblings = tfr < 2.2 ? r.weighted([0, 1, 2], [0.22, 0.55, 0.23]) : Math.min(7, Math.max(0, Math.round(r.normal(tfr - 1, 1.3))));
    this.lottery = r.chance(this.D.ev.lotteryParticipationRate);
    this.parents = [
      { age: Math.round(r.normal(33 - (this.D.inst?.marriageAgeShift.male ?? 0), 4.5)), alive: true },
      { age: Math.max(17, Math.round(r.normal(31.5 - (this.D.inst?.marriageAgeShift.female ?? 0), 4))), alive: true },
    ];
    this.sibs = this.makeSiblings();
    if (heir) {
      this.parents = [
        { age: heir.parentAges[0], alive: true },
        { age: heir.parentAges[1], alive: true },
      ];
      this.sibs = heir.sibs.map((x) => ({ ...x }));
      this.siblings = this.sibs.length;
    }
    this.ipvRate = ipvHazard(this.D.iso3, this.sex);
    const mr = this.rng("marriageMode", 0);
    this.marriageMode = drawMarriageMode(this.D.iso3, mr);
    // 家族が決める結婚は、その国の平均初婚年齢より少し早めに話が来る（ゲームの中では18歳以上）
    const smam = (this.sex === "male" ? 31.1 : 29.7) - (this.D.inst?.marriageAgeShift[this.sex] ?? 0);
    this.arrangedAge = Math.max(18, Math.round(mr.normal(smam - 1.5, 2)));
  }

  /** きょうだいを兄姉と弟妹に振り分ける。母の年齢（17〜44歳で出産）に収まるようにする */
  private makeSiblings(): { sex: Sex; born: number }[] {
    const r = this.rng("sib", 0);
    const mother = this.parents[1].age;
    const out: { sex: Sex; born: number }[] = [];
    let older = 0;
    let younger = 0;
    for (let i = 0; i < this.siblings; i++) {
      const sex: Sex = r.chance(0.512) ? "male" : "female";
      // 年の差は2〜4歳くらいが多い
      const gap = Math.max(1, Math.round(r.normal(3, 1.4)));
      const canOlder = mother - (older + gap) >= 17;
      const canYounger = mother + younger + gap <= 44;
      const goOlder = canOlder && (!canYounger || r.chance(0.5));
      if (goOlder) {
        older += gap;
        out.push({ sex, born: -older });
      } else if (canYounger) {
        younger += gap;
        out.push({ sex, born: younger });
      }
    }
    this.siblings = out.length;
    return out.sort((a, b) => a.born - b.born);
  }

  /** いま一緒にいるきょうだいの数（まだ生まれていない弟妹は数えない） */
  get siblingsNow(): number {
    return this.sibs.filter((x) => x.born <= this.age).length;
  }

  /** いま一緒に暮らしている家族（自分を含む）。実家にいる間は親ときょうだい、家を出たあとはパートナーと巣立つ前の子ども */
  get household(): string[] {
    const a = this.age;
    const out = ["自分"];
    const p = this.partner;
    if (p && p.alive) out.push(p.sex === "male" ? "夫" : "妻");
    const kidsHome = this.kids.filter((k) => kidShownHome(this, k, a)).length;
    if (kidsHome) out.push(`子ども${kidsHome}人`);
    if (this.home === "parents") {
      if (this.parents[0].alive) out.push("父");
      if (this.parents[1].alive) out.push("母");
      // きょうだいは22歳くらいで家を出る
      const counts = new Map<string, number>();
      for (const x of this.sibs) {
        const sa = a - x.born;
        if (x.born > a || sa >= 22) continue;
        const w = x.born < 0 ? (x.sex === "male" ? "兄" : "姉") : x.sex === "male" ? "弟" : "妹";
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
      for (const w of ["兄", "姉", "弟", "妹"]) {
        const n = counts.get(w);
        if (n) out.push(n > 1 ? `${w}${n}人` : w);
      }
    }
    return out;
  }

  /** household の人数 */
  get householdSize(): number {
    return this.household.reduce((t, w) => t + (/(\d+)人$/.test(w) ? Number(/(\d+)人$/.exec(w)![1]) : 1), 0);
  }

  /** 円で考えた金額を、この国の通貨の目安に直す */
  y(n: number): number {
    return n * this.D.k;
  }

  private rng(stream: string, age = this.age): Rng {
    return streamRng(this.seed, stream, age);
  }

  /** 地域の係数。日本は地域ごとの表、他の国は都市部か農村部かで決める */
  regionFactor(map: Record<string, number>, urban: number, rural: number): number {
    if (this.D.isJapan) return map[this.region.id] ?? 1;
    return this.region.urban ? urban : rural;
  }

  get year(): number {
    return this.birthYear + this.age;
  }
  /** 純資産：金融資産 − 負債 ＋ 持ち家の評価額（古くなるほど下がる） */
  get balance(): number {
    return this.cash + this.invest - this.loan - this.scholarship + this.homeValue + this.heldHouse;
  }
  get homeValue(): number {
    if (this.home !== "own" && !this.ownedBefore) return 0;
    const yrs = this.age - this.boughtAge;
    return this.housePrice * Math.max(0.25, 1 - yrs * 0.02);
  }
  boughtAge = 0;
  ownedBefore = false;
  welfare = false;
  tight = false;
  reverseMortgage = false;
  get regionLabel(): string {
    return this.region.label;
  }
  get bandIdx(): number {
    return this.D.household.incomeBandsWithChildren.indexOf(this.band);
  }

  // ───────────────────────── 進行 ─────────────────────────

  /** 1年進める。選択が必要なら pending をセットして null を返す。 */
  advance(): YearRecord | null {
    if (this.dead) return null;
    if (this.pending) return null;
    const due = this.dueChoice();
    if (due) {
      this.pending = due;
      return null;
    }
    this.simulateYear();
    const rec = this.cur!;
    this.cur = null;
    this.records.push(rec);
    if (!this.dead) this.age++;
    return rec;
  }

  /** お金の振り分けを決める（割合は10%きざみ、合計10） */
  chooseAlloc(al: Alloc, optionId = "custom"): void {
    const c = this.pending;
    if (!c || !c.alloc) throw new Error("振り分けの場面ではありません");
    let v = normAlloc(al);
    // 口座がない人は投資ができないので、投資に回す分は手元の貯金にする
    if (!this.banked && v.invest) v = noInvestAlloc(v);
    this.pending = null;
    const label = allocLabel(v);
    this.choiceLog.push({ id: "alloc", optionId, label, age: this.age, pickIndex: -1, alloc: v });
    this.preEvents.push({ age: this.age, kind: "choice", text: `【選択】お金の振り分け：${label}`, major: false });
    this.alloc = v;
  }

  choose(optionId: string): void {
    const c = this.pending;
    if (!c) throw new Error("選択場面ではありません");
    if (c.alloc) {
      const i = c.options.findIndex((o) => o.id === optionId);
      if (i < 0) throw new Error(`不明な選択肢: ${optionId}`);
      return this.chooseAlloc(optionId === "same" && c.alloc.last ? c.alloc.last : c.alloc.presets[i], optionId);
    }
    const opt = c.options.find((o) => o.id === optionId);
    if (!opt) throw new Error(`不明な選択肢: ${optionId}`);
    this.pending = null;
    this.choiceLog.push({ id: c.id, optionId, label: opt.label, age: this.age, pickIndex: c.options.indexOf(opt) });
    const micro = c.id.startsWith("micro:");
    this.preEvents.push({ age: this.age, kind: "choice", text: `【選択】${c.title}：${opt.label}`, major: !micro });
    // （ev: の場面は出来事がきっかけの選択。転機として目立たせる）
    if (c.id.startsWith("ev:")) {
      const sc = this.sceneQueue.shift()!;
      sc.options.find((o) => o.id === optionId)!.apply(this, this.rng("c:" + c.id));
    } else if (micro) {
      const m = MICROS.find((x) => "micro:" + x.id === c.id)!;
      this.usedMicro.set(m.id, this.age);
      m.options.find((o) => o.id === optionId)!.apply(this, this.rng("c:" + c.id));
    } else applyChoice(this, c.id, optionId, this.rng("c:" + c.id));
  }

  /** 出来事がきっかけで出る選択場面の待ち行列 */
  sceneQueue: Scene[] = [];
  queueScene(sc: Scene): void {
    if (!this.sceneQueue.some((x) => x.id === sc.id)) this.sceneQueue.push(sc);
  }

  // 家族計画・夫婦関係
  kidsPlan: "undecided" | "want" | "later" | "none" = "undecided";
  kidsFrom = 0;
  infertile = false;
  naturalHope = false;
  strained = false;
  dvOngoing = false;
  dvHappened = false;
  /** 1年あたり、パートナーからの暴力が始まる確率の目安（国の統計から設定） */
  ipvRate = 0.004;
  /** ドルや金で貯めている（物価の暴騰に強い） */
  protectCash = false;
  inflationNoticed = false;
  /** 今年の物価の動きを借りている、その国の過去の年（data/world/cpi_annual.json）。null はまだ選んでいない */
  inflSrcYear: number | null = null;
  /** 直近の1年の物価上昇率（割合） */
  lastInflation = 0;
  /** 物価の激しい上昇（年25%以上）が続いている年数と、借りている過去の最初の年 */
  inflSpell = 0;
  inflSpellFrom = 0;
  /** 一度起きた「国ごとの出来事」 */
  usedEvents = new Set<string>();
  /** 暮らしに困ったとき、国の給付を受けられた（親戚の援助ではなく） */
  publicAid = false;
  /** 子どものうちから家の仕事や外の仕事で働いた（児童労働） */
  childWorked = false;
  /** 学校に行けない時期があった年齢（日本、不登校）。-1 はなし */
  futokoAge = -1;
  /** お酒がやめられなくなった */
  alcoholProblem = false;
  /** 銀行やモバイルマネーの口座を持っている（ない人は貯金に利息がつかず、投資もできない） */
  banked = true;
  /** 高校でプロを目指した競技（日本の男子）。"" は目指していない */
  proSport: "" | "baseball" | "soccer" | "soccerW" = "";
  /** プロ選手として稼ぐ年俸と、引退する年齢。-1 はプロではない */
  proSalary = 0;
  proUntil = -1;
  /** 自己破産した年齢。-1 はなし */
  bankruptAge = -1;
  bankruptAsked = false;

  /** 離婚する。財産を分け、子どもがいれば養育費などが続く */
  divorce(r: Rng, text: string, dv = false): void {
    const a = this.age;
    const share = Math.max(0, this.cash) * 0.5;
    this.log("family", text, -share, true);
    this.mark("divorce");
    this.spend("events", share);
    if (this.kids.some((k) => a - k.born < 18) && this.sex === "male") this.childSupport = true;
    else if (this.kids.some((k) => a - k.born < 18)) this.singleParentNote();
    this.partner = null;
    this.strained = false;
    this.dvOngoing = false;
    this.noMarry = r.chance(dv ? 0.7 : 0.5);
  }

  /** 次に小さな選択を出す年齢 */
  nextMicro = 6;
  /** 小さな選択ごとの、最後に出た年齢 */
  usedMicro = new Map<string, number>();
  private microReady(id: string, repeat?: boolean): boolean {
    const last = this.usedMicro.get(id);
    return last === undefined || (!!repeat && this.age - last >= 10);
  }

  private microChoice(): Choice | null {
    const a = this.age;
    if (a < this.nextMicro || this.choiceLog.some((c) => c.age === a)) return null;
    const r = this.rng("micro");
    const pool = MICROS.filter((m) => a >= m.min && a <= m.max && this.microReady(m.id, m.repeat) && (!m.when || m.when(this)));
    if (!pool.length) {
      this.nextMicro = a + 1;
      return null;
    }
    // 年齢の上限が近いものを優先して、取りこぼしを減らす
    const m = r.weighted(pool, pool.map((x) => 1 / (1 + Math.max(0, x.max - a) * 0.15)));
    // 出来事がきっかけの選択も増えたので、小さな選択は2〜3年に1回にする
    this.nextMicro = a + r.int(2, 3);
    return {
      id: `micro:${m.id}`,
      age: a,
      title: m.titleOf?.(this) ?? m.title,
      situation: m.situation(this),
      options: m.options.filter((o) => !o.when || o.when(this)).map((o) => ({ id: o.id, label: o.labelOf?.(this) ?? o.label, desc: o.descOf?.(this) ?? o.desc })),
    };
  }

  // 小さな選択がもたらす状態
  social = 0;
  familyHelped = false;
  abroad = false;
  abroadUntil = -1;
  sideIncome = 0;
  gymUntil = -1;
  insured = false;
  cramUntil = -1;
  parentDebt = false;
  repairLater = false;
  earlyCheckUntil = -1;
  prepaidFuneral = false;
  seniorWorkUntil = -1;

  /** 選択前後に起きた出来事を、その年の記録に入れるためのバッファ */
  preEvents: LifeEvent[] = [];

  private made(id: ChoiceId): boolean {
    return this.choiceLog.some((c) => c.id === id);
  }

  private dueChoice(): Choice | null {
    const a = this.age;
    if (!this.made("afterJHS") && a === 15) return buildChoice(this, "afterJHS");
    if (!this.made("afterHS") && this.made("afterJHS")) {
      const kosenDone = this.school === "kosen" && a === this.schoolEnd;
      const hsDone = (this.school === "hs" || this.school === "hs_night") && a >= this.schoolEnd;
      const working18 = this.school === "done" && a === 18;
      if (kosenDone || hsDone || working18) return buildChoice(this, "afterHS");
    }
    if (!this.made("firstJob") && this.school === "done" && this.job === "none" && a >= 15 && this.made("afterJHS"))
      return buildChoice(this, "firstJob");
    if (!this.made("invest") && a >= 25 && this.made("firstJob")) return buildChoice(this, "invest");
    if (!this.made("marriageHome") && a >= 30 && this.made("invest")) return buildChoice(this, "marriageHome");
    if (!this.made("careerShift") && a >= 38 && this.made("marriageHome")) return buildChoice(this, "careerShift");
    if (!this.made("parentCare") && this.made("careerShift") && (this.careTriggered || a >= 58))
      return buildChoice(this, "parentCare");
    if (!this.made("retire") && a >= 60 && this.made("parentCare")) return buildChoice(this, "retire");
    // お金の振り分け：25〜60歳で5年に一度（大きな分かれ道のあと）
    if (a >= 25 && a <= 60 && a % 5 === 0 && this.school === "done" && !this.choiceLog.some((c) => c.id === "alloc" && c.age === a)) return allocChoice(this);
    // 結婚の話を待っている間に、別の形で結婚した場合は、その話は消える
    // 順番を待つあいだに状況が変わり、もう合わなくなった場面も消す
    while (this.sceneQueue.length && ((this.partner && ["meet", "propose", "arranged", "betrothed"].includes(this.sceneQueue[0].id)) || this.sceneQueue[0].stillValid?.(this) === false)) this.sceneQueue.shift();
    const sc = this.sceneQueue[0];
    if (sc)
      return {
        id: `ev:${sc.id}`,
        age: a,
        title: sc.title,
        situation: sc.situationOf?.(this) ?? sc.situation,
        options: sc.options.map(({ id, label, desc }) => ({ id, label, desc })),
      };
    return this.microChoice();
  }

  // ───────────────────────── 1年の計算 ─────────────────────────

  private simulateYear(): void {
    const a = this.age;
    this.cur = { age: a, year: this.year, income: this.preIncome, expense: this.preExpense, balance: 0, invested: 0, debt: 0, events: this.preEvents };
    this.preEvents = [];
    this.preIncome = {};
    this.preExpense = {};
    if (a === 0) this.birthEvents();
    // 0〜5歳の成長の場面（お金は動かさない。専用の乱数を使うので、ほかの出来事や選択には影響しない）
    if (a <= 6) for (const t of earlyEvents(this, this.rng("early"))) this.log("life", t);
    const r = this.rng("year");

    this.schoolYear(r);
    this.familyYear(r);
    this.workYear(r);
    this.parentsYear(r);
    this.healthYear(r);
    this.luckYear(r);
    riskYear(this, this.rng("risk"));
    this.moneyYear(r);
    this.mortality();

    if (!this.dead) {
      const sc = countryEventScene(this, this.rng("cevent"));
      if (sc) this.queueScene(sc);
    }
    const c = this.cur!;
    c.balance = Math.round(this.balance);
    c.invested = Math.round(this.invest);
    c.debt = Math.round(this.loan + this.scholarship);
  }

  /** 乱数を使わずに言い回しを選ぶ（同じ文ばかりにならないように）。記録の中身や共有URLには影響しない */
  vary(key: string, lines: string[]): string {
    return lines[hashStr(`${this.seed}|${key}|${this.age}`) % lines.length];
  }
  /** 前にその知らせを出した年齢。within 年以内に出していれば true（「また」をつけるため） */
  private saidAt = new Map<string, number>();
  again(key: string, within: number): boolean {
    const p = this.saidAt.get(key);
    this.saidAt.set(key, this.age);
    return p !== undefined && this.age - p <= within;
  }

  /** 章のまとめで「同い年の人と比べる」ための出来事の印（[印, 年齢]）。乱数や記録には影響しない */
  tags: [string, number][] = [];
  mark(tag: string): void {
    this.tags.push([tag, this.age]);
  }

  log(kind: EventKind, text: string, amount?: number, major = false): void {
    this.cur
      ? this.cur.events.push({ age: this.age, kind, text, amount, major })
      : this.preEvents.push({ age: this.age, kind, text, amount, major });
  }
  /** 選択の直後（年の計算前）用 */
  logPre(kind: EventKind, text: string, amount?: number, major = false): void {
    this.preEvents.push({ age: this.age, kind, text, amount, major });
  }
  addIncome(cat: IncomeCat, v: number): void {
    if (!isFinite(v) || v === 0) return;
    const t = this.cur ? this.cur.income : this.preIncome;
    t[cat] = (t[cat] ?? 0) + v;
    this.cash += v;
  }
  spend(cat: ExpenseCat, v: number): void {
    if (!isFinite(v) || v <= 0) return;
    if (cat === "medical" && this.D.inst) v *= this.D.inst.medicalBurden;
    if (cat === "medical" && this.insured && v > this.y(200_000)) v *= 0.5;
    const t = this.cur ? this.cur.expense : this.preExpense;
    t[cat] = (t[cat] ?? 0) + v;
    this.cash -= v;
  }

  private birthEvents(): void {
    const s = this.sex === "male" ? "男の子" : "女の子";
    const h = this.heir;
    if (h) this.log("life", `${this.year}年、${this.region.label}に、${h.gen - 1}代目のあなたの${h.nth}（${s}）として生まれた。${this.bandSentence()}`, undefined, true);
    else this.log("life", `${this.year}年、${this.region.label}に${s}として生まれた。${this.bandSentence()}`, undefined, true);
    if (h && (h.eduBoost ?? 0) >= 0.03) this.log("family", `${h.gen - 1}代目のあなたは、教育のためのお金を用意してくれていた。`, undefined, true);
    // 兄と姉に分けて、年上から書く（「家には兄2人（5歳・3歳）と、姉（2歳）がいる。」）
    const olders = this.sibs.filter((x) => x.born < 0).sort((a, b) => a.born - b.born);
    const group = (sex: Sex, word: string) => {
      const g = olders.filter((x) => x.sex === sex);
      if (!g.length) return "";
      return g.length === 1 ? `${word}（${-g[0].born}歳）` : `${word}${g.length}人（${g.map((x) => `${-x.born}歳`).join("・")}）`;
    };
    const words = [group("male", "兄"), group("female", "姉")].filter(Boolean);
    if (words.length) this.log("family", `家には${words.join("と、")}がいる。`);
  }

  /** 生まれた家庭の年収の文（日本は「家庭の年収は400万円未満。」、ほかの国は「ふつうの家庭で、年収は約30万ペソ。」） */
  private bandSentence(): string {
    const m = /^(.*?)（年収 (.*)）$/.exec(this.band.label);
    if (m) return `${m[1]}で、年収は${m[2]}。`;
    return `家庭の年収は${this.band.label.replace(/^年収/, "")}。`;
  }

  private schoolYear(r: Rng): void {
    const a = this.age;
    if (a === 6) this.log("school", "小学校に入学した。");
    if (a === 12) this.log("school", "中学校に入学した。");
    this.childhoodYear();
    if (this.school === "child" || this.school === "done") return;
    const drop = BAND_DROPOUT[this.band.id] ?? 1;
    // 在学中のアルバイト・学費
    if (this.school === "hs_night" || this.school === "univ_night") {
      this.addIncome("salary", this.D.nonRegularWage(this.sex, Math.max(a, 20)) * 0.65 * this.region.wageIndex);
    } else if (this.school === "univ_work") {
      this.addIncome("salary", this.y(900000) * this.region.wageIndex);
    } else if ((this.school === "univ" || this.school === "vocational" || this.school === "grad") && r.chance(0.7)) {
      this.addIncome("salary", r.range(this.y(300000), this.y(900000)));
    }
    if (this.school === "univ_night") this.spend("selfEdu", this.y(600000));
    if (this.school === "univ_work") {
      // 奨学金（貸与）は学費と生活費に消える
      const loan = this.y(1200000);
      this.scholarship += loan;
      this.cash += loan;
      this.spend("selfEdu", this.privateUni ? this.y(1300000) : this.y(700000));
      this.spend("other", this.y(700000));
    }

    // 中退
    let pDrop = 0;
    if (this.school === "hs" || this.school === "hs_night" || this.school === "kosen")
      pDrop = this.D.education.highSchoolDropoutRate * drop * (this.school === "hs_night" ? 4 : 1);
    if (this.school === "univ" || this.school === "univ_work" || this.school === "univ_night" || this.school === "vocational")
      pDrop = (this.D.education.universityDropoutRate / 4) * drop * (this.school === "univ_work" ? 1.8 : this.school === "univ_night" ? 2.5 : 1);
    if (r.chance(pDrop)) {
      const famReason = r.chance(Math.min(0.75, 0.25 * drop));
      const what = this.schoolName();
      this.log("school", famReason ? `家の事情で${what}を中退した。` : `${what}が合わず中退した。`, undefined, true);
      this.school = "done";
      this.schoolEnd = a;
      if (this.job === "none" && this.made("firstJob")) this.job = "nonregular";
      return;
    }

    if (a + 1 >= this.schoolEnd) {
      const what = this.schoolName();
      const next: Record<string, Edu> = {
        hs: "high_school",
        hs_night: "high_school",
        kosen: "vocational",
        vocational: "vocational",
        univ: "university",
        univ_work: "university",
        univ_night: "university",
        grad: "graduate",
      };
      this.edu = next[this.school] ?? this.edu;
      this.log("school", `${what}を卒業した。`);
      if ((this.school === "univ" || this.school === "univ_work") && r.chance(this.D.education.graduateSchoolEntryRate * (0.6 + this.aptitude))) {
        this.school = "grad";
        this.schoolEnd = a + 3;
        this.log("school", "大学院に進んだ。", undefined, true);
        return;
      }
      if (this.school === "univ_work" || this.school === "univ_night" || this.school === "grad")
        if (this.scholarship > 0) this.scholarshipAnnual = this.scholarship / 15;
      if (this.school === "hs" || this.school === "hs_night" || this.school === "kosen") {
        // afterHS の選択で次が決まる
        this.school = this.school === "kosen" ? "kosen" : this.school;
        this.schoolEnd = a + 1;
        this.hsGraduated = true;
        return;
      }
      this.school = "done";
      this.schoolEnd = a + 1;
    }
  }
  hsGraduated = false;
  privateUni = false;

  schoolName(): string {
    return (
      {
        hs: "高校",
        hs_night: "定時制高校",
        kosen: "高専",
        vocational: "専門学校",
        univ: "大学",
        univ_work: "大学",
        univ_night: "夜間の大学",
        grad: "大学院",
        child: "学校",
        done: "学校",
      } as Record<School, string>
    )[this.school];
  }

  // ── 家族
  private familyYear(r: Rng): void {
    const a = this.age;
    for (const x of this.sibs) if (x.born === a && a > 0) this.log("family", `${x.sex === "male" ? "弟" : "妹"}が生まれた。`, undefined, true);
    if (this.marriageMode === "betrothed" && a === 10) this.log("family", "親どうしの約束で、将来結婚する相手（許嫁）が決まった。", undefined, true);
    const p = this.partner;
    if (p && p.alive) {
      p.age++;
      // 出産
      const maxKids = Math.max(this.kidsPlan === "want" ? 1 : 0, this.kidsTarget(r));
      const motherAge = this.sex === "female" ? a : p.age;
      if (this.kidsPlan === "later" && a >= this.kidsFrom) this.queueScene(kidsAgainScene());
      if (this.kidsPlan === "want" && this.infertile && !this.naturalHope && a === this.kidsFrom + 2) this.queueScene(fertilityScene(this));
      if (this.naturalHope && this.infertile && r.chance(0.12)) this.infertile = false;
      const canHave = this.kidsPlan === "want" && !this.infertile && a >= this.kidsFrom;
      if (canHave && this.kids.length < maxKids && motherAge >= 18 && motherAge <= 44 && r.chance(0.32 - Math.max(0, motherAge - 35) * 0.035)) {
        const kr = this.rng("kid" + this.kids.length);
        const hh = this.householdIncomeGuess();
        const kid = {
          born: a,
          privateSchool: kr.chance(hh > this.y(10_000_000) ? 0.45 : hh > this.y(7_000_000) ? 0.15 : 0.05),
          univ: kr.chance(this.D.univRateForIncome(hh)),
          away: kr.chance(0.4),
          otherAge: p.age,
          otherSince: this.partnerSince,
        };
        this.kids.push(kid);
        const nth = ["第一子", "第二子", "第三子", "第四子"][this.kids.length - 1] ?? "子ども";
        this.log("family", `${nth}が生まれた。` + (this.kids.length === 1 ? this.birthRiskNote() : ""), -this.D.living.childbirthNetCost, this.kids.length === 1);
        this.spend("kids", this.D.living.childbirthNetCost);
        if (this.sex === "female" && (this.job === "big" || this.job === "sme" || this.job === "civil") && r.chance(0.3)) {
          this.log("work", "出産を機に仕事を辞めた。", undefined, true);
          this.job = "none";
          this.unemployedUntil = a + 3;
        }
      }
      // 夫婦のすれ違い（いきなり離婚せず、まず話し合いの場面が来る）
      const pStrain = this.D.ev.divorceRateAnnual * (a - this.partnerSince < 10 ? 1.4 : 0.7) * 2.2;
      if (this.strained && r.chance(0.35)) {
        this.divorce(r, "話し合いはまとまらず、離婚した。財産は分け合った。");
      } else if (!this.strained && r.chance(pStrain)) {
        this.queueScene(strainScene(this));
      } else if (!this.dvHappened && r.chance(this.ipvRate)) {
        // パートナーからの暴力（国の統計にもとづく確率。描写はしない）
        this.dvHappened = true;
        this.queueScene(dvScene(this));
      } else if (this.dvOngoing) {
        this.illMult = Math.min(2, this.illMult * 1.04);
        if (r.chance(0.2)) this.queueScene({ ...dvScene(this), id: "dv" });
      }
      // 配偶者の死亡
      else if (r.chance(this.D.qx(p.sex, p.age) * 0.9)) {
        p.alive = false;
        this.log("family", `パートナーが${p.age}歳で亡くなった。`, -this.D.living.funeralCost, true);
        this.mark("partnerDeath");
        this.spend("events", this.D.living.funeralCost);
        if (this.kids.some((k) => a - k.born < 18)) this.singleParentNote();
        this.widowed = true;
        this.partnerDeaths[this.partnerSince] = a;
        this.partner = null;
        this.strained = false;
        this.dvOngoing = false;
      }
    } else if (!this.partner && a >= 18 && a < 60 && a >= this.marriageDelayUntil) {
      // 結婚は「出会い → 付き合う → 結婚の話」と段階を踏む。家族が相手を決める国では縁談や許嫁の話が来る
      if (!this.noMarry && this.marriageMode === "betrothed" && a >= this.arrangedAge) this.queueScene(betrothedScene(this));
      else if (!this.noMarry && this.marriageMode === "arranged" && a >= this.arrangedAge && a < 45 && !this.dating && r.chance(0.5))
        this.queueScene(arrangedScene(this));
      else if (this.dating) {
        // 付き合っている間：デート代がかかる。別れることもあれば、結婚の話になることもある
        this.spend("love", this.y(150_000));
        if (r.chance(0.12)) {
          this.dating = false;
          this.log("family", "恋人と別れた。");
        } else if (a - this.datingSince >= 1 && r.chance(0.55)) this.queueScene(loveScene(this));
      } else if (a >= 30 || (this.school === "done" && !this.made("marriageHome"))) {
        // 出会い。結婚しないと決めた人にも、まれにいい出会いはある
        const boost = a < this.marriageBoostUntil ? this.marriageBoost : 1;
        const mode = this.marriageMode === "love" ? 4 : 0.9;
        // 付き合ってから結婚まで2年ほどかかるので、2年先の結婚しやすさで出会いが起きる
        const again = this.partnerSince >= 0 ? (a >= 50 ? 0.2 : 0.45) : 1;
        if (r.chance(this.marriageHazard(a + 2) * mode * boost * again * (this.noMarry ? 0.25 : 1))) this.queueScene(meetScene(this));
      }
    }
    // 実家から通って働いている：貯金がたまってきたら「そろそろ家を出る？」
    if (this.home === "parents" && this.school === "done" && this.job !== "none" && this.job !== "retired" && !this.partner && !this.coLiveParents) {
      if (a >= Math.max(22, this.leaveAskAfter) && a < 45 && this.cash > this.y(1_000_000) && r.chance(0.3)) this.queueScene(leaveHomeScene(this, true));
    }
    // 子どもの節目
    for (const k of this.kids) {
      const ka = a - k.born;
      const em = ka === 27 && !this.kidWithEx(k) ? emigration(this.D.iso3) : null;
      if (em && em.dest.length && streamRng(this.seed, "kidAbroad" + this.kids.indexOf(k), 0).chance(Math.min(0.15, em.share))) {
        // その国で生まれた人のうち外国に住む人の割合で、子どもが外国へ移り住む。行き先は人数の多い国ほど選ばれやすい
        const rr = streamRng(this.seed, "kidAbroadTo" + this.kids.indexOf(k), 0);
        let x = rr.next() * em.dest.reduce((t, [, c]) => t + c, 0);
        const to = em.dest.find(([, c]) => (x -= c) < 0)?.[0] ?? em.dest[0][0];
        k.abroad = to;
        if (k.leftAge === undefined) k.leftAge = a;
        k.stayHome = false;
        this.log("family", `${this.kidLabel(this.kids.indexOf(k))}が${to}へ移り住み、向こうで働きはじめた。${this.D.nameJa}で生まれた人の${Math.round(em.share * 1000) / 10}%が、外国で暮らしている。`, undefined, true);
        this.mark("kidAbroad");
      }
      if ((ka === 22 && k.univ) || (ka === 18 && !k.univ)) this.queueScene(kidLeaveScene(this, this.kids.indexOf(k)));
      else if (k.stayHome && k.leftAge === undefined && ka > 18) {
        // 実家から通う子どもは家にお金を入れ、いずれ貯めたお金で家を出る
        if (r.chance(0.18) || ka >= 35) {
          k.leftAge = a;
          this.log("family", `実家から通っていた子ども（${ka}歳）が、貯めたお金で家を出た。`);
        } else this.addIncome("windfall", this.y(360_000));
      }
    }
  }
  childSupport = false;
  /** 離婚した相手のもとで暮らしている子どもか（養育費を払っている父親の、前の結婚の子ども） */
  kidWithEx(k: Life["kids"][number]): boolean {
    return this.childSupport && !(this.partner?.alive && k.otherSince === this.partnerSince);
  }
  /** 車を初めて買った年齢（持っていなければ -1） */
  carSince = -1;
  widowed = false;

  private kidsTarget(r: Rng): number {
    if (this._kidsTarget >= 0) return this._kidsTarget;
    const kr = this.rng("kidsTarget", 0);
    const m = this.D.inst?.tfr ?? this.D.ev.birthsPerCouple;
    this._kidsTarget =
      m < 2.4
        ? kr.weighted([0, 1, 2, 3], [0.08, 0.2, Math.max(0.3, 0.72 - m * 0.05), Math.max(0.05, (m - 1.6) * 0.8)])
        : Math.min(8, Math.max(0, Math.round(kr.normal(m * 1.05, 1.4))));
    void r;
    return this._kidsTarget;
  }
  private _kidsTarget = -1;

  marriageHazard(a: number): number {
    const base = this.D.marriageHazard(a, this.sex) * (1 + Math.min(0.5, this.social));
    // 収入が安定していると結婚しやすい傾向（統計的な相関をゆるく反映）
    const stab = this.job === "nonregular" || this.job === "none" ? (this.sex === "male" ? 0.6 : 1) : 1.05;
    return base * stab;
  }

  /** ceremony を省くと、式を挙げるかは半々で決まる */
  marry(r: Rng, text: string, ceremony?: boolean): void {
    const other: Sex = this.sex === "male" ? "female" : "male";
    const pAge = Math.max(18, Math.round(this.age + r.normal(this.sex === "male" ? -1.8 : 1.8, 2.5)));
    const work: Partner["work"] =
      other === "female" ? r.weighted(["regular", "part", "none"], [0.4, 0.38, 0.22]) : r.weighted(["regular", "part", "none"], [0.86, 0.09, 0.05]);
    const edu: Edu = r.weighted(["high_school", "vocational", "university"], [0.35, 0.25, 0.4]);
    this.partner = { sex: other, age: pAge, edu, work, alive: true };
    this.partnerSince = this.age;
    this.dating = false;
    this.noMarry = false;
    this.kidsPlan = "undecided";
    this.log("family", `${text.replace(/。$/, "")}（相手は${pAge}歳）。`, undefined, true);
    this.queueScene(kidsScene(this));
    if (ceremony ?? r.chance(0.5)) {
      const net = this.D.living.weddingCost * 0.45;
      this.spend("love", net);
      this.log("money", "結婚式を挙げた。費用の半分ほどは、ご祝儀で戻ってきた。", -net);
    }
    if (this.home === "parents" && this.school === "done") this.home = "rent";
  }

  householdIncomeGuess(): number {
    return this.salaryOf(this.age) + (this.partner?.alive ? this.partnerIncome() : 0);
  }

  // ── 仕事
  salaryOf(a: number): number {
    if (this.proUntil > a) return this.proSalary;
    const w = this.region.wageIndex;
    const m = this.careerMult;
    switch (this.job) {
      case "big":
        return this.D.regularWage(this.sex, this.edu, a) * 1.18 * m * w;
      case "sme":
        return this.D.regularWage(this.sex, this.edu, a) * 0.86 * m * w;
      case "civil":
        return this.D.regularWage(this.sex, this.edu, a) * 1.02 * Math.min(m, 1.2) * Math.min(w, 1.05);
      case "nonregular":
        return this.D.nonRegularWage(this.sex, a) * Math.min(m, 1.3) * w;
      case "freelance":
        return this.D.income.selfEmployedMedianAnnual * m * Math.min(w, 1.1);
      case "founder":
        return this.D.income.selfEmployedMedianAnnual * m * (this.founderBig ? 6 : 1);
      default:
        return 0;
    }
  }

  partnerIncome(): number {
    const p = this.partner;
    if (!p || !p.alive || p.age >= 65) return 0;
    if (p.work === "regular") return this.D.regularWage(p.sex, p.edu, p.age) * 0.95 * this.region.wageIndex;
    if (p.work === "part") return this.D.nonRegularWage(p.sex, p.age) * 0.55 * this.region.wageIndex;
    return 0;
  }

  private workYear(r: Rng): void {
    const a = this.age;
    // 高校の部活でプロを目指す場面（男子は野球・サッカー、女子はサッカー。片方の性別だけには出さない：ユーザーの判断）
    if (PRO_ENABLED && this.D.isJapan && a === 15 && this.school === "hs") this.queueScene(clubScene(this.sex));
    if (this.proUntil === a) {
      this.proUntil = -1;
      this.log("work", this.proSport === "baseball" ? "プロ野球選手を引退した。次の仕事を探す。" : "プロサッカー選手を引退した。次の仕事を探す。", undefined, true);
      this.job = "none";
    }
    if (!this.banked && (this.job === "big" || this.job === "sme" || this.job === "civil")) {
      this.banked = true;
      this.log("money", "給料の振り込みのため、銀行に口座を作った。");
    }
    const world = streamRng("world", "economy", this.year); // 景気は同い年みんな共通
    const recession = world.chance(0.1);
    if (recession && a >= 18) {
      const working = this.job !== "none" && this.job !== "retired";
      this.log(
        "money",
        this.again("recession", 1)
          ? this.vary("recession2", ["不景気が続いている。", "景気は、なかなか上向かない。", "今年も景気は悪いままだった。"])
          : this.vary("recession", [
              "景気が後退した。",
              "景気が悪くなり、求人が減った。",
              "不景気のニュースが続いた。",
              "景気が冷えこみ、街の人通りが減った。",
              "物が売れなくなり、景気が後退した。",
              "景気の先行きが暗くなり、みんな財布のひもを固くした。",
              working ? "景気が後退し、勤め先の業績も落ちこんだ。" : "景気が後退し、まわりでも仕事を失う人が出た。",
              working ? "不景気で、ボーナスや残業代が減るという話が出た。" : "不景気で、店じまいする店が増えた。",
            ]),
      );
    }

    if (this.job === "none" && this.school === "done" && this.made("firstJob") && a < this.retireAge) {
      if (a >= this.unemployedUntil && this.unemployedUntil >= 0) {
        const back: Job = r.chance(0.35) ? "sme" : "nonregular";
        this.job = back;
        this.careerMult = Math.max(0.65, this.careerMult * 0.85);
        this.unemployedUntil = -1;
        this.log(
          "work",
          back === "sme"
            ? this.vary("backSme", ["中小企業の正社員として働きはじめた。", "仕事が見つかり、中小企業の正社員になった。"])
            : this.vary("backNonreg", ["非正規の仕事で働きはじめた。", "派遣やパートの仕事を見つけて、働きはじめた。", "契約社員として、また働きはじめた。", "短期の仕事をつないで、働きはじめた。"]),
        );
      }
    }

    if (this.job !== "none" && this.job !== "retired") {
      let sal = this.salaryOf(a);
      if (this.job === "freelance" || this.job === "founder") {
        // 収入は毎年ばらつく。プロのスポーツ選手は年俸の契約なので、ばらつかせない
        const v = Math.max(0.2, r.normal(1, 0.28));
        if (this.proUntil <= a) sal *= v;
      }
      if (recession && (this.job === "big" || this.job === "sme")) sal *= 0.94;
      if (this.careMode === "home" && a < this.careUntil) sal *= 0.85;
      if (this.careMode === "liveIn" && a < this.careUntil) sal *= 0.9;
      if (this.postRetireWork) sal = this.lastRegularWage > 0 ? this.lastRegularWage * 0.62 : sal;
      this.addIncome("salary", sal);
      this.workYears++;
      if (this.job === "big" || this.job === "sme" || this.job === "civil") {
        this.regularYears++;
        if (!this.postRetireWork) this.lastRegularWage = sal;
      }

      // 給料の揺らぎ
      this.careerMult = Math.min(2.6, Math.max(0.55, this.careerMult * Math.exp(r.normal(0.004, 0.03))));

      // 昇進
      if ((this.job === "big" || this.job === "sme" || this.job === "civil") && !this.manager && a >= 35 && a <= 55 && !this.postRetireWork) {
        const p = 1 - Math.pow(1 - this.D.ev.promotionToManagerBy45, 1 / 10);
        if (r.chance(p * (this.edu === "university" || this.edu === "graduate" ? 1.3 : 0.7))) {
          this.manager = true;
          this.careerMult *= 1.18;
          this.log("work", "管理職に昇進した。給料が上がった。", undefined, true);
        }
      }
      // リストラ・倒産・雇い止め
      const layoffMult = recession ? 2.2 : 1;
      if ((this.job === "big" || this.job === "sme") && a >= 30 && a < 60 && !this.postRetireWork) {
        const p = this.D.ev.layoffAnnual * layoffMult * (this.job === "big" ? (a >= 45 ? 1.3 : 0.6) : 1) * (this.manager ? 0.8 : 1);
        if (r.chance(p)) {
          const sev = this.job === "big" ? this.salaryOf(a) * r.range(0.5, 1.5) : this.salaryOf(a) * 0.3;
          this.log("work", this.job === "big" ? "早期退職を迫られ、会社を辞めた。割増退職金が出た。" : "勤め先が経営不振で人員削減。職を失った。", sev, true);
          this.addIncome("windfall", sev);
          this.loseJob(a);
          this.mark("jobLoss");
        }
      } else if (this.job === "nonregular" && !this.postRetireWork) {
        if (r.chance(0.06 * layoffMult)) {
          this.log("work", this.vary("noRenew", ["契約が更新されず、次の仕事を探した。", "契約期間が終わり、仕事がなくなった。", "人手が足りたからと、契約を打ち切られた。"]));
          this.mark("jobLoss");
          this.unemployedUntil = a + 1;
          this.job = "none";
        } else if (a < 45 && r.chance(0.025)) {
          this.job = "sme";
          this.log("work", "正社員に登用された。", undefined, true);
        }
      } else if (this.job === "founder") {
        const years = a - this.founderYear;
        if (!this.founderBig && years >= 1 && years <= 5) {
          const fail = 1 - Math.pow(this.D.ev.startupFiveYearSurvival, 1 / 5);
          if (r.chance(fail * (recession ? 1.6 : 1))) {
            const debt = r.range(this.y(1_000_000), this.y(8_000_000));
            this.log("work", "会社をたたんだ。借入の返済が残った。", -debt, true);
            this.spend("other", debt);
            this.job = "none";
            this.unemployedUntil = a + 1;
          } else if (r.chance(this.D.ev.startupBigSuccessRate / 5)) {
            this.founderBig = true;
            this.log("luck", "事業が大きく当たった。会社が急成長している。", undefined, true);
          }
        }
        if (this.founderBig && r.chance(0.04)) {
          const exit = this.D.income.selfEmployedMedianAnnual * r.range(20, 120);
          this.log("luck", "会社を売却した。", exit, true);
          this.addIncome("windfall", exit);
          this.job = "freelance";
          this.founderBig = false;
        }
      } else if (this.job === "freelance") {
        if (r.chance(0.03 * layoffMult)) {
          this.log("work", this.vary("lostClient", ["大口の取引先を失い、収入が減った。", "長く続いた取引が終わり、収入が減った。", "注文が減り、売り上げが落ちた。"]));
          this.careerMult *= 0.8;
        }
      }
      // 転職（自発的）
      if ((this.job === "sme" || this.job === "big") && a < 55 && r.chance(this.D.ev.jobChangeRateAnnual * 0.35)) {
        const ch = Math.exp(r.normal(0.02, 0.12));
        this.careerMult *= ch;
        this.log("work", ch >= 1 ? "より条件のいい会社に転職した。" : "働きやすさを優先して転職した。給料は少し下がった。");
      }
    }

    // 小さな選択の効果：副業・出稼ぎ・近所の仕事
    if (this.seniorWorkUntil >= 0 && a >= this.seniorWorkUntil) {
      this.seniorWorkUntil = -1;
      this.sideIncome = 0;
    }
    if (this.sideIncome > 0 && a < 80) this.addIncome("salary", this.sideIncome);
    if (this.abroad) {
      if (a < this.abroadUntil && this.job !== "none") {
        // 出稼ぎ先の稼ぎ（現地の数倍）。生活費を引いた分を仕送りする
        this.addIncome("salary", this.salaryOf(a) * 2.2);
      } else {
        this.abroad = false;
        this.abroadUntil = -1;
        this.log("work", "出稼ぎから帰ってきた。家族と暮らす日々に戻った。", undefined, true);
      }
    }

    // 定年
    if (a + 1 === this.retireAge && this.job !== "none" && this.job !== "retired") {
      this.retire(r);
    }
    // 失業中の手当
    if (this.job === "none" && this.unemployedUntil > a && this.lastRegularWage > 0 && a < 65) {
      this.addIncome("windfall", this.lastRegularWage * 0.25);
    }
  }

  loseJob(a: number): void {
    this.job = "none";
    this.manager = false;
    this.unemployedUntil = a + 1;
  }

  retire(r: Rng): void {
    if (this.job === "big" || this.job === "sme" || this.job === "civil" || this.regularYears >= 10) {
      const base = this.edu === "university" || this.edu === "graduate" ? this.D.ev.retirementAllowance.university : this.D.ev.retirementAllowance.high_school;
      const jm = this.job === "big" ? 1.15 : this.job === "civil" ? 1.05 : this.job === "sme" ? 0.55 : 0.3;
      const amt = base * jm * Math.min(1, this.regularYears / 35) * r.range(0.85, 1.15);
      if (amt > 0) {
        this.addIncome("pension", amt);
        this.log("money", `退職金を受け取った。`, amt, true);
      }
    }
    this.log("work", `${this.age + 1}歳で仕事を引退した。`, undefined, true);
    this.job = "retired";
    this.postRetireWork = false;
  }

  // ── 親
  private parentsYear(r: Rng): void {
    const a = this.age;
    if (this.heir) this.heirParentsYear(a);
    // 子どものうちに受け継いだ家は、18歳で住むか売るかを決める
    if (this.heldHouse > 0 && a >= 18) this.queueScene(heldHouseScene(this));
    if (a < 18) return;
    for (const [i, p] of this.parents.entries()) {
      if (!p.alive) continue;
      const pa = p.age + a;
      const sex: Sex = i === 0 ? "male" : "female";
      const careEnding = this.careUntil === a && this.careMode !== "" && i === this.careParent;
      // 前の代の人生で亡くなる年が決まっている親は、ここでは亡くならない（介護はその年で終わる）
      const h = this.heir;
      if (h && (i === h.parentIdx || h.otherDies !== null || a < h.otherSafeUntil)) {
        if (careEnding) this.careMode = "";
        continue;
      }
      if (careEnding || r.chance(this.D.qx(sex, pa))) {
        p.alive = false;
        this.log("family", `${i === 0 ? "父" : "母"}が${pa}歳で亡くなった。`, -this.D.living.funeralCost / (this.siblings + 1), true);
        this.mark("parentDeath");
        this.spend("events", this.D.living.funeralCost / (this.siblings + 1));
        if (careEnding) this.careMode = "";
        if (!this.parents.some((x) => x.alive) && !this.heir) {
          this.inherit(r);
          if (this.home === "parents") {
            // 同居していた実家をそのまま受け継ぐ
            this.home = "own";
            this.housePrice = (this.region.id === "tokyo" ? this.y(30_000_000) : this.y(12_000_000)) / (this.siblings + 1);
            this.boughtAge = a - 30;
            this.log("life", "住んでいた実家を受け継いだ。");
          }
        }
      }
    }
    // 介護が必要になる
    if (!this.careTriggered && !this.made("parentCare") && a >= 45 && this.parents.some((p) => p.alive)) {
      const pc = this.D.ev.parentCareStartProbByChildAge;
      const pr = a < 50 ? pc["40s"] : a < 60 ? pc["50s"] : pc["60s"];
      if (r.chance(pr)) {
        this.careTriggered = true;
        this.careParent = this.parents.findIndex((p) => p.alive);
        this.log("family", `${this.careParent === 0 ? "父" : "母"}に介護が必要になった。`, undefined, true);
      }
    }
    // 介護費用
    if (this.careMode && a < this.careUntil) {
      const cost =
        this.careMode === "facility"
          ? this.y(1_800_000)
          : this.careMode === "home"
            ? this.y(600_000)
            : this.careMode === "liveIn"
              ? this.y(350_000)
              : this.careMode === "quit"
                ? this.y(400_000)
                : this.y(700_000);
      // 親と同居している人には、きょうだいがいても負担が寄りやすい
      const share = this.careMode === "share" ? 1 : 1 / Math.max(1, this.siblings * (this.livesWithParents ? 0.25 : 0.5) + 1);
      // 親自身の年金・貯金でまかなう分もあるので、子の家計が苦しいときは負担が軽くなる
      this.spend("care", cost * share * (this.cash + this.invest < 0 ? 0.5 : 1));
    }
  }
  careParent = 0;

  /** 親と同じ家で暮らしている（実家暮らし・二世帯） */
  get livesWithParents(): boolean {
    return (this.home === "parents" || this.coLiveParents) && this.parents.some((p) => p.alive);
  }

  /** 前の代のあなた（と、そのパートナー）が、前の代の人生で決まった年に亡くなる。遺産もここで受け継ぐ */
  private heirParentsYear(a: number): void {
    const h = this.heir!;
    const word = (i: number) => (i === 0 ? "父" : "母");
    const other = h.parentIdx === 0 ? 1 : 0;
    if (h.otherDies === a && this.parents[other].alive) {
      this.parents[other].alive = false;
      this.log("family", `${word(other)}が${this.parents[other].age + a}歳で亡くなった。`, undefined, true);
      this.mark("parentDeath");
    }
    const me = this.parents[h.parentIdx];
    if (h.parentDies !== a || !me.alive) return;
    me.alive = false;
    const share = this.D.living.funeralCost / (this.siblings + 1);
    this.log("family", `${word(h.parentIdx)}（${h.gen - 1}代目のあなた）が${me.age + a}歳で亡くなった。`, a >= 18 ? -share : undefined, true);
    this.mark("parentDeath");
    if (a >= 18) this.spend("events", share);
    if (h.estate > 0) {
      this.addIncome("windfall", h.estate);
      this.inherited += h.estate;
      this.log("money", `${h.gen - 1}代目のあなたが残したお金を相続した。`, h.estate, true);
    }
    if (h.debt > 0) {
      this.addIncome("windfall", -h.debt);
      this.inherited -= h.debt;
      this.log("money", h.homeShare === 0 && h.hadHome ? "実家を売っても返しきれず、親が残した借金を引き継いだ。" : "親が残した借金を引き継いだ。", -h.debt, true);
    }
    if (h.homeShare > 0) {
      // 親が残した家は、住み続けるか売るかを選ぶ。子どものうちは住み続け、18歳になったら決める
      this.heldHouse = h.homeShare;
      if (a < 18) {
        const other = this.parents[h.parentIdx === 0 ? 1 : 0].alive;
        this.log("life", other ? "親が残した家で、そのまま暮らし続けた。" : "親が残した家に、親戚に見守られながら住み続けた。", undefined, true);
      } else this.queueScene(heldHouseScene(this));
    }
    if (!h.estate && !h.homeShare && !h.debt) this.log("money", "親の遺産はほとんどなかった。");
  }

  /**
   * お金の振り分け：その年に余ったお金（手取りから、出ていったお金を引いた残り）を、決めた割合で使う。
   * 効き目はゲームがすでに使っている統計の範囲だけにする（投資は国の株式の利回り、貯金は預金金利と物価、
   * 学びは「学び直し」と同じ確率、家族は子どもの教育費・親への仕送り）。
   */
  private allocYear(): void {
    const c = this.cur!;
    const inc = (c.income.salary ?? 0) + (c.income.partner ?? 0) + (c.income.pension ?? 0);
    const out = Object.values(c.expense).reduce((t, v) => t + (v ?? 0), 0);
    const free = inc - out;
    this.lastFree = free;
    const al = this.alloc;
    if (!al || free <= 0 || this.cash <= 0) return;
    const pot = Math.min(free, this.cash);
    const part = (n: number) => (pot * n) / 10;
    if (al.living) this.spend("fun", part(al.living));
    // 口座がない人は、投資に回すつもりの分も手元に置く
    if (al.invest && this.banked) {
      const v = Math.min(this.cash, part(al.invest));
      this.cash -= v;
      this.invest += v;
    }
    if (al.family) {
      const v = part(al.family);
      const a = this.age;
      const kids = this.kids.filter((k) => a - k.born >= 0 && a - k.born < 22);
      if (kids.length) {
        this.spend("kids", v);
        for (const k of kids) k.eduSpend = (k.eduSpend ?? 0) + v / kids.length;
      } else if (this.parents.some((p) => p.alive)) {
        // 親への仕送り（多くの国で、働く子が親を支えている）
        this.spend("care", v);
      }
    }
    if (al.self && this.age < 65) {
      this.spend("selfEdu", part(al.self));
      this.selfFund += part(al.self);
      // 学び直しの費用（40万円×3年ぶん、または年収の半分の大きいほう）がたまったら、給料が上がるかが決まる。
      // 「学び直し」の選択と同じ確率（半々で＋15%）。1年に1回まで、一生で3回まで
      const unit = Math.max(this.y(1_200_000), this.salaryOf(this.age) * 0.5);
      if (this.selfFund >= unit && this.selfRaises < 3) {
        this.selfFund -= unit;
        if (this.rng("allocSelf").chance(0.5)) {
          this.selfRaises++;
          this.careerMult *= 1.15;
          this.log("work", "学びに使ったお金で身につけたことが評価され、給料が上がった。", undefined, true);
        } else this.log("work", this.vary("studyNo", ["学び続けたが、すぐには給料に結びつかなかった。", "勉強は続けているが、まだ仕事には生かせていない。", "資格の勉強を続けた。給料は変わらなかった。"]));
      }
      this.selfFund = Math.min(this.selfFund, unit);
    }
  }

  /** 親が残した家に住む（家賃がかからなくなる） */
  moveIntoHeldHouse(): void {
    this.home = "own";
    this.housePrice = this.heldHouse;
    this.boughtAge = this.age;
    this.heldHouse = 0;
  }
  /** 親が残した家を売って、お金にする */
  sellHeldHouse(): number {
    const v = this.heldHouse;
    this.addIncome("windfall", v);
    this.inherited += v;
    this.heldHouse = 0;
    return v;
  }

  private inherit(r: Rng): void {
    const b = BAND_INHERIT[this.band.id] ?? BAND_INHERIT.mid;
    if (r.chance(b.p)) {
      const amt = (this.D.ev.inheritanceAverage * b.mult * Math.exp(r.normal(-0.2, 0.7))) / (this.siblings + 1);
      this.addIncome("windfall", amt);
      this.log("money", "親の遺産を相続した。", amt, true);
    } else {
      this.log("money", "親の遺産はほとんどなかった。");
    }
  }

  // ── 健康
  private healthYear(r: Rng): void {
    const a = this.age;
    if (a < 20) return;
    if (this.gymUntil > a) this.spend("fun", this.y(96_000));
    if (this.insured && a < 70) this.spend("other", this.y(60_000));
    if (this.cramUntil > a) this.spend("kids", this.y(400_000));
    if (this.repairLater && this.home === "own" && r.chance(0.12)) {
      this.repairLater = false;
      this.spend("housing", this.y(2_500_000));
      this.log("money", "先送りにしていた家の傷みが広がり、大きな修理になった。", -this.y(2_500_000), true);
    }
    const pc = this.D.cancerAnnual(a) * (this.sex === "male" ? 1.1 : 0.9);
    if (a - this.cancerAge > 6 && r.chance(pc)) {
      this.cancerAge = a;
      const cost = r.range(this.y(400_000), this.y(1_500_000));
      this.spend("medical", cost);
      this.log("health", "がんが見つかり、治療を受けた。" + this.sickLeave(4), -cost, true);
      this.mark("cancer");
      if (this.job !== "none" && this.job !== "retired" && r.chance(0.2)) {
        this.log("work", "治療のため仕事を辞めた。");
        this.loseJob(a);
        this.unemployedUntil = a + 2;
      }
    } else if (r.chance(0.002 + Math.max(0, a - 40) * 0.0006)) {
      const cost = r.range(this.y(300_000), this.y(1_000_000));
      this.spend("medical", cost);
      this.log("health", (r.chance(0.5) ? "心臓の病気で入院した。" : "脳の血管の病気で入院した。") + this.sickLeave(2), -cost, true);
      this.mark("heartBrain");
      this.illMult = Math.min(1.6, this.illMult * 1.12);
    } else if (r.chance(0.012)) {
      const cost = r.range(this.y(50_000), this.y(300_000));
      this.spend("medical", cost);
      this.log("health", r.pick(["骨折して通院した。", "手術のため入院した。", "持病の治療が続いた。"]), -cost);
    }
    // お酒がやめられなくなる（WHO の12か月有病率を、20〜59歳の40年でおよそ一度起きる大きさにした。統計がある20か国だけ）
    const alc = alcoholDisorderShare(this.D.iso3);
    if (alc !== null && !this.alcoholProblem && a < 60 && streamRng(this.seed, "alcohol", a).chance(1 - Math.pow(1 - alc, 1 / 40))) {
      this.alcoholProblem = true;
      const cost = this.y(streamRng(this.seed, "alcoholCost", a).range(200_000, 600_000));
      this.spend("medical", cost);
      this.illMult = Math.min(1.6, this.illMult * 1.08);
      this.log("health", this.vary("alcohol", ["お酒の量が増え、自分ではやめられなくなった。専門の病院で治療を受けた。", "毎晩の酒が手放せなくなり、家族に勧められて治療に通った。"]), -cost, true);
      this.mark("alcohol");
    }
    if (!this.selfCare && a >= 65 && r.chance(this.D.careNeed(a) / 6)) {
      this.selfCare = true;
      this.log("health", "要介護の認定を受けた。介護サービスを使いはじめた。", undefined, true);
      this.mark("care");
    }
    if (this.selfCare) this.spend("care", r.range(this.y(600_000), this.y(1_200_000)));
  }

  /**
   * 子ども時代の出来事（ほかの出来事と乱数を分ける）
   * ・児童労働（日本以外）：10歳のとき、その国の5〜17歳の児童労働の割合（UNICEF・ILO）を、家の豊かさで重みづけて決める
   * ・不登校（日本）：その年度に不登校だった子は小学生2.3%、中学生6.8%（文部科学省 2024年度）
   */
  private childhoodYear(): void {
    const a = this.age;
    // 19歳：口座を持てるか。国の口座の割合（Global Findex）を、家の豊かさで重みづけて決める。統計がない国は持っているとみなす。
    // 正社員・公務員として働いている人は、給料の振り込みのために口座を持っている
    if (a === 19 && this.job !== "big" && this.job !== "sme" && this.job !== "civil") {
      const acc = accountShare(this.D.iso3);
      const bandF = [2, 1.4, 1, 0.5, 0.2][this.bandIdx] ?? 1;
      if (acc !== null && streamRng(this.seed, "account", 0).chance(Math.min(0.95, (1 - acc) * bandF))) {
        this.banked = false;
        this.log("money", "銀行やスマホのお金の口座を持っていない。稼いだお金は、手元に置いておくしかない。");
        this.mark("unbanked");
      }
    }
    if (!this.D.isJapan && a === 10) {
      const share = childLabourShare(this.D.iso3);
      const bandF = [2, 1.4, 1, 0.5, 0.2][this.bandIdx] ?? 1;
      if (share !== null && streamRng(this.seed, "childWork", 0).chance(Math.min(0.9, share * bandF))) {
        this.childWorked = true;
        this.log(
          "school",
          this.region.urban
            ? "家計を助けるため、学校が終わると市場や店で働くようになった。学校を休む日も増えた。"
            : "家の畑仕事や家畜の世話を任され、学校を休む日が増えた。",
          undefined,
          true,
        );
        this.mark("childWork");
      }
    }
    // 不登校の割合は「その年度に不登校だった子」の割合で、同じ子を毎年数える。そこで小学校（9歳）と中学校（13歳）で1回ずつ決める
    if (this.D.isJapan && this.futokoAge < 0 && (a === 9 || a === 13) && streamRng(this.seed, "futoko", a).chance(a === 13 ? 0.068 : 0.023)) {
      this.futokoAge = a;
      this.log(
        "school",
        a >= 12 ? "中学校に行けない時期が続いた。家やフリースクールで過ごした。" : "小学校に行けない時期が続いた。家で過ごす日が多かった。",
        undefined,
        true,
      );
      this.mark("futoko");
    }
  }

  /** 子どもの呼び名（長男・次女など）。家族の声と同じ数え方 */
  kidLabel(i: number): string {
    const f = kidFemale(this.seed, i);
    const nth = this.kids.slice(0, i).filter((_, j) => kidFemale(this.seed, j) === f).length;
    return `${["長", "次", "三", "四", "五"][nth] ?? "末"}${f ? "女" : "男"}`;
  }

  /** 初めての子が生まれたときに添える、お産の危険の一言（国連の推計） */
  private birthRiskNote(): string {
    const n = maternalDeaths(this.D.iso3);
    if (n === null) return "";
    const jp = maternalDeaths("JPN");
    return `${this.D.nameJa}では、お産で命を落とす女性が10万人に${Math.round(n)}人いる` + (this.D.isJapan || jp === null ? "。" : `（日本は${Math.round(jp)}人）。`);
  }

  /** 一人で子どもを育てることになったときの一言（ひとり親世帯の貧困率） */
  private singleParentNote(): void {
    const p = singleParentPoverty(this.D.iso3);
    if (p === null) return;
    this.log("family", `一人で子どもを育てることになった。${this.D.nameJa}では、ひとり親の家庭の${Math.round(p * 100)}%が、貧困ラインより下で暮らしている。`);
  }

  /**
   * 病気で何か月か仕事を休む。休んだ分の給料は、国の補償がある人なら3分の2が出る（統計は lifestats.ts）。
   * 休んで減った分を支出に入れ、ログに足す一文を返す
   */
  private sickLeave(months: number): string {
    if (this.job === "none" || this.job === "retired") return "";
    const covered = sickPayCovered(this.D.iso3, this.job, this.D.inst?.informalShare ?? 0);
    const lost = this.salaryOf(this.age) * (months / 12) * (covered ? 1 / 3 : 1);
    this.spend("other", lost);
    return covered ? `${months}か月休み、その間は国の制度で給料の3分の2が出た。` : `${months}か月休み、その間の給料は出なかった。`;
  }

  // ── 運
  private luckYear(r: Rng): void {
    const a = this.age;
    if (a < 20) return;
    if (this.lottery) {
      this.spend("fun", this.y(30_000));
      if (r.chance(this.D.ev.lotteryJackpotOdds * 10)) {
        this.addIncome("windfall", this.y(700_000_000));
        this.log("luck", this.D.isJapan ? "年末ジャンボ宝くじで1等が当たった。" : "宝くじの1等が当たった。", this.y(700_000_000), true);
      } else if (r.chance(10 / 1_000_000)) {
        this.addIncome("windfall", this.y(1_000_000));
        this.log("luck", `宝くじで${this.D.fmt(this.y(1_000_000), false)}が当たった。`, this.y(1_000_000), true);
      } else if (r.chance(0.02)) {
        this.addIncome("windfall", this.y(10_000));
        this.log("luck", `宝くじで${this.D.fmt(this.y(10_000), false)}が当たった。`, this.y(10_000));
      }
    }
    if (a >= 22 && a < 60 && r.chance(0.0015)) {
      const amt = r.range(this.y(3_000_000), this.y(30_000_000));
      this.addIncome("windfall", amt);
      this.log("luck", "副業で作ったものが思わぬヒットになった。", amt, true);
    }
    // 日本の地震・災害（地域ごとの係数）。日本以外の災害は risks.ts が INFORM の実データで起こす
    const dis = this.D.isJapan ? this.D.ev.majorDisasterAnnualByRiskUnit * this.region.disasterRisk : 0;
    if (r.chance(dis)) {
      const own = this.home === "own";
      const dmg = own ? r.range(this.y(1_500_000), this.y(8_000_000)) : r.range(this.y(200_000), this.y(800_000));
      this.spend("events", dmg);
      this.log("disaster", own ? "大きな地震で家が被害を受け、修理した。" : "大きな災害で家財を失った。", -dmg, true);
      this.mark("disaster");
    }
    // 車
    if (a >= 22 && this.school === "done" && !this.frugal && !this.welfare && r.chance(this.regionFactor(REGION_CAR, 0.35, 0.55) * Math.min(1, this.D.k * 3) / 9) && a < 80) {
      const liquid = this.cash + this.invest;
      const used = liquid < this.y(2_000_000);
      const c = used ? r.range(this.y(400_000), this.y(1_000_000)) : r.range(this.y(1_500_000), this.y(3_200_000));
      this.spend("car", c);
      const first = this.carSince < 0;
      if (first) this.carSince = a;
      this.log(
        "money",
        first
          ? used
            ? "中古車を買った。"
            : "車を買った。"
          : used
            ? this.vary("carUsed", ["中古車に買い替えた。", "古い車を下取りに出して、中古車に乗り換えた。", "車が故障続きになり、中古車に買い替えた。"])
            : this.vary("carNew", ["車を買い替えた。", "長く乗った車を手放し、新しい車にした。", "家族の暮らしに合わせて、車を買い替えた。"]),
        -c,
      );
    }
    if (a >= 25 && !this.tight && !this.frugal && r.chance(0.04)) {
      const c = r.range(this.y(150_000), this.y(600_000));
      this.spend("fun", c);
      this.log(
        "money",
        r.pick([
          this.vary("splurge1", ["家族で海外旅行に行った。", "思い切って遠くへ旅行した。", "温泉旅行でのんびり過ごした。"]),
          this.vary("splurge2", ["趣味に思い切って使った。", "ずっと欲しかったものを買った。", "習いごとを始め、道具をそろえた。"]),
          this.vary("splurge3", ["家電をまとめて買い替えた。", "古くなった家具を買い替えた。", "冷蔵庫と洗濯機が続けて壊れ、買い替えた。"]),
        ]),
        -c,
      );
    }
  }

  // ── お金の流れ
  private moneyYear(r: Rng): void {
    const a = this.age;
    const living = this.school === "child" || (this.school !== "done" && this.home === "parents");
    // 世帯収入
    const pInc = this.partnerIncome();
    if (pInc > 0) this.addIncome("partner", pInc);

    // 年金
    if (a >= this.pensionStart) {
      const pen = this.pensionAnnual();
      this.addIncome("pension", pen);
      if (a === this.pensionStart)
        this.log("money", pen > 0 ? `年金を受け取りはじめた。年に${this.D.fmt(pen)}。` : "年金には入っていなかった。これからは貯えと家族が頼り。", undefined, true);
    }
    if (this.partner?.alive && this.partner.age >= 65) this.addIncome("partner", this.partnerPension());
    if (this.widowed && a >= 60 && this.D.isJapan) this.addIncome("pension", this.D.ev.pensionMonthly.kosei_avg * 12 * 0.35);

    // 児童手当
    const minors = this.kids.filter((k) => a - k.born < 18).length;
    if (minors > 0 && this.D.isJapan) this.addIncome("windfall", minors * 12 * this.y(12_000));

    // 税
    const gross = (this.cur!.income.salary ?? 0) + (this.cur!.income.partner ?? 0) * 0;
    const pension = (this.cur!.income.pension ?? 0) * (a >= this.pensionStart ? 1 : 0);
    const formal = this.job === "big" || this.job === "sme" || this.job === "civil" || this.job === "retired";
    this.spend(
      "tax",
      this.D.tax(gross, formal) +
        (this.cur!.income.partner ? this.D.tax(this.cur!.income.partner, this.partner?.work === "regular") : 0) +
        this.D.pensionTax(Math.min(pension, this.pensionAnnual() + 1)),
    );

    if (!living) this.livingCosts(r);

    // 奨学金返済
    if (this.scholarship > 0 && this.school === "done") {
      const pay = Math.min(this.scholarship, this.scholarshipAnnual || this.scholarship / 15);
      this.scholarship -= pay;
      this.cash -= pay;
      this.cur!.expense.selfEdu = (this.cur!.expense.selfEdu ?? 0) + pay;
      if (this.scholarship <= 1) {
        this.scholarship = 0;
        this.log("money", "奨学金を返し終えた。", undefined, true);
      }
    }
    // 住宅ローン
    if (this.loan > 0) {
      const interest = this.loan * 0.012;
      const pay = Math.min(this.loan + interest, this.loanAnnual);
      this.loan = Math.max(0, this.loan + interest - pay);
      this.cash -= pay;
      this.cur!.expense.housing = (this.cur!.expense.housing ?? 0) + pay;
      if (this.loan < 1) {
        this.loan = 0;
        this.log("money", "住宅ローンを完済した。", undefined, true);
      }
    }

    // 投資
    if (this.investStyle !== "none" && this.banked && a < 65 && this.cash > 0) {
      const net = (this.cur!.income.salary ?? 0) + (this.cur!.income.partner ?? 0) - (this.cur!.expense.tax ?? 0);
      const c = Math.min(this.cash, Math.max(0, net * this.investRate));
      this.cash -= c;
      this.invest += c;
    }
    if (this.invest > 0) {
      const world = streamRng("world", "market", this.year);
      const m = this.D.ev.investmentReturn;
      const market = world.normal(m.meanAnnual, m.stdevAnnual);
      let ret = this.investStyle === "stocks" ? market * 1.25 + r.normal(-0.025, 0.12) : market;
      if (a >= 65) ret = ret * 0.5 + this.D.ev.depositRate * 0.5; // 老後は守りの配分に寄せる
      const g = this.invest * Math.max(-0.7, ret);
      this.invest += g;
      this.cur!.income.invest = (this.cur!.income.invest ?? 0) + g;
      if (this.investStyle === "stocks" && ret > 0.45) this.log("luck", this.vary("stockUp", ["持っていた株が大きく値上がりした。", "株が大きく上がり、資産がふくらんだ。", "買っておいた株の値段が、一年で大きく伸びた。"]), g, true);
      if (ret < -0.25)
        this.log("money", this.again("stockDown", 2) ? this.vary("stockDown2", ["株価がまた大きく下がった。", "株価の下落が続き、資産がさらに減った。"]) : this.vary("stockDown", ["株価が大きく下がり、資産が目減りした。", "株が暴落し、資産が大きく減った。", "株価が急落した。売らずに持ち続けた。"]), g);
      // 65歳から少しずつ取り崩す
      if (a >= 65 && this.cash < 0) {
        const w = Math.min(this.invest, -this.cash + this.y(500_000));
        this.invest -= w;
        this.cash += w;
      }
    }
    this.allocYear();
    if (this.cash > 0 && this.banked) this.cash += this.cash * this.D.ev.depositRate;
    if (this.cash < 0) {
      if (this.invest > 0) {
        const w = Math.min(this.invest, -this.cash);
        this.invest -= w;
        this.cash += w;
      }
      if (this.cash < 0 && !this.welfare && !this.reverseMortgage) this.cash *= 1.02; // 借入の利息
    }
    // 生活保護：65歳以降で貯えが尽き、年金だけでは暮らせないとき不足分を補う
    if (a >= 65 && this.cash + this.invest < 0 && this.home === "own" && !this.reverseMortgage) {
      this.reverseMortgage = true;
      this.log("money", "家を担保にお金を借りて暮らすことにした。", undefined, true);
    }
    // 日本以外：借りられる額には限りがあるので、一定を超えたら家族・親戚の援助で暮らす
    const creditLimit = this.y(this.D.inst?.incomeGroup === "HIC" ? 5_000_000 : 1_500_000);
    const overLimit = !this.D.isJapan && this.cash + this.invest < -creditLimit;
    if ((overLimit || a >= 65) && this.cash + this.invest < 0 && (this.home !== "own" || this.cash + this.invest < -this.homeValue || overLimit)) {
      const c = this.cur!;
      const inc = (["salary", "partner", "pension", "windfall"] as IncomeCat[]).reduce((t, k) => t + (c.income[k] ?? 0), 0);
      const exp = Object.values(c.expense).reduce((t, v) => t + (v ?? 0), 0);
      const gap = exp - inc;
      if (gap > 0) {
        if (!this.welfare) {
          // 国の給付（社会扶助）があるかは、その国で一番所得の低い人たちが給付を受けている割合で決める
          this.publicAid = this.D.isJapan || streamRng(this.seed, "publicAid", 0).chance(publicAidRate(this.D.iso3));
          const text = this.D.isJapan
            ? "貯えが尽き、生活保護を受けはじめた。"
            : this.publicAid
              ? a < 65
                ? this.vary("aidPub", ["暮らしが立ち行かなくなり、国の生活支援（現金の給付）を受けることになった。", "稼ぎだけでは暮らせなくなり、国の生活支援を受けはじめた。"])
                : "貯えが尽き、国の生活支援（現金の給付）を受けて暮らすようになった。"
            : a < 65
              ? this.again("aid", 8)
                ? this.vary("aid2", ["また借金が返せなくなり、親戚の援助を受けることになった。", "再び暮らしが立ち行かなくなり、親戚を頼った。"])
                : this.vary("aid", ["借金が返せなくなり、親戚に助けを求めた。しばらく援助を受けて暮らす。", "返済が追いつかなくなり、親戚の援助で暮らすことになった。"])
              : this.kids.length
                ? "貯えが尽き、子どもたちの仕送りに頼って暮らすようになった。"
                : "貯えが尽き、親戚や地域の支えで暮らすようになった。";
          this.log("money", text, undefined, true);
        }
        this.welfare = true;
        this.addIncome("windfall", gap);
      }
    }
    if (this.welfare && !this.D.isJapan && a < 65 && this.cash + this.invest > 0) {
      this.welfare = false;
      this.log("money", this.publicAid ? this.vary("welfareOffPub", ["国の支援を受けずに暮らせるようになった。", "なんとか自分の稼ぎで暮らせるようになった。"]) : this.vary("welfareOff", ["援助を受けずに暮らせるようになった。", "なんとか自分の稼ぎで暮らせるようになった。", "親戚に頼らずにやっていけるようになった。"]));
    }
    // 家計が苦しいときは節約する
    const wasFrugal = this.frugal;
    this.frugal = this.cash + this.invest < -this.y(1_000_000) && this.school === "done";
    // 自己破産（日本）：奨学金を除く借金が年収の3年分を超えたとき、一度だけ考える
    if (this.D.isJapan && !this.bankruptAsked && a >= 20 && a < 65 && -(this.cash + this.invest) > 3 * Math.max(this.y(2_000_000), this.salaryOf(a))) {
      this.bankruptAsked = true;
      this.queueScene(bankruptScene(this));
    }
    // 1〜2年で行ったり来たりするときは、毎回は知らせない
    if (this.frugal && !wasFrugal && !this.again("frugalFlip", 2))
      this.log(
        "money",
        this.again("frugal", 6)
          ? this.vary("frugal2", ["また家計が赤字になり、節約生活に戻った。", "貯えが再びマイナスになり、出費を削った。", "家計がまた苦しくなった。"])
          : this.vary("frugal", ["家計が赤字続きになり、節約生活を始めた。", "貯えがマイナスになり、出費を大きく削ることにした。", "借金がふくらみ、暮らしを見直した。"]),
      );
    if (!this.frugal && wasFrugal && !this.again("recoverFlip", 2))
      this.log("money", this.again("recover", 6) ? this.vary("recover2", ["家計がまた持ち直した。", "どうにか赤字から抜け出した。"]) : this.vary("recover", ["家計が立ち直った。", "赤字から抜け出し、ひと息ついた。", "借金が減り、家計が落ち着いた。"]));
  }

  private livingCosts(r: Rng): void {
    const a = this.age;
    const reg = this.regionFactor(REGION_LIVING, 1.05, 0.9);
    const s = this.D.living.singleMonthly;
    const share = (k: string) => (s[k] ?? 0) / Math.max(1, this.D.singleMonthlyTotal() - (s.housing ?? 0) - (s.education ?? 0));
    const fam = this.partner?.alive;
    let annual: number;
    const elderly = a >= 65 && (this.job === "retired" || this.job === "none");
    if (elderly) {
      // 家計調査の「支出」には税・社会保険料（非消費支出）が含まれるので除く。住居費も別に計上
      annual = this.D.living.retiredCoupleMonthly.expense * 12 * (fam ? 1 : 0.62) * 0.8;
      // 年を重ねると支出は自然に減る
      annual *= a >= 85 ? 0.82 : a >= 75 ? 0.9 : 1;
    } else if (fam) {
      annual = this.D.familyMonthly(a) * 12 * 0.78;
    } else {
      annual = (this.D.singleMonthlyTotal() - (s.housing ?? 0)) * 12 * (a < 30 ? 1 : 1.08);
    }
    // 家計は収入に合わせて調整される（家計調査の平均は平均的な所得の世帯なので、収入比で伸び縮みさせる）
    const c = this.cur!;
    const disp =
      (["salary", "partner", "pension", "windfall"] as IncomeCat[]).reduce((t, k) => t + (c.income[k] ?? 0), 0) -
      (c.expense.tax ?? 0) +
      0.04 * Math.max(0, this.cash + this.invest);
    const ref = elderly ? (fam ? this.y(3_000_000) : this.y(1_900_000)) : fam ? this.y(5_600_000) : this.y(3_000_000);
    const scale = Math.min(1.8, Math.max(elderly ? 0.45 : 0.6, Math.pow(Math.max(1, disp) / ref, 0.55)));
    annual *= scale;
    const kidsLiving = this.kids.filter((k) => kidAtHome(k, a) || a - k.born < 22).length;
    annual *= 1 + (kidsLiving > 0 ? 0.08 * kidsLiving : 0);
    annual *= reg * this.thrift * (this.frugal ? 0.8 : 1) * (this.welfare ? 0.75 : 1);
    if (this.home === "parents") annual *= 0.55;

    // 住まい
    const rent = this.D.rentFor(this.region) * 12;
    if (this.home === "rent") this.spend("housing", rent * (fam || this.kids.length ? 1.5 : 1) * Math.min(1.4, Math.max(0.5, scale * scale)) * (this.frugal ? 0.85 : 1));
    else if (this.home === "parents") this.spend("housing", this.y(360_000));
    else if (this.home === "own") this.spend("housing", this.housePrice * 0.009);

    // 子どもの教育費
    const e = this.D.living.educationCostPerChild;
    for (const k of this.kids) {
      const ka = a - k.born;
      if (ka >= 3 && ka < 18) this.spend("kids", (k.privateSchool ? e.private_total_k_to_hs : e.public_total_k_to_hs) / 15);
      if (k.univ && ka === 18 && !k.decided) {
        k.decided = true;
        const hh = this.householdIncomeGuess();
        if (hh < this.y(5_000_000) && this.cash + this.invest < this.y(4_000_000)) {
          k.loan = true;
          this.log("family", "子どもは奨学金を借りて大学に進んだ。");
        }
      }
      if (k.univ && !k.loan && ka >= 18 && ka < 22) {
        const priv = k.privateSchool || this.rng("kidUniv" + k.born, 0).chance(this.D.education.privateUniversityShare);
        this.spend("kids", (priv ? e.university_private_4y : e.university_national_4y) / 4 + (k.away ? this.y(1_000_000) : 0));
      }
    }
    if (this.childSupport && this.kids.some((k) => a - k.born < 18)) this.spend("kids", this.y(600_000));
    if (this.selfStudyUntil > a) this.spend("selfEdu", this.y(400_000));
    if (this.keepHouseCost) this.spend("housing", this.y(200_000));

    // 予算の制約：貯えが薄いときは、固定費を払った残りで暮らす（最低限の生活水準は下回らない）
    const liquid = this.cash + this.invest;
    if (liquid < annual * 2) {
      const spentSoFar = Object.entries(c.expense).reduce((t, [k, v]) => t + (k === "tax" ? 0 : v ?? 0), 0);
      const upcoming = (this.loan > 0 ? this.loanAnnual : 0) + (this.scholarship > 0 && this.school === "done" ? this.scholarshipAnnual : 0);
      const budget = disp - 0.04 * Math.max(0, liquid) - spentSoFar - upcoming + Math.max(0, liquid) * 0.3;
      // 最低限の暮らしの水準。所得の低い国では日本よりずっと低い
      const minimum = ((fam ? this.y(1_700_000) : this.y(1_000_000)) + kidsLiving * this.y(300_000)) * (this.D.isJapan ? 1 : 0.45);
      const capped = Math.max(minimum * (this.home === "parents" ? 0.55 : 1), Math.min(annual, budget));
      if (capped < annual * 0.97 && !this.tight)
        this.log(
          "money",
          this.again("tight", 6)
            ? this.vary("tight2", ["また、家計を切りつめる暮らしに戻った。", "出費がかさみ、再びやりくりが厳しくなった。", "今年もまた、外食や買い物を控えた。", "安い店を回って、食費を抑えた。", "使っていない契約を解約して、出費を減らした。"])
            : this.vary("tight", ["家計を切りつめて暮らすようになった。", "外食や買い物を減らして、やりくりするようになった。", "収入に合わせて、暮らしを小さくした。", "家計簿をつけて、出費を見直した。"]),
        );
      this.tight = capped < annual * 0.97;
      annual = capped;
    } else this.tight = false;

    this.spend("food", annual * share("food"));
    this.spend("utilities", annual * share("utilities"));
    this.spend("car", annual * share("transport_comm"));
    this.spend("fun", annual * share("culture"));
    this.spend("medical", annual * share("medical") * (1 + Math.max(0, a - 50) * 0.03));
    this.spend("other", annual * (share("furniture") + share("clothing") + share("other")));
    void r;
  }

  pensionAnnual(): number {
    const inst = this.D.inst;
    if (inst) {
      // 年金に入れるかどうかは、正規の仕事をどれだけ続けたかで決まりやすい
      if (this.pensionCovered === null) {
        const r = this.rng("pension", 0);
        // 高所得国の公的年金は雇用形態にかかわらず広く加入する。それ以外の国は正規雇用の人が中心
        const p =
          inst.incomeGroup === "HIC"
            ? inst.pensionCoverage * (this.workYears >= 10 ? 1 : 0.6)
            : this.regularYears >= 15
              ? Math.min(0.98, inst.pensionCoverage * 1.8 + 0.2)
              : inst.pensionCoverage * 0.5;
        this.pensionCovered = r.chance(p);
      }
      if (!this.pensionCovered) return 0;
      const ref = this.lastRegularWage > 0 ? this.lastRegularWage : this.D.regularWage(this.sex, this.edu, 50) * 0.6;
      const years = inst.incomeGroup === "HIC" ? this.workYears : this.regularYears;
      return Math.max(0, ref * inst.pensionReplacementRate * Math.min(1, Math.max(0.3, years / 35)) * this.pensionMult);
    }
    const pm = this.D.ev.pensionMonthly;
    const basic = pm.kokumin_avg * 12 * Math.min(1, (Math.max(this.workYears, 20) + 5) / 40);
    const kosei = (pm.kosei_avg - pm.kokumin_avg) * 12 * Math.min(1.4, this.regularYears / 38) * Math.min(1.5, Math.max(0.6, this.lastRegularWage / this.y(5_000_000)));
    return Math.max(0, (basic + kosei) * this.pensionMult);
  }
  pensionCovered: boolean | null = null;

  partnerPension(): number {
    const inst = this.D.inst;
    if (inst) {
      const p = this.partner;
      if (!p || p.work !== "regular") return 0;
      return this.D.regularWage(p.sex, p.edu, 55) * inst.pensionReplacementRate * 0.8;
    }
    const pm = this.D.ev.pensionMonthly;
    return this.partner?.work === "regular" ? pm.kosei_avg * 12 * 0.9 : pm.kokumin_avg * 12;
  }

  private mortality(): void {
    const a = this.age;
    if (a < 20) return; // 20歳になるまでの死亡は扱わない（お金の一生が主題で、子ども時代の死は重すぎるため）
    let q = this.D.qx(this.sex, a);
    q *= BAND_MORTALITY[this.band.id] ?? 1;
    q *= this.illMult;
    // qx には既にがん死亡が含まれるので上乗せは控えめに。医療を受けにくい国ほど重くなる
    if (a - this.cancerAge <= 5) q = q + Math.min(0.06, 0.015 * Math.sqrt(this.D.inst?.medicalBurden ?? 1)) * (this.earlyCheckUntil >= this.cancerAge ? 0.5 : 1);
    if (this.selfCare) q *= 1.6;
    if (a >= MAX_AGE - 1) q = 1;
    const r = this.rng("death");
    if (r.chance(Math.min(1, q))) {
      this.dead = true;
      this.deathCause = this.pickCause(r);
      this.log("death", `${a}歳で亡くなった。死因は${this.deathCause}。`, undefined, true);
      const funeral = this.prepaidFuneral ? 0 : this.D.living.funeralCost;
      this.spend("events", funeral);
    }
  }

  private pickCause(r: Rng): string {
    const a = this.age;
    if (a - this.cancerAge <= 5 && r.chance(0.7)) return CAUSE_LABEL.cancer;
    const g = a < 40 ? "under40" : a < 65 ? "40to64" : "65plus";
    const shares = this.D.lifetable.causeShare[g];
    const keys = Object.keys(shares);
    const k = r.weighted(keys, keys.map((x) => shares[x]));
    return CAUSE_LABEL[k] ?? CAUSE_LABEL.other;
  }

  // ───────────────────────── 結果 ─────────────────────────

  summary(): LifeSummary {
    const incomeTotal: Partial<Record<IncomeCat, number>> = {};
    const expenseTotal: Partial<Record<ExpenseCat, number>> = {};
    for (const y of this.records) {
      for (const [k, v] of Object.entries(y.income)) incomeTotal[k as IncomeCat] = (incomeTotal[k as IncomeCat] ?? 0) + (v ?? 0);
      for (const [k, v] of Object.entries(y.expense)) expenseTotal[k as ExpenseCat] = (expenseTotal[k as ExpenseCat] ?? 0) + (v ?? 0);
    }
    const lifetimeIncome = (["salary", "partner", "pension", "windfall"] as IncomeCat[]).reduce((s, k) => s + (incomeTotal[k] ?? 0), 0);
    const lifetimeExpense = Object.values(expenseTotal).reduce((s, v) => s + (v ?? 0), 0);
    return {
      seed: this.seed,
      birthYear: this.birthYear,
      sex: this.sex,
      regionId: this.region.id,
      regionLabel: this.region.label,
      familyBandId: this.band.id,
      familyBandLabel: this.band.label,
      deathAge: this.age,
      deathCause: this.deathCause,
      edu: this.edu,
      incomeTotal,
      expenseTotal,
      lifetimeIncome,
      lifetimeExpense,
      finalBalance: Math.round(this.balance),
      ownsHome: this.home === "own",
      married: !!this.partner || this.widowed || this.partnerSince >= 0,
      kids: this.kids.length,
      choices: this.choiceLog.map(({ id, optionId, label, age }) => ({ id, optionId, label, age })),
    };
  }
}

// ───────────────────────── 税 ─────────────────────────

function bandUnivRate(l: Life): number {
  const mid = (l.band.min + Math.min(l.band.max, l.y(15_000_000))) / 2;
  return l.D.univRateForIncome(mid);
}

// ───────────────────────── 選択場面 ─────────────────────────

const opt = (id: string, label: string, desc: string): ChoiceOption => ({ id, label, desc });

export function buildChoice(l: Life, id: ChoiceId): Choice {
  const r = streamRng(l.seed, "avail:" + id, l.age);
  const a = l.age;
  const low = l.band.id === "low" || l.band.id === "lower_mid";
  let title = "";
  let situation = "";
  const options: ChoiceOption[] = [];

  switch (id) {
    case "afterJHS": {
      title = "中学卒業後の進路";
      const jp = l.D.isJapan;
      // 日本は家庭の年収帯から、他の国は中等教育の就学率と家庭の豊かさから「進学できない」確率を決める
      const bandF = [2, 1.4, 1, 0.5, 0.2][l.bandIdx] ?? 1;
      const pNoFull = jp
        ? l.band.id === "low" ? 0.08 : l.band.id === "lower_mid" ? 0.03 : 0.008
        : Math.min(0.92, (1 - l.D.education.highSchoolEntryRate) * bandF);
      // 児童労働をしている12〜14歳の3人に1人は学校に通っていない（ILO・UNICEF「Child Labour: Global estimates 2020」）。
      // 中学で不登校だった人のうち、高校などに進んだのは85.1%（文部科学省 不登校に関する実態調査）
      const pAdj = l.childWorked ? 1 - (1 - pNoFull) * (2 / 3) : l.futokoAge >= 12 ? Math.max(pNoFull, 0.149) : pNoFull;
      const noFull = r.chance(pAdj);
      if (noFull) {
        situation = jp ? "家計が苦しく、全日制の高校に通わせる余裕がないと親に言われた。" : "家計が苦しく、上の学校に通わせる余裕はないと親に言われた。";
        options.push(
          opt("night", jp ? "定時制高校に通いながら働く" : "働きながら夜間の学校に通う", "卒業資格を目指せる。働く分、中退しやすい。"),
          opt("work", jp ? "就職する" : "働きに出る", "早くから稼げる。ただし学歴が低いと給料は伸びにくい。"),
        );
        if (!jp && !l.region.urban) options.push(opt("farm", "家の農作業を手伝う", "家族と一緒にいられる。現金収入は少ない。"));
      } else {
        situation = `成績はクラスで${l.aptitude > 0.7 ? "上のほう" : l.aptitude > 0.4 ? "真ん中くらい" : "下のほう"}。`;
        options.push(opt("public", jp ? "公立高校へ" : "公立の高校へ", "学費は安い。進路は自分次第。"));
        if (!low || r.chance(0.35))
          options.push(opt("private", "私立高校へ", low ? "特待生の話がある。家計の負担は残り、事情で中退するリスクも。" : "大学進学には有利。学費は親の負担に。"));
        options.push(
          opt("kosen", jp ? "高専へ（5年制）" : "職業技術学校へ（5年制）", "技術職の就職に強い。進路が早く固まり、向き不向きが出やすい。"),
          opt("work", jp ? "就職する" : "働きに出る", "早く稼げて自立できる。給料の伸びは小さい。"),
        );
        if (low && !options.some((o) => o.id === "private")) situation += "私立に行く余裕はない。";
      }
      break;
    }
    case "afterHS": {
      if (l.school === "kosen") {
        title = "高専卒業後の進路";
        situation = "高専の5年間が終わった。";
        options.push(
          opt("job", "就職する", "メーカーの技術職などに就きやすい。"),
          opt("transfer", "大学3年に編入する", "大卒になれる。学費が2年分かかる。"),
        );
        break;
      }
      if (l.school === "done" && !l.hsGraduated) {
        title = "18歳の分かれ道";
        situation = "働きはじめて数年。同級生は大学や就職へ進んでいく。";
        options.push(
          opt("stay", "今の仕事を続ける", "経験は積み上がる。学歴による差は残る。"),
          opt("night_univ", "働きながら夜間・通信で学ぶ", "学費と時間の負担は大きいが、卒業できれば大卒に。"),
          opt("license", "資格を取って手に職をつける", "費用はかかる。取れれば収入が上がる見込み。"),
        );
        break;
      }
      title = "高校卒業後の進路";
      // プロを目指していた人に、プロから声がかかるか（大学や社会人を経てプロになる人も含めた、高校の部員1人あたりの割合）
      const scouted = !!l.proSport && streamRng(l.seed, "scout", 0).chance(PRO[l.proSport || "baseball"].rate);
      if (scouted) options.push(opt("pro", PRO[l.proSport || "baseball"].label, PRO[l.proSport || "baseball"].desc));
      const pUniv = bandUnivRate(l) / Math.max(0.01, l.D.education.universityEntryByHouseholdIncome.over1000);
      const noSupport = r.chance(Math.max(0.03, 0.85 - pUniv * 0.85));
      if (noSupport) {
        situation = "親からは「学費は出せない」と言われた。";
        options.push(
          opt("univ_loan", "奨学金を借りて大学へ", "大卒の道が開く。数百万円の返済と、アルバイト漬けの日々。"),
          opt("univ_night", "働きながら夜間の大学へ", "借金は少ない。卒業までたどり着けるかは体力次第。"),
          opt("voc_loan", "奨学金で専門学校へ", "2年で手に職。業界によって給料の差が大きい。"),
          opt("job", "就職する", "すぐに稼げる。給料は高卒の水準で上がっていく。"),
        );
      } else {
        situation = "大学に行くなら学費は親が出してくれるらしい。";
        options.push(
          opt("national", "国公立大学を目指す", "学費は安い。合格できるかは分からない。"),
          opt("private_univ", "私立大学へ", "合格はしやすい。学費は高い。"),
          opt("vocational", "専門学校へ", "2年で就職。資格職なら安定。"),
          opt("job", "就職する", "早く稼げる。大卒との給料差は広がりやすい。"),
        );
      }
      if (scouted) situation = PRO[l.proSport || "baseball"].offer + situation;
      else if (l.proSport) situation = (l.proSport === "baseball" ? "3年間、野球に打ち込んだが、プロからの声はかからなかった。" : "3年間、サッカーに打ち込んだが、プロからの声はかからなかった。") + situation;
      break;
    }
    case "firstJob": {
      title = "最初の働き方";
      const eduLabel: Record<Edu, string> = {
        junior_high: "中卒",
        high_school: "高卒",
        vocational: "専門・高専卒",
        university: "大卒",
        graduate: "大学院卒",
      };
      situation = `${eduLabel[l.edu]}、${a}歳。どう働く？`;
      options.push(
        opt("big", "大企業の正社員を目指す", "給料は高め。転勤や激務、中高年での早期退職もありうる。受かるとは限らない。"),
        opt("sme", "中小企業の正社員になる", "地元で働ける。給料は控えめで、会社の業績に左右される。"),
      );
      if (l.edu !== "junior_high") options.push(opt("civil", "公務員試験を受ける", "安定していて解雇はまずない。給料の伸びは穏やか。落ちることもある。"));
      options.push(opt("nonregular", "非正規で自由に働く", "時間の融通がきく。給料は上がりにくく、雇い止めもある。"));
      if (l.edu === "vocational" || l.edu === "university" || l.edu === "graduate" || r.chance(0.4))
        options.push(opt("freelance", "フリーランスになる", "腕次第で稼げる。収入は毎年ばらつく。"));
      break;
    }
    case "invest": {
      title = "投資を始めるか";
      situation = `${a}歳。貯金は${l.D.fmt(Math.max(0, l.cash))}。${l.D.isJapan ? "周りでNISAの話を聞くようになった。" : "周りで投資の話を聞くようになった。"}`;
      if (!l.banked) {
        situation += "ただ、口座を持っていないので、投資はできない。";
        options.push(
          opt("deposit", "手元に貯めておく", "口座がないので利息はつかない。物価が上がると目減りする。"),
          opt("self", "自分に投資する（資格・スキル）", "数年間の出費。収入が上がる保証はない。"),
        );
        break;
      }
      options.push(
        opt("index", "毎月コツコツ積立投資", "長く続ければ増えやすい。暴落の年は資産が目減りする。"),
        opt("stocks", "個別株で攻める", "大きく増えることも、大きく減ることもある。"),
        opt("deposit", "貯金だけにする", "金額は減らない。物価が上がると目減りし、ほぼ増えない。"),
        opt("self", "自分に投資する（資格・スキル）", "数年間の出費。収入が上がる保証はない。"),
      );
      break;
    }
    case "marriageHome": {
      title = "結婚と住まい";
      const p = l.partner;
      if (p) {
        situation = `結婚して${a - l.partnerSince}年。${l.kids.length ? `子どもは${l.kids.length}人。` : ""}住まいをどうする？`;
        options.push(
          opt("rent", "賃貸のまま暮らす", "身軽に引っ越せる。家賃は一生かかる。"),
          opt("buy", "家を買う（35年ローン）", "老後の家賃はかからない。災害や修繕のリスク、ローン返済が続く。"),
        );
        if (l.parents.some((x) => x.alive)) options.push(opt("withParents", "親と二世帯で住む", "住居費が浮き、子育ての手も借りられる。気をつかう暮らし。"));
      } else {
        const met = l.dating || r.chance(0.32 * l.marriageHazard(a) / Math.max(0.01, l.D.ev.marriageByAge["30s"]));
        if (met) {
          situation = l.dating ? `付き合って${Math.max(1, a - l.datingSince)}年の恋人から、将来の話をされた。` : "付き合っている人から、将来の話をされた。";
          options.push(
            opt("marryRent", "結婚して賃貸で暮らす", "ふたりの収入で暮らしが安定しやすい。出費も増える。"),
            opt("marryBuy", "結婚して家を買う", "持ち家で落ち着ける。ローンが長く続く。"),
            opt("single", "結婚はしない", "自由に使えるお金と時間。老後は一人で備える。"),
          );
        } else {
          situation = "30歳、パートナーはいない。";
          options.push(
            opt("konkatsu", "婚活にお金をかける", "出会いは増える。結婚できる保証はない。"),
            opt("solo", "おひとりさまで生きる", "身軽で自由。老後の住まいとお金は自分で備える。"),
            opt("condo", "一人用のマンションを買う", "老後の住まいが確保できる。ローンを一人で背負う。"),
          );
          if (l.parents.some((x) => x.alive)) options.push(opt("home", "実家に戻る", "住居費が浮いて貯金しやすい。親の介護が身近になる。"));
        }
      }
      // 自己破産してから7年ほどは、住宅ローンを組めない（信用情報に記録が残る）
      if (l.bankruptAge >= 0 && a - l.bankruptAge < 7) {
        const keep = options.filter((o) => o.id !== "buy" && o.id !== "marryBuy" && o.id !== "condo");
        options.length = 0;
        options.push(...keep);
      }
      break;
    }
    case "careerShift": {
      title = "転職・独立";
      const j = l.job;
      if (j === "big" || j === "sme" || j === "civil") {
        situation = `${a}歳、${l.manager ? jobLabel(j).replace(/の正社員$/, "") + "の管理職" : jobLabel(j)}。年収は${l.D.fmt(l.salaryOf(a))}ほど。`;
        options.push(
          opt("stay", "今の職場に残る", "昇進のチャンスはある。会社の都合に振り回されることも。"),
          opt("change", "転職する", "給料が上がるかもしれないし、下がるかもしれない。"),
          opt("found", "独立・起業する", "当たれば大きい。5年以内にたたむ会社も多い。"),
        );
      } else if (j === "nonregular" || j === "none") {
        situation = `${a}歳、${j === "none" ? "いまは仕事をしていない" : "非正規で働いている"}。`;
        options.push(
          opt("seekRegular", "正社員を目指して転職活動", "なれれば給料と年金が安定。なれないこともある。"),
          opt("keep", "今の働き方を続ける", "生活のペースは保てる。収入は大きく変わらない。"),
          opt("license", "資格を取りに学校へ", "学費と時間がかかる。取れれば道が広がる。"),
          opt("found", "小さく起業する", "当たれば大きい。失敗すれば借金が残ることも。"),
        );
      } else {
        situation = `${a}歳、${jobLabel(j)}として働いている。`;
        options.push(
          opt("keep", "このまま続ける", "自分のペースで働ける。収入は年によって波がある。"),
          opt("employee", "会社員に戻る", "収入が安定し、厚生年金に入れる。自由は減る。"),
          opt("expand", "事業を広げる", "人を雇って勝負する。失敗すれば借金が残る。"),
        );
      }
      break;
    }
    case "parentCare": {
      const alive = l.parents.some((x) => x.alive);
      // 両親がすでに亡くなっていれば、介護ではなく、実家とこれからの備えの話になる
      title = alive ? "親の介護への向き合い方" : l.heir ? "これからの備え" : "空き家になった実家";
      if (!alive && l.heir) {
        // 子どもに生まれ直した人は、親の家とお金の整理を、親が亡くなった年に済ませている
        situation = "両親はすでに他界している。親が残したものの整理は、亡くなったときに済ませた。これから、自分の老後にどう備える？";
        options.push(
          opt("saveMore", "老後に向けて貯金を増やす", "暮らしを少し切りつめる。残せるお金は増える。"),
          opt("enjoyNow", "今の暮らしを楽しむ", "旅行や趣味にお金を使う。残るお金は減る。"),
          ...(l.kids.length ? [opt("helpKids", "子どもの暮らしを手伝う", "まとまったお金を子どもに渡す。自分の手元は減る。")] : []),
        );
      } else if (!alive) {
        situation = "両親はすでに他界している。実家が空き家のまま残っている。";
        options.push(
          opt("sellHouse", "実家を売る", "まとまったお金になるかもしれない。地域によっては買い手がつかない。"),
          opt("keepHouse", "実家を残しておく", "思い出の場所を守れる。固定資産税と管理の手間がかかる。"),
          opt("moveIn", "実家に移り住む", "住居費が浮く。仕事や暮らしを変える必要がある。"),
        );
      } else {
        const who = l.careTriggered ? (l.careParent === 0 ? "父" : "母") : "親";
        const together = l.livesWithParents;
        situation = together
          ? `一緒に暮らしている${who}に介護が必要になった。同じ家にいるぶん、自分が見ることになりそうだ。どう向き合う？`
          : l.careTriggered
            ? `${who}に介護が必要になった。どう向き合う？`
            : `${who}が高齢になり、介護が必要になった。どう向き合う？`;
        if (together) {
          options.push(
            opt("liveIn", "同じ家で、働きながら自分が見る", "通う手間も交通費もかからない。夜や休日も介護が続き、仕事は少し減る。"),
            opt("facility", "施設に入ってもらう", "仕事は続けられる。費用は毎月かかり続ける。"),
            opt("quit", "仕事を辞めて介護に専念", "そばにいられる。収入が途絶え、復職は簡単ではない。"),
          );
          if (l.siblingsNow > 0) options.push(opt("share", "家を出たきょうだいにも頼む", "負担を分け合える。同居している自分に負担が寄りがち。"));
        } else {
          options.push(
            opt("facility", "施設に入ってもらう", "仕事は続けられる。費用は毎月かかり続ける。"),
            opt("home", "実家に通いながら介護", "費用は抑えられる。通う時間と交通費がかかり、仕事を減らすことになる。"),
            opt("quit", "仕事を辞めて介護に専念", "そばにいられる。収入が途絶え、復職は簡単ではない。"),
          );
          if (l.siblingsNow > 0) options.push(opt("share", "きょうだいと分担する", "負担を分け合える。話し合いがまとまらないことも。"));
        }
      }
      break;
    }
    case "retire": {
      title = "退職の時期";
      const working = l.job !== "none" && l.job !== "retired";
      situation = working
        ? `${a}歳。会社員なら定年の年。${savingsText(l)}`
        : `${a}歳。${savingsText(l)}${l.D.isJapan ? "年金は65歳から。" : ""}`;
      if (working) {
        options.push(
          opt("r60", "60歳で引退する", "自由な時間が増える。年金まで5年は貯えで暮らす。"),
          opt("r65", "65歳まで働く", "収入のすき間がない。給料は下がる。"),
          opt("r70", "70歳まで働き、年金を遅らせる", "年金が4割ほど増える。体力と健康次第。"),
        );
        if (l.job === "freelance" || l.job === "founder") options.push(opt("forever", "生涯現役で働く", "収入が続く。いつまで続けられるかは分からない。"));
      } else {
        options.push(
          opt("part", "70歳までパートで働く", "少しでも収入が入る。体力を使う。"),
          opt("wait", "年金を待つ", "のんびり過ごす。65歳まで貯えを取り崩す。"),
          opt("early", "年金を60歳から繰り上げる", "すぐ受け取れる。一生、年金が2割ほど減る。"),
        );
      }
      break;
    }
  }
  if (options.length === 0) options.push(opt("default", "流れに任せる", "特に何も変えない。"));
  return { id, age: a, title, situation, options };
}

/** 「貯えは300万円。」／貯えがマイナスなら「貯えはなく、借金が80万円ある。」 */
function savingsText(l: Life): string {
  return l.balance >= 0 ? `貯えは${l.D.fmt(l.balance)}。` : `貯えはなく、借金が${l.D.fmt(-l.balance)}ある。`;
}

export function jobLabel(j: Job): string {
  return (
    {
      none: "無職",
      big: "大企業の正社員",
      sme: "中小企業の正社員",
      civil: "公務員",
      nonregular: "非正規",
      freelance: "フリーランス",
      founder: "経営者",
      retired: "引退",
    } as Record<Job, string>
  )[j];
}

function applyChoice(l: Life, id: ChoiceId, o: string, r: Rng): void {
  const a = l.age;
  switch (id) {
    case "afterJHS":
      if (o === "public" || o === "private") {
        l.school = "hs";
        l.schoolEnd = a + 3;
        if (o === "private") l.aptitude = Math.min(1, l.aptitude + 0.12);
        if (o === "private" && (l.band.id === "low" || l.band.id === "lower_mid")) l.thrift *= 1; // 親の負担（本人の財布ではない）
        l.logPre("school", `${o === "public" ? "公立" : "私立"}高校に入学した。`);
      } else if (o === "kosen") {
        l.school = "kosen";
        l.schoolEnd = a + 5;
        l.logPre("school", "高専に入学した。");
      } else if (o === "night") {
        l.school = "hs_night";
        l.schoolEnd = a + 4;
        l.logPre("school", "定時制高校に入学し、昼は働きはじめた。");
      } else {
        l.school = "done";
        l.schoolEnd = a;
        l.home = "parents";
      }
      break;
    case "afterHS": {
      if (o === "pro") {
        const pr = PRO[l.proSport as keyof typeof PRO];
        l.school = "done";
        l.job = "freelance";
        l.jobStart = a;
        l.proSalary = pr.salary;
        l.proUntil = a + pr.years;
        l.logPre("work", pr.joined, undefined, true);
        l.mark("pro");
        break;
      }
      if (o === "job" || o === "stay") {
        l.school = "done";
        if (o === "stay") l.careerMult *= 1.05;
        break;
      }
      if (o === "transfer") {
        l.school = "univ";
        l.schoolEnd = a + 2;
        l.logPre("school", "大学3年に編入した。");
        break;
      }
      if (o === "license") {
        l.selfStudyUntil = a + 2;
        if (r.chance(0.55)) {
          l.careerMult *= 1.15;
          l.logPre("work", "資格を取った。仕事の幅が広がった。", undefined, true);
        } else l.logPre("work", "資格の勉強を続けたが、試験には届かなかった。");
        break;
      }
      if (o === "night_univ" || o === "univ_night") {
        l.school = "univ_night";
        l.schoolEnd = a + 5;
        l.logPre("school", "働きながら夜間の大学に通いはじめた。");
        if (o === "night_univ") l.job = l.job === "none" ? "nonregular" : l.job;
        break;
      }
      if (o === "univ_loan") {
        l.school = "univ_work";
        l.schoolEnd = a + 4;
        l.privateUni = r.chance(l.D.education.privateUniversityShare);
        l.logPre("school", `奨学金を借りて${l.privateUni ? "私立" : "国公立"}大学に入学した。`);
        break;
      }
      if (o === "voc_loan" || o === "vocational") {
        l.school = "vocational";
        l.schoolEnd = a + 2;
        if (o === "voc_loan") {
          l.scholarship += l.y(2_200_000);
          l.scholarshipAnnual = l.y(2_200_000) / 12;
        }
        l.logPre("school", "専門学校に入学した。");
        break;
      }
      if (o === "national") {
        const pass = r.chance(0.12 + l.aptitude * 0.65);
        l.school = "univ";
        l.schoolEnd = a + 4;
        if (pass) l.logPre("school", "国公立大学に合格した。", undefined, true);
        else {
          l.privateUni = true;
          l.logPre("school", "国公立は不合格。私立大学に進んだ。", undefined, true);
        }
        break;
      }
      if (o === "private_univ") {
        l.school = "univ";
        l.schoolEnd = a + 4;
        l.privateUni = true;
        l.logPre("school", "私立大学に入学した。");
      }
      break;
    }
    case "firstJob": {
      const e = l.edu;
      let job: Job = o as Job;
      if (o === "big") {
        const p = { junior_high: 0.05, high_school: 0.2, vocational: 0.3, university: 0.42, graduate: 0.55 }[e] * (0.7 + l.aptitude * 0.6);
        if (!r.chance(p)) {
          job = "sme";
          l.logPre("work", "大企業は不採用。中小企業の正社員になった。", undefined, true);
        } else l.logPre("work", "大企業に採用された。", undefined, true);
      } else if (o === "civil") {
        if (!r.chance(0.25 + l.aptitude * 0.35)) {
          job = "nonregular";
          l.logPre("work", "公務員試験に落ちた。非正規で働きながら次を考える。", undefined, true);
        } else l.logPre("work", "公務員試験に合格した。", undefined, true);
      } else if (o === "freelance") {
        l.careerMult = Math.exp(r.normal(-0.1, 0.35));
        l.logPre("work", "フリーランスとして独立した。");
      } else l.logPre("work", o === "sme" ? "中小企業の正社員になった。" : "非正規の仕事で働きはじめた。");
      l.job = job;
      l.jobStart = a;
      if (l.home === "parents") l.queueScene(leaveHomeScene(l, false));
      break;
    }
    case "invest":
      if (o === "index") {
        l.investStyle = "index";
        l.investRate = 0.1;
      } else if (o === "stocks") {
        l.investStyle = "stocks";
        l.investRate = 0.15;
      } else if (o === "self") {
        l.selfStudyUntil = a + 3;
        if (r.chance(0.5)) {
          l.careerMult *= 1.15;
          l.logPre("work", "身につけたスキルが評価され、収入が上がりそうだ。");
        } else l.logPre("work", "学んだことは、すぐには収入に結びつかなかった。");
      }
      break;
    case "marriageHome": {
      const buy = (single: boolean) => {
        const nat = l.D.living.housePriceNewBuilt.national;
        const base = l.region.id === "tokyo" ? l.D.living.housePriceNewBuilt.tokyo : nat * l.regionFactor(REGION_HOUSE, l.region.wageIndex, l.region.wageIndex * 0.7) / 0.85;
        // 銀行が貸すのは年収の7倍程度まで。手が届く範囲の物件を選ぶ
        const hh = Math.max(l.y(2_500_000), l.householdIncomeGuess());
        const price = Math.min(base * (single ? 0.6 : 1) * r.range(0.85, 1.15), hh * 7 + Math.max(0, l.cash) * 0.6);
        const down = Math.max(0, Math.min(l.cash * 0.6, price * 0.1));
        l.spend("housing", down);
        l.housePrice = price;
        l.boughtAge = a;
        l.loan = price - down;
        const i = 0.012;
        l.loanAnnual = (l.loan * i) / (1 - Math.pow(1 + i, -35));
        l.home = "own";
        l.logPre("money", `${single ? "マンション" : "家"}を${l.D.fmt(price)}で買った。35年ローンを組んだ。`, -down, true);
      };
      if (o === "buy") buy(false);
      else if (o === "rent") l.home = "rent";
      else if (o === "withParents") {
        l.home = "parents";
        l.coLiveParents = true;
        l.logPre("life", "親と二世帯で暮らしはじめた。");
      } else if (o === "marryRent" || o === "marryBuy") {
        l.marry(r, "結婚した。");
        if (o === "marryBuy") buy(false);
        else l.home = "rent";
      } else if (o === "single" || o === "solo") {
        l.noMarry = true;
        if (l.dating) l.logPre("family", "恋人とは別々の道を歩むことにした。");
        l.dating = false;
        if (l.home === "parents") l.home = "rent";
      } else if (o === "konkatsu") {
        l.spend("events", l.y(300_000));
        l.marriageBoost = 2.5;
        l.marriageBoostUntil = a + 10;
        l.logPre("life", "婚活サービスに登録した。", -l.y(300_000));
      } else if (o === "condo") {
        l.noMarry = r.chance(0.7);
        buy(true);
      } else if (o === "home") {
        l.home = "parents";
        l.logPre("life", "実家に戻った。");
      }
      break;
    }
    case "careerShift": {
      if (o === "change") {
        const c = Math.exp(r.normal(0.03, 0.18));
        l.careerMult *= c;
        if (l.job === "civil") l.job = "sme";
        l.manager = false;
        l.logPre("work", c >= 1 ? "転職して年収が上がった。" : "転職したが、年収は下がった。", undefined, true);
      } else if (o === "found" || o === "expand") {
        l.job = "founder";
        l.founderYear = a;
        l.careerMult = Math.exp(r.normal(-0.15, 0.4));
        const seedMoney = o === "expand" ? l.y(3_000_000) : l.y(2_000_000);
        l.spend("other", seedMoney);
        l.logPre("work", o === "expand" ? "人を雇って事業を広げた。" : "会社を立ち上げた。", -seedMoney, true);
      } else if (o === "seekRegular") {
        if (r.chance(0.4)) {
          l.job = "sme";
          l.careerMult = Math.max(0.85, l.careerMult);
          l.logPre("work", "正社員として採用された。", undefined, true);
        } else l.logPre("work", "正社員の採用には届かなかった。");
      } else if (o === "license") {
        l.selfStudyUntil = a + 2;
        if (r.chance(0.55)) {
          l.careerMult *= 1.2;
          if (l.job === "none") l.job = "nonregular";
          l.logPre("work", "資格を取り、仕事の条件がよくなった。", undefined, true);
        } else l.logPre("work", "資格は取れなかった。");
      } else if (o === "employee") {
        if (r.chance(0.55)) {
          l.job = "sme";
          l.careerMult = Math.max(0.9, l.careerMult);
          l.logPre("work", "会社員に戻った。", undefined, true);
        } else l.logPre("work", "条件の合う会社が見つからず、今の仕事を続けた。");
      }
      break;
    }
    case "parentCare": {
      if (o === "saveMore") {
        l.thrift *= 0.92;
        l.logPre("money", "老後に向けて、暮らしを少し切りつめることにした。");
      } else if (o === "enjoyNow") {
        l.thrift *= 1.06;
        l.logPre("life", "旅行や趣味に、お金を使うようにした。");
      } else if (o === "helpKids") {
        const gift = l.y(2_000_000);
        l.spend("kids", gift);
        l.logPre("family", "子どもの住まいの頭金を援助した。", -gift, true);
      } else if (o === "sellHouse") {
        const v = l.region.id === "tokyo" ? r.range(l.y(10_000_000), l.y(40_000_000)) : l.region.id === "rural" ? (r.chance(0.4) ? 0 : r.range(l.y(1_000_000), l.y(6_000_000))) : r.range(l.y(3_000_000), l.y(15_000_000));
        const share = v / (l.siblings + 1);
        l.addIncome("windfall", share);
        l.logPre("money", v > 0 ? (l.siblings > 0 ? "実家を売り、きょうだいで分けた。" : "実家を売った。") : "実家は買い手がつかず、解体費だけかかった。", v > 0 ? share : -l.y(1_500_000), true);
        if (v === 0) l.spend("housing", l.y(1_500_000));
      } else if (o === "keepHouse") {
        l.keepHouseCost = true;
      } else if (o === "moveIn") {
        if (l.home === "rent") l.home = "parents";
        l.logPre("life", "実家に移り住んだ。");
      } else {
        l.careMode = o as "facility" | "home" | "liveIn" | "quit" | "share";
        if (!l.careTriggered) l.careParent = l.parents.findIndex((x) => x.alive);
        l.careTriggered = true;
        l.careUntil = a + r.int(2, 9);
        if (o === "quit" && l.job !== "none" && l.job !== "retired") {
          l.loseJob(a);
          l.unemployedUntil = l.careUntil;
          l.logPre("work", "介護のために仕事を辞めた。", undefined, true);
        }
        if (o === "liveIn") l.logPre("family", "同じ家で暮らしながら、働きつつ親の介護をすることにした。", undefined, true);
        if (o === "share" && r.chance(l.livesWithParents ? 0.5 : 0.3)) l.logPre("family", "きょうだいとの話し合いは難航した。負担は思ったより減らなかった。");
      }
      break;
    }
    case "retire": {
      if (o === "r60") {
        l.retireAge = a + 1;
      } else if (o === "r65") {
        l.retireAge = 65;
        if (l.job === "big" || l.job === "sme" || l.job === "civil") {
          l.postRetireWork = true;
          l.logPre("work", "再雇用で働き続けることになった。給料は下がった。");
        }
      } else if (o === "r70") {
        l.retireAge = 70;
        l.pensionStart = 70;
        l.pensionMult = 1.42;
        if (l.job === "big" || l.job === "sme" || l.job === "civil") l.postRetireWork = true;
      } else if (o === "forever") {
        l.retireAge = 78;
        l.pensionStart = 70;
        l.pensionMult = 1.42;
      } else if (o === "part") {
        l.job = "nonregular";
        l.retireAge = 70;
        l.careerMult = 0.6;
      } else if (o === "early") {
        l.pensionStart = 60;
        l.pensionMult = 0.76;
        l.retireAge = a;
      } else if (o === "wait") {
        l.retireAge = a;
      }
      if (l.retireAge <= a + 1 && l.job !== "none" && l.job !== "retired" && o === "r60") {
        // 60歳引退は今年の終わりに退職金が出る
      }
      break;
    }
  }
}


// ───────────────────────── 再生・自動プレイ ─────────────────────────

/** シードと選択の並びから人生を最後まで再現する */
export function replay(seed: string, picks: string[], country: CountryData = JAPAN, mode = "j"): Life {
  const l = new Life(seed, country, mode);
  let i = 0;
  let guard = 0;
  while (!l.dead && guard++ < 500) {
    if (l.pending) {
      const want = picks[i++];
      const ok = l.pending.options.find((o) => o.id === want);
      l.choose(ok ? ok.id : l.pending.options[0].id);
      continue;
    }
    l.advance();
  }
  return l;
}

/** 選択をランダムに（決定的に）行う自動プレイ。同い年の比較用 */
const AUTO_WEIGHTS: Record<string, number[]> = {
  "ev:meet": [0.72, 0.18, 0.1],
  "ev:leaveHome": [0.55, 0.45],
  "ev:kidLeave": [0.6, 0.3, 0.1],
  "ev:propose": [0.5, 0.35, 0.12, 0.03],
  "ev:arranged": [0.7, 0.22, 0.08],
  "ev:betrothed": [0.92, 0.08],
};

export function autoplay(seed: string, country: CountryData = JAPAN, mode = "j"): Life {
  return autoplayLife(new Life(seed, country, mode));
}

/** 作ってある人生を、最後まで自動で選んで進める */
export function autoplayLife(l: Life): Life {
  const seed = l.seed;
  let guard = 0;
  while (!l.dead && guard++ < 500) {
    if (l.pending) {
      const r = new Rng(hashStr(`${seed}|auto|${l.pending.id}|${l.age}`));
      // 結婚の場面は、比べる集団の結婚の割合が現実に近くなるよう、結婚する側を選びやすくする
      const w = AUTO_WEIGHTS[l.pending.id];
      l.choose((w ? r.weighted(l.pending.options, w) : r.pick(l.pending.options)).id);
      continue;
    }
    l.advance();
  }
  return l;
}

/** 比べる集団の一人ぶん（章のまとめで使う）。bal は各年の年末の貯え */
export interface CohortLife {
  tags: [string, number][];
  bal: number[];
  death: number;
}
export interface Cohort {
  income: number[];
  balance: number[];
  lives: CohortLife[];
}
const cohortCache = new Map<string, Cohort>();
/** 同じ国に生まれた300人（自動で選んだ人生）。同い年との比較に使う */
export function cohort(country: CountryData = JAPAN, n = 300): Cohort {
  const hit = cohortCache.get(country.iso3);
  if (hit) return hit;
  const income: number[] = [];
  const balance: number[] = [];
  const lives: CohortLife[] = [];
  for (let i = 0; i < n; i++) {
    const l = autoplay(`cohort-${BIRTH_YEAR}-${country.iso3}-${i}`, country);
    const s = l.summary();
    income.push(s.lifetimeIncome);
    balance.push(s.finalBalance);
    lives.push({ tags: l.tags, bal: l.records.map((r) => r.balance), death: l.age });
  }
  income.sort((a, b) => a - b);
  balance.sort((a, b) => a - b);
  const c = { income, balance, lives };
  cohortCache.set(country.iso3, c);
  return c;
}

/** 上位何％か（0〜1、小さいほど上位） */
export function rankOf(sorted: number[], v: number): number {
  let lo = 0;
  while (lo < sorted.length && sorted[lo] <= v) lo++;
  return 1 - lo / sorted.length;
}

// ───────────────────────── お金の振り分け ─────────────────────────

/** 振り分けの「型」（options と同じ順。割合は10%きざみ） */
const ALLOC_PRESETS: { id: string; label: string; desc: string; a: Alloc }[] = [
  { id: "p0", label: "堅実", desc: "暮らし4・貯金4・投資1・家族1。物価が上がると貯金は目減りする。", a: { living: 4, save: 4, invest: 1, family: 1, self: 0 } },
  { id: "p1", label: "投資を重視", desc: "暮らし3・貯金1・投資5・家族1。増える年も減る年もある。", a: { living: 3, save: 1, invest: 5, family: 1, self: 0 } },
  { id: "p2", label: "家族を重視", desc: "暮らし3・貯金2・投資1・家族4。子どもの教育や親への仕送りに回す。", a: { living: 3, save: 2, invest: 1, family: 4, self: 0 } },
  { id: "p3", label: "自分に投資", desc: "暮らし3・貯金2・投資1・家族1・自分3。学び直しで給料が上がることも、上がらないことも。", a: { living: 3, save: 2, invest: 1, family: 1, self: 3 } },
  { id: "p4", label: "今を楽しむ", desc: "暮らし8・貯金1・家族1。旅行や趣味にお金を使う。残るお金は少ない。", a: { living: 8, save: 1, invest: 0, family: 1, self: 0 } },
];

/** 割合を10%きざみ・合計10にそろえる（暮らしは残り） */
export function normAlloc(a: Alloc): Alloc {
  const c = (n: number) => Math.max(0, Math.min(9, Math.round(n || 0)));
  let save = c(a.save);
  let invest = c(a.invest);
  let family = c(a.family);
  let self = c(a.self);
  // 合計が10を超えたら、後ろから減らす
  for (const k of ["self", "family", "invest", "save"] as const) {
    const over = save + invest + family + self - 10;
    if (over <= 0) break;
    if (k === "self") self -= Math.min(self, over);
    if (k === "family") family -= Math.min(family, over);
    if (k === "invest") invest -= Math.min(invest, over);
    if (k === "save") save -= Math.min(save, over);
  }
  return { living: 10 - save - invest - family - self, save, invest, family, self };
}

export const ALLOC_LABEL: Record<keyof Alloc, string> = { living: "暮らし", save: "貯金", invest: "投資", family: "家族", self: "自分" };

/** 口座がない人の振り分け：投資の分を手元の貯金に回す（共有URLに1けたで書けるよう、貯金は9割まで。余りは暮らし） */
export function noInvestAlloc(a: Alloc): Alloc {
  const save = Math.min(9, a.save + a.invest);
  return { living: 10 - save - a.family - a.self, save, invest: 0, family: a.family, self: a.self };
}

/** 「暮らし40%・貯金40%・投資10%・家族10%」 */
export function allocLabel(a: Alloc): string {
  return (Object.keys(ALLOC_LABEL) as (keyof Alloc)[])
    .filter((k) => a[k] > 0)
    .map((k) => `${ALLOC_LABEL[k]}${a[k] * 10}%`)
    .join("・");
}

function allocChoice(l: Life): Choice {
  const a = l.age;
  const last = l.alloc;
  const kidsNow = l.kids.some((k) => a - k.born >= 0 && a - k.born < 22);
  const familyTo = kidsNow ? "kids" : l.parents.some((p) => p.alive) ? "parents" : "none";
  const free = l.lastFree;
  const situation =
    free > 0
      ? `${a}歳。去年、自由に使えたお金（手取りから、出ていったお金を引いた残り）は約${l.D.fmt(free)}。これから5年、どこに使う？`
      : `${a}歳。去年は、手取りより出ていくお金のほうが多かった。これから5年、余りが出た年は、どこに使う？`;
  // 口座がない人には、投資を貯金（手元）に置きかえた形で見せる
  const noInvest = (x: Alloc): Alloc => (l.banked || !x.invest ? x : noInvestAlloc(x));
  const presets = ALLOC_PRESETS.filter((p) => l.banked || p.id !== "p1");
  const options = presets.map(({ id, label, desc, a: x }) => ({ id, label, desc: l.banked ? desc : `${allocLabel(noInvest(x))}。` }));
  if (last) options.push({ id: "same", label: "前回と同じ", desc: allocLabel(noInvest(last)) });
  return {
    id: "alloc",
    age: a,
    title: "お金の振り分け",
    situation: l.banked ? situation : situation + "口座を持っていないので投資はできず、貯金は手元に置く。",
    options,
    alloc: { free, last: last && noInvest(last), presets: [...presets.map((p) => noInvest(p.a)), ...(last ? [noInvest(last)] : [])], familyTo, noInvest: !l.banked },
  };
}

/** 借金が返せないほどふくらんだとき（日本）：自己破産するか */
function bankruptScene(l: Life): Scene {
  const debt = () => Math.max(0, -(l.cash + l.invest));
  return {
    id: "bankrupt",
    title: "借金の整理",
    situation: `借金が${l.D.fmt(debt())}にふくらみ、返済が追いつかない。弁護士に相談すると、自己破産という方法もあると言われた。日本で自己破産する人は、1年に大人の約1,200人に1人。`,
    situationOf: (l) => `借金が${l.D.fmt(Math.max(0, -(l.cash + l.invest)))}にふくらみ、返済が追いつかない。弁護士に相談すると、自己破産という方法もあると言われた。日本で自己破産する人は、1年に大人の約1,200人に1人。`,
    stillValid: (l) => l.cash + l.invest < 0 && l.bankruptAge < 0,
    options: [
      {
        id: "file",
        label: "自己破産する",
        desc: "借金の返済がなくなる。家などの財産は手放し、7年ほどは住宅ローンを組めない。",
        apply: (l) => {
          l.bankruptAge = l.age;
          const lost = l.home === "own" ? "家も手放した。" : "";
          if (l.home === "own") {
            l.home = "rent";
            l.loan = 0;
            l.loanAnnual = 0;
            l.ownedBefore = false;
          }
          l.invest = 0;
          l.cash = 0;
          l.logPre("money", `自己破産した。借金の返済はなくなった。${lost}`, undefined, true);
          l.mark("bankrupt");
        },
      },
      {
        id: "repay",
        label: "働きながら返し続ける",
        desc: "財産は手元に残る。利息がかさみ、返し終えるまで暮らしは苦しい。",
        apply: (l) => l.logPre("money", "暮らしを切りつめ、借金を返し続けることにした。"),
      },
    ],
  };
}

/** プロのスポーツ選手の出来事を出すか（男女の統計がそろうまで止めている） */
const PRO_ENABLED = true;

/**
 * プロのスポーツ選手（日本の男子）。高校の部員1人あたり、のちにプロになる割合
 * ・野球：NPB 2026年ドラフトの支配下指名76人 ÷ 硬式野球部の男子11.49万人の1学年分（3分の1）。年俸は支配下選手の中央値2,000万円（日本プロ野球選手会 2026年）、在籍は戦力外・引退した人の平均6.8年（NPB 2025年）
 * ・サッカー：2026/27シーズンに高校・大学・ユースから新しく加入した265人（Jリーグ公式の移籍情報から数えた）÷ 男子サッカー部員13.79万人の1学年分。
 *   ユース出身者も分子に入るので、部員1人あたりでは多めに出る。年俸はJ2の下限360万円（Jリーグ 2026/27、J1は480万円・J3は240万円）、在籍は2004年の新人103人の平均6.3年（報道）
 * ・女子サッカー：WEリーグ公式の選手名簿から数えた新人37人（2026/27、大学18・高校8・ユース11）÷ 女子サッカー部員9,048人の1学年分。
 *   年俸はプロB・C契約の下限270万円（WEリーグ）。在籍年数の統計はないので、名簿の18歳以上の日本の選手304人 ÷ 毎年の新人37人 ≈ 8年を目安にした
 */
const PRO = {
  baseball: {
    rate: 76 / (114_904 / 3),
    salary: 20_000_000,
    years: 7,
    offer: "高校最後の夏が終わり、プロ野球のドラフト会議で指名された。",
    label: "プロ野球選手になる",
    desc: "年俸の真ん中は2,000万円。平均で7年ほどで引退し、その先の仕事は自分で探す。",
    joined: "ドラフトで指名され、プロ野球選手になった。",
  },
  soccer: {
    rate: 265 / (137_925 / 3),
    salary: 3_600_000,
    years: 6,
    offer: "Jリーグのクラブから、プロ契約の話が来た。",
    label: "プロサッカー選手になる",
    desc: "年俸の下限はJ1で480万円、J2で360万円。平均で6年ほどで引退し、その先の仕事は自分で探す。",
    joined: "Jリーグのクラブとプロ契約を結び、プロサッカー選手になった。",
  },
  soccerW: {
    rate: 37 / (9_048 / 3),
    salary: 2_700_000,
    years: 8,
    offer: "WEリーグのクラブから、プロ契約の話が来た。",
    label: "プロサッカー選手になる",
    desc: "プロ契約の年俸の下限は270万円。在籍はおよそ8年（選手名簿から計算した目安）で、その先の仕事は自分で探す。",
    joined: "WEリーグのクラブとプロ契約を結び、プロサッカー選手になった。",
  },
} as const;

/** 高校1年生（日本）：部活でプロを目指すか。男子は野球・サッカー、女子はサッカー（統計がそろった競技だけ） */
function clubScene(sex: "male" | "female"): Scene {
  if (sex === "female")
    return {
      id: "club",
      title: "高校の部活",
      situation: "高校に入った。部活をどうする？",
      stillValid: (l) => l.school === "hs",
      options: [
        {
          id: "soccerW",
          label: "サッカー部でプロを目指す",
          desc: "高校でサッカーをする女子は約9千人。高校・大学・ユースから1年にWEリーグに入るのは約40人。",
          apply: (l) => {
            l.proSport = "soccerW";
            l.logPre("school", "サッカー部に入り、プロを目指して練習に打ち込んだ。");
          },
        },
        {
          id: "other",
          label: "ほかの部活・入らない",
          desc: "勉強や趣味、アルバイトに時間を使える。",
          apply: (l) => l.logPre("school", "部活はほどほどに、高校生活を送った。"),
        },
      ],
    };
  return {
    id: "club",
    title: "高校の部活",
    situation: "高校に入った。部活をどうする？",
    stillValid: (l) => l.school === "hs",
    options: [
      {
        id: "baseball",
        label: "野球部でプロを目指す",
        desc: "高校で硬式野球をする男子は約11万5千人。プロ（支配下）に入れるのは1年に76人で、約500人に1人。",
        apply: (l) => {
          l.proSport = "baseball";
          l.logPre("school", "野球部に入り、プロを目指して練習に打ち込んだ。");
        },
      },
      {
        id: "soccer",
        label: "サッカー部でプロを目指す",
        desc: "高校でサッカーをする男子は約13万8千人。高校・大学・ユースから1年にプロになるのは約270人。",
        apply: (l) => {
          l.proSport = "soccer";
          l.logPre("school", "サッカー部に入り、プロを目指して練習に打ち込んだ。");
        },
      },
      {
        id: "other",
        label: "ほかの部活・入らない",
        desc: "勉強や趣味、アルバイトに時間を使える。",
        apply: (l) => l.logPre("school", "部活はほどほどに、高校生活を送った。"),
      },
    ],
  };
}
