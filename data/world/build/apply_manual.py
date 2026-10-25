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
    elif field == "housing_share_of_consumption":
        # 家計消費に占める住居・光熱費の割合（世界銀行 ICP）。国どうしの比で家賃の重さを決める
        c["rentShareOfIncome"] = v; drop_est(c, "rentShareOfIncome")
    elif field == "house_price_to_income":
        c["housePriceToIncome"] = v; drop_est(c, "housePriceToIncome")
    elif field in ("tuition_public_annual", "tuition_private_annual"):
        # 現地通貨の年間学費 → 1人あたりGNIに対する割合（国公立6割・私立4割で合成。片方しかなければその値）
        t = c.setdefault("tuition", {})
        t["public" if field == "tuition_public_annual" else "private"] = v
        vals = [(t.get("public"), 0.6), (t.get("private"), 0.4)]
        got = [(x, w) for x, w in vals if x is not None]
        c["tertiaryAnnualCostShareOfGni"] = round(sum(x * w for x, w in got) / sum(w for _, w in got) / c["gniPerCapitaLCU"], 4)
        drop_est(c, "tertiaryAnnualCostShareOfGni")
    elif field == "city_population_share":
        # 都市の人口割合（note の先頭に city=都市名）。places の組み直しは人が確認してから行う
        city = r["note"].split(";")[0].replace("city=", "").strip()
        c.setdefault("cityPopulationShare", {})[city] = v
    elif field == "homicide_rate" and k is not None:
        k["homicidePer100k"] = v; drop_est(k, "homicide")
    elif field == "secondary_net_enrollment":
        c["secondaryNetEnrollment"] = v; drop_est(c, "secondaryNetEnrollment")
    elif field == "tertiary_gross_enrollment":
        c["tertiaryGrossEnrollment"] = min(1.0, v); drop_est(c, "tertiaryGrossEnrollment")
    elif field == "consumption_per_capita_lcu":
        c["consumptionPerCapitaLCU"] = v; drop_est(c, "consumptionPerCapitaLCU")
    elif field == "remittance_share_gdp":
        c["remittanceShareGdp"] = v; drop_est(c, "remittanceShareGdp")
    elif field == "inflation_recent" and k is not None:
        y = int(r["year"])
        if y >= latest_infl.get(iso, (0, 0))[0]:
            latest_infl[iso] = (y, v)
        continue
    else:
        continue
    c.setdefault("sources", {})[field] = src
    applied[field] = applied.get(field, 0) + 1

# disasterRisk は日本以外では使わない（災害は risks.json の INFORM 実データで起こす）
for c in countries:
    drop_est(c, "disasterRisk")

for iso, (y, v) in latest_infl.items():
    k = risks[iso]
    k["inflationRecent"] = round(v / 100, 4)
    drop_est(k, "inflationRecent")
    k.setdefault("years", {})["inflationRecent"] = y
    applied["inflation_recent"] = applied.get("inflation_recent", 0) + 1

(ROOT / "countries.json").write_text(json.dumps(countries, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "risks.json").write_text(json.dumps(risks, ensure_ascii=False, indent=2), encoding="utf-8")
print("反映した数（国の数。初婚年齢は男女で2）:", applied)
