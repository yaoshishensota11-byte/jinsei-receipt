"""国別の消費者物価上昇率（年ごと）を data/world/cpi_annual.json に書き出す。
古い年の平均月収を、税率表の年の金額に換算するために apply_manual.py が使う。
出典: World Bank WDI FP.CPI.TOTL.ZG（raw/wdi のミラー）。手作業の CSV に IMF WEO の値（inflation_recent）があれば、その年はそちらを優先する。
使い方: python3 -I data/world/build/cpi_series.py
"""
import csv, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIRST, LAST = 2000, 2026
isos = {c["iso3"] for c in json.loads((ROOT / "countries.json").read_text(encoding="utf-8"))}

series = {iso: {} for iso in isos}
for r in csv.DictReader((ROOT / "raw" / "wdi" / "fp_cpi_totl_zg.csv").open(encoding="utf-8")):
    iso, y = r["geo"].upper(), int(r["time"])
    if iso in series and FIRST <= y <= LAST and r["fp_cpi_totl_zg"]:
        series[iso][y] = round(float(r["fp_cpi_totl_zg"]), 2)
for f in sorted((ROOT / "manual").glob("*.csv")):
    for r in csv.DictReader(f.open(encoding="utf-8-sig")):
        # シリアは2010年（内戦の前）までの値しかないので、物価の表には入れるが、最新の値には使わない（apply_manual.py の REJECT）
        if r["field"] == "inflation_recent" and r["value"].strip() and r["iso3"] in series:
            series[r["iso3"]][int(r["year"][:4])] = round(float(r["value"]), 2)

out = {iso: {str(y): v for y, v in sorted(s.items())} for iso, s in sorted(series.items())}
(ROOT / "cpi_annual.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print("書き出した国:", sum(1 for s in out.values() if s), "/", len(out))
