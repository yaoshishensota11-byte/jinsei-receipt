# Build data/world/risks.json. Run: python3 -I data/world/build/build_risks.py
# Inputs: raw/wdi/*.csv (open-numbers WDI mirror; untrusted data), countries.json, hand tables below.
import sys, os, json, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from wdi_load import load, latest
ROOT = os.path.join(HERE, '..')
cs = json.load(open(os.path.join(ROOT, 'countries.json'), encoding='utf-8'))
K = ['fp_cpi_totl_zg', 'gov_wgi_pv_est', 'sg_vaw_1549_zs', 'vc_ihr_psrc_p5', 'vc_btl_deth', 'vc_idp_nwcv', 'sp_pop_totl']
D = {k: load(k) for k in K}

# ---- hand estimates (memory of UNODC / WHO 2018 / news); all flagged as estimated
HOMICIDE_EST = {'COD': 13.5, 'MDG': 8.0, 'CIV': 10.0, 'MLI': 10.0, 'TCD': 9.0, 'SOM': 6.0, 'GIN': 9.0, 'PRK': 4.0, 'TGO': 9.0, 'COG': 10.0}
# WHO Violence Against Women Prevalence Estimates 2018, past-12-month IPV (ever-partnered women 15-49), recalled approximately
IPV_EST = {'CHN': 8, 'PAK': 16, 'IDN': 9, 'USA': 6, 'BRA': 6, 'SDN': 17, 'YEM': 18, 'RUS': 9, 'ZAF': 13, 'IRN': 18, 'IRQ': 16,
           'NER': 13, 'MDG': 18, 'UZB': 8, 'DZA': 9, 'SOM': 22, 'JPN': 4, 'MAR': 10, 'THA': 9, 'SAU': 11, 'SYR': 15, 'ARG': 5,
           'GIN': 21, 'BEN': 15, 'MYS': 6, 'VEN': 9, 'KAZ': 6, 'CAN': 3, 'PRK': 10, 'SSD': 27, 'AUS': 3, 'PNG': 31, 'LKA': 4,
           'KOR': 8, 'COG': 18, 'ISR': 6, 'CHL': 6}
# latest CPI in mirror is too old (<2022) or missing -> recent estimate (fraction)
INFL_RECENT_EST = {'COD': 0.18, 'VEN': 0.5, 'YEM': 0.2, 'MMR': 0.25, 'SYR': 0.4, 'SOM': 0.05, 'PRK': 0.1}
INFL_MEAN_EST = {'SOM': 0.08, 'PRK': 0.1}
# conflictRisk: computed index from battle deaths + new conflict displacement, then overridden by judgment where needed
CONFLICT_OVERRIDE = {'UKR': 0.8, 'SDN': 0.85, 'SSD': 0.7, 'SYR': 0.75, 'YEM': 0.8, 'AFG': 0.6, 'MMR': 0.7, 'SOM': 0.7, 'COD': 0.6,
                     'ETH': 0.5, 'MLI': 0.6, 'BFA': 0.65, 'NER': 0.45, 'NGA': 0.35, 'CAF': 0.65, 'HTI': 0.5, 'ISR': 0.4, 'CMR': 0.35,
                     'MOZ': 0.3, 'TCD': 0.35, 'IRQ': 0.3, 'COL': 0.25, 'PAK': 0.25, 'RUS': 0.2, 'BDI': 0.2, 'IRN': 0.2,
                     'PRK': 0.1, 'KOR': 0.03, 'MEX': 0.15, 'JPN': 0.0, 'IND': 0.03}
# (flood, drought, earthquake) 0..1 relative; judgement informed by INFORM Risk / WorldRiskIndex / EM-DAT recollection
HAZ = {
 'IND': (.7,.5,.4), 'CHN': (.6,.4,.5), 'NGA': (.5,.4,.02), 'PAK': (.7,.5,.5), 'IDN': (.6,.3,.8), 'COD': (.4,.2,.2), 'ETH': (.4,.8,.3),
 'USA': (.4,.3,.3), 'BGD': (.9,.3,.3), 'BRA': (.4,.4,.02), 'EGY': (.1,.3,.2), 'TZA': (.4,.5,.2), 'MEX': (.4,.4,.6), 'PHL': (.8,.3,.7),
 'UGA': (.3,.4,.2), 'SDN': (.5,.7,.05), 'KEN': (.4,.7,.1), 'AFG': (.4,.7,.7), 'VNM': (.7,.3,.05), 'YEM': (.3,.6,.2), 'AGO': (.3,.6,.05),
 'MOZ': (.7,.6,.1), 'RUS': (.3,.3,.1), 'ZAF': (.3,.5,.05), 'IRN': (.3,.6,.8), 'IRQ': (.3,.6,.3), 'NER': (.4,.8,.02), 'MDG': (.5,.6,.05),
 'CIV': (.3,.3,.02), 'CMR': (.3,.4,.05), 'TUR': (.3,.4,.8), 'MLI': (.3,.8,.02), 'UZB': (.2,.5,.4), 'DZA': (.2,.6,.5), 'MMR': (.7,.4,.5),
 'GHA': (.3,.3,.1), 'TCD': (.4,.8,.02), 'SOM': (.5,.9,.02), 'JPN': (.5,.1,.9), 'BFA': (.3,.7,.02), 'COL': (.5,.3,.5), 'DEU': (.3,.15,.03),
 'GBR': (.3,.1,.01), 'ZMB': (.3,.6,.05), 'FRA': (.3,.2,.05), 'MWI': (.6,.6,.1), 'MAR': (.2,.6,.4), 'THA': (.6,.3,.1), 'NPL': (.5,.3,.8),
 'SAU': (.1,.5,.05), 'PER': (.5,.4,.7), 'SEN': (.3,.6,.02), 'SYR': (.2,.7,.4), 'ARG': (.4,.4,.2), 'ZWE': (.2,.7,.05), 'GIN': (.3,.3,.02),
 'BEN': (.4,.3,.02), 'BDI': (.3,.4,.2), 'MYS': (.5,.1,.05), 'VEN': (.4,.3,.3), 'KAZ': (.2,.5,.3), 'RWA': (.3,.3,.2), 'ITA': (.3,.3,.5),
 'GTM': (.5,.5,.7), 'KHM': (.6,.4,.02), 'CAN': (.3,.2,.1), 'PRK': (.5,.4,.1), 'SSD': (.7,.6,.05), 'ESP': (.3,.4,.1), 'AUS': (.3,.6,.05),
 'POL': (.3,.2,.01), 'TJK': (.4,.4,.6), 'ECU': (.4,.3,.6), 'TGO': (.3,.3,.02), 'BOL': (.4,.5,.1), 'SLE': (.4,.2,.02), 'HTI': (.5,.4,.7),
 'PNG': (.5,.3,.7), 'LKA': (.5,.4,.02), 'CAF': (.3,.3,.02), 'JOR': (.1,.7,.2), 'HND': (.6,.5,.3), 'KOR': (.4,.2,.1), 'UKR': (.2,.3,.05),
 'DOM': (.5,.3,.4), 'COG': (.4,.2,.02), 'ISR': (.1,.5,.3), 'CHL': (.3,.5,.8)}

def r(x, n=3): return None if x is None else round(x, n)
out = {}
for c in cs:
    iso = c['iso3']; g = iso.lower(); est = []
    cpi = D['fp_cpi_totl_zg'].get(g, {})
    yrs = [cpi[y] for y in range(2000, 2025) if y in cpi]
    if len(yrs) >= 5:
        # geometric-ish mean via log to avoid hyperinflation outliers dominating too much? keep arithmetic as spec'd but cap each year at 300%
        mean = sum(min(v, 300) for v in yrs) / len(yrs) / 100
    else:
        mean = INFL_MEAN_EST[iso]; est.append('inflationMean')
    yy = [cpi[y] for y in range(1990, 2025) if y in cpi]
    if len(yy) >= 5: crisis = sum(1 for v in yy if v > 40) / len(yy)
    else: crisis = 0.0; est.append('inflationCrisisShare')
    v, y = latest(D['fp_cpi_totl_zg'], g, 2025, 1990)
    if iso in INFL_RECENT_EST or v is None or y < 2022:
        rec = INFL_RECENT_EST[iso]; est.append('inflationRecent')
    else: rec = v / 100
    h, hy = latest(D['vc_ihr_psrc_p5'], g, 2025, 2005)
    if h is None: h = HOMICIDE_EST[iso]; est.append('homicidePer100k')
    ipv, iy = latest(D['sg_vaw_1549_zs'], g, 2025, 2000)
    if ipv is None: ipv = IPV_EST[iso]; est.append('ipvPast12mWomen')
    ps, py = latest(D['gov_wgi_pv_est'], g, 2025, 2015)
    # conflict index from data: battle deaths per 100k (2015-2024 mean) + new conflict IDPs as share of population (2014-2023 sum)
    pop = latest(D['sp_pop_totl'], g, 2024)[0] or 1
    bd = sum(D['vc_btl_deth'].get(g, {}).get(y, 0) for y in range(2015, 2025)) / 10 / pop * 1e5
    idp = sum(D['vc_idp_nwcv'].get(g, {}).get(y, 0) for y in range(2014, 2024)) / pop
    ci = 1 - math.exp(-(bd * 0.15 + idp * 2.5))
    conflict = CONFLICT_OVERRIDE.get(iso, ci); est.append('conflictRisk')
    fl, dr, eq = HAZ[iso]
    u5 = c['under5MortalityPer1000']
    epi = min(0.9, 0.05 + u5 / 130 + (0.05 if c['incomeGroup'] in ('LIC', 'LMC') else 0))
    est += ['floodRisk', 'droughtRisk', 'earthquakeRisk', 'epidemicRisk']
    out[iso] = {
        'inflationMean': r(mean), 'inflationCrisisShare': r(crisis), 'inflationRecent': r(rec),
        'homicidePer100k': r(h, 2), 'ipvPast12mWomen': r(ipv / 100), 'politicalStability': r(ps, 2),
        'conflictRisk': r(min(1, conflict), 2), 'floodRisk': fl, 'droughtRisk': dr, 'earthquakeRisk': eq, 'epidemicRisk': r(epi, 2),
        'years': {'inflationRecent': None if 'inflationRecent' in est else y, 'homicide': None if 'homicidePer100k' in est else hy,
                  'ipv': None if 'ipvPast12mWomen' in est else iy, 'politicalStability': py},
        'estimated': est,
        '_debug_conflictIndex': r(ci, 3),
    }
for k in out:
    out[k].pop('_debug_conflictIndex') if '--debug' not in sys.argv else None
json.dump(out, open(os.path.join(ROOT, 'risks.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if '--debug' in sys.argv:
    for k, v in out.items(): print(k, v['inflationMean'], v['inflationCrisisShare'], v['inflationRecent'], v['conflictRisk'], v.get('_debug_conflictIndex'), v['epidemicRisk'])
print('wrote', len(out))
