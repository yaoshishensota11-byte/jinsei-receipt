// 小さな選択（1〜3年に1回、5秒で選べる2択）。
// どれも得と損の両方が起こりうるようにし、結果はその場で一言返す。
import type { Rng } from "./rng";
import { kidFemale, type Life } from "./sim";
import { riskOf } from "./risks";

export interface MicroOption {
  id: string;
  label: string;
  desc: string;
  /** この条件のときだけ出す選択肢 */
  when?: (l: Life) => boolean;
  apply: (l: Life, r: Rng) => void;
}
export interface Micro {
  id: string;
  min: number;
  max: number;
  when?: (l: Life) => boolean;
  /** 10年空ければ、もう一度出てよい */
  repeat?: boolean;
  title: string;
  situation: (l: Life) => string;
  options: MicroOption[];
}

/** 乱数の流れを変えずに、シードから文の言い回しを選ぶ */
function hashPick(key: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return (h >>> 0) % Math.max(1, n);
}

const working = (l: Life) => l.job !== "none" && l.job !== "retired" && l.school === "done";
/** パートナーも子どももいない */
const alone = (l: Life) => !(l.partner && l.partner.alive) && l.kids.length === 0;
const company = (l: Life) => l.job === "big" || l.job === "sme" || l.job === "civil";
const poorCountry = (l: Life) => l.D.inst !== null && (l.D.inst.incomeGroup === "LIC" || l.D.inst.incomeGroup === "LMC");
const hasKids = (l: Life) => l.kids.some((k) => l.age - k.born < 18);
const parentsAlive = (l: Life) => l.parents.some((p) => p.alive);

export const MICROS: Micro[] = [
  // ── 子ども時代（6〜14歳）
  {
    id: "study",
    min: 7,
    max: 11,
    title: "放課後の過ごし方",
    situation: () => "友だちに遊びに誘われた。宿題はまだ終わっていない。",
    options: [
      { id: "a", label: "宿題を先にやる", desc: "勉強の力がつく。誘いを断ることになる。", apply: (l) => { l.aptitude = Math.min(1, l.aptitude + 0.05); l.logPre("school", "宿題を終わらせてから遊んだ。勉強が少し得意になった。"); } },
      { id: "b", label: "遊びに行く", desc: "友だちが増える。勉強は少し遅れる。", apply: (l) => { l.aptitude = Math.max(0, l.aptitude - 0.02); l.social += 0.08; l.logPre("life", "日が暮れるまで遊んだ。友だちが増えた。"); } },
    ],
  },
  {
    id: "otoshidama",
    min: 6,
    max: 12,
    title: "もらったお小遣い",
    situation: (l) => `親戚から${l.D.fmt(l.y(10_000), false)}のお小遣いをもらった。`,
    options: [
      { id: "a", label: "貯金箱に入れる", desc: "少しずつ貯まる。欲しい物はがまん。", apply: (l) => { l.addIncome("windfall", l.y(10_000)); l.thrift *= 0.98; l.logPre("money", "貯金箱に入れた。お金を貯めるくせがついた。", l.y(10_000)); } },
      { id: "b", label: "欲しかった物を買う", desc: "今すぐうれしい。手元には残らない。", apply: (l) => { l.logPre("life", "ずっと欲しかった物を買った。"); } },
    ],
  },
  {
    id: "help",
    min: 9,
    max: 14,
    when: poorCountry,
    title: "家の手伝い",
    situation: () => "家計が苦しく、親が仕事を手伝ってほしいと言っている。",
    options: [
      { id: "a", label: "放課後に手伝う", desc: "家計が助かる。勉強の時間は減る。", apply: (l) => { l.aptitude = Math.max(0, l.aptitude - 0.06); l.familyHelped = true; l.logPre("family", "放課後は家の仕事を手伝った。親に感謝された。"); } },
      { id: "b", label: "勉強を続けたいと伝える", desc: "学校に集中できる。家は少し苦しくなる。", apply: (l) => { l.aptitude = Math.min(1, l.aptitude + 0.04); l.logPre("school", "勉強を続けたいと伝え、親は折れてくれた。"); } },
    ],
  },
  {
    id: "club",
    min: 12,
    max: 14,
    title: "部活動",
    situation: () => "中学で入る部活を決める日。",
    options: [
      { id: "a", label: "運動部に入る", desc: "体が丈夫になる。勉強の時間は減る。", apply: (l) => { l.illMult *= 0.94; l.aptitude = Math.max(0, l.aptitude - 0.02); l.logPre("school", "運動部に入った。毎日へとへとだが体力がついた。"); } },
      { id: "b", label: "勉強に集中する", desc: "成績が上がりやすい。体力はつかない。", apply: (l) => { l.aptitude = Math.min(1, l.aptitude + 0.05); l.logPre("school", "部活には入らず、勉強に集中した。"); } },
    ],
  },
  {
    id: "phone",
    min: 13,
    max: 16,
    title: "はじめてのスマホ",
    situation: () => "周りはみんなスマホを持っている。",
    options: [
      { id: "a", label: "親にねだる", desc: "友だちとつながれる。夜ふかしが増えるかも。", apply: (l, r) => { if (r.chance(0.4)) { l.aptitude = Math.max(0, l.aptitude - 0.04); l.logPre("life", "スマホを買ってもらった。夜ふかしが増え、成績が少し落ちた。"); } else { l.social += 0.05; l.logPre("life", "スマホを買ってもらった。友だちとのやりとりが増えた。"); } } },
      { id: "b", label: "高校まで待つ", desc: "勉強に集中できる。話題についていけないことも。", apply: (l) => { l.aptitude = Math.min(1, l.aptitude + 0.02); l.logPre("life", "スマホはもう少し待つことにした。"); } },
    ],
  },
  // ── 10代後半〜20代
  {
    id: "parttime",
    min: 16,
    max: 21,
    when: (l) => l.school !== "done" && l.school !== "child",
    title: "アルバイト",
    situation: () => "近所の店でアルバイトを募集している。",
    options: [
      { id: "a", label: "週4で働く", desc: "お金が貯まる。勉強の時間が減る。", apply: (l) => { l.addIncome("salary", l.y(400_000)); l.aptitude = Math.max(0, l.aptitude - 0.04); l.logPre("work", "アルバイトを始めた。自分で稼ぐ楽しさを知った。", l.y(400_000)); } },
      { id: "b", label: "学業を優先する", desc: "成績が安定する。お金はない。", apply: (l) => { l.aptitude = Math.min(1, l.aptitude + 0.03); l.logPre("school", "アルバイトはせず、学業に集中した。"); } },
    ],
  },
  {
    id: "credit",
    min: 19,
    max: 30,
    when: working,
    title: "欲しかった物",
    situation: (l) => `欲しかった物が${l.D.fmt(l.y(250_000), false)}。分割払いなら今すぐ買える。`,
    options: [
      { id: "a", label: "分割で今すぐ買う", desc: "すぐ手に入る。利息が高くつく。", apply: (l) => { l.spend("fun", l.y(330_000)); l.logPre("money", "分割払いで買った。利息を含めると思ったより高くついた。", -l.y(330_000)); } },
      { id: "b", label: "お金を貯めてから買う", desc: "利息はかからない。手に入るのは1年後。", apply: (l) => { l.spend("fun", l.y(250_000)); l.thrift *= 0.98; l.logPre("money", "1年かけて貯めてから買った。", -l.y(250_000)); } },
    ],
  },
  {
    id: "migrate",
    min: 20,
    max: 40,
    when: (l) => poorCountry(l) && working(l) && !l.abroad,
    title: "海外への出稼ぎ",
    situation: () => "知り合いが、中東の建設現場や外国の工場での仕事を紹介すると言う。",
    options: [
      { id: "a", label: "海外に働きに出る", desc: "収入が数倍になる。家族と離れ、仲介料や契約トラブルの危険も。", apply: (l, r) => {
        const fee = l.y(300_000);
        l.spend("other", fee);
        if (r.chance(0.18)) { l.logPre("work", "仲介業者に手数料だけ取られ、仕事は紹介されなかった。", -fee, true); return; }
        l.abroadUntil = l.age + r.int(3, 8);
        l.abroad = true;
        l.logPre("work", "海外へ出稼ぎに出た。給料の多くを家族に送った。", -fee, true);
      } },
      { id: "b", label: "地元に残る", desc: "家族と暮らせる。収入は今のまま。", apply: (l) => { l.social += 0.05; l.logPre("family", "地元に残り、家族と暮らすことにした。"); } },
    ],
  },
  {
    id: "livestock",
    min: 22,
    max: 55,
    when: (l) => poorCountry(l) && !l.region.urban,
    title: "家畜を買う",
    situation: (l) => `貯めたお金で牛を1頭買えそうだ（${l.D.fmt(l.y(250_000))}）。`,
    options: [
      { id: "a", label: "牛を買う", desc: "乳や子牛で収入が増える。病気で失うこともある。", apply: (l, r) => {
        l.spend("other", l.y(250_000));
        if (r.chance(0.2)) l.logPre("money", "牛を買ったが、病気で死んでしまった。", -l.y(250_000), true);
        else { l.sideIncome += l.y(90_000); l.logPre("money", "牛を買った。乳を売って少しずつ稼げるようになった。", -l.y(250_000)); }
      } },
      { id: "b", label: "現金で持っておく", desc: "いざという時に使える。増えはしない。", apply: (l) => { l.logPre("money", "お金は手元に残しておいた。"); } },
    ],
  },
  {
    id: "dollar",
    min: 22,
    max: 70,
    when: (l) => !l.protectCash && l.cash > l.y(300_000) && (riskOf(l.D.iso3).inflationMean > 0.08 || l.lastInflation > 0.15),
    title: "貯金をどう持つか",
    situation: () => "物価が上がり続けている。周りではドルや金で貯める人が増えてきた。",
    options: [
      { id: "a", label: "ドルや金に替えておく", desc: "通貨が下がっても守られやすい。両替の手数料がかかり、すぐには使いにくい。", apply: (l) => { const fee = l.cash * 0.04; l.spend("other", fee); l.protectCash = true; l.logPre("money", "貯金の多くをドルと金に替えた。", -fee); } },
      { id: "b", label: "現地のお金のまま持つ", desc: "手数料がかからず、すぐ使える。物価が上がると目減りする。", apply: (l) => { l.logPre("money", "貯金はそのまま銀行に置いておいた。"); } },
    ],
  },
  {
    id: "friendWedding",
    repeat: true,
    min: 23,
    max: 35,
    title: "友人の結婚式",
    situation: (l) => `友人から結婚式の招待状が届いた。ご祝儀と移動で${l.D.fmt(l.y(50_000), false)}ほどかかる。`,
    options: [
      { id: "a", label: "出席する", desc: "出費は痛い。新しい出会いがあるかも。", apply: (l) => { l.spend("events", l.y(50_000)); l.social += 0.1; l.logPre("life", "友人の結婚式に出席した。久しぶりの仲間と盛り上がった。", -l.y(50_000)); } },
      { id: "b", label: "お祝いだけ送る", desc: "安く済む。少し気まずい。", apply: (l) => { l.spend("events", l.y(10_000)); l.logPre("life", "お祝いの品だけ送った。", -l.y(10_000)); } },
    ],
  },
  {
    id: "gym",
    repeat: true,
    min: 25,
    max: 55,
    when: working,
    title: "健康づくり",
    situation: () => "健康診断で「運動不足」と書かれた。",
    options: [
      { id: "a", label: "ジムに通う", desc: "毎月の会費がかかる。病気になりにくくなる。", apply: (l, r) => { l.gymUntil = l.age + 10; if (r.chance(0.35)) { l.logPre("health", "ジムに入会したが、3か月で行かなくなった。"); l.gymUntil = l.age + 1; } else { l.illMult *= 0.9; l.logPre("health", "ジムに通いはじめた。体が軽くなった。"); } } },
      { id: "b", label: "今のままでいい", desc: "お金はかからない。体は少しずつ衰える。", apply: (l) => { l.illMult *= 1.03; l.logPre("health", "忙しさを理由に、運動は先送りにした。"); } },
    ],
  },
  {
    id: "insurance",
    min: 25,
    max: 50,
    when: working,
    title: "医療保険の勧誘",
    situation: (l) => `保険の営業が来た。月${l.D.fmt(l.y(5_000), false)}で入院や手術に備えられるという。`,
    options: [
      { id: "a", label: "加入する", desc: "大きな病気のときに助かる。何もなければ払い損。", apply: (l) => { l.insured = true; l.logPre("money", "医療保険に入った。"); } },
      { id: "b", label: "貯金で備える", desc: "毎月の出費はない。大病のときは重い。", apply: (l) => { l.logPre("money", "保険には入らず、貯金で備えることにした。"); } },
    ],
  },
  {
    id: "bonus",
    repeat: true,
    min: 24,
    max: 58,
    when: company,
    title: "ボーナスの使い道",
    situation: (l) => `ボーナスが${l.D.fmt(l.salaryOf(l.age) * 0.12, false)}出た。`,
    options: [
      { id: "a", label: "旅行に行く", desc: "一生の思い出。貯金は増えない。", apply: (l) => { const c = l.salaryOf(l.age) * 0.1; l.spend("fun", c); l.logPre("life", "思い切って旅行に出た。忘れられない景色を見た。", -c); } },
      { id: "b", label: "全部貯金する", desc: "いざという時に強い。少し味気ない。", apply: (l) => { l.logPre("money", "ボーナスは全部貯金に回した。"); } },
      { id: "c", label: "投資に回す", desc: "増えるかもしれない。減るかもしれない。", apply: (l) => { const c = Math.max(0, Math.min(l.cash, l.salaryOf(l.age) * 0.1)); l.cash -= c; l.invest += c; l.logPre("money", "ボーナスを投資に回した。"); } },
    ],
  },
  {
    id: "side",
    repeat: true,
    min: 24,
    max: 50,
    when: working,
    title: "副業の誘い",
    situation: () => "SNSで「スキマ時間で稼げる」副業の話が回ってきた。",
    options: [
      { id: "a", label: "やってみる", desc: "収入が増えるかも。怪しい話のこともある。", apply: (l, r) => {
        const x = r.next();
        if (x < 0.25) { const c = l.y(200_000); l.spend("other", c); l.logPre("money", "「初期費用」を払ったが、連絡が取れなくなった。", -c, true); }
        else if (x < 0.75) { l.sideIncome += l.y(250_000); l.logPre("work", "副業を始めた。休日が減ったが、少し稼げるようになった。"); }
        else { l.logPre("work", "やってみたが、時間のわりに稼げずやめた。"); }
      } },
      { id: "b", label: "断る", desc: "時間を守れる。収入は今のまま。", apply: (l) => { l.logPre("life", "副業の話は断った。"); } },
    ],
  },
  {
    id: "overtime",
    repeat: true,
    min: 25,
    max: 55,
    when: company,
    title: "残業",
    situation: () => "大きな案件で人手が足りない。残業を頼まれた。",
    options: [
      { id: "a", label: "引き受ける", desc: "残業代と評価が上がる。体を壊すことも。", apply: (l, r) => { l.careerMult *= 1.04; l.addIncome("salary", l.salaryOf(l.age) * 0.06); if (r.chance(0.2)) { l.illMult *= 1.12; l.logPre("health", "残業続きで体調を崩した。", undefined, true); } else l.logPre("work", "残業を引き受け、案件をやり遂げた。評価が上がった。"); } },
      { id: "b", label: "定時で帰る", desc: "家族や体を守れる。評価は上がりにくい。", apply: (l) => { l.social += 0.03; l.logPre("life", "定時で帰った。家族との時間を大事にした。"); } },
    ],
  },
  {
    id: "transfer",
    min: 28,
    max: 52,
    when: (l) => l.job === "big" || l.job === "civil",
    title: "転勤の辞令",
    situation: () => "遠くの支店への転勤を打診された。",
    options: [
      { id: "a", label: "受ける", desc: "出世の道が開ける。引っ越し代と家族の負担。", apply: (l) => { l.careerMult *= 1.06; l.spend("other", l.y(300_000)); l.logPre("work", "転勤を受けた。知らない町での暮らしが始まった。", -l.y(300_000)); } },
      { id: "b", label: "断る", desc: "今の暮らしを守れる。出世は遠のく。", apply: (l) => { l.careerMult *= 0.97; l.logPre("work", "転勤は断った。上司の視線が少し冷たくなった。"); } },
    ],
  },
  {
    id: "cram",
    min: 30,
    max: 60,
    when: hasKids,
    title: "子どもの塾",
    situation: () => "子どもが「友だちと同じ塾に行きたい」と言っている。",
    options: [
      { id: "a", label: "通わせる", desc: "進学に有利。毎年の出費が増える。", apply: (l) => { l.cramUntil = l.age + 4; const k = l.kids.find((x) => l.age - x.born < 18); if (k) k.univ = true; l.logPre("family", "子どもを塾に通わせた。家計は少し苦しくなった。"); } },
      { id: "b", label: "家で教える", desc: "お金はかからない。親の時間がとられる。", apply: (l) => { l.logPre("family", "夜は子どもの勉強を見てやることにした。"); } },
    ],
  },
  {
    id: "crypto",
    repeat: true,
    min: 25,
    max: 60,
    when: (l) => l.cash > l.y(1_000_000),
    title: "話題の暗号資産",
    situation: () => "同僚が暗号資産で大きく儲けたらしい。",
    options: [
      { id: "a", label: "少し買ってみる", desc: "何倍にもなるかも。半分以下になるかも。", apply: (l, r) => {
        const c = Math.min(l.cash * 0.2, l.y(1_000_000));
        const m = r.chance(0.08) ? r.range(4, 12) : r.chance(0.45) ? r.range(1, 2.2) : r.range(0.1, 0.8);
        const g = c * (m - 1);
        if (g >= 0) l.addIncome("invest", g); else l.spend("other", -g);
        l.logPre("money", m >= 1 ? `買った暗号資産が値上がりした（${m.toFixed(1)}倍）。` : "買った暗号資産が暴落した。", g, Math.abs(g) > l.y(1_000_000));
      } },
      { id: "b", label: "見送る", desc: "損はしない。儲けもない。", apply: (l) => { l.logPre("money", "暗号資産には手を出さなかった。"); } },
    ],
  },
  {
    id: "lendParent",
    min: 30,
    max: 60,
    when: parentsAlive,
    title: "親からの相談",
    situation: (l) => `親から「家の修理代が足りない」と${l.D.fmt(l.y(800_000), false)}を頼まれた。`,
    options: [
      { id: "a", label: "出してあげる", desc: "親は助かる。お金は戻らないかもしれない。", apply: (l, r) => { l.spend("events", l.y(800_000)); l.parentDebt = r.chance(0.4); l.logPre("family", "親に修理代を渡した。とても喜ばれた。", -l.y(800_000)); } },
      { id: "c", label: "今は出せないと断る", desc: "自分の家計を守れる。親は困るかもしれない。", apply: (l) => { l.logPre("family", "今は余裕がないと伝えた。親は黙ってうなずいた。"); } },
      { id: "b", label: "きょうだいと相談する", when: (l) => l.siblingsNow > 0, desc: "負担を分けられる。話がこじれることも。", apply: (l, r) => { l.spend("events", l.y(800_000) / (l.siblings + 1)); l.logPre("family", r.chance(0.3) ? "きょうだいと揉めたが、何とか分担した。" : "きょうだいで分担して出した。", -l.y(800_000) / (l.siblings + 1)); } },
    ],
  },
  {
    id: "renovate",
    min: 40,
    max: 70,
    when: (l) => l.home === "own",
    title: "家の修繕",
    situation: () => "外壁にひびが入り、屋根も古くなってきた。",
    options: [
      { id: "a", label: "今のうちに直す", desc: "まとまった出費。家が長持ちする。", apply: (l) => { const c = l.y(1_500_000); l.spend("housing", c); l.boughtAge += 8; l.logPre("money", "家を修繕した。見違えるようにきれいになった。", -c); } },
      { id: "b", label: "まだ様子を見る", desc: "今は払わずに済む。あとで高くつくことも。", apply: (l) => { l.repairLater = true; l.logPre("money", "修繕は先送りにした。"); } },
    ],
  },
  {
    id: "carUpgrade",
    repeat: true,
    min: 30,
    max: 65,
    when: (l) => working(l) && (l.D.k > 0.25 || l.region.urban === true),
    title: "車の買い替え",
    situation: () => "車が古くなってきた。新車のカタログを見ている。",
    options: [
      { id: "a", label: "新車を買う", desc: "快適で安全。大きな出費。", apply: (l) => { const c = l.y(2_800_000); l.spend("car", c); l.logPre("money", "新車に買い替えた。", -c); } },
      { id: "b", label: "乗りつぶす", desc: "お金が浮く。故障の修理代がかかるかも。", apply: (l, r) => { if (r.chance(0.4)) { l.spend("car", l.y(250_000)); l.logPre("money", "古い車が故障し、修理代がかかった。", -l.y(250_000)); } else l.logPre("money", "古い車を大事に乗り続けた。"); } },
    ],
  },
  {
    id: "dock",
    repeat: true,
    min: 40,
    max: 80,
    title: "精密検査",
    situation: (l) => `精密検査（${l.D.fmt(l.y(40_000), false)}）を受けるか迷っている。`,
    options: [
      { id: "a", label: "受ける", desc: "病気を早く見つけられる。費用がかかる。", apply: (l, r) => { l.spend("medical", l.y(40_000)); l.earlyCheckUntil = l.age + 5; if (r.chance(0.08)) { l.illMult *= 0.92; l.logPre("health", "検査で小さな異常が見つかり、早めに治療できた。", -l.y(40_000), true); } else l.logPre("health", "検査を受けた。異常はなかった。", -l.y(40_000)); } },
      { id: "b", label: "受けない", desc: "お金と時間が浮く。見逃すかもしれない。", apply: (l) => { l.logPre("health", "検査は受けなかった。"); } },
    ],
  },
  {
    id: "scamCall",
    min: 60,
    max: 90,
    when: (l) => l.kids.length > 0,
    title: "知らない番号からの電話",
    situation: (l) =>
      [
        "「息子だけど、会社のお金をなくして…今日中に必要なんだ」と、知らない番号から電話がかかってきた。",
        `「${l.sex === "female" ? "お母さん" : "お父さん"}？ 私。スマホが壊れて友だちの電話から…家賃が払えなくて」と電話がかかってきた。`,
        "「事故を起こしてしまって、示談金がすぐ要るんだ」と、泣きそうな声で電話がかかってきた。",
      ][hashPick(l.seed + "call" + l.age, 3)],
    // 詐欺がほとんどだが、本当に困った子どもからの電話のこともある
    options: [
      {
        id: "a",
        label: "家族に確認してから",
        desc: "落ち着いて確かめる。本当に困っていたら、遅れるかもしれない。",
        apply: (l, r) => {
          if (r.chance(0.8)) l.logPre("life", "家族に確認すると、まったくの作り話だった。詐欺の電話だった。");
          else {
            const c = Math.min(Math.max(0, l.cash) * 0.3, l.y(300_000));
            if (c > 0) l.spend("kids", c);
            l.logPre("family", c > 0 ? "確かめると、本当に子どもが困っていた。必要な分だけ送った。" : "確かめると、本当に子どもが困っていた。送れるお金はなく、話を聞くことしかできなかった。", c > 0 ? -c : undefined, true);
          }
        },
      },
      {
        id: "b",
        label: "急いでお金を用意する",
        desc: "本当なら助けになる。だまされることも。",
        apply: (l, r) => {
          if (r.chance(0.8)) {
            const c = Math.min(Math.max(0, l.cash), l.y(2_000_000));
            if (c > 0) {
              l.spend("other", c);
              l.logPre("money", "電話は詐欺だった。渡したお金は戻らなかった。", -c, true);
            } else l.logPre("money", "用意できるお金がなく、渡さずに済んだ。あとで詐欺の電話だったと分かった。");
          } else {
            const c = Math.min(Math.max(0, l.cash) * 0.5, l.y(500_000));
            if (c > 0) l.spend("kids", c);
            l.logPre("family", c > 0 ? "本当に困っていた子どもを、急いで助けることができた。" : "本当に困っていた子どもだったが、用意できるお金がなかった。", c > 0 ? -c : undefined, true);
          }
        },
      },
    ],
  },
  {
    id: "kidLoan",
    min: 48,
    max: 85,
    repeat: true,
    when: (l) => l.kids.some((k) => l.age - k.born >= 22),
    title: "子どもからの電話",
    situation: (l) => {
      const grown = l.kids.map((k, i) => ({ i, age: l.age - k.born })).filter((k) => k.age >= 22);
      const k = grown[hashPick(l.seed + "loanKid" + l.age, grown.length)];
      const who = kidFemale(l.seed, k.i) ? "娘" : "息子";
      const why = ["仕事を失って、家賃が払えない", "子どもが入院して、お金が足りない", "始めた店の資金が足りない"][hashPick(l.seed + "loanWhy" + l.age, 3)];
      return `${who}（${k.age}歳）から電話があった。「${why}。少しだけお金を貸してほしい」`;
    },
    options: [
      {
        id: "a",
        label: "お金を貸す",
        desc: "子どもは助かる。返ってくるかは分からない。",
        apply: (l, r) => {
          const c = Math.min(Math.max(0, l.cash) * 0.3, l.y(1_000_000));
          if (c <= 0) {
            l.logPre("family", "貸せるお金がなく、気持ちだけ伝えた。");
            return;
          }
          l.spend("kids", c);
          if (r.chance(0.45)) {
            l.addIncome("windfall", c * 0.7);
            l.logPre("family", "子どもにお金を貸した。何年かかけて、少しずつ返してくれた。", -c * 0.3, true);
          } else l.logPre("family", "子どもにお金を貸した。返ってはこなかったが、子どもは立ち直った。", -c, true);
        },
      },
      {
        id: "b",
        label: "事情を話して断る",
        desc: "自分の老後のお金を守れる。子どもとの間に気まずさが残るかも。",
        apply: (l, r) => {
          l.logPre("family", r.chance(0.5) ? "自分たちの老後もあると話して、断った。子どもは自分でなんとかした。" : "断ったあと、しばらく子どもからの電話が減った。");
        },
      },
    ],
  },
  {
    id: "grandkids",
    min: 55,
    max: 85,
    when: (l) => l.kids.some((k) => l.age - k.born >= 25),
    title: "孫への援助",
    situation: () => "子ども夫婦が家を買うらしい。援助してほしそうだ。",
    options: [
      { id: "a", label: "まとまった額を援助する", desc: "子どもは助かる。自分の老後資金が減る。", apply: (l) => { const c = Math.min(Math.max(0, l.cash) * 0.3, l.y(3_000_000)); l.spend("kids", c); l.logPre("family", "子ども夫婦に住宅資金を援助した。", -c); } },
      { id: "b", label: "気持ちだけ渡す", desc: "老後資金を守れる。少し寂しがられる。", apply: (l) => { l.spend("kids", l.y(100_000)); l.logPre("family", "お祝いを渡した。", -l.y(100_000)); } },
    ],
  },
  {
    id: "oldTravel",
    min: 62,
    max: 80,
    when: (l) => l.cash + l.invest > l.y(5_000_000),
    title: "老後の旅",
    situation: () => "ずっと行きたかった遠くの国への旅行を考えている。",
    options: [
      { id: "a", label: "思い切って行く", desc: "一生に一度の旅。老後資金が減る。", apply: (l) => { const c = l.y(1_200_000); l.spend("fun", c); l.logPre("life", "念願の旅に出た。写真を見返すたびに笑顔になる。", -c, true); } },
      { id: "b", label: "近場で楽しむ", desc: "お金を守れる。少し心残り。", apply: (l) => { l.spend("fun", l.y(100_000)); l.logPre("life", "近くの温泉でのんびりした。", -l.y(100_000)); } },
    ],
  },
  {
    id: "endPlan",
    min: 65,
    max: 90,
    when: (l) => !alone(l),
    title: "人生のしまい方",
    situation: () => "友人の葬儀に出て、自分の最期のことを考えた。",
    options: [
      { id: "a", label: "葬儀やお墓を準備しておく", desc: "家族の負担が減る。今お金がかかる。", apply: (l) => { l.spend("events", l.y(500_000)); l.prepaidFuneral = true; l.logPre("life", "葬儀の準備と遺言を済ませた。", -l.y(500_000)); } },
      { id: "b", label: "まだ考えない", desc: "今は払わずに済む。家族があとで困るかも。", apply: (l) => { l.logPre("life", "まだ先のことだと、考えるのをやめた。"); } },
    ],
  },
  {
    id: "scamCallSolo",
    min: 60,
    max: 90,
    when: (l) => l.kids.length === 0,
    title: "知らない番号からの電話",
    situation: () => "「役所の者です。医療費の払い戻しがあるので、今からATMへ行ってください」と電話がかかってきた。",
    options: [
      { id: "a", label: "電話を切って役所に確かめる", desc: "落ち着いて確かめる。手間はかかる。", apply: (l) => { l.logPre("life", "役所に確かめると、そんな払い戻しはなかった。詐欺の電話だった。"); } },
      { id: "b", label: "言われたとおりATMへ行く", desc: "本当ならお金が戻る。だまされることも。", apply: (l, r) => { if (r.chance(0.9)) { const c = Math.min(Math.max(0, l.cash), l.y(1_000_000)); if (c > 0) { l.spend("other", c); l.logPre("money", "電話は詐欺だった。振り込んだお金は戻らなかった。", -c, true); } else l.logPre("money", "口座にお金がなく、振り込めなかった。あとで詐欺の電話だったと分かった。"); } else l.logPre("money", "本当に払い戻しの手続きだった。"); } },
    ],
  },
  {
    id: "endPlanSolo",
    min: 65,
    max: 90,
    when: (l) => alone(l),
    title: "人生のしまい方",
    situation: () => "ひとりで暮らしている。もしものとき、誰が後のことをしてくれるのか考えた。",
    options: [
      { id: "a", label: "葬儀や身の回りの整理を契約しておく", desc: "亡くなったあとの手続きを任せられる。今お金がかかる。", apply: (l) => { l.spend("events", l.y(500_000)); l.prepaidFuneral = true; l.logPre("life", "葬儀と身の回りの整理を、前もって契約しておいた。", -l.y(500_000)); } },
      { id: "b", label: "まだ考えない", desc: "今は払わずに済む。あとの手続きは周りの人が困るかも。", apply: (l) => { l.logPre("life", "まだ先のことだと、考えるのをやめた。"); } },
    ],
  },
  {
    id: "seniorWork",
    min: 66,
    max: 78,
    when: (l) => l.job === "retired" || l.job === "none",
    title: "近所の仕事",
    situation: () => "近所の人から「週に何日か手伝ってくれないか」と頼まれた。",
    options: [
      { id: "a", label: "引き受ける", desc: "少し稼げて、人とのつながりもできる。体は疲れる。", apply: (l) => { l.sideIncome += l.y(500_000); l.seniorWorkUntil = l.age + 5; l.logPre("work", "週3日、近所で働くことにした。", undefined); } },
      { id: "b", label: "のんびり過ごす", desc: "時間は自由。収入は増えない。", apply: (l) => { l.logPre("life", "のんびり過ごすことにした。"); } },
    ],
  },
];
