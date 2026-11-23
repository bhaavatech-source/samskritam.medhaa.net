"""tools/build_sahitya.py — builds the data of the साहित्यम् section's अलङ्काराः and छन्दांसि tabs.

Reads (nothing is edited):
  data-source/26-alankara/alankaras_complete-v3.json
  data-source/27-chandas-vrittas/chandas_vrittas_complete_corrected.json
  data-source/27-chandas-vrittas/chandas_classes_2026-11-22.py   (26 classes, Vṛttaratnākara lists, Vedic notes)
Writes:
  app/src/data/alankara.json
  app/src/data/chandas.json

Every vṛtta's example is scanned syllable by syllable (laghu/guru). An example that does not
scan in its own metre is not shown in the app; its entry gets an "example_note" instead.

    python tools/build_sahitya.py
"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

# ── laghu / guru scansion (same rules as app/src/sahitya/scan.ts) ──
V_IND = set("अआइईउऊऋॠऌएऐओऔ"); LONG_IND = set("आईऊॠएऐओऔ")
MAT = {"ा": 1, "ि": 0, "ी": 1, "ु": 0, "ू": 1, "ृ": 0, "ॄ": 1, "ॢ": 0, "े": 1, "ै": 1, "ो": 1, "ौ": 1}
isC = lambda c: "क" <= c <= "ह"
def scan(s):
    s = re.sub(r"[^ऀ-ॣ]", "", s).replace("ऽ", "")
    syl, i, n = [], 0, len(s)
    while i < n:
        c = s[i]
        if c in V_IND: syl.append(c in LONG_IND); i += 1
        elif isC(c):
            if i + 1 < n and s[i + 1] == "्": i += 2; continue
            if i + 1 < n and s[i + 1] in MAT: syl.append(MAT[s[i + 1]] == 1); i += 2
            else: syl.append(False); i += 1
        elif c in "ंः" and syl: syl[-1] = True; i += 1; continue
        else: i += 1; continue
        j, k = i, 0
        while j < n:
            if isC(s[j]):
                k += 1
                if j + 1 < n and s[j + 1] == "्": j += 2; continue
                break
            if s[j] in "ंःँ": j += 1; continue
            break
        if k >= 2: syl[-1] = True
    return "".join("ऽ" if h else "।" for h in syl)

FIXED = {  # patterns not given as a single gaṇa string in the source
    "VRIT-001": {"kind": "anushtup"},
    "VRIT-004": {"kind": "upajati", "pats": ["ऽऽ।ऽऽ।।ऽ।ऽऽ", "।ऽ।ऽऽ।।ऽ।ऽऽ"]},
    "VRIT-015": {"kind": "matra", "matra": [30, 27]},
    "VRIT-029": {"kind": "matra", "matra": [30, 30]},
    "VRIT-024": {"kind": "ardhasama", "pats": ["।।ऽ।।ऽ।ऽ।ऽ", "।।ऽऽ।।ऽ।ऽ।ऽ"]},
    "VRIT-025": {"kind": "ardhasama", "pats": ["।।।।।।ऽ।ऽ।ऽऽ", "।।।।ऽ।।ऽ।ऽ।ऽऽ"]},
}
def fits(p, pat): return len(p) == len(pat) and p[:-1] == pat[:-1]
def anushtup_ok(p, even):
    return len(p) == 8 and p[4] == "।" and p[5] == "ऽ" and p[6] == ("।" if even else "ऽ")
def example_ok(m, lines):
    k = m["kind"]
    if k == "matra":
        mm = [sum(2 if c == "ऽ" else 1 for c in scan(l)) for l in lines]
        return [x + (1 if scan(l)[-1] == "।" else 0) for x, l in zip(mm, lines)] == m["matra"] or mm == m["matra"]
    if k == "anushtup":
        qs = [q for l in lines for q in (scan(l)[:8], scan(l)[8:])]
        return len(qs) == 4 and all(anushtup_ok(q, i % 2 == 1) for i, q in enumerate(qs))
    ps = [scan(l) for l in lines]
    if k == "upajati": return all(any(fits(p, x) for x in m["pats"]) for p in ps)
    if k == "ardhasama": return all(fits(p, m["pats"][i % 2]) for i, p in enumerate(ps))
    return all(fits(p, m["pat"]) for p in ps)

C = json.load(open(P("data-source/27-chandas-vrittas/chandas_vrittas_complete_corrected.json"), encoding="utf-8"))
vr = []
for v in C["vrittas"]:
    g = v["gana_structure"]
    m = dict(FIXED.get(v["id"], {}))
    if not m:
        m = {"kind": "daNDaka" if v["id"] == "VRIT-030" else "sama", "pat": re.sub(r"\s", "", g.get("symbols", ""))}
    ex = v["primary_example"]
    lines = [l for l in ex["sloka_sa"].split("\n") if l.strip()]
    ok = example_ok(m, lines)
    e = {k: v[k] for k in ("id", "name", "chandas_class", "gana_structure", "yati", "lakshana")}
    e["metre"] = m
    if ok:
        e["primary_example"] = {k: ex[k] for k in ex if k != "scansion"}
        e["prastara_and_samanvaya"] = v.get("prastara_and_samanvaya")
    else:
        e["example_note"] = {"sa": "अस्य वृत्तस्य उदाहरणश्लोकः स्वच्छन्दसि न सङ्गच्छते; परीक्षणानन्तरं योजयिष्यते।",
                             "en": "The example verse in the source does not scan in this metre, so it is held back until it is checked against a text."}
    vr.append(e)
    print(v["id"], "example ok" if ok else "EXAMPLE HELD BACK")
# ── the 26 classes and Vṛttaratnākara's metres ──
import runpy
K = runpy.run_path(P("data-source/27-chandas-vrittas/chandas_classes_2026-11-22.py"))
G = {"म": "ऽऽऽ", "य": "।ऽऽ", "र": "ऽ।ऽ", "स": "।।ऽ", "त": "ऽऽ।", "ज": "।ऽ।", "भ": "ऽ।।", "न": "।।।", "ग": "ऽ", "ल": "।"}
gpat = lambda g: "".join(G[c] for c in g)
DN = str.maketrans("0123456789", "०१२३४५६७८९")
key = lambda name: re.sub(r"(ः|म्)$", "", name.split(" ")[0])
detail_of = {key(v["name"]["sa"]): v["id"] for v in vr}
vr3 = []
for n, name, g, y, line in K["VR3"]:
    e = {"vr": n, "name": name, "ganas": " ".join(g), "pattern": gpat(g) if g else "", "yati": y, "line": line,
         "scans": bool(g) and len(scan(line)) == len(gpat(g)) and scan(line)[:-1] == gpat(g)[:-1]}
    if n in K["ALIASES"]: e["aliases"] = K["ALIASES"][n]
    if n in K["NOTES"]: e["note"] = K["NOTES"][n]
    d = detail_of.get(key(name))
    if d and (not g or n in (30,)) or (d and g and any(x["id"] == d and x["metre"].get("pat") == gpat(g) for x in vr)): e["detail"] = d
    vr3.append(e)
# metres with no gaṇa string of their own belong with the class of their neighbours
cls_of = {}
last = 1
for e in vr3:
    if e["pattern"]: last = len(e["pattern"])
    cls_of[e["vr"]] = last
classes = []
for n, name, alt, grp in K["CLASSES"]:
    c = {"n": n, "name": name, "alt": alt, "alt2": K["ALT_NAME"].get(n, ""), "group": grp, "patterns": 2 ** n,
         "vrittas": [e for e in vr3 if cls_of[e["vr"]] == n]}
    if n in K["VEDIC"]: c["vedic"] = K["VEDIC"][n]
    classes.append(c)
# where each detailed entry stands in the supplied VR
vr_num = {}
for e in vr3:
    vr_num.setdefault(key(e["name"]), e)
for v in vr:
    e = vr_num.get(key(v["name"]["sa"]))
    m = v["metre"]
    if e and e["pattern"] and m.get("pat") and e["pattern"] != m["pat"]:
        v["vr_check"] = {"en": f"Vṛttaratnākara 3.{e['vr']} gives a different metre of this name: {e['name']} = {e['ganas']} ({len(e['pattern'])} syllables). The metre described here is not in VR."}
    elif e:
        norm = lambda t: re.sub(r"ं(?=म)", "म्", t).rstrip(" ।॥")
        same = norm(e["line"]) == norm(v["lakshana"]["sloka_sa"].split("\n")[0]) or v["id"] == "VRIT-004"
        v["vr_check"] = {"vr": f"वृत्तरत्नाकरः ३.{str(e['vr']).translate(DN)}" + ("–३१" if e["vr"] == 30 else ""), "line": e["line"] if not same else "",
                         "en": "" if same else "Vṛttaratnākara defines it in other words (shown here); the definition above is from another work."}
VR_OTHER = {"VRIT-001": ("वृत्तरत्नाकरः २.२२ (पथ्यावक्त्रम्)", "युजोर्जेन सरिद्भर्तुः पथ्यावक्त्रं प्रकीर्तितम्"),
            "VRIT-015": ("वृत्तरत्नाकरः २.१", ""), "VRIT-029": ("वृत्तरत्नाकरः २.८", "आर्याप्रथमदलोक्तं यदि कथमपि लक्षणं भवेदुभयोः । दलयोः कृतयतिशोभां तां गीतिं गीतवान्भुजङ्गेशः ॥"),
            "VRIT-025": ("वृत्तरत्नाकरः ४.१०", ""), "VRIT-030": ("वृत्तरत्नाकरः ३.११२", "यदि ह नयुगलं ततः सप्तरेफास्तदा चण्डवृष्टिप्रपातो भवेद्दण्डकः")}
for v in vr:
    if v["id"] in VR_OTHER:
        r, l = VR_OTHER[v["id"]]
        v["vr_check"] = {"vr": r, "line": l, "en": "Vṛttaratnākara's own definition is shown here." if l else ""}
ardha = [{"name": n, "ganas": g, "pats": [gpat(x.replace(" ", "")) for x in re.findall(r"(?:विषमे|समे) ([^;]+)", g)]} for n, g in K["VR_ARDHASAMA"]]
fw = C["theoretical_framework"]
out = {"framework": fw, "vrittas": vr, "classes": classes, "groups": K["GROUPS"],
       "vedic_classes": [{"sa": a, "en": b, "counts": c} for a, b, c in K["VEDIC_CLASSES"]], "vedic_classes_note": K["VEDIC_CLASSES_NOTE"],
       "variants": [{"sa": a, "en": b, "d_en": c, "d_te": d, "d_hi": e} for a, b, c, d, e in K["VARIANTS"]], "variants_note": K["VARIANTS_NOTE"],
       "kinds": [{"sa": a, "en": b, "te": c, "hi": d} for a, b, c, d in K["KINDS"]], "vr_defs": K["VR_DEFS"], "vr_names": K["VR_NAMES"],
       "dandaka": [{"vr": a, "name": b, "ganas": c, "line": d} for a, b, c, d in K["DANDAKA"]],
       "jati": K["VR_JATI"], "ardhasama": ardha, "vishama": K["VR_VISHAMA"],
       "source": "Vṛttaratnākara of Kedārabhaṭṭa with Nārāyaṇabhaṭṭa's commentary, Kashi Sanskrit Series 55, Benares 1927; Madhavi R. Narsalay, Chandas as Vedāṅga, TTD 2019."}
json.dump(out, open(P("app/src/data/chandas.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(sum(len(c["vrittas"]) for c in classes), "VR metres in", len(classes), "classes;", sum(1 for e in vr3 if e["pattern"] and not e["scans"]), "definitions that do not scan")

A = json.load(open(P("data-source/26-alankara/alankaras_complete-v3.json"), encoding="utf-8"))
json.dump(A, open(P("app/src/data/alankara.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(vr), "vṛttas,", len(A["alankaras"]), "alaṅkāras")
