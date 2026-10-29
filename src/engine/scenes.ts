// 出来事のあとに差し込まれる選択場面（子どもを持つか、夫婦のすれ違い、家庭内の暴力 など）。
// 小さな選択（micro.ts）と違い、出来事がきっかけで必ず出る。結果は選択と運で決まり、正解はない。
import type { Rng } from "./rng";
import type { Life } from "./sim";

export interface SceneOption {
  id: string;
  label: string;
  desc: string;
  apply: (l: Life, r: Rng) => void;
}
export interface Scene {
  id: string;
  title: string;
  situation: string;
  options: SceneOption[];
  /** 順番待ちのあいだに状況が変わって、もう合わなくなったら出さない（例：入試の前に学校をやめた） */
  stillValid?: (l: Life) => boolean;
  /** 出す時点の状況で、説明の文を作り直すとき */
  situationOf?: (l: Life) => string;
}

/** 結婚した直後：子どもをどうするか */
export function kidsScene(l: Life): Scene {
  return {
    id: "kids",
    title: "子どものこと",
    situation: "結婚して、ふたりで将来の話をした。子どもはどうする？",
    options: [
      {
        id: "want",
        label: "子どもがほしい",
        desc: "家族がにぎやかになる。教育費や働き方の負担は大きい。",
        apply: (l, r) => {
          l.kidsPlan = "want";
          l.kidsFrom = l.age;
          // 望んでもすぐに授かるとは限らない
          l.infertile = r.chance(0.12);
          l.logPre("family", "子どもがほしいと、ふたりで決めた。");
        },
      },
      {
        id: "later",
        label: "しばらくは二人で",
        desc: "仕事や貯金に集中できる。先に延ばすほど授かりにくくなる。",
        apply: (l, r) => {
          l.kidsPlan = "later";
          l.kidsFrom = l.age + r.int(3, 5);
          l.logPre("family", "子どもはもう少し先にしようと決めた。");
        },
      },
      {
        id: "none",
        label: "子どもは持たない",
        desc: "時間とお金を自分たちのために使える。老後に頼れる家族は少なくなる。",
        apply: (l) => {
          l.kidsPlan = "none";
          l.logPre("family", "子どもは持たず、ふたりで生きていくと決めた。");
        },
      },
    ],
  };
}

/** 「しばらくは二人で」から数年たったとき */
export function kidsAgainScene(): Scene {
  return {
    id: "kidsAgain",
    title: "そろそろ子どものこと",
    situation: "結婚して数年。ふたりの暮らしも落ち着いてきた。",
    options: [
      {
        id: "now",
        label: "子どもを考えはじめる",
        desc: "家族が増えるかもしれない。年齢的に授かりにくいこともある。",
        apply: (l, r) => {
          l.kidsPlan = "want";
          l.kidsFrom = l.age;
          l.infertile = r.chance(0.18);
          l.logPre("family", "子どもを考えはじめた。");
        },
      },
      {
        id: "none",
        label: "やっぱり二人で生きる",
        desc: "今の暮らしを続けられる。あとで気持ちが変わることもある。",
        apply: (l) => {
          l.kidsPlan = "none";
          l.logPre("family", "子どもは持たないと決めた。");
        },
      },
    ],
  };
}

/** 子どもを望んで2年たっても授からないとき */
export function fertilityScene(l: Life): Scene {
  return {
    id: "fertility",
    title: "なかなか授からない",
    situation: `子どもを望んで2年。まだ授かっていない。不妊治療には${l.D.fmt(l.y(1_000_000), false)}ほどかかるという。`,
    options: [
      {
        id: "treat",
        label: "不妊治療を受ける",
        desc: "授かる可能性が上がる。費用と心身の負担がある。",
        apply: (l, r) => {
          l.spend("medical", l.y(1_000_000));
          if (r.chance(0.5)) {
            l.infertile = false;
            l.logPre("family", "治療を続け、妊娠がわかった。", -l.y(1_000_000), true);
          } else l.logPre("family", "治療を続けたが、授からなかった。", -l.y(1_000_000), true);
        },
      },
      {
        id: "wait",
        label: "自然に任せる",
        desc: "お金はかからない。授からないまま時間が過ぎるかもしれない。",
        apply: (l) => {
          l.naturalHope = true;
          l.logPre("family", "焦らず、自然に任せることにした。");
        },
      },
      {
        id: "stop",
        label: "ふたりで生きると決める",
        desc: "気持ちが楽になる。子どものいない人生を選ぶことになる。",
        apply: (l) => {
          l.kidsPlan = "none";
          l.logPre("family", "子どもを持たない人生を、ふたりで受け入れた。");
        },
      },
    ],
  };
}

/** 夫婦のすれ違い（離婚の前に、話し合いの場面をはさむ） */
export function strainScene(l: Life): Scene {
  const reasons = ["家事の分担", "お金の使い方", "仕事の忙しさ", "親との付き合い方", "子育ての方針"];
  const reason = l.kids.length ? reasons[(l.age + l.kids.length) % reasons.length] : reasons[l.age % 4];
  return {
    id: "strain",
    title: "夫婦のすれ違い",
    situation: `${reason}をめぐって、パートナーとの言い争いが増えてきた。`,
    options: [
      {
        id: "talk",
        label: "とことん話し合う",
        desc: "お金はかからない。うまくいくかは二人しだい。",
        apply: (l, r) => {
          if (r.chance(0.55)) {
            l.strained = false;
            l.logPre("family", "何度も話し合い、もう一度やり直すことにした。");
          } else {
            l.strained = true;
            l.logPre("family", "話し合ったが、わだかまりは残った。");
          }
        },
      },
      {
        id: "counsel",
        label: "夫婦カウンセリングに通う",
        desc: "専門家の助けで関係を立て直しやすい。費用がかかる。",
        apply: (l, r) => {
          l.spend("other", l.y(150_000));
          if (r.chance(0.7)) {
            l.strained = false;
            l.logPre("family", "カウンセリングに通い、お互いの気持ちがわかるようになった。", -l.y(150_000));
          } else {
            l.strained = true;
            l.logPre("family", "カウンセリングに通ったが、溝は埋まらなかった。", -l.y(150_000));
          }
        },
      },
      {
        id: "separate",
        label: "別れる",
        desc: "気持ちの区切りがつく。財産を分け、暮らしを立て直すことになる。",
        apply: (l, r) => {
          l.divorce(r, "話し合いの末、離婚した。財産は分け合った。");
        },
      },
    ],
  };
}

/** パートナーからの暴力（描写はせず、事実と選択だけを示す） */
export function dvScene(l: Life): Scene {
  const jp = l.D.isJapan;
  return {
    id: "dv",
    title: "パートナーの暴力",
    situation: `パートナーから暴力を受けるようになった。${jp ? "（相談先：DV相談ナビ #8008、DV相談＋ 0120-279-889）" : "地域には相談できる窓口や支援団体がある。"}`,
    options: [
      {
        id: "leave",
        label: "相談窓口の支援を受けて家を出る",
        desc: "安全を取り戻せる。引っ越しや生活の立て直しにお金がかかる。",
        apply: (l, r) => {
          l.spend("housing", l.y(500_000));
          l.divorce(r, "相談窓口の支援を受けて家を出た。その後、離婚した。", true);
          if (l.home === "own" || l.home === "parents") l.home = "rent";
        },
      },
      {
        id: "family",
        label: "家族や友人に相談する",
        desc: "身近な人の支えが得られる。状況が変わるとは限らない。",
        apply: (l, r) => {
          if (r.chance(0.45)) l.logPre("family", "家族が間に入り、暴力はおさまった。");
          else {
            l.dvOngoing = true;
            l.logPre("family", "家族に相談したが、状況はあまり変わらなかった。");
          }
        },
      },
      {
        id: "wait",
        label: "しばらく様子を見る",
        desc: "今の暮らしは変えずに済む。心と体への負担が続くかもしれない。",
        apply: (l) => {
          l.dvOngoing = true;
          l.logPre("health", "しばらく様子を見ることにした。眠れない夜が増えた。");
        },
      },
    ],
  };
}

/** 子どもに生まれ直した人：親が残した家に住むか、売るか */
export function heldHouseScene(l: Life): Scene {
  const atHome = l.home === "parents";
  const owns = l.home === "own";
  return {
    id: "heldHouse",
    title: "親が残した家",
    situation: `親が残した家（自分の分は${l.D.fmt(l.heldHouse)}）をどうする？`,
    options: [
      ...(owns
        ? []
        : [
            {
              id: "live",
              label: atHome ? "このまま住み続ける" : "実家に移って住む",
              desc: "家賃がかからない。古い家なので、修繕や税金のお金はかかる。",
              apply: (l: Life) => {
                l.moveIntoHeldHouse();
                l.logPre("life", atHome ? "親が残した家に、そのまま住み続けることにした。" : "親が残した家に移り住んだ。家賃がかからなくなった。", undefined, true);
              },
            },
          ]),
      {
        id: "sell",
        label: "売ってお金にする",
        desc: "まとまったお金が手に入る。住む場所は自分で用意する。",
        apply: (l: Life) => {
          const v = l.sellHeldHouse();
          if (l.home === "parents") l.home = "rent";
          l.logPre("money", l.siblings ? "親が残した家を売って、きょうだいで分けた。" : "親が残した家を売って、お金に換えた。", v, true);
        },
      },
    ],
  };
}
