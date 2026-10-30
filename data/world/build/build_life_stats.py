"""第11部（新しい出来事）の統計を、ゲームが読む data/world/life_stats.json にまとめる。
元の表は manual/jinsei_receipt_part11*.csv、判断の理由は manual/part11_review.md。
何度実行しても同じ結果になる。使い方: python3 -I data/world/build/build_life_stats.py
"""
import csv, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
FILES = ["jinsei_receipt_part11a.csv", "jinsei_receipt_part11a_2.csv", "jinsei_receipt_part11b_1.csv"]
# CSV の field → life_stats.json のキー。割合（%）で来るものは小数に直さない（CSV ですでに小数）
FIELDS = {
    "road_traffic_death_rate": "roadDeathsPer100k",
    "maternal_mortality_ratio": "maternalDeathsPer100kBirths",
    "social_assistance_coverage_q1": "socialAssistanceQ1",
    "social_protection_coverage": "socialProtection",
    "sickness_benefit_status": "sicknessBenefit",
    "single_parent_poverty_rate": "singleParentPoverty",
}
# 使わない値（理由つき）
REJECT = {
    ("IND", "single_parent_poverty_rate"): "2011年と古い",
    ("CHN", "single_parent_poverty_rate"): "2011年と古い",
}

countries = {c["iso3"] for c in json.loads((ROOT / "countries.json").read_text(encoding="utf-8"))}
out = {}
for name in FILES:
    for r in csv.DictReader(open(ROOT / "manual" / name, encoding="utf-8-sig")):
        key = FIELDS.get(r["field"])
        if not key or not r["value"].strip() or r["iso3"] not in countries or (r["iso3"], r["field"]) in REJECT:
            continue
        # あとのファイル（聞き直しの分）が前の値を上書きする
        out.setdefault(r["iso3"], {})[key] = round(float(r["value"]), 4)
        out[r["iso3"]].setdefault("years", {})[key] = r["year"]

path = ROOT / "life_stats.json"
path.write_text(json.dumps(dict(sorted(out.items())), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
for k in FIELDS.values():
    print(f"{k}: {sum(1 for v in out.values() if k in v)}か国")
