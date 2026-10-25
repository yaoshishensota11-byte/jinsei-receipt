// まだ「推定値」のままの項目を、項目ごとに国の一覧で表示する（Manusなどへの調査依頼を作るため）。
// 使い方: node data/world/build/list_estimated.mjs [--major]   （--major で主要20か国だけ）
import { readFileSync } from "node:fs";
const dir = new URL("..", import.meta.url);
const countries = JSON.parse(readFileSync(new URL("countries.json", dir), "utf8"));
const risks = JSON.parse(readFileSync(new URL("risks.json", dir), "utf8"));
const en = JSON.parse(readFileSync(new URL("country_names_en.json", dir), "utf8"));
const majorOnly = process.argv.includes("--major");
const list = {};
for (const c of countries) {
  if (majorOnly && !c.major) continue;
  for (const k of c.estimated ?? []) (list[k] ??= []).push(c.iso3);
  for (const k of risks[c.iso3]?.estimated ?? []) (list["risks." + k] ??= []).push(c.iso3);
}
for (const [k, isos] of Object.entries(list).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n■ ${k}（${isos.length}か国）`);
  console.log(isos.map((i) => `${i}: ${en[i] ?? "?"}`).join(" / "));
}
