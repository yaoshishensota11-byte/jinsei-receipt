// 国ごとの結婚のしかた（data/world/marriage.json）と、結婚の場面。
// 自分で相手を見つける国では「結婚するか」を選び、家族が相手を決めることが多い国では縁談や許嫁の話が来る。
// 結婚のときのお金の習わし（持参金・婚資・マフル）も国ごとに違う。結婚はゲームの中では18歳以上だけで起きる。
import marriageJson from "../../data/world/marriage.json";
import type { Rng } from "./rng";
import type { Scene } from "./scenes";
import type { Life } from "./sim";

export type MarriageMode = "love" | "arranged" | "betrothed";
export type Payment = "dowry" | "brideprice" | "mahr" | "none";

export interface MarriageNorm {
  arranged: number;
  betrothal: number;
  payment: Payment;
  paymentYears: number;
}

const NORMS = marriageJson as unknown as Record<string, Partial<MarriageNorm>>;

export function marriageNorm(iso3: string): MarriageNorm {
  const n = NORMS[iso3] ?? {};
  return {
    arranged: n.arranged ?? 0.02,
    betrothal: n.betrothal ?? 0,
    payment: (n.payment as Payment) ?? "none",
    paymentYears: n.paymentYears ?? 0,
  };
}

/** 生まれたときに、その人の結婚のしかたが決まる（国の割合どおり） */
export function drawMarriageMode(iso3: string, r: Rng): MarriageMode {
  const n = marriageNorm(iso3);
  if (!r.chance(n.arranged)) return "love";
  return r.chance(n.betrothal) ? "betrothed" : "arranged";
}

const PAY_WORD: Record<Exclude<Payment, "none">, string> = {
  dowry: "妻の家から夫の家へ持参金（ダウリー）を渡すのが習わし",
  brideprice: "夫の側から妻の家へ婚資（ブライドプライス）を払うのが習わし",
  mahr: "夫から妻へ婚資（マフル）を贈るのが習わし",
};

/** 結婚のときのお金のやりとり。払う側・受け取る側は、習わしと自分の性別で決まる */
function payForMarriage(l: Life, r: Rng): void {
  const n = marriageNorm(l.D.iso3);
  if (n.payment === "none" || n.paymentYears <= 0) return;
  const amount = n.paymentYears * l.D.regularWage("male", "high_school", 35) * r.range(0.6, 1.4);
  const male = l.sex === "male";
  if (n.payment === "dowry") {
    if (male) {
      l.addIncome("windfall", amount * 0.5);
      l.log("money", "妻の家から持参金（ダウリー）が届いた。新しい暮らしの家財になった。", amount * 0.5);
    } else {
      // 多くは親が用意するが、自分の貯えからも出す
      l.spend("love", amount * 0.35);
      l.log("money", "結婚にあたり、家族と出し合って持参金（ダウリー）を用意した。", -amount * 0.35, true);
    }
  } else if (n.payment === "brideprice") {
    if (male) {
      l.spend("love", amount);
      l.log("money", "妻の家へ婚資（ブライドプライス）を払った。何年分もの稼ぎが一度に出ていった。", -amount, true);
    } else {
      l.addIncome("windfall", amount * 0.2);
      l.log("money", "夫の側から婚資（ブライドプライス）が実家に届いた。一部は新しい暮らしの支度に回った。", amount * 0.2);
    }
  } else if (n.payment === "mahr") {
    if (male) {
      l.spend("love", amount);
      l.log("money", "妻へ婚資（マフル）を贈った。", -amount, true);
    } else {
      l.addIncome("windfall", amount * 0.8);
      l.log("money", "夫から婚資（マフル）を受け取った。自分の財産として持っておける。", amount * 0.8);
    }
  }
}

function marryWith(l: Life, r: Rng, text: string, ceremony: boolean): void {
  l.marry(r, text, ceremony);
  payForMarriage(l, r);
}

function customLine(l: Life): string {
  const n = marriageNorm(l.D.iso3);
  return n.payment === "none" || n.paymentYears <= 0 ? "" : `${l.D.isJapan ? "" : `${l.D.nameJa}では`}${PAY_WORD[n.payment]}。`;
}

/** 気になる人ができたとき（付き合うかどうか） */
export function meetScene(l: Life): Scene {
  const a = l.age;
  const again = l.widowed || l.partnerSince >= 0;
  const where = again
    ? "ひとりの暮らしにも慣れたころ、気になる人ができた。"
    : l.noMarry
      ? "結婚はしないと決めていたが、ある日、いい人に出会った。"
      : a < 23 && l.school !== "done"
        ? "同じ学校に、気になる人ができた。"
        : ["職場に、気の合う人ができた。", "友だちの紹介で会った人と、話が弾んだ。", "趣味の集まりで、気になる人ができた。"][a % 3];
  return {
    id: "meet",
    title: "出会い",
    situation: where,
    options: [
      {
        id: "ask",
        label: "食事に誘ってみる",
        desc: "うまくいけば付き合える。断られることもある。",
        apply: (l, r) => {
          if (r.chance(0.75)) {
            l.dating = true;
            l.datingSince = l.age;
            l.logPre("family", "食事に誘い、付き合いはじめた。");
          } else {
            l.marriageDelayUntil = l.age + 1;
            l.logPre("family", "勇気を出して誘ったが、うまくいかなかった。");
          }
        },
      },
      {
        id: "friend",
        label: "友だちのままでいる",
        desc: "気楽な関係のまま。この先どうなるかは分からない。",
        apply: (l, r) => {
          l.marriageDelayUntil = l.age + r.int(1, 2);
          l.logPre("family", "友だちのままでいることにした。");
        },
      },
      {
        id: "focus",
        label: "今は自分のことを優先する",
        desc: "仕事や勉強、趣味に打ち込める。出会いはしばらく遠のく。",
        apply: (l, r) => {
          l.marriageDelayUntil = l.age + r.int(3, 5);
          l.logPre("family", "今は恋愛より自分のことを優先すると決めた。");
        },
      },
    ],
  };
}

/** 付き合っている恋人と、結婚の話が出たとき */
export function loveScene(l: Life): Scene {
  const years = Math.max(1, l.age - l.datingSince);
  return {
    id: "propose",
    title: "結婚のこと",
    situation: `付き合って${years}年になる恋人と、結婚の話が出た。${customLine(l)}`,
    options: [
      {
        id: "wedding",
        label: "結婚する（式を挙げる）",
        desc: "家族や友人に祝ってもらえる。式の費用がかかる。",
        apply: (l, r) => marryWith(l, r, "結婚した。", true),
      },
      {
        id: "simple",
        label: "結婚する（式は挙げない）",
        desc: "届けだけで済ませ、お金を暮らしに回す。",
        apply: (l, r) => marryWith(l, r, "式は挙げず、届けだけで結婚した。", false),
      },
      {
        id: "wait",
        label: "結婚はまだ先にする",
        desc: "恋人のまま付き合いを続ける。待たせるうちに、気持ちが離れることもある。",
        apply: (l, r) => {
          l.marriageDelayUntil = l.age + r.int(2, 3);
          if (r.chance(0.3)) {
            l.dating = false;
            l.logPre("family", "結婚はまだ先にしたいと伝えた。しばらくして、恋人とは別れることになった。");
          } else l.logPre("family", "結婚はまだ先にしたいと伝え、恋人のまま付き合いを続けることにした。");
        },
      },
      {
        id: "breakup",
        label: "別れる",
        desc: "この人とは結婚しないと決める。また別の出会いがあるかもしれない。",
        apply: (l, r) => {
          l.dating = false;
          l.marriageDelayUntil = l.age + r.int(1, 2);
          l.logPre("family", "この人とは結婚しないと決め、別れた。");
        },
      },
    ],
  };
}

/** 家族が縁談を持ってきたとき */
export function arrangedScene(l: Life): Scene {
  const jp = l.D.isJapan;
  const who = l.sex === "male" ? "女性" : "男性";
  const job = l.sex === "male" ? "近くの町で働く" : "親戚の知り合いで、仕事が安定している";
  return {
    id: "arranged",
    title: jp ? "お見合いの話" : "縁談",
    situation: jp
      ? `親の知り合いから、お見合いの話が来た。相手は${job}${who}。`
      : `家族が縁談を持ってきた。相手は${job}${who}で、家どうしの話はまとまりかけている。${customLine(l)}`,
    options: [
      {
        id: "accept",
        label: jp ? "お見合いをして結婚する" : "縁談を受けて結婚する",
        desc: "家族に祝福され、親戚の支えも得やすい。相手のことはよく知らないまま始まる。",
        apply: (l, r) => marryWith(l, r, jp ? "お見合いで出会った相手と結婚した。" : "家族が決めた相手と結婚した。", true),
      },
      {
        id: "meet",
        label: "会ってから決めたいと伝える",
        desc: "相手を知ってから決められる。話が流れることもある。",
        apply: (l, r) => {
          if (r.chance(0.6)) marryWith(l, r, "何度か会って話し、この人となら、と結婚を決めた。", true);
          else {
            l.marriageDelayUntil = l.age + r.int(1, 3);
            l.logPre("family", "何度か会ったが、話はまとまらなかった。");
          }
        },
      },
      {
        id: "refuse",
        label: "断って、相手は自分で探す",
        desc: jp ? "自分のペースで相手を探せる。" : "自分で選んだ人と結婚できるかもしれない。家族との間にしこりが残ることもある。",
        apply: (l, r) => {
          l.marriageMode = "love";
          l.marriageDelayUntil = l.age + r.int(1, 3);
          if (!jp) l.social = Math.max(-0.5, l.social - 0.2);
          l.logPre("family", jp ? "お見合いは断った。" : "縁談を断った。家族はしばらく口をきいてくれなかった。");
        },
      },
    ],
  };
}

/** 子どものころに決まっていた許嫁との結婚の時期が来たとき */
export function betrothedScene(l: Life): Scene {
  return {
    id: "betrothed",
    title: "許嫁との結婚",
    situation: `子どものころに親どうしで決めた許嫁との結婚の日取りが決まった。${customLine(l)}`,
    options: [
      {
        id: "keep",
        label: "約束どおり結婚する",
        desc: "家どうしのつながりが強まり、親戚の支えも得やすい。",
        apply: (l, r) => marryWith(l, r, "許嫁と、約束どおり結婚した。", true),
      },
      {
        id: "break",
        label: "約束を断る",
        desc: "自分で相手を選べる。家どうしで受け取ったものを返すお金がかかり、家族ともめる。",
        apply: (l, r) => {
          const n = marriageNorm(l.D.iso3);
          const cost = Math.max(n.paymentYears, 0.3) * l.D.regularWage("male", "high_school", 35) * 0.3;
          l.spend("events", cost);
          l.marriageMode = "love";
          l.marriageDelayUntil = l.age + r.int(2, 4);
          l.social = Math.max(-0.5, l.social - 0.3);
          l.logPre("family", "許嫁との約束を断った。家どうしの話し合いは長引き、受け取っていたものを返した。", -cost);
        },
      },
    ],
  };
}
