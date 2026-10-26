// 実家を出るかどうか（自分と、自分の子ども）。
// 働きはじめても実家から通ってお金を貯める人もいれば、貯まってから家を出る人、ずっと実家で暮らす人もいる。
import type { Rng } from "./rng";
import type { Scene } from "./scenes";
import type { Life } from "./sim";

type Kid = Life["kids"][number];

/** 子どもがまだ一緒に暮らしているか。ふつうは高校を出て働けば18歳、大学に進めば22歳で巣立つ */
export function kidAtHome(k: Kid, age: number): boolean {
  if (k.leftAge !== undefined) return false;
  const ka = age - k.born;
  return ka < (k.univ ? 22 : 18) || !!k.stayHome;
}

/** 自分が実家を出るか。later は、実家から通って働いていて貯金がたまってきたとき */
export function leaveHomeScene(l: Life, later: boolean): Scene {
  return {
    id: "leaveHome",
    title: "実家を出る？",
    situation: later
      ? `実家から仕事に通って、貯金が${l.D.fmt(Math.max(0, l.cash), false)}になった。そろそろ家を出る？`
      : "働きはじめた。このまま実家から通うか、家を出て一人で暮らすか。",
    options: [
      {
        id: "leave",
        label: later ? "貯めたお金で家を出る" : "実家を出て一人暮らしを始める",
        desc: "自分のペースで暮らせる。家賃と生活費が全部かかる。",
        apply: (l) => {
          l.home = "rent";
          l.logPre("life", later ? "貯めたお金で実家を出て、一人暮らしを始めた。" : "実家を出て一人暮らしを始めた。", undefined, true);
        },
      },
      {
        id: "stay",
        label: later ? "もうしばらく実家にいる" : "実家から通ってお金を貯める",
        desc: "家にお金を入れても、家賃より安く済んで貯金しやすい。親の老いや介護が身近になる。",
        apply: (l, r: Rng) => {
          l.leaveAskAfter = l.age + r.int(2, 4);
          l.logPre("life", later ? "もうしばらく実家で暮らすことにした。" : "実家から仕事に通い、毎月家にお金を入れることにした。");
        },
      },
    ],
  };
}

/** 自分の子どもが巣立つ年齢になったとき */
export function kidLeaveScene(l: Life, idx: number): Scene {
  const k = l.kids[idx];
  const word = k.univ ? "大学を卒業して働きはじめた" : "高校を出て働きはじめた";
  return {
    id: "kidLeave",
    title: "子どもの巣立ち",
    situation: `子どもが${word}。これからどこで暮らす？`,
    options: [
      {
        id: "leave",
        label: "一人立ちを見送る",
        desc: "子どもは自分の力で暮らしはじめる。家計は軽くなる。",
        apply: (l) => {
          k.leftAge = l.age;
          l.logPre("family", "子どもが家を出て、一人立ちした。", undefined, true);
        },
      },
      {
        id: "stay",
        label: "実家から通ってもらう",
        desc: "子どもは貯金しやすく、家にもお金を入れてくれる。暮らしの費用はそのぶんかかる。",
        apply: (l) => {
          k.stayHome = true;
          l.logPre("family", "子どもは実家から仕事に通い、家にお金を入れてくれることになった。");
        },
      },
      {
        id: "help",
        label: "引っ越しと当面の生活費を出してあげる",
        desc: "子どもは安心して一人立ちできる。まとまったお金がかかる。",
        apply: (l) => {
          const c = l.y(500_000);
          l.spend("kids", c);
          k.leftAge = l.age;
          l.logPre("family", "引っ越しと当面の生活費を出して、子どもの一人立ちを支えた。", -c, true);
        },
      },
    ],
  };
}
