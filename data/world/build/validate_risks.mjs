// Validate data/world/risks.json and data/world/country_events.json. Run: node data/world/build/validate_risks.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(root, f), 'utf8'));
const countries = read('countries.json');
const risks = read('risks.json');
const events = read('country_events.json');
const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const num = (x) => typeof x === 'number' && Number.isFinite(x);
const isos = new Set(countries.map((c) => c.iso3));
const majors = countries.filter((c) => c.major).map((c) => c.iso3);

// ---- risks
const RANGE = {
  inflationMean: [-0.2, 5], inflationCrisisShare: [0, 1], inflationRecent: [-0.5, 20], homicidePer100k: [0, 150],
  ipvPast12mWomen: [0, 1], politicalStability: [-2.6, 2.6], conflictRisk: [0, 1], floodRisk: [0, 1], droughtRisk: [0, 1],
  earthquakeRisk: [0, 1], epidemicRisk: [0, 1],
};
const estCount = {};
for (const iso of isos) {
  const r = risks[iso];
  if (!r) { fail(iso, 'missing risks entry'); continue; }
  for (const [k, [lo, hi]] of Object.entries(RANGE)) {
    if (!num(r[k])) fail(iso, `${k} not finite`);
    else if (r[k] < lo || r[k] > hi) fail(iso, `${k} out of range: ${r[k]}`);
  }
  if (!Array.isArray(r.estimated)) fail(iso, 'estimated not array');
  else for (const k of r.estimated) { if (!(k in RANGE)) fail(iso, `unknown estimated key ${k}`); estCount[k] = (estCount[k] ?? 0) + 1; }
}
for (const iso of Object.keys(risks)) if (!isos.has(iso)) fail(iso, 'risks entry not in countries.json');

// ---- events
const TAGS = new Set(['*LIC', '*LMC', '*UMC', '*HIC', '*RURAL', '*URBAN', '*ALL']);
const REQ = new Set(['working', 'married', 'hasKids', 'rural', 'urban', 'ownsHome', null, "newlywed", "dating", "mortgage", "renting", "notOwner", "student", "inUniv", "parentAway", "nonregular"]);
const EFF = { cost: 'amount', income: 'amount', moveCost: 'amount', cashLossPct: 'frac', incomeDropPct: 'frac', careerMult: 'mult', health: 'mult', protectCash: 'bool' };
const emoji = /\p{Extended_Pictographic}/u;
const ids = new Set();
const perCountry = {};
let generic = 0;
for (const e of events) {
  const id = e.id ?? '?';
  if (!/^[a-z0-9_]+$/.test(id) || ids.has(id)) fail(id, 'bad or duplicate id'); ids.add(id);
  if (!Array.isArray(e.iso3) || e.iso3.length === 0) fail(id, 'iso3 empty');
  else {
    let isGeneric = false;
    for (const t of e.iso3) {
      if (t.startsWith('*')) { if (!TAGS.has(t)) fail(id, `bad tag ${t}`); isGeneric = true; }
      else if (!isos.has(t)) fail(id, `unknown iso3 ${t}`);
      else perCountry[t] = (perCountry[t] ?? 0) + 1;
    }
    if (isGeneric) generic++;
  }
  if (!(Number.isInteger(e.minAge) && Number.isInteger(e.maxAge) && e.minAge >= 0 && e.minAge < e.maxAge && e.maxAge <= 110)) fail(id, 'ages');
  if (!(num(e.annualProb) && e.annualProb > 0 && e.annualProb <= 0.2)) fail(id, `annualProb ${e.annualProb}`);
  // 条件は「+」でつなげられる。kid:10-12 は「その年齢の子どもがいる」
  if (!(e.requires ?? '').split('+').every((q) => REQ.has(q === '' ? null : q) || /^kid:\d+-\d+$/.test(q))) fail(id, `requires ${e.requires}`);
  for (const k of ['title', 'situation', 'basis']) if (typeof e[k] !== 'string' || !e[k] || emoji.test(e[k])) fail(id, k);
  if (typeof e.estimated !== 'boolean') fail(id, 'estimated');
  if (!Array.isArray(e.options) || e.options.length < 2 || e.options.length > 3) { fail(id, 'options count'); continue; }
  const oids = new Set();
  for (const o of e.options) {
    if (!o.id || oids.has(o.id)) fail(id, 'option id'); oids.add(o.id);
    for (const k of ['label', 'desc', 'result']) if (typeof o[k] !== 'string' || !o[k] || emoji.test(o[k])) fail(id, `option ${o.id} ${k}`);
    if (!Array.isArray(o.effects) || o.effects.length === 0) { fail(id, `option ${o.id} effects empty`); continue; }
    for (const f of o.effects) {
      const kind = EFF[f.type];
      if (!kind) { fail(id, `bad effect type ${f.type}`); continue; }
      const v = f.value;
      if (kind === 'amount' && !(num(v) && v >= 0 && v <= 1e8)) fail(id, `${f.type} ${v}`);
      if (kind === 'frac' && !(num(v) && v > 0 && v <= 1)) fail(id, `${f.type} ${v}`);
      if (kind === 'mult' && !(num(v) && v >= 0.5 && v <= 2)) fail(id, `${f.type} ${v}`);
      if (kind === 'bool' && v !== true) fail(id, `${f.type} ${v}`);
    }
  }
}
for (const iso of majors) {
  const n = perCountry[iso] ?? 0;
  if (n < 4 || n > 7) fail(iso, `major country has ${n} events (want 4-7)`);
}
if (generic < 6 || generic > 10) fail('generic', `generic events ${generic} (want 6-10)`);

console.log(`risks: ${Object.keys(risks).length} countries; estimated-field counts:`, estCount);
console.log(`events: ${events.length} total, ${generic} generic; per major:`, Object.fromEntries(majors.map((m) => [m, perCountry[m] ?? 0])));
if (errors.length) { console.error(`${errors.length} errors:\n` + errors.join('\n')); process.exit(1); }
console.log('OK');
