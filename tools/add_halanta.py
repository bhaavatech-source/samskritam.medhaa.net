"""tools/add_halanta.py — the halanta śabdas added on 2026-11-08 (भिषज्, जलमुच् …).
Forms: vidyut-prakriyā's subanta generator (run once in the build sandbox; its output is saved in
data-source/01-shabda-words/halanta_additions_2026-11-08.json, so the game build does not need vidyut),
then the fixes below. Meanings: /tmp/hal/m1.tsv → the same file (17 languages, 'draft')."""
import sys, json, re, subprocess, collections
sys.path.insert(0, "/home/claude/tools/meanings"); sys.path.insert(0, "/home/claude/tools/dhatu")
from mw import slp1
from slp import deva
ROOT = "/home/claude/smg"
rows = [l.split("\t") for l in open("/tmp/hal/words.tsv", encoding="utf-8").read().strip().split("\n")]
M = {l.split("\t")[0]: l.rstrip("\n").split("\t")[1:] for l in open("/tmp/hal/m1.tsv", encoding="utf-8")}
L17 = ["en", "hi", "te", "ta", "kn", "ml", "mr", "bn", "or", "de", "fr", "es", "ru", "ar", "zh", "ja", "ko"]
inp = "\n".join(f"{i}\t{slp1(w)}\t{g}" for i, (w, g) in enumerate(rows)) + "\n"
out = subprocess.run(["/home/claude/src/vbuild/target/release/sup"], input=inp, capture_output=True, text=True).stdout
gen = collections.defaultdict(dict)
for l in out.splitlines():
    i, vi, va, fs = l.split("\t"); gen[int(i)][(va, vi)] = [deva(f) for f in fs.split("|") if f]
VIB = ["prathama", "dvitiya", "tritiya", "chaturthi", "panchami", "shashthi", "saptami", "sambodhana"]
NUM = ["singular", "dual", "plural"]
def tab(*r): return [x.split() for x in r]
MANUAL = {
 "पुंस्": tab("पुमान् पुमांसम् पुंसा पुंसे पुंसः पुंसः पुंसि पुमन्", "पुमांसौ पुमांसौ पुम्भ्याम् पुम्भ्याम् पुम्भ्याम् पुंसोः पुंसोः पुमांसौ",
             "पुमांसः पुंसः पुम्भिः पुम्भ्यः पुम्भ्यः पुंसाम् पुंसु पुमांसः"),
}
UGIT = {"बलवत्": ("बलवान्", "बलवन्", "बलवन्त"), "बुद्धिमत्": ("बुद्धिमान्", "बुद्धिमन्", "बुद्धिमन्त"), "बृहत्": ("बृहन्", "बृहन्", "बृहन्त")}
VOICED = {"द्": "त्", "ग्": "क्", "ड्": "ट्", "ब्": "प्"}
def iast(w):
    s = slp1(w); T = str.maketrans({"A": "ā", "I": "ī", "U": "ū", "f": "ṛ", "F": "ṝ", "x": "ḷ", "E": "ai", "O": "au", "M": "ṃ", "H": "ḥ", "N": "ṅ", "Y": "ñ", "w": "ṭ", "W": "ṭh", "q": "ḍ", "Q": "ḍh", "R": "ṇ", "S": "ś", "z": "ṣ", "K": "kh", "G": "gh", "C": "ch", "J": "jh", "T": "th", "D": "dh", "P": "ph", "B": "bh"})
    return s.translate(T)
entries = []
for i, (w, g) in enumerate(rows):
    if w in MANUAL: d = MANUAL[w]
    else:
        d = []
        for va in NUM:
            row = []
            for vi in VIB:
                fs = gen[i].get((va, vi), [])
                if w == "सीमन्": fs = [f for f in fs if f.startswith("सी")]                       # vidyut also gave सा/सया (wrong stem)
                fs = [f for f in fs if not (f[-2:] in VOICED and f[:-2] + VOICED[f[-2:]] in fs)]   # वाक् not वाग् at the end
                if re.search(r"[ुि]स्$", w): fs = [re.sub(r"([ुि])स(?!्)", r"\1ष", f) for f in fs]    # इणः षः: ज्योतिषा (8.3.59)
                row.append(fs[0] if fs else "")
            d.append(row)
        if w in UGIT:                                                                            # उगिदचां सर्वनामस्थानेऽधातोः (7.1.70)
            nom, voc, st = UGIT[w]
            d[0][0], d[0][7], d[0][1] = nom, voc, st + "म्"
            for n in (1, 2): d[n][0] = d[n][7] = st + ("ौ" if n == 1 else "ः")
            d[1][1] = st + "ौ"
        if w == "पुर्":                                                                           # वोरुपधाया दीर्घ इकः (8.2.76): पूः, पूर्भ्याम्
            d = [[re.sub(r"^पुर्(?=भ|ष)", "पूर्", re.sub(r"^पुः$", "पूः", f)) for f in r] for r in d]
    m = {l: [M[w][k], "draft"] for k, l in enumerate(L17) if k < len(M[w]) and M[w][k]}
    cat = "adjective" if w in UGIT else "noun"
    entries.append({"id": f"SH-{211 + i:06d}", "w": w, "iast": iast(w), "g": g, "cat": cat, "m": m, "d": d, "ch": 0,
                    "notes": ["added 2026-11-08 (halanta); forms: vidyut-prakriyā + reviewed fixes; meanings: draft"]})
json.dump(entries, open(f"{ROOT}/data-source/01-shabda-words/halanta_additions_2026-11-08.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(entries))
