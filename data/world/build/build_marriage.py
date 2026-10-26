"""国ごとの結婚のしかた（見合い・家族が決める結婚の割合、許嫁、婚資・持参金）を data/world/marriage.json に書き出す。
使い方: python3 -I data/world/build/build_marriage.py（そのあと apply_manual.py で調査済みの値に置き換える）

国をまたいでそろった統計がないため、ここの値はすべて地域ごとの目安（推定）。
- arranged: 結婚のうち、家族が相手を決める・縁談で決まる割合（本人の同意があるものを含む）
- betrothal: そのうち、子どものころに親どうしの約束（許嫁）で決まっている割合
- payment: 結婚のときのお金の習わし。dowry=妻の家から夫の家へ（持参金）、brideprice=夫の側から妻の家へ（婚資）、
           mahr=夫から妻本人へ（マフル）、none=特になし
- paymentYears: その額が、ふつうの働き手の年収の何年分か
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]

# (arranged, betrothal, payment, paymentYears)
REGION = {
    "south_asia_dowry": (0.8, 0.08, "dowry", 1.5),
    "afg": (0.9, 0.3, "brideprice", 2.0),
    "sahel": (0.7, 0.25, "brideprice", 0.8),
    "ssa": (0.35, 0.05, "brideprice", 0.6),
    "mena": (0.5, 0.05, "mahr", 1.0),
    "gulf_yemen": (0.75, 0.15, "mahr", 1.5),
    "central_asia": (0.45, 0.05, "brideprice", 0.6),
    "china": (0.1, 0.0, "brideprice", 1.0),
    "se_asia_brideprice": (0.15, 0.02, "brideprice", 0.4),
    "se_asia_mahr": (0.15, 0.02, "mahr", 0.2),
    "se_asia": (0.05, 0.0, "none", 0.0),
    "east_asia": (0.05, 0.0, "none", 0.0),
    "west": (0.02, 0.0, "none", 0.0),
    "latam": (0.02, 0.0, "none", 0.0),
    "png": (0.3, 0.05, "brideprice", 1.0),
}
GROUP = {
    "south_asia_dowry": "IND PAK BGD NPL LKA",
    "afg": "AFG",
    "sahel": "NER MLI TCD BFA GIN SOM SSD SDN SEN CAF",
    "ssa": "NGA COD ETH TZA UGA KEN AGO MOZ ZAF MDG CIV CMR GHA ZMB MWI ZWE BEN BDI RWA TGO SLE COG",
    "mena": "EGY IRN IRQ TUR DZA MAR SYR JOR",
    "gulf_yemen": "YEM SAU",
    "central_asia": "UZB TJK KAZ",
    "china": "CHN",
    "se_asia_brideprice": "THA KHM MMR",
    "se_asia_mahr": "IDN MYS",
    "se_asia": "VNM PHL",
    "east_asia": "JPN KOR PRK",
    "west": "USA RUS DEU GBR FRA ITA CAN ESP AUS POL UKR ISR",
    "latam": "BRA MEX COL PER ARG VEN GTM ECU BOL HTI HND DOM CHL",
    "png": "PNG",
}
# 地域の目安から外れることが知られている国の調整
ADJUST = {
    "LKA": {"arranged": 0.3},
    "KAZ": {"arranged": 0.15},
    "PRK": {"arranged": 0.3},
    "ZAF": {"arranged": 0.05},
    "TUR": {"arranged": 0.45},
    "JPN": {"arranged": 0.06},
}

countries = json.loads((ROOT / "countries.json").read_text(encoding="utf-8"))
out = {}
for c in countries:
    iso = c["iso3"]
    g = next((g for g, isos in GROUP.items() if iso in isos.split()), None)
    if g is None:
        raise SystemExit(f"地域が決まっていない国: {iso}")
    a, b, pay, yrs = REGION[g]
    v = {"arranged": a, "betrothal": b, "payment": pay, "paymentYears": yrs}
    v.update(ADJUST.get(iso, {}))
    v["estimated"] = ["arranged", "betrothal", "payment", "paymentYears"]
    v["region"] = g
    out[iso] = v
(ROOT / "marriage.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print("書き出した国:", len(out))
