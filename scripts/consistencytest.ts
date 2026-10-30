// 食い違いのテスト：いろいろな国の人生を動かし、出来事・選択の場面・家族の声が、その時の状況と食い違っていないかを調べる。
// （持っていない車の「買い替え」、家にいない子どもの「巣立ち」、持ち家なのに「大家」、亡くなった親の話 など）
// 使い方: npx tsx scripts/consistencytest.ts [人数=800]
import { Life } from "../src/engine/sim";
import { Rng, hashStr } from "../src/engine/rng";
import { COUNTRIES, countryData } from "../src/engine/world";
import { kidShownHome } from "../src/engine/home";
import { snap, voicesFor, type Snap } from "../src/engine/voices";
import type { Choice } from "../src/engine/types";

const N = Number(process.argv[2] ?? 800);
const problems = new Map<string, string[]>();
const add = (rule: string, detail: string) => {
  if (!problems.has(rule)) problems.set(rule, []);
  problems.get(rule)!.push(detail);
};

const kidsHome = (l: Life) => l.kids.filter((k) => kidShownHome(l, k, l.age)).length;
const partnerAlive = (l: Life) => !!l.partner?.alive;
const parentAlive = (l: Life) => l.parents.some((p) => p.alive);
const working = (l: Life) => l.job !== "none" && l.job !== "retired";

/** 選択の場面が、その時の状況と食い違っていないか */
function checkChoice(l: Life, c: Choice): void {
  const where = `${l.seed} ${l.D.nameJa} ${l.age}歳「${c.title}」`;
  const text = c.title + c.situation;
  if (c.title === "子どもの巣立ち" && kidsHome(l) === 0) add("家にいない子どもの巣立ち", where);
  if (/子ども/.test(text) && l.kids.length === 0 && c.title !== "そろそろ子どものこと" && !/子どものころ|子どもを|子どもは|子どもが欲し|子どもの予定|子どもを持|授か|不妊|生まれ/.test(text) && l.age >= 20) add("子どもがいないのに子どもの話", `${where} ${c.situation}`);
  if (/大家|家賃/.test(text) && !/子ども|電話/.test(text) && l.home === "own") add("持ち家なのに家賃・大家の話", where);
  if (/住宅ローン/.test(text) && !(l.home === "own" && l.loan > 0)) add("住宅ローンがないのにローンの話", where);
  if (/(^|[^親])親(が|に|の|から)/.test(text) && !/親戚|親族|親友|親子|他界/.test(text) && !parentAlive(l) && l.age >= 18) add("親が亡くなっているのに親の話", `${where} ${c.situation}`);
  if (/残業|転勤|ボーナス|職場|勤め先|上司/.test(text) && !working(l)) add("働いていないのに職場の話", where);
  if (/夫婦|配偶者|パートナー/.test(text.replace(/子ども夫婦/g, "")) && !partnerAlive(l) && !/結婚|出会|恋人|別れ|亡く|離婚|再婚|一人|独り/.test(text)) add("パートナーがいないのに夫婦の話", `${where} ${c.situation}`);
  if (c.title === "車の買い替え" && l.carSince < 0) add("車がないのに車の買い替え", where);
  if (/合格通知|入試|試験の結果|点数/.test(text) && l.school === "done" && l.age < 25) add("学校を出たのに入試の話", where);
  if (!c.options.length) add("選択肢が空", where);
}

for (let i = 0; i < N; i++) {
  const c = COUNTRIES[i % COUNTRIES.length];
  const iso = i % 4 === 0 ? "JPN" : c.iso3;
  const l = new Life(`ct${i}`, countryData(iso), iso === "JPN" ? "j" : "w");
  let prev: Snap | null = null;
  let carBought = false;
  let g = 0;
  while (!l.dead && g++ < 800) {
    if (l.pending) {
      checkChoice(l, l.pending);
      const r = new Rng(hashStr(`${l.seed}|${l.pending.id}|${l.age}`));
      l.choose(r.pick(l.pending.options).id);
      continue;
    }
    const wasWorking = working(l);
    const rec = l.advance();
    if (!rec) continue;
    const where = `${l.seed} ${l.D.nameJa} ${rec.age}歳`;
    for (const e of rec.events) {
      if (e.age > l.age) add("亡くなったあとの出来事", `${where} ${e.text}`);
      if (/車を買った|中古車を買った|新車を買った/.test(e.text)) carBought = true;
      if (/(車|新車|中古車)に?を?買い替え/.test(e.text) && !carBought) add("車がないのに車の買い替え", `${where} ${e.text}`);
      if (/家賃|大家/.test(e.text) && l.home === "own" && !/売|引っ越|移/.test(e.text)) add("持ち家なのに家賃・大家の話", `${where} ${e.text}`);
      if (/通勤|休んでいる間|か月休み/.test(e.text) && !wasWorking && !working(l) && !rec.events.some((x) => /仕事を辞め|働きはじめ|就職|採用/.test(x.text))) add("働いていないのに仕事を休む話", `${where} ${e.text}`);
      if (/一人で子どもを育てる/.test(e.text) && !l.kids.some((k) => rec.age - k.born < 18)) add("子どもがいないのにひとり親の話", `${where} ${e.text}`);
    }
    // 家族の声
    for (const v of voicesFor(l, prev, rec)) {
      const w = `${where} ${v.who}「${v.text}」`;
      if ((v.who === "夫" || v.who === "妻") && !partnerAlive(l)) add("いないパートナーの声", w);
      if ((v.who === "父" && !l.parents[0].alive) || (v.who === "母" && !l.parents[1].alive)) add("亡くなった親の声", w);
      if (/^[長次三四五末][男女]$/.test(v.who) && v.text !== "今までありがとう。たまに帰るね。" && v.text !== "部屋、そのままにしておいてね。" && kidsHome(l) === 0) add("家にいない子どもの声", w);
    }
    prev = snap(l);
    // 家族の表示
    const hh = l.household.join("・");
    if (partnerAlive(l) !== /夫|妻/.test(hh)) add("家族の表示とパートナーが合わない", `${where} ${hh}`);
    if ((kidsHome(l) > 0) !== /子ども/.test(hh)) add("家族の表示と子どもが合わない", `${where} ${hh}`);
  }
}

if (!problems.size) {
  console.log(`✔ ${N}人の人生で、食い違いはなし`);
  process.exit(0);
}
for (const [rule, list] of problems) {
  console.log(`✖ ${rule}：${list.length}件`);
  for (const x of list.slice(0, 4)) console.log(`   ${x}`);
}
process.exit(1);
