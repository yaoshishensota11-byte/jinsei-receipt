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

# WDI の穴埋め項目は、2010年より前の値だと今の暮らしとずれるので取り込まない
TOO_OLD = {"remittance_share_gdp", "secondary_net_enrollment", "tertiary_gross_enrollment", "consumption_per_capita_lcu"}
skipped_old = []

tax_parts = {}

applied = {}
latest_infl = {}
for r in rows:
    if not r["value"].strip():
        continue
    iso, field, v = r["iso3"], r["field"], float(r["value"])
    if field in TOO_OLD and r["year"][:4].isdigit() and int(r["year"][:4]) < 2010:
        skipped_old.append(f"{iso} {field} {r['year']}")
        continue
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
    elif field in ("avg_monthly_earnings", "employee_ssc_rate", "income_tax_allowance", "income_tax_bracket", "employee_ssc_bracket", "income_tax_credit"):
        # 税・社会保険料の「材料」。国ごとに集めておき、あとでまとめて実効税率を計算する
        t = tax_parts.setdefault(iso, {"brackets": []})
        if field == "income_tax_bracket":
            meta = dict(x.split("=", 1) for x in [y.strip() for y in r["note"].split(";")] if "=" in x)
            lo = float(meta.get("from", "0").replace(",", "") or 0)
            hi = meta.get("to", "").replace(",", "")
            t["brackets"].append((lo, float(hi) if hi else float("inf"), v))
        elif field == "employee_ssc_bracket":
            meta = dict(x.split("=", 1) for x in [y.strip() for y in r["note"].split(";")] if "=" in x)
            lo = float(meta.get("from", "0").replace(",", "") or 0)
            hi = meta.get("to", "").replace(",", "")
            t.setdefault("ssc_brackets", []).append((lo, float(hi) if hi else float("inf"), v))
        else:
            t[field] = v
            t[field + "_note"] = r["note"]
        y4 = r["year"].strip()[:4]
        if y4.isdigit():
            t.setdefault("years", {})[field] = int(y4)
        t.setdefault("sources", []).append(r["source_url"])
        continue
    elif field == "inflation_recent" and k is not None:
        y = int(r["year"])
        if y >= latest_infl.get(iso, (0, 0))[0]:
            latest_infl[iso] = (y, v)
        continue
    else:
        continue
    c.setdefault("sources", {})[field] = src
    applied[field] = applied.get(field, 0) + 1

# 税・社会保険料の材料がそろった国は、平均賃金・単身の実効負担率を計算する
#   年収 = 平均月収 × 12、課税所得 = 年収 − 基礎控除、所得税 = 税率表で累進計算、社会保険料 = 年収 × 本人負担率
tax_computed, tax_skipped = [], []
for iso, t in tax_parts.items():
    c = by_iso.get(iso)
    if c is None or "avg_monthly_earnings" not in t or ("employee_ssc_rate" not in t and "ssc_brackets" not in t) or not t["brackets"]:
        tax_skipped.append(f"{iso}: 材料不足")
        continue
    # 保険料率が累進表の最高率など「実効率ではない」と書かれている場合は計算しない
    if "ssc_brackets" not in t and "実効率ではない" in t.get("employee_ssc_rate_note", ""):
        tax_skipped.append(f"{iso}: 社会保険料率が実効率ではない")
        continue
    # 平均月収の年が税率表より4年以上古いと、物価の上昇で負担が実際より軽く出るので計算しない
    ys = t.get("years", {})
    ey, by = ys.get("avg_monthly_earnings"), ys.get("income_tax_bracket")
    if ey and by and by - ey > 3:
        tax_skipped.append(f"{iso}: 平均月収が古い（{ey}年、税率表は{by}年）")
        continue
    # 区分の境目が「400001から」のように1ずれている表は、前の区分の上限につなげる
    brackets, prev_hi = [], 0.0
    for lo, hi, rate in sorted(t["brackets"]):
        if 0 < lo - prev_hi <= 1:
            lo = prev_hi
        brackets.append((lo, hi, rate)); prev_hi = hi
    # 基礎控除が「0%区分の上限」と同じ額なら、税率表がすでに控除を含んでいるので二重に引かない
    allowance = t.get("income_tax_allowance", 0.0)
    if any(rate == 0 and lo <= 1 and abs(hi - allowance) <= 1 for lo, hi, rate in brackets):
        allowance = 0.0
    annual = t["avg_monthly_earnings"] * 12
    taxable = max(0.0, annual - allowance)
    tax = 0.0
    for lo, hi, rate in brackets:
        if taxable > lo:
            tax += (min(taxable, hi) - lo) * rate
    # 税額控除（ケニアの personal relief など）は計算した税額から引く
    tax = max(0.0, tax - t.get("income_tax_credit", 0.0))
    # 保険料が累進の国（ブラジルの INSS など）は、月収に月額の料率表を当てはめる
    if "ssc_brackets" in t:
        m = t["avg_monthly_earnings"]
        ssc = sum((min(m, hi) - lo) * rate for lo, hi, rate in sorted(t["ssc_brackets"]) if m > lo) * 12
    else:
        ssc = annual * t["employee_ssc_rate"]
    share = round((tax + ssc) / annual, 4)
    c["effectiveTaxRateAvgWorker"] = share
    drop_est(c, "effectiveTaxRateAvgWorker")
    c.setdefault("sources", {})["tax_rate_avg_worker"] = {"source": "計算値（平均月収・税率表・本人負担社会保険料率から）", "url": t["sources"][0], "year": str(by or "")}
    tax_computed.append(f"{iso}:{share}")
    applied["tax_rate_avg_worker(計算)"] = applied.get("tax_rate_avg_worker(計算)", 0) + 1

# 都市の人口割合（国連 WUP）で places を組み直す。所得の係数（incomeIndex）は推定のまま
CITY_JA = json.loads((ROOT / "build" / "city_names_ja.json").read_text(encoding="utf-8"))
rebuilt = []
for c in countries:
    cps, names = c.get("cityPopulationShare"), CITY_JA.get(c["iso3"])
    if not cps or not names:
        continue
    for p in c["places"]:
        if p["nameJa"] == "広州・深圳":
            p["nameJa"] = "広州"
    urban = c["urbanShare"]
    named = 0.0
    for p in c["places"]:
        keys = names.get(p["nameJa"])
        if p["urban"] and keys and all(k in cps for k in keys):
            p["share"] = round(sum(cps[k] for k in keys), 4)
        if p["urban"] and p["nameJa"] != "その他の都市":
            named += p["share"]
    others = [p for p in c["places"] if p["nameJa"] == "その他の都市"]
    if others:
        others[0]["share"] = round(max(0.02, urban - named), 4)
    rural = [p for p in c["places"] if not p["urban"]]
    rsum = sum(p["share"] for p in rural) or 1
    for p in rural:
        p["share"] = round(p["share"] / rsum * (1 - urban), 4)
    total = sum(p["share"] for p in c["places"])
    for p in c["places"]:
        p["share"] = round(p["share"] / total, 4)
    c["estimated"] = [e for e in c.get("estimated", []) if e not in ("places", "places.incomeIndex")] + ["places.incomeIndex"]
    rebuilt.append(c["iso3"])

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
print("都市の人口割合で places を組み直した国:", len(rebuilt), " ".join(rebuilt))
if tax_computed:
    print("税・社会保険料を計算した国:", " ".join(tax_computed))
if tax_skipped:
    print("税・社会保険料を計算しなかった国:", ", ".join(tax_skipped))
if skipped_old:
    print("古すぎるため取り込まなかった値:", ", ".join(skipped_old))
