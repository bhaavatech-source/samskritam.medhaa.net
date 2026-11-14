"""tools/build_prakriya.py — data-source/15-prakriya/prakriya.py → app/src/data/prakriya.json
(the बोधः chapters प्रकृतिः प्रत्ययश्च and प्रक्रिया, and the derivations for the प्रक्रियाक्रमः station).
Run:  python tools/build_prakriya.py"""
import json, os, runpy
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = runpy.run_path(os.path.join(ROOT, "data-source/15-prakriya/prakriya.py"))
out = {"prakriti": d["PRAKRITI"], "prakriya": d["PRAKRIYA"], "derivations": d["DERIVATIONS"], "fixes": d["FIXES"]}
for x in out["derivations"]:
    assert len(x["steps"]) >= 3 and len({s[0] for s in x["steps"]}) == len(x["steps"]), x["w"]   # steps must be distinct for the ordering game
json.dump(out, open(os.path.join(ROOT, "app/src/data/prakriya.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(out["derivations"]), "derivations,", len(out["prakriti"]["kinds"]), "kinds of pratyaya,", len(out["fixes"]), "fixes")
