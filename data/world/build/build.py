import sys, os, json, re, statistics as st, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from wdi_load import load, latest, countries
from manual import *
ROOT = os.path.join(HERE, '..'); NPM = os.path.join(ROOT, 'raw', 'npm')
GROUP = {'low_income':'LIC','lower_middle_income':'LMC','upper_middle_income':'UMC','high_income':'HIC'}
MAJORS = 'JPN USA CHN IND NGA BRA DEU GBR FRA IDN PAK BGD MEX PHL EGY ETH COD VNM KOR KEN'.split()
ja_names = json.load(open(os.path.join(NPM,'i18n-iso-countries-7.14.0/package/langs/ja.json'), encoding='utf-8'))['countries']
cldr = json.load(open(os.path.join(NPM,'cldr-numbers-full-49.0.0/package/main/ja/currencies.json'), encoding='utf-8'))['main']['ja']['numbers']['currencies']
rates = json.load(open(os.path.join(NPM,'fawazahmed0-currency-api-2026.10.22/package/v1/currencies/jpy.json'), encoding='utf-8'))
RATE_DATE, R = rates['date'], rates['jpy']
c2c = dict(re.findall(r'\b([A-Z]{2}): "([A-Z]{3})"', open(os.path.join(NPM,'country-to-currency-3.0.1/package/index.js'), encoding='utf-8').read()))
c2c.update({'ZW':'ZWG','SL':'SLE','VE':'VES','MR':'MRU'})
K = ['ny_gnp_pcap_cn','ne_con_prvt_cn','pa_nus_prvt_pp','pa_nus_ppp','pa_nus_fcrf','si_dst_frst_20','si_dst_02nd_20','si_dst_03rd_20',
     'si_dst_04th_20','si_dst_05th_20','sp_urb_totl_in_zs','sp_dyn_le00_ma_in','sp_dyn_le00_fe_in','sh_dyn_mort','sp_dyn_tfrt_in','se_sec_nenr',
     'se_sec_cmpt_lo_zs','se_ter_enrr','sl_uem_totl_zs','sh_xpd_oopc_ch_zs','bx_trf_pwkr_dt_gd_zs','sp_dyn_cbrt_in','sp_pop_totl','sl_emp_vuln_zs']
D = {k: load(k) for k in K}
C = countries()
def grp(g, iso3): return INCOME_OVERRIDE.get(iso3) or GROUP.get(C[g]['income_groups'])
# ---- births and coverage
rows = []
for g, r in C.items():
    c, _ = latest(D['sp_dyn_cbrt_in'], g, 2023); p, _ = latest(D['sp_pop_totl'], g, 2023)
    if c and p: rows.append((c * p / 1000, g))
rows.sort(reverse=True); world = sum(b for b, _ in rows)
chosen, cum = [], 0
for b, g in rows:
    iso = C[g]['iso3166_1_alpha3']
    if cum / world < 0.96 or iso in MAJORS: chosen.append((b, g)); cum += b
# ---- simple WDI fields (value, year) with group-median fallback
def wdi_basic(g):
    v = {}
    v['urban'] = latest(D['sp_urb_totl_in_zs'], g, 2024)[0]
    v['e0m'] = latest(D['sp_dyn_le00_ma_in'], g, 2023)[0]; v['e0f'] = latest(D['sp_dyn_le00_fe_in'], g, 2023)[0]
    v['u5'] = latest(D['sh_dyn_mort'], g, 2023)[0]; v['tfr'] = latest(D['sp_dyn_tfrt_in'], g, 2023)[0]
    s, ys = latest(D['se_sec_nenr'], g, 2024, 2012); v['secSrc'] = 'net'
    if s is None: s, ys = latest(D['se_sec_cmpt_lo_zs'], g, 2024, 2012); v['secSrc'] = 'completion'
    v['sec'] = None if s is None else min(s, 100)
    v['ter'] = latest(D['se_ter_enrr'], g, 2024, 2012)[0]
    v['unemp'] = latest(D['sl_uem_totl_zs'], g, 2024)[0]
    v['oop'] = latest(D['sh_xpd_oopc_ch_zs'], g, 2023, 2015)[0]
    v['remit'] = latest(D['bx_trf_pwkr_dt_gd_zs'], g, 2024)[0]
    v['vuln'] = latest(D['sl_emp_vuln_zs'], g, 2024)[0]
    q = None
    for y in range(2024, 2004, -1):
        vals = [D[k].get(g, {}).get(y) for k in K[5:10]]
        if all(x is not None for x in vals): q = (vals, y); break
    v['quint'] = q
    return v
allv = {g: wdi_basic(g) for g in C}
med = {}
for key in ['urban','e0m','e0f','u5','tfr','sec','ter','unemp','oop','remit','vuln']:
    for G in ['LIC','LMC','UMC','HIC']:
        xs = [allv[g][key] for g in C if grp(g, C[g]['iso3166_1_alpha3']) == G and allv[g][key] is not None]
        med[(key, G)] = st.median(xs)
for G in ['LIC','LMC','UMC','HIC']:
    qs = [allv[g]['quint'][0] for g in C if grp(g, C[g]['iso3166_1_alpha3']) == G and allv[g]['quint']]
    med[('quint', G)] = [st.median([q[i] for q in qs]) for i in range(5)]
# ---- regressions / medians from majors' hand values
def ols(xs, ys):
    mx, my = st.mean(xs), st.mean(ys); b = sum((x-mx)*(y-my) for x, y in zip(xs, ys)) / sum((x-mx)**2 for x in xs); return my - b*mx, b
gmap = {C[g]['iso3166_1_alpha3']: g for g in C}
mv = {i: allv[gmap[i]] for i in MAJORS}
inf_fit = ols([mv[i]['vuln'] for i in MAJORS], [MAJOR[i][0]*100 for i in MAJORS])
mf_fit = ols([math.log(mv[i]['tfr']) for i in MAJORS], [MAJOR[i][4][1] for i in MAJORS])
mm_fit = ols([math.log(mv[i]['tfr']) for i in MAJORS], [MAJOR[i][4][0] for i in MAJORS])
def major_med(idx, G):
    xs = [MAJOR[i][idx] for i in MAJORS if grp(gmap[i], i) == G]
    return st.median(xs)
def rnd(x, n=3): return float(round(x, n))
out, est_count = [], {}
for b, g in chosen:
    r = C[g]; iso = r['iso3166_1_alpha3']; iso2 = r['iso3166_1_alpha2']; G = grp(g, iso); v = allv[g]; est = []; notes = []
    major = iso in MAJORS
    def W(key, scale=1.0, field=None):
        x = v[key]
        if x is None: x = med[(key, G)]; est.append(field)
        return x * scale
    # money
    code = c2c[iso2]; cur = cldr.get(code, {}); jpy = 1 / R[code.lower()]
    gni, yg = latest(D['ny_gnp_pcap_cn'], g, 2024, 2015)
    con, yc = latest(D['ne_con_prvt_cn'], g, 2024, 2015)
    pp, yp = latest(D['pa_nus_prvt_pp'], g, 2024, 2015); ppsrc = 'PA.NUS.PRVT.PP'
    if pp is None: pp, yp = latest(D['pa_nus_ppp'], g, 2024, 2015); ppsrc = 'PA.NUS.PPP'
    lcu_per_usd_now = R[code.lower()] / R['usd']
    def rebase(val, y, field):
        f = D['pa_nus_fcrf'].get(g, {}).get(y)
        if f is None: return val, 1.0
        fac = lcu_per_usd_now / f
        if fac > 1.25: return val * fac, fac
        return val, 1.0
    if gni is None or yg < 2020 or iso in FORCE_GNI_FALLBACK:
        gni, yg = GNI_USD[iso] * lcu_per_usd_now, 2025; est.append('gniPerCapitaLCU'); con = None; pp = None if iso in FORCE_GNI_FALLBACK or pp is None else pp; notes.append('GNIはWDI欠損のため推定(米ドル換算)')
        gni2, fg = gni, 1.0
    else: gni2, fg = rebase(gni, yg, 'gni')
    if con is not None and yc >= 2020:
        conpc = con / D['sp_pop_totl'][g][yc]; con2, fc = rebase(conpc, yc, 'con')
    else:
        con2, fc = gni2 * 0.6, 1.0; est.append('consumptionPerCapitaLCU')
    if pp is None: pp2 = lcu_per_usd_now * PLI[G]; est.append('pppPerIntlDollar')
    else: pp2, fp = rebase(pp, yp, 'ppp')
    if fg != 1.0: notes.append(f'金額はWDI {yg}年値を為替変動で現行通貨水準に換算(x{fg:.2f})')
    notes.append(f'GNI{yg}/消費{yc if con is not None else "推定"}/PPP{(str(yp)+"("+ppsrc+")") if pp is not None else "推定"}')
    if v['quint']: qv, qy = v['quint']; notes.append(f'五分位{qy}')
    else: qv = med[('quint', G)]; est.append('incomeShareQuintiles')
    qs = sum(qv); quint = [rnd(x/qs, 4) for x in qv]; quint[-1] = rnd(1 - sum(quint[:-1]), 4)
    urban = W('urban', .01, 'urbanShare')
    # places
    if major:
        pl = PLACES[iso]; est.append('places')
    else:
        cap = min(0.35, 0.3 * urban) if urban > 0.05 else urban * 0.5
        cidx = {'LIC':1.9,'LMC':1.7,'UMC':1.4,'HIC':1.2}[G]
        pl = [(CITY_JA[iso], 1, cap, cidx), ('その他の都市', 1, urban - cap, 1.1), ('農村部', 0, 1 - urban, {'LIC':.65,'LMC':.7,'UMC':.75,'HIC':.9}[G])]
        est.append('places')
    tot = sum(p[2] for p in pl); mean_idx = sum(p[2]*p[3] for p in pl) / tot
    places = [{'nameJa': p[0], 'urban': bool(p[1]), 'share': rnd(p[2]/tot, 4), 'incomeIndex': rnd(p[3]/mean_idx, 2)} for p in pl]
    places[-1]['share'] = rnd(1 - sum(p['share'] for p in places[:-1]), 4)
    sec = W('sec', .01, 'secondaryNetEnrollment')
    ter = W('ter', .01, 'tertiaryGrossEnrollment')
    if ter > 1: notes.append(f'高等教育総就学率{ter*100:.0f}%を1.0に丸め'); ter = 1.0
    if v['sec'] is not None and v['secSrc'] == 'completion': notes.append('中等教育は前期中等修了率で代替')
    # hand/estimated fields
    if major:
        inf, pc, rr, tax, (mm, mf), tc, rent, pti, dis = MAJOR[iso]
    else:
        inf = min(.97, max(.05, (inf_fit[0] + inf_fit[1] * W('vuln', 1, None)) / 100))
        pc, rr, tax, tc, rent, pti = (major_med(i, G) for i in (1, 2, 3, 5, 6, 7))
        tfr_ = W('tfr', 1, None); mf = mf_fit[0] + mf_fit[1]*math.log(tfr_); mm = mm_fit[0] + mm_fit[1]*math.log(tfr_)
        dis = DISASTER.get(iso, .30)
    est += ['informalEmploymentShare','pensionCoverage','pensionReplacementRate','effectiveTaxRateAvgWorker','meanAgeFirstMarriage',
            'tertiaryAnnualCostShareOfGni','rentShareOfIncome','housePriceToIncome','disasterRisk']
    o = {
      'iso3': iso, 'nameJa': NAME_JA.get(iso, ja_names.get(iso2)), 'major': major, 'incomeGroup': G, 'births': int(round(b, -2)),
      'currency': {'code': code, 'nameJa': cur.get('displayName', code), 'symbol': cur.get('symbol-alt-narrow', cur.get('symbol', code)),
                   'jpyPerUnit': float(f'{jpy:.6g}'), 'asOf': RATE_DATE},
      'pppPerIntlDollar': float(f'{pp2:.6g}'), 'gniPerCapitaLCU': float(f'{gni2:.6g}'), 'consumptionPerCapitaLCU': float(f'{con2:.6g}'),
      'incomeShareQuintiles': quint, 'urbanShare': rnd(urban), 'places': places,
      'lifeExpectancy': {'male': rnd(W('e0m', 1, 'lifeExpectancy'), 1), 'female': rnd(W('e0f', 1, 'lifeExpectancy'), 1)},
      'under5MortalityPer1000': rnd(W('u5', 1, 'under5MortalityPer1000'), 1), 'tfr': rnd(W('tfr', 1, 'tfr'), 2),
      'meanAgeFirstMarriage': {'male': rnd(mm, 1), 'female': rnd(mf, 1)},
      'secondaryNetEnrollment': rnd(sec), 'tertiaryGrossEnrollment': rnd(ter),
      'tertiaryAnnualCostShareOfGni': rnd(tc), 'unemploymentRate': rnd(W('unemp', .01, 'unemploymentRate')),
      'informalEmploymentShare': rnd(inf), 'pensionCoverage': rnd(pc), 'pensionReplacementRate': rnd(rr),
      'outOfPocketHealthShare': rnd(W('oop', .01, 'outOfPocketHealthShare')), 'effectiveTaxRateAvgWorker': rnd(tax),
      'rentShareOfIncome': rnd(rent), 'housePriceToIncome': rnd(pti, 1), 'disasterRisk': rnd(dis, 2),
      'remittanceShareGdp': rnd(W('remit', .01, 'remittanceShareGdp'), 4),
      'estimated': sorted(set(e for e in est if e)), 'notes': '; '.join(notes)}
    out.append(o)
json.dump(out, open(os.path.join(ROOT, 'countries.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
meta = {'year': 2023, 'worldBirths': int(round(world, -3)), 'coveredBirthShare': round(cum / world, 4), 'exchangeRatesAsOf': RATE_DATE, 'sources': [
  {'key':'wdi','name':'World Bank World Development Indicators (open-numbers DDF mirror on GitHub)','url':'https://github.com/open-numbers/ddf--open_numbers--world_development_indicators','year':2025},
  {'key':'fx','name':'fawazahmed0/exchange-api (npm @fawazahmed0/currency-api)','url':'https://github.com/fawazahmed0/exchange-api','year':2026},
  {'key':'cldr','name':'Unicode CLDR 49 currency names/symbols (npm cldr-numbers-full)','url':'https://github.com/unicode-org/cldr-json','year':2026},
  {'key':'names','name':'i18n-iso-countries ja locale (npm) + MOFA-style overrides','url':'https://github.com/michaelwittig/node-i18n-iso-countries','year':2026},
  {'key':'currencyMap','name':'country-to-currency (npm)','url':'https://github.com/thiagodp/country-to-currency','year':2026},
  {'key':'incomeGroup','name':'World Bank country income classification FY2026 (manual overrides on mirror)','url':'https://datahelpdesk.worldbank.org/knowledgebase/articles/906519','year':2025},
  {'key':'handEstimates','name':'Hand-entered approximations referencing ILO WSPR 2024-26, ILO informality stats, OECD Pensions at a Glance 2023, OECD Taxing Wages 2024, UN World Marriage Data, WorldRiskIndex 2023 (not downloaded)','url':'https://www.ilo.org/ ; https://www.oecd.org/ ; https://weltrisikobericht.de/','year':2024}]}
json.dump(meta, open(os.path.join(ROOT, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('countries', len(out), 'coverage', meta['coveredBirthShare'], 'world', meta['worldBirths'])
print('fits', inf_fit, mf_fit, mm_fit)
for o in out:
    if 'gniPerCapitaLCU' in o: print(o['iso3'], o['nameJa'], o['incomeGroup'], o['currency']['code'], round(o['gniPerCapitaLCU']*o['currency']['jpyPerUnit']), o['notes'][:70])
