// 家族の声：その年に起きたことに合わせて、家族のひとことを添える。
// 数字や出来事は変えない（統計どおりの人生に、言葉だけを足す）。乱数は使わず、種と年齢から決めるので、記録や共有URLには影響しない。
import type { Life } from "./sim";
import type { YearRecord } from "./types";
import { kidShownHome } from "./home";
import { kidFemale } from "./sim";
import { hashStr } from "./rng";

export interface Voice {
  who: string;
  text: string;
}

/** 前の年の終わりの様子（変わったところを見つけるため） */
export interface Snap {
  partner: boolean;
  kids: number;
  /** 一緒に暮らしている子ども（何番目の子か） */
  kidsHome: number[];
  working: boolean;
  retired: boolean;
  home: string;
  abroad: boolean;
  tags: number;
}

const isWorking = (j: string) => j !== "none" && j !== "retired";

export function snap(l: Life): Snap {
  return {
    partner: !!l.partner?.alive,
    kids: l.kids.length,
    kidsHome: l.kids.map((k, i) => (kidShownHome(l, k, l.age) ? i : -1)).filter((i) => i >= 0),
    working: isWorking(l.job),
    retired: l.job === "retired",
    home: l.home,
    abroad: l.abroad,
    tags: l.tags.length,
  };
}

/** その年の家族の声（多くても2つ） */
export function voicesFor(l: Life, prev: Snap | null, rec: YearRecord): Voice[] {
  const a = rec.age;
  const pick = (key: string, lines: string[]) => lines[hashStr(`${l.seed}|${key}|${a}`) % lines.length];
  const mom = l.parents[1].alive ? "母" : l.parents[0].alive ? "父" : "";
  const dad = l.parents[0].alive ? "父" : mom;
  const pt = l.partner?.alive ? (l.partner.sex === "male" ? "夫" : "妻") : "";
  // 長女・次女…は、男女それぞれで数える
  const kidName = (i: number) => {
    const f = kidFemale(l.seed, i);
    const nth = l.kids.slice(0, i).filter((_, j) => kidFemale(l.seed, j) === f).length;
    return `${["長", "次", "三", "四", "五"][nth] ?? "末"}${f ? "女" : "男"}`;
  };
  const out: Voice[] = [];
  // 一緒に暮らしている子ども（いちばん上）
  const homeKid = l.kids.findIndex((k) => kidShownHome(l, k, a));
  const say = (who: string, text: string) => who && out.length < 2 && out.push({ who, text });
  const self = (text: string) => out.length < 2 && out.push({ who: "心の声", text });

  if (a === 0) {
    say(mom || "家族", pick("born", ["生まれてきてくれて、ありがとう。", "小さな手だね。大きくなるんだよ。", "よく来てくれたね。"]));
    return out;
  }
  if (!prev) return out;

  // その年に起きたこと（印）に合わせて
  const newTags = l.tags.filter(([, ta]) => ta === a).map(([t]) => t);
  const close = pt || (l.home === "parents" ? mom : "");
  for (const t of newTags) {
    if (t === "cancer" || t === "heartBrain") close ? say(close, pick(t, ["お金のことは、なんとかなる。まずは治そう。", "無理しないで。ゆっくり休んで。"])) : self("一人で病院に通うのは、心細い。");
    else if (t === "jobLoss") close ? say(close, pick(t, ["次の仕事、一緒に探そう。", "しばらくは、切りつめてやっていこう。"])) : self("家賃、来月も払えるだろうか。");
    else if (t === "disaster") say(close || "近所の人", pick(t, ["みんな無事で、よかった。", "片づけ、手伝うよ。"]));
    else if (t === "displaced") homeKid >= 0 ? say(kidName(homeKid), "いつ、家に帰れるの？") : say(close || "家族", "早く、家に戻れるといいね。");
    else if (t === "inflation") {
      const line = pick(t, ["また値上がりしてる……。", "先月と同じ買い物で、こんなに違うなんて。"]);
      close ? say(close, line) : self(line);
    }
    else if (t === "theft") close ? say(close, "けががなくて、よかった。") : self("けががなかっただけ、よかった。");
    else if (t === "parentDeath") self(pick(t, ["もっと、話しておけばよかった。", "実家の電話番号を、まだ消せずにいる。"]));
    else if (t === "partnerDeath") self(pick(t, ["食卓の向かいの席が、空いたまま。", "家が、急に広くなった。"]));
    else if (t === "divorce") self("これからは、一人で決めていく。");
    else if (t === "scam") self("どうして、信じてしまったんだろう。");
  }

  // 暮らしの変化
  if (a === 6) say(mom, l.D.isJapan ? pick("school", ["ランドセル、似合ってるよ。", "車に気をつけて、いってらっしゃい。"]) : pick("school", ["学校、楽しんでおいで。", "先生の話を、よく聞くんだよ。"]));
  if (a === 9 && mom) {
    const b = l.band.id;
    if (b === "low" || b === "lower_mid") say(mom, pick("band", ["ごめんね、今年は我慢してね。", "給料日まで、あと少しだからね。"]));
    else if (b === "high" || b === "upper_mid") say(mom, pick("band", ["習いごと、何かやってみる？", "夏休みは、どこへ行こうか。"]));
  }
  if (!prev.working && isWorking(l.job) && a < 32 && !prev.retired) say(dad || mom, pick("job", ["最初の給料、大事に使いなよ。", "体だけは、壊さないようにね。"]));
  if (prev.home === "parents" && l.home !== "parents" && mom) say(mom, pick("leave", ["たまには、帰ってきなさいよ。", "ちゃんと、ご飯を食べるんだよ。"]));
  if (!prev.partner && pt) say(pt, pick("partner", ["これから、よろしくね。", "ふたりで、なんとかやっていこう。"]));
  if (l.kids.length > prev.kids) pt ? say(pt, pick("kid", ["名前、どうしようか。", "ちっちゃいね……。", "これから、もっと働かないとね。"])) : self("この子を、守らないと。");
  l.kids.forEach((k, i) => {
    if (a - k.born === 6 && kidShownHome(l, k, a)) say(kidName(i), "いってきます！");
  });
  // 去年まで一緒に暮らしていて、今年家を出た子ども
  const gone = prev.kidsHome.find((i) => !kidShownHome(l, l.kids[i], a) && l.kids[i].leftAge !== undefined);
  if (gone !== undefined) say(kidName(gone), pick("kidleave", ["今までありがとう。たまに帰るね。", "部屋、そのままにしておいてね。"]));
  if (!prev.abroad && l.abroad) say(homeKid >= 0 ? kidName(homeKid) : close || "家族", "次は、いつ帰ってくるの？");
  if (!prev.retired && l.job === "retired") pt ? say(pt, "長いあいだ、おつかれさま。") : self("明日から、目覚ましをかけなくていい。");

  // 何もない年は、ときどき家計の話
  if (!out.length && a >= 22 && hashStr(`${l.seed}|talk|${a}`) % 6 === 0) {
    const who = pt || (l.home === "parents" ? mom : "");
    if (who) {
      const before = l.records.find((r) => r.age === a - 1)?.balance ?? 0;
      if (rec.balance < 0) say(who, pick("money", ["今月も、やりくりが厳しいね。", "カードの支払い、なんとかしないと。"]));
      else if (rec.balance > before) say(who, pick("money", ["たまには、おいしいものでも食べに行こうか。", "少しずつだけど、貯まってきたね。"]));
      else say(who, pick("money", ["今年は、出ていくお金が多かったね。", "来年は、もう少し節約しようか。"]));
    }
  }
  return out;
}
