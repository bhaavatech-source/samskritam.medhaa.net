"""Build app/src/data/play_dhatu.json for the क्रीडाङ्गणम् (Play) games from dhatu_400_tinanta.json.

Keeps, per root: id, root, gaṇa number, pada, meanings (sa/en/hi/te) and the kartari forms of
five lakāras (लट्, लङ्, ऌट्, लोट्, विधिलिङ्) as 9 cells each (prathama eka … uttama bahu; "" = none).
A cell with alternatives is "main|alt|alt"; all are accepted in the games. In लोट् the common
form (भवतु, भव) is put first where the table lists the -तात् form first.
The source file is not changed.

    python tools/build_play_dhatu.py dhatu_400_tinanta.json app/src/data/play_dhatu.json
"""
import json, re, sys

src, out = sys.argv[1:3]
LK = ["lat", "lan", "lrt", "lot", "vidhilin"]
P = ["prathama_purusha", "madhyama_purusha", "uttama_purusha"]
V = ["ekavacana", "dvivacana", "bahuvacana"]
roots = []
for d in json.load(open(src, encoding="utf-8")):
    m = re.search(r"\((\d+)", d["gana"])
    g = int(m.group(1)) if m else 0
    if "णिजन्त" in d["gana"]: g = 11          # causatives as their own group
    f = {}
    for lk in LK:
        c = d["lakara_conjugations"].get(lk)
        if not c: continue
        cells = []
        for p in P:
            for v in V:
                cell = (c["conjugation_grid"].get(p) or {}).get(v) or {}
                forms = [x for x in [cell.get("form")] + (cell.get("variants") or []) if x]
                if lk == "lot" and len(forms) > 1 and forms[0].endswith("तात्"):
                    forms = forms[1:] + forms[:1]
                cells.append("|".join(dict.fromkeys(forms)))
        if any(cells): f[lk] = cells
    if "lat" not in f: continue
    m = {k: d["meanings"].get(k, "") for k in ("sa", "en", "hi", "te")}
    roots.append([d["id"], d["lemma"], g, d["pada"], m, f])
json.dump({"lakaras": LK, "roots": roots}, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(roots), "roots →", out)
