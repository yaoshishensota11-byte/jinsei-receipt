import csv, os, json, sys
RAW = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'wdi')
def load(key):
    out = {}
    with open(os.path.join(RAW, key + '.csv'), newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            try: v = float(r[key])
            except (ValueError, KeyError): continue
            out.setdefault(r['geo'], {})[int(r['time'])] = v
    return out
def latest(series, geo, maxyear=2025, minyear=2005, prefer=None):
    s = series.get(geo, {})
    if prefer and prefer in s: return s[prefer], prefer
    for y in range(maxyear, minyear - 1, -1):
        if y in s: return s[y], y
    return None, None
def countries():
    rows = {}
    with open(os.path.join(RAW, 'geo_country.csv'), newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            if r['iso3166_1_alpha3'] and r['un_state'] == 'TRUE':
                rows[r['country']] = r
    return rows
