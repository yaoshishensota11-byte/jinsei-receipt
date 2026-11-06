// 日本の習い事（小学生）と部活動（中学・高校の運動部）。
// どちらも専用の乱数（streamRng）で選択肢を決めるので、ほかの出来事・選択・金額には影響しない。
// 習い事：学研教育総合研究所「小学生白書Web版 2024年11月調査」（小学1〜6年生1,200人、学校以外で行っている習い事・複数回答）
//         ベネッセ「小学生の習い事調査」（2024年2月、3,096組）：有料の習い事をしている小学生のうち、2つ以上は54.7%
// 部活動：中学は日本中学校体育連盟「令和6年度 加盟校・加盟生徒数調査（確定値）」（参考競技を含む）、
//         高校は全国高等学校体育連盟「令和7年度 加盟・登録状況」と、日本高等学校野球連盟（硬式、2026年度）
import { streamRng, type Rng } from "./rng";
import type { Scene } from "./scenes";
import type { Life } from "./sim";

type Sex = "male" | "female";
type Kind = "study" | "sports" | "arts";

/** 習い事。pct は学研の調査で「習っている」と答えた割合（%、男子・女子） */
const LESSONS: { id: string; label: string; kind: Kind; m: number; f: number }[] = [
  { id: "swim", label: "水泳", kind: "sports", m: 26.2, f: 23.0 },
  { id: "juku", label: "学習塾", kind: "study", m: 16.0, f: 17.8 },
  { id: "eikaiwa", label: "英会話教室", kind: "study", m: 11.3, f: 17.3 },
  { id: "music", label: "音楽教室（ピアノ・歌など）", kind: "arts", m: 6.7, f: 17.0 },
  { id: "tsushin", label: "通信教育", kind: "study", m: 9.3, f: 8.7 },
  { id: "soroban", label: "そろばん", kind: "study", m: 7.8, f: 8.2 },
  { id: "taiso", label: "体操教室", kind: "sports", m: 7.2, f: 8.3 },
  { id: "soccer", label: "サッカー・フットサル", kind: "sports", m: 11.5, f: 3.2 },
  { id: "shuji", label: "習字・書道", kind: "arts", m: 6.5, f: 7.0 },
  { id: "eigojuku", label: "英語塾", kind: "study", m: 6.3, f: 6.3 },
  { id: "dance", label: "ダンス", kind: "sports", m: 1.7, f: 10.0 },
  { id: "baseball", label: "野球・ソフトボール", kind: "sports", m: 6.2, f: 2.2 },
  { id: "basket", label: "バスケットボール", kind: "sports", m: 4.0, f: 3.5 },
  { id: "budo", label: "武道（柔道・空手・剣道など）", kind: "sports", m: 5.0, f: 1.8 },
  { id: "program", label: "プログラミング・ロボット教室", kind: "study", m: 3.8, f: 0.5 },
  { id: "ballet", label: "バレエ", kind: "arts", m: 0.5, f: 3.3 },
  { id: "pc", label: "パソコン教室", kind: "study", m: 1.8, f: 1.2 },
  { id: "art", label: "絵画教室・造形教室", kind: "arts", m: 0.2, f: 1.7 },
  { id: "craft", label: "手芸・料理教室", kind: "arts", m: 0.5, f: 0.7 },
  { id: "video", label: "動画制作・編集", kind: "arts", m: 0.2, f: 0.7 },
  { id: "shogi", label: "将棋・囲碁", kind: "arts", m: 0.3, f: 0.5 },
  { id: "golf", label: "ゴルフ", kind: "sports", m: 0.3, f: 0.3 },
  { id: "bouldering", label: "ボルダリング", kind: "sports", m: 0.2, f: 0.3 },
  { id: "sado", label: "茶道・華道", kind: "arts", m: 0, f: 0.3 },
  { id: "skate", label: "スケート", kind: "sports", m: 0, f: 0.2 },
  { id: "drama", label: "演劇", kind: "arts", m: 0.2, f: 0 },
];
/** 学校以外の習い事をしている割合（「習い事はない」男子24.0%・女子22.5%の残り） */
const LESSON_SHARE: Record<Sex, number> = { male: 0.76, female: 0.775 };
/** 習い事をしている小学生のうち、2つ以上している割合（ベネッセ） */
const SECOND_LESSON = 0.547;

const pctOf = (x: { m: number; f: number }, sex: Sex) => (sex === "male" ? x.m : x.f);
const sexWord = (sex: Sex) => (sex === "male" ? "男子" : "女子");

/** 重みつきで、重ならないように n 個選ぶ */
function pickWeighted<T>(r: Rng, items: T[], weight: (x: T) => number, n: number): T[] {
  const pool = items.filter((x) => weight(x) > 0);
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const x = r.weighted(pool, pool.map(weight));
    out.push(x);
    pool.splice(pool.indexOf(x), 1);
  }
  return out;
}

/** 習い事の効き目（小さな選択と同じくらいの、少しの差） */
function startLesson(l: Life, ls: (typeof LESSONS)[number]): void {
  l.lessons.push(ls.label);
  if (ls.kind === "study") l.aptitude = Math.min(1, l.aptitude + 0.03);
  else if (ls.kind === "sports") l.illMult *= 0.97;
  else l.social += 0.03;
  const after = ls.kind === "study" ? "勉強が少し得意になった。" : ls.kind === "sports" ? "体が少し丈夫になった。" : "教室で友だちができた。";
  const start = /(教室|塾)$|教室・/.test(ls.label.replace(/（.*）$/, "")) ? `${ls.label}に通いはじめた。` : ls.id === "tsushin" ? "通信教育を始めた。" : `${ls.label}を習いはじめた。`;
  l.logPre("school", start + after);
}

function lessonOptions(l: Life, r: Rng, skip: string[]) {
  return pickWeighted(r, LESSONS.filter((x) => !skip.includes(x.label)), (x) => pctOf(x, l.sex), 3).map((ls) => ({
    id: ls.id,
    label: ls.label,
    desc: `小学生の${sexWord(l.sex)}の${pctOf(ls, l.sex) >= 1 ? `約${Math.round(pctOf(ls, l.sex))}%` : "100人に1人ほど"}が${
      /(教室|塾)$|教室・/.test(ls.label.replace(/（.*）$/, "")) ? "通っている" : ls.id === "tsushin" ? "している" : "習っている"
    }。${
      ls.kind === "study" ? "勉強の力がつく。" : ls.kind === "sports" ? "体が丈夫になる。" : "好きなことが見つかる。"
    }月謝は親が払う。`,
    apply: (lf: Life) => startLesson(lf, ls),
  }));
}

/**
 * 日本・小学1年生（6歳）と4年生（9歳）：習い事を始めるか。その割合で出す。
 * 出来事がきっかけの場面は翌年の頭に出るので、前の年（5歳・8歳）に決めて並べておく。
 */
export function lessonScene(l: Life): Scene | null {
  const a = l.age + 1;
  if (!l.D.isJapan) return null;
  if (a === 6) {
    if (!streamRng(l.seed, "lesson", 6).chance(LESSON_SHARE[l.sex])) return null;
    const r = streamRng(l.seed, "lessonPick", 6);
    return {
      id: "lesson",
      title: "習い事",
      situation: "小学校に入った。習い事を始めないかと、親が聞いてきた。",
      options: [
        ...lessonOptions(l, r, []),
        { id: "none", label: "習い事はしない", desc: "放課後は自由に遊べる。", apply: (lf) => lf.logPre("life", "習い事はせず、放課後は友だちと遊んだ。") },
      ],
    };
  }
  if (a === 9 && l.lessons.length === 1) {
    if (!streamRng(l.seed, "lesson", 9).chance(SECOND_LESSON)) return null;
    const r = streamRng(l.seed, "lessonPick", 9);
    return {
      id: "lesson2",
      title: "もう1つの習い事",
      situation: `${l.lessons[0]}を続けている。友だちに誘われて、もう1つ習い事を始めるか考えている。`,
      options: [
        ...lessonOptions(l, r, l.lessons),
        { id: "none", label: `${l.lessons[0]}だけにする`, desc: "今の習い事に集中できる。", apply: (lf) => lf.logPre("life", `${lf.lessons[0]}だけを続けることにした。`) },
      ],
    };
  }
  return null;
}

/** 小学校の卒業（12歳）で、習い事に区切りをつける */
export function lessonGraduation(l: Life): string | null {
  if (!l.D.isJapan || l.age !== 12 || !l.lessons.length) return null;
  return `小学校を卒業するまで、${l.lessons.join("と")}を続けた。`;
}

/** 運動部。m・f は部員数（人） */
type Sport = { id: string; label: string; m: number; f: number };
/** 中学（日本中学校体育連盟 令和6年度。テニス〜アーチェリーは都道府県中体連が独自に認める「参考競技」） */
const JHS_SPORTS: Sport[] = [
  { id: "track", label: "陸上競技", m: 117_524, f: 74_500 },
  { id: "swim", label: "水泳", m: 20_352, f: 11_267 },
  { id: "basket", label: "バスケットボール", m: 162_938, f: 116_435 },
  { id: "soccer", label: "サッカー", m: 150_505, f: 4_910 },
  { id: "handball", label: "ハンドボール", m: 16_817, f: 8_392 },
  { id: "baseball", label: "軟式野球", m: 129_805, f: 4_049 },
  { id: "gym", label: "体操", m: 1_232, f: 2_628 },
  { id: "rgym", label: "新体操", m: 219, f: 2_379 },
  { id: "volley", label: "バレーボール", m: 60_937, f: 147_738 },
  { id: "softtennis", label: "ソフトテニス", m: 123_031, f: 142_417 },
  { id: "tabletennis", label: "卓球", m: 127_065, f: 82_300 },
  { id: "badminton", label: "バドミントン", m: 53_192, f: 75_051 },
  { id: "softball", label: "ソフトボール", m: 888, f: 22_880 },
  { id: "judo", label: "柔道", m: 15_745, f: 6_101 },
  { id: "kendo", label: "剣道", m: 36_568, f: 26_913 },
  { id: "sumo", label: "相撲", m: 636, f: 84 },
  { id: "ski", label: "スキー", m: 995, f: 739 },
  { id: "skate", label: "スケート", m: 206, f: 201 },
  { id: "icehockey", label: "アイスホッケー", m: 371, f: 32 },
  { id: "tennis", label: "テニス", m: 18_236, f: 14_576 },
  { id: "hockey", label: "ホッケー", m: 684, f: 547 },
  { id: "naginata", label: "なぎなた", m: 74, f: 506 },
  { id: "wrestling", label: "レスリング", m: 157, f: 58 },
  { id: "kyudo", label: "弓道", m: 4_559, f: 5_595 },
  { id: "rugby", label: "ラグビー", m: 5_272, f: 133 },
  { id: "karate", label: "空手道", m: 944, f: 730 },
  { id: "figure", label: "フィギュアスケート", m: 0, f: 11 },
  { id: "archery", label: "アーチェリー", m: 333, f: 242 },
];
/** 高校（全国高等学校体育連盟 令和7年度。硬式野球は日本高等学校野球連盟 2026年度） */
const HS_SPORTS: Sport[] = [
  { id: "track", label: "陸上競技", m: 63_712, f: 28_838 },
  { id: "gym", label: "体操", m: 1_564, f: 2_319 },
  { id: "rgym", label: "新体操", m: 364, f: 1_582 },
  { id: "swim", label: "競泳", m: 16_389, f: 9_197 },
  { id: "diving", label: "飛込", m: 18, f: 21 },
  { id: "waterpolo", label: "水球", m: 1_110, f: 0 },
  { id: "basket", label: "バスケットボール", m: 86_687, f: 48_579 },
  { id: "volley", label: "バレーボール", m: 55_939, f: 55_377 },
  { id: "tabletennis", label: "卓球", m: 40_029, f: 18_805 },
  { id: "softtennis", label: "ソフトテニス", m: 38_480, f: 25_289 },
  { id: "handball", label: "ハンドボール", m: 26_298, f: 12_735 },
  { id: "soccer", label: "サッカー", m: 137_925, f: 9_048 },
  { id: "rugby", label: "ラグビー", m: 17_158, f: 0 },
  { id: "badminton", label: "バドミントン", m: 70_997, f: 50_421 },
  { id: "softball", label: "ソフトボール", m: 3_164, f: 12_109 },
  { id: "sumo", label: "相撲", m: 752, f: 0 },
  { id: "judo", label: "柔道", m: 11_244, f: 3_231 },
  { id: "ski", label: "スキー", m: 1_069, f: 689 },
  { id: "skate", label: "スケート", m: 795, f: 297 },
  { id: "rowing", label: "ボート", m: 2_891, f: 1_398 },
  { id: "kendo", label: "剣道", m: 19_688, f: 11_992 },
  { id: "wrestling", label: "レスリング", m: 1_768, f: 238 },
  { id: "kyudo", label: "弓道", m: 27_715, f: 35_474 },
  { id: "tennis", label: "テニス", m: 40_587, f: 24_066 },
  { id: "climbing", label: "登山", m: 8_293, f: 3_010 },
  { id: "cycling", label: "自転車競技", m: 1_626, f: 117 },
  { id: "boxing", label: "ボクシング", m: 2_172, f: 0 },
  { id: "hockey", label: "ホッケー", m: 1_722, f: 1_267 },
  { id: "weight", label: "ウエイトリフティング", m: 1_792, f: 393 },
  { id: "yacht", label: "ヨット", m: 723, f: 343 },
  { id: "fencing", label: "フェンシング", m: 1_547, f: 1_208 },
  { id: "karate", label: "空手道", m: 4_173, f: 3_043 },
  { id: "archery", label: "アーチェリー", m: 2_118, f: 1_572 },
  { id: "naginata", label: "なぎなた", m: 0, f: 1_335 },
  { id: "canoe", label: "カヌー", m: 1_031, f: 430 },
  { id: "shorinji", label: "少林寺拳法", m: 1_129, f: 975 },
  { id: "baseball", label: "硬式野球", m: 114_904, f: 0 },
];

/** 部員数を「約◯万◯千人」「約◯人」の形に */
function people(n: number): string {
  if (n >= 10_000) {
    const man = Math.floor(n / 10_000);
    const sen = Math.round((n % 10_000) / 1_000);
    return sen === 10 ? `約${man + 1}万人` : sen ? `約${man}万${sen}千人` : `約${man}万人`;
  }
  if (n >= 1_000) return `約${(Math.round(n / 100) * 100).toLocaleString("ja-JP")}人`;
  if (n >= 100) return `約${Math.round(n / 10) * 10}人`;
  return `${n}人`;
}

/** プロを目指せる部（統計がそろった競技だけ：男子は硬式野球・サッカー、女子はサッカー） */
function proOf(sex: Sex, level: "jhs" | "hs", id: string): "baseball" | "soccer" | "soccerW" | null {
  if (level !== "hs") return null;
  if (id === "soccer") return sex === "male" ? "soccer" : "soccerW";
  if (id === "baseball" && sex === "male") return "baseball";
  return null;
}
const PRO_DESC: Record<"baseball" | "soccer" | "soccerW", string> = {
  baseball: "プロ（支配下）に入れるのは1年に76人で、約500人に1人。",
  soccer: "高校・大学・ユースから1年にプロになるのは約270人。",
  soccerW: "高校・大学・ユースから1年にWEリーグに入るのは約40人。",
};

/** 運動部を選んだあと：日本の部活動の中から、毎回ちがう4つを出す（男女どちらかの部員がいない競技は、その性別には出さない） */
export function sportScene(l: Life, level: "jhs" | "hs"): Scene {
  const list = (level === "jhs" ? JHS_SPORTS : HS_SPORTS).filter((s) => pctOf(s, l.sex) > 0);
  const r = streamRng(l.seed, "sport:" + level, l.age);
  const four = pickWeighted(r, list, () => 1, 4);
  const school = level === "jhs" ? "中学" : "高校";
  return {
    id: "sport_" + level,
    title: `${school}の運動部`,
    situation: `どの運動部に入る？（${school}の運動部は全部で${list.length}種類。その中の4つ）`,
    stillValid: (lf) => (level === "jhs" ? lf.age <= 15 : lf.school === "hs"),
    options: four.map((s) => {
      const pro = proOf(l.sex, level, s.id);
      return {
        id: s.id,
        label: `${s.label}部`,
        desc: `全国の${school}で${s.label}部の${sexWord(l.sex)}は${people(pctOf(s, l.sex))}。${pro ? PRO_DESC[pro] : ""}`,
        apply: (lf: Life) => {
          lf.clubSport = s.label;
          if (pro) {
            lf.proSport = pro;
            lf.logPre("school", `${s.label}部に入り、プロを目指して練習に打ち込んだ。`);
          } else lf.logPre("school", level === "jhs" ? `${s.label}部に入った。毎日へとへとだが体力がついた。` : `${s.label}部に入り、3年間打ち込んだ。`);
        },
      };
    }),
  };
}

/** 高校1年生（日本）：部活をどうするか。運動部を選ぶと、次に4つの競技から選ぶ */
export function hsClubScene(): Scene {
  return {
    id: "club",
    title: "高校の部活",
    situation: "高校に入った。部活をどうする？",
    stillValid: (l) => l.school === "hs",
    options: [
      {
        id: "sport",
        label: "運動部に入る",
        desc: "体を動かす3年間。プロを目指せる競技もある。",
        apply: (l) => l.queueScene(sportScene(l, "hs")),
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
