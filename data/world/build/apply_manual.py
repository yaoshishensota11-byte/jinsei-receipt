"""人が調べて集めた国別データ（data/world/manual/*.csv）を countries.json と risks.json に反映する。
使い方: python3 -I data/world/build/apply_manual.py
CSV の形式: iso3,country_en,field,value,unit,year,source_name,source_url,note（1行に1つの数値）
値が空欄の行は使わず、これまでの推定値を残す。
"""
import csv, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
countries = json.loads((ROOT / "countries.json").read_text(encoding="utf-8"))
risks = json.loads((ROOT / "risks.json").read_text(encoding="utf-8"))
by_iso = {c["iso3"]: c for c in countries}

rows = []
for f in sorted((ROOT / "manual").glob("*.csv")):
    rows += list(csv.DictReader(f.open(encoding="utf-8-sig")))

def drop_est(obj, key):
    obj["estimated"] = [e for e in obj.get("estimated", []) if not e.startswith(key)]

applied = {}
latest_infl = {}
for r in rows:
    if not r["value"].strip():
        continue
    iso, field, v = r["iso3"], r["field"], float(r["value"])
    c, k = by_iso.get(iso), risks.get(iso)
    if c is None:
        continue
    src = {"source": r["source_name"], "url": r["source_url"], "year": r["year"]}
    if field == "pension_coverage":
        c["pensionCoverage"] = v; drop_est(c, "pensionCoverage")
    elif field == "informal_employment_share":
        c["informalEmploymentShare"] = v; drop_est(c, "informalEmploymentShare")
    elif field in ("smam_male", "smam_female"):
        c["meanAgeFirstMarriage"]["male" if field == "smam_male" else "female"] = v
        drop_est(c, "meanAgeFirstMarriage")
    elif field == "pension_replacement_rate":
        c["pensionReplacementRate"] = v; drop_est(c, "pensionReplacementRate")
    elif field == "tax_rate_avg_worker":
        c["effectiveTaxRateAvgWorker"] = v; drop_est(c, "effectiveTaxRateAvgWorker")
    elif field == "ipv_past12m_women" and k is not None:
        k["ipvPast12mWomen"] = v; drop_est(k, "ipv")
        k.setdefault("years", {})["ipv"] = "WHO VAWポータルの最新推定（15〜49歳・過去1年）"
    elif field == "inflation_recent" and k is not None:
        y = int(r["year"])
        if y >= latest_infl.get(iso, (0, 0))[0]:
            latest_infl[iso] = (y, v)
        continue
    else:
        continue
    c.setdefault("sources", {})[field] = src
    applied[field] = applied.get(field, 0) + 1

for iso, (y, v) in latest_infl.items():
    k = risks[iso]
    k["inflationRecent"] = round(v / 100, 4)
    drop_est(k, "inflationRecent")
    k.setdefault("years", {})["inflationRecent"] = y
    applied["inflation_recent"] = applied.get("inflation_recent", 0) + 1

(ROOT / "countries.json").write_text(json.dumps(countries, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "risks.json").write_text(json.dumps(risks, ensure_ascii=False, indent=2), encoding="utf-8")
print("反映した数（国の数。初婚年齢は男女で2）:", applied)
