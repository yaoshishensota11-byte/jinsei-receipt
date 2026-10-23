import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wdi_load import *
cbr, pop = load('sp_dyn_cbrt_in'), load('sp_pop_totl')
C = countries(); res = []
for g, r in C.items():
    c, yc = latest(cbr, g, 2023); p, yp = latest(pop, g, 2023)
    if c and p: res.append((c * p / 1000, g, r['iso3166_1_alpha3'], r['name'], r['income_groups'], yc))
res.sort(reverse=True); tot = sum(x[0] for x in res); cum = 0
print('world', round(tot), 'n', len(res), 'missing', [r['name'] for g, r in C.items() if g not in {x[1] for x in res}])
for i, x in enumerate(res):
    cum += x[0]; print(i+1, x[2], x[3], round(x[0]), x[4], x[5], round(cum/tot, 4))
    if cum / tot > 0.955: break
