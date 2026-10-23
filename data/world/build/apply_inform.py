"""INFORM Risk Mid 2026 (v0.7.3) の国別スコアを risks.json に反映する。
使い方: python3 -I data/world/build/apply_inform.py data/world/raw/inform/INFORM_Risk_Mid_2026_v073.xlsx data/world/risks.json
スコアは 0〜10。ゲームでは 0〜1 に直して使う。
"""
import json, sys
import openpyxl

xlsx, risks_path = sys.argv[1], sys.argv[2]
ws = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)["INFORM Risk 2026 (a-z)"]
rows = list(ws.iter_rows(values_only=True))
head = [str(h).strip() if h is not None else "" for h in rows[1]]
col = {name: head.index(name) for name in head if name}

def f(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

inform = {}
for r in rows[3:]:
    iso = r[col["ISO3"]]
    if not iso:
        continue
    g = lambda name: f(r[col[name]])
    inform[iso] = {
        "earthquake": g("Earthquake"),
        "flood": max(x for x in [g("River Flood"), g("Coastal flood"), 0] if x is not None),
        "drought": g("Drought"),
        "epidemic": g("Epidemic"),
        "conflictProjected": g("Projected Conflict Probability"),
        "conflictCurrent": g("Current Conflict Intensity"),
    }

risks = json.load(open(risks_path, encoding="utf-8"))
updated, missing = 0, []
for iso, v in risks.items():
    s = inform.get(iso)
    if not s:
        missing.append(iso)
        continue
    est = set(v.get("estimated", []))
    # INFORM のスコアは国全体の危険度（対数に近い目盛り）。ゲームでは「ふつうの家庭が被害を受けやすいか」の
    # 相対値（0〜1）に直して使う。生のスコアは inform に残す。
    v["inform"] = {k: s[k] for k in s}
    conv = {
        "floodRisk": lambda x: (x / 10) ** 3,       # 洪水・地震は上位の国に集中させる
        "earthquakeRisk": lambda x: (x / 10) ** 3,
        "droughtRisk": lambda x: x / 10,
        "epidemicRisk": lambda x: x / 10,
    }
    for key, src in [("earthquakeRisk", "earthquake"), ("floodRisk", "flood"), ("droughtRisk", "drought"), ("epidemicRisk", "epidemic")]:
        if s[src] is not None:
            v[key] = round(conv[key](s[src]), 4)
            est.discard(key)
    if s["conflictCurrent"] is not None:
        # 紛争による避難：いまの紛争の激しさを指数で直す（10 → 1、7 → 約0.06、5 → 0.01）
        v["conflictRisk"] = round(10 ** ((s["conflictCurrent"] - 10) / 2.5), 4) if s["conflictCurrent"] > 0 else 0
        est.discard("conflictRisk")
    v["estimated"] = sorted(est)
    v.setdefault("years", {})["inform"] = "Mid 2026 v0.7.3"
    updated += 1

json.dump(risks, open(risks_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("updated", updated, "missing", missing)
