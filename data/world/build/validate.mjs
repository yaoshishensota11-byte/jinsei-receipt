import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'countries.json'), 'utf8'));
const meta = JSON.parse(readFileSync(join(root, 'meta.json'), 'utf8'));
const errors = [];
const fail = (iso, msg) => errors.push(`${iso}: ${msg}`);
const num = (x) => typeof x === 'number' && Number.isFinite(x);
if (!Array.isArray(data)) throw new Error('countries.json is not an array');
const NUM = ['births','pppPerIntlDollar','gniPerCapitaLCU','consumptionPerCapitaLCU','urbanShare','under5MortalityPer1000','tfr',
  'secondaryNetEnrollment','tertiaryGrossEnrollment','tertiaryAnnualCostShareOfGni','unemploymentRate','informalEmploymentShare',
  'pensionCoverage','pensionReplacementRate','outOfPocketHealthShare','effectiveTaxRateAvgWorker','rentShareOfIncome',
  'housePriceToIncome','disasterRisk','remittanceShareGdp'];
const RATE01 = ['urbanShare','secondaryNetEnrollment','tertiaryGrossEnrollment','unemploymentRate','informalEmploymentShare','pensionCoverage',
  'pensionReplacementRate','outOfPocketHealthShare','effectiveTaxRateAvgWorker','rentShareOfIncome','disasterRisk'];
const KEYS = ['iso3','nameJa','major','incomeGroup','births','currency','pppPerIntlDollar','gniPerCapitaLCU','consumptionPerCapitaLCU',
  'incomeShareQuintiles','urbanShare','places','lifeExpectancy','under5MortalityPer1000','tfr','meanAgeFirstMarriage','secondaryNetEnrollment',
  'tertiaryGrossEnrollment','tertiaryAnnualCostShareOfGni','unemploymentRate','informalEmploymentShare','pensionCoverage','pensionReplacementRate',
  'outOfPocketHealthShare','effectiveTaxRateAvgWorker','rentShareOfIncome','housePriceToIncome','disasterRisk','remittanceShareGdp','estimated','notes'];
const emoji = /\p{Extended_Pictographic}/u;
const seen = new Set();
for (const c of data) {
  const id = c.iso3 ?? '?';
  for (const k of KEYS) if (!(k in c)) fail(id, `missing key ${k}`);
  for (const k of Object.keys(c)) if (!KEYS.includes(k) && !['sources','tuition','cityPopulationShare'].includes(k)) fail(id, `unexpected key ${k}`);
  if (!/^[A-Z]{3}$/.test(id) || seen.has(id)) fail(id, 'bad/duplicate iso3'); seen.add(id);
  if (!['LIC','LMC','UMC','HIC'].includes(c.incomeGroup)) fail(id, 'bad incomeGroup');
  if (typeof c.nameJa !== 'string' || !c.nameJa) fail(id, 'nameJa');
  for (const k of NUM) if (!num(c[k])) fail(id, `${k} not finite`);
  for (const k of RATE01) if (!(c[k] >= 0 && c[k] <= 1)) fail(id, `${k} out of 0..1: ${c[k]}`);
  const cur = c.currency ?? {};
  for (const k of ['code','nameJa','symbol','asOf']) if (typeof cur[k] !== 'string' || !cur[k]) fail(id, `currency.${k}`);
  if (!(num(cur.jpyPerUnit) && cur.jpyPerUnit > 0)) fail(id, 'jpyPerUnit');
  if (!(c.gniPerCapitaLCU > 0 && c.consumptionPerCapitaLCU > 0 && c.pppPerIntlDollar > 0 && c.births > 0)) fail(id, 'non-positive money/births');
  const q = c.incomeShareQuintiles;
  if (!Array.isArray(q) || q.length !== 5 || !q.every(num)) fail(id, 'quintiles shape');
  else { const s = q.reduce((a, b) => a + b, 0); if (Math.abs(s - 1) > 0.02) fail(id, `quintiles sum ${s}`);
    for (let i = 1; i < 5; i++) if (q[i] < q[i - 1]) fail(id, 'quintiles not ascending'); }
  const p = c.places;
  if (!Array.isArray(p) || p.length < 2 || p.length > 6) fail(id, 'places length');
  else {
    const s = p.reduce((a, x) => a + x.share, 0); if (Math.abs(s - 1) > 0.02) fail(id, `places sum ${s}`);
    for (const x of p) if (typeof x.nameJa !== 'string' || typeof x.urban !== 'boolean' || !num(x.share) || !num(x.incomeIndex) || x.incomeIndex <= 0) fail(id, 'place shape');
    if (c.major && (p.length < 4 || !p.some(x => x.urban) || !p.some(x => !x.urban))) fail(id, 'major places need 4-6 mixed');
  }
  for (const s of ['male','female']) {
    if (!(c.lifeExpectancy?.[s] >= 45 && c.lifeExpectancy[s] <= 90)) fail(id, `e0 ${s} ${c.lifeExpectancy?.[s]}`);
    if (!(c.meanAgeFirstMarriage?.[s] >= 15 && c.meanAgeFirstMarriage[s] <= 45)) fail(id, `marriage ${s}`);
  }
  if (!(c.tfr > 0.5 && c.tfr < 8)) fail(id, 'tfr range');
  if (!(c.under5MortalityPer1000 > 0 && c.under5MortalityPer1000 < 300)) fail(id, 'u5mr range');
  if (!Array.isArray(c.estimated) || !c.estimated.every(k => KEYS.includes(k))) fail(id, 'estimated keys');
  if (emoji.test(JSON.stringify(c))) fail(id, 'emoji found');
}
const majors = data.filter(c => c.major);
if (majors.length !== 20) errors.push(`major count ${majors.length}`);
const births = data.reduce((a, c) => a + c.births, 0);
const share = births / meta.worldBirths;
if (Math.abs(share - meta.coveredBirthShare) > 0.005) errors.push(`coveredBirthShare mismatch ${share}`);
if (share < 0.95) errors.push(`coverage < 95%: ${share}`);
if (JSON.stringify(data).includes('NaN')) errors.push('NaN text');
console.log(`countries=${data.length} births=${births} world=${meta.worldBirths} covered=${(share * 100).toFixed(2)}%`);
console.table(majors.map(c => ({ iso3: c.iso3, name: c.nameJa, births: c.births, e0m: c.lifeExpectancy.male, e0f: c.lifeExpectancy.female,
  gniJPY: Math.round(c.gniPerCapitaLCU * c.currency.jpyPerUnit), estN: c.estimated.length })));
if (errors.length) { console.error(`FAILED (${errors.length})\n` + errors.join('\n')); process.exit(1); }
console.log('OK: all checks passed');
