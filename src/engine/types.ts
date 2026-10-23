export type Sex = "male" | "female";
export type Edu = "junior_high" | "high_school" | "vocational" | "university" | "graduate";
export type Job =
  | "none" // 学生・無職
  | "big" // 大企業の正社員
  | "sme" // 中小企業の正社員
  | "civil" // 公務員
  | "nonregular" // 非正規
  | "freelance" // フリーランス・自営
  | "founder" // 起業
  | "retired";

export type ExpenseCat =
  | "tax"
  | "food"
  | "housing"
  | "utilities"
  | "kids"
  | "selfEdu"
  | "medical"
  | "care"
  | "car"
  | "fun"
  | "events"
  | "other";

export type IncomeCat = "salary" | "partner" | "pension" | "windfall" | "invest";

export const EXPENSE_LABEL: Record<ExpenseCat, string> = {
  tax: "税金・社会保険",
  food: "食費",
  housing: "住まい",
  utilities: "光熱・通信",
  kids: "子育て・教育",
  selfEdu: "自分の学費",
  medical: "医療",
  care: "介護",
  car: "車・交通",
  fun: "趣味・交際",
  events: "冠婚葬祭・臨時",
  other: "その他の生活費",
};

export const INCOME_LABEL: Record<IncomeCat, string> = {
  salary: "本人の稼ぎ",
  partner: "パートナーの稼ぎ",
  pension: "年金・退職金",
  windfall: "臨時収入",
  invest: "運用益",
};

export type EventKind =
  | "life" // 誕生・結婚・出産など
  | "school"
  | "work"
  | "money"
  | "health"
  | "family"
  | "luck"
  | "disaster"
  | "choice"
  | "death";

export interface LifeEvent {
  age: number;
  kind: EventKind;
  text: string;
  /** 金額への影響（+収入 / -支出）。表示と「転機」判定に使う */
  amount?: number;
  /** 転機として目立たせる */
  major?: boolean;
}

export interface YearRecord {
  age: number;
  year: number;
  income: Partial<Record<IncomeCat, number>>;
  expense: Partial<Record<ExpenseCat, number>>;
  /** 年末時点の金融資産 − 負債 */
  balance: number;
  invested: number;
  debt: number;
  events: LifeEvent[];
}

export interface ChoiceOption {
  id: string;
  label: string;
  desc: string;
}

export interface Choice {
  id: ChoiceId;
  age: number;
  title: string;
  situation: string;
  options: ChoiceOption[];
}

export type ChoiceId =
  | "afterJHS"
  | "afterHS"
  | "firstJob"
  | "invest"
  | "marriageHome"
  | "careerShift"
  | "parentCare"
  | "retire"
  | `micro:${string}`
  | `ev:${string}`;

export interface LifeSummary {
  seed: string;
  birthYear: number;
  sex: Sex;
  regionId: string;
  regionLabel: string;
  familyBandId: string;
  familyBandLabel: string;
  deathAge: number;
  deathCause: string;
  edu: Edu;
  incomeTotal: Partial<Record<IncomeCat, number>>;
  expenseTotal: Partial<Record<ExpenseCat, number>>;
  lifetimeIncome: number;
  lifetimeExpense: number;
  finalBalance: number;
  ownsHome: boolean;
  married: boolean;
  kids: number;
  choices: { id: ChoiceId; optionId: string; label: string; age: number }[];
}
