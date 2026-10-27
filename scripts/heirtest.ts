// 子どもに生まれ直す（2・3代目）が、世界の全部の国で正しく入っているかを確かめる。
// 使い方: npx tsx scripts/heirtest.ts（1か国3家系ずつ。親の亡くなる年、遺産・借金・実家の額、URLからの再現、レシートの家系の行を見る）
import { Life, autoplayLife } from "../src/engine/sim";
import { COUNTRIES, pickCountry } from "../src/engine/world";
import { childOf, encodeResult, decodeResult, replayCode, buildReceipt } from "../src/engine/result";
const problems: string[] = [];
const rows: string[] = [];
let g2 = 0, g3 = 0, debts = 0, estates = 0, homes = 0, none = 0;
const ok = (n: number) => typeof n === "number" && isFinite(n);
for (const c of COUNTRIES) {
  let tried = 0, chains = 0, cDebt = 0, cEst = 0, n = 0;
  // 実際の遊び方と同じく、シードから「世界」で国が決まる人生だけを使う（URLから戻すときも同じ国になる）
  for (let i = 0; i < 3_000_000 && chains < 3 && tried < 400; i++) {
    const seed = `w${c.iso3.toLowerCase()}${i.toString(36)}`;
    const D = pickCountry(seed, "w");
    if (D.iso3 !== c.iso3) continue;
    tried++;
    const l1 = autoplayLife(new Life(seed, D, "w"));
    if (!l1.kids.length) continue;
    let cur = l1;
    for (const gen of [2, 3]) {
      if (!cur.kids.length) break;
      const idx = i % cur.kids.length;
      const ch = autoplayLife(childOf(cur, idx));
      const h = ch.heir!;
      gen === 2 ? g2++ : g3++;
      const evs = ch.records.flatMap((y) => y.events.map((e) => ({ age: y.age, t: e.text, a: e.amount })));
      const tag = `${c.iso3} ${gen}代目 seed=${ch.seed}`;
      // 前の代の自分が決まった年に亡くなるか
      const death = evs.find((e) => e.t.includes(`（${gen - 1}代目のあなた）が`));
      if (h.parentDies <= ch.age) {
        if (!death) problems.push(`${tag}: 親が亡くならない`);
        else if (death.age !== h.parentDies) problems.push(`${tag}: 親の亡くなる年が違う ${death.age}≠${h.parentDies}`);
      }
      // 遺産・借金の額
      const parentBal = cur.balance / Math.max(1, cur.kids.length);
      if (Math.abs(h.estate + h.homeShare - h.debt - parentBal) > 1) problems.push(`${tag}: 受け継ぐ額が親の残高と合わない`);
      if (h.parentDies <= ch.age) {
        const expected = h.debt > 0 ? -h.debt : h.homeShare > 0 && evs.some((e) => e.t === "住んでいた実家を受け継いだ。") ? h.estate : h.estate + h.homeShare;
        if (Math.abs(ch.inherited - expected) > 1) problems.push(`${tag}: 相続額が違う ${Math.round(ch.inherited)}≠${Math.round(expected)}`);
        if (h.debt > 0) { debts++; cDebt++; if (!evs.some((e) => e.t.includes("借金を引き継いだ") && Math.abs((e.a ?? 0) + h.debt) < 1)) problems.push(`${tag}: 借金の出来事がない`); }
        else if (h.estate > 0 || h.homeShare > 0) { estates++; cEst++; }
        else none++;
        if (h.homeShare > 0) homes++;
      }
      // 生まれ・家族
      if (ch.D.iso3 !== c.iso3) problems.push(`${tag}: 国が変わった`);
      if (ch.birthYear !== cur.birthYear + cur.kids[idx].born) problems.push(`${tag}: 生まれ年が違う`);
      if (ch.region.id !== cur.region.id) problems.push(`${tag}: 地域が違う`);
      // お金が壊れていない
      for (const y of ch.records) if (![y.balance, ...Object.values(y.income), ...Object.values(y.expense)].every((v) => ok(v as number))) { problems.push(`${tag}: ${y.age}歳で数値異常`); break; }
      // URLから戻れる・レシート
      const d = decodeResult(encodeResult(ch));
      const back = d && replayCode(d);
      if (!back || Math.round(back.balance) !== Math.round(ch.balance)) problems.push(`${tag}: URLから再現できない`);
      const rc = buildReceipt(ch);
      if (rc.lineage.length !== gen || rc.generation !== gen) problems.push(`${tag}: レシートの家系が違う`);
      if (h.parentDies <= ch.age && Math.abs(ch.inherited) >= 1 && !rc.depositLines.some((x) => x.label.startsWith("親から受け継いだ"))) problems.push(`${tag}: レシートに相続の行がない`);
      cur = ch;
    }
    chains++;
  }
  rows.push(`${c.iso3}:${chains}${cDebt ? `(借${cDebt})` : ""}`);
  if (!chains) problems.push(`${c.iso3}: 子どもがいる人生が${tried}人中見つからない`);
}
console.log(`国 ${COUNTRIES.length}か国 / 2代目 ${g2}人・3代目 ${g3}人 / 遺産を受け継いだ ${estates}・借金を引き継いだ ${debts}・何もなし ${none}（実家あり ${homes}）`);
console.log(rows.join(" "));
console.log(problems.length ? problems.slice(0, 30).join("\n") + `\n…問題 ${problems.length}件` : "✔ 問題なし");
