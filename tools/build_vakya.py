"""tools/build_vakya.py — builds app/src/data/vakya.json for the वाक्यरचना game of क्रीडाङ्गणम्.

Reads (nothing is edited):
  data-source/25-vakya/vakya_lexicon_2026-11-20.py   which words go together (agents, objects, places …)
  data-source/25-vakya/vidyut_forms_2026-11-20.json  forms of the added nouns, adjectives, यद्/तद्, and roots not in rupa
  app/src/data/words.json                            checked declensions of the other nouns, and अस्मद्, युष्मद्
  app/public/rupa/<code>.json                        verb tables (vidyut-prakriya)
Cells keep every correct alternative, main form first ("गृहात्", "भूम्याम्|भूमौ"); sandhi-ready variants that
differ only in a final द् (गृहाद्, अकथयद्) are dropped, because the game writes words apart.

    python tools/build_vakya.py
"""
import json, os, runpy, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "data-source/25-vakya"))
L = runpy.run_path(os.path.join(ROOT, "data-source/25-vakya/vakya_lexicon_2026-11-20.py"))
VF = json.load(open(os.path.join(ROOT, "data-source/25-vakya/vidyut_forms_2026-11-20.json"), encoding="utf-8"))
W = {x["w"]: x for x in json.load(open(os.path.join(ROOT, "app/src/data/words.json"), encoding="utf-8")) if x.get("cat") in ("noun", "pronoun")}

SLP = {"a": "अ", "A": "आ", "i": "इ", "I": "ई", "u": "उ", "U": "ऊ", "f": "ऋ", "F": "ॠ", "x": "ऌ", "e": "ए", "E": "ऐ", "o": "ओ", "O": "औ"}
SIGN = {"A": "ा", "i": "ि", "I": "ी", "u": "ु", "U": "ू", "f": "ृ", "F": "ॄ", "x": "ॢ", "e": "े", "E": "ै", "o": "ो", "O": "ौ"}
CONS = dict(zip("kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh", "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह"))
def deva(s):
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c in CONS:
            out.append(CONS[c]); nx = s[i + 1] if i + 1 < len(s) else ""
            if nx == "a": i += 2; continue
            if nx in SIGN: out.append(SIGN[nx]); i += 2; continue
            out.append("्"); i += 1; continue
        if c in SLP: out.append(SLP[c])
        elif c == "M": out.append("ं")
        elif c == "H": out.append("ः")
        elif c == "~": out.append("ँ")
        else: out.append(c)
        i += 1
    return "".join(out)

def clean(cell, slp=False):
    """"a|b" or "a / b" → "main|alt": drop द्-final twins of त्-final forms; लोट् -तात् after the common form"""
    fs = [x.strip() for x in cell.replace(" / ", "|").split("|") if x.strip()]
    if slp: fs = [deva(x) for x in fs]
    fs = list(dict.fromkeys(fs))
    fs = [f for f in fs if not (f.endswith("द्") and f[:-2] + "त्" in fs)]
    fs.sort(key=lambda f: f.endswith("तात्"))
    return "|".join(fs)

# ── nouns ──
nouns = []
for s, g, en, pl, kind, x in L["N"]:
    if s in L["FROM_WORDS"]:
        w = W[s]; assert w["g"] == g, (s, w["g"], g)
        d = [[clean(c) for c in row[:7]] for row in w["d"]]
    else:
        d = [[clean(c) for c in row[:7]] for row in VF["nouns"][s]]
    assert all(all(c for c in row) for row in d), s
    nouns.append({"w": s, "g": g, "en": en, "pl": pl, "k": kind, **{k: v for k, v in x.items() if k != "nyap"}, "d": d})
# ── adjectives ──
adj = [{"w": m, "f": f, "en": en, "desc": desc, "d": {g: [[clean(c) for c in row[:7]] for row in VF["adjectives"][m][g]] for g in "mnf"}}
       for m, f, en, desc in L["A"]]
# ── pronouns ──
pers = {"1": [clean(W["अस्मद्"]["d"][n][0]) for n in range(3)], "2": [clean(W["युष्मद्"]["d"][n][0]) for n in range(3)]}
rel = {s: {g: [[clean(c) for c in row[:7]] for row in VF["pronouns"][s][g]] for g in "mfn"} for s in ("यद्", "तद्")}
# ── verbs ──
def table(code, pre):
    p = os.path.join(ROOT, "app/public/rupa", code + ".json")
    t = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else VF["roots"][code]
    return t[pre]
verbs = []
for key, v in L["V"].items():
    e = table(v["code"], v.get("pre", ""))
    mode = v.get("mode") or ("kartari_P" if "kartari_P" in e["t"] else "kartari_A")
    f = {lk: [clean(c, True) for c in e["t"][mode][lk]] for lk in ("lat", "lan", "lrt", "lot", "vidhilin")}
    k = e["k"]
    ktva = v.get("ktva_form") or clean(k.get("ktvA", ""), True)
    if v.get("ktva_main"):
        alts = ktva.split("|"); assert v["ktva_main"] in alts, (key, alts)
        ktva = "|".join([v["ktva_main"]] + [a for a in alts if a != v["ktva_main"]])
    tum = clean(k.get("tumun", ""), True)
    if v.get("ktva_form"): assert v["ktva_form"] in clean(k.get("ktvA", ""), True).split("|"), (key, k.get("ktvA"))
    out = {"key": key, "f": f, "ktvaF": ktva, "tumF": tum, "pada": "A" if mode == "kartari_A" else "P",
           **{a: b for a, b in v.items() if a not in ("code", "pre", "mode", "ktva_main", "ktva_form")}}
    verbs.append(out)
data = {"nouns": nouns, "adj": adj, "verbs": verbs, "pers": pers, "rel": rel,
        "man": {k: list(v) for k, v in L["MAN"].items()}, "time": L["TIME"], "placeFor": L["PLACE_FOR"], "owned": L["OWNED"],
        "placeEn": L["PLACE_EN"]}
json.dump(data, open(os.path.join(ROOT, "app/src/data/vakya.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(nouns), "nouns,", len(adj), "adjectives,", len(verbs), "verbs → app/src/data/vakya.json")
