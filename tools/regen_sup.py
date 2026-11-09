import json, subprocess, sys, collections
sys.path.insert(0, "/home/claude/tools/meanings"); sys.path.insert(0, "/home/claude/tools/dhatu")
from mw import slp1
from slp import deva
d = json.load(open("/home/claude/out/shabda_meanings_pilot.json"))
NYAP_I = {"नदी", "गौरी", "नारी"}
STEMFIX = {"योद्धा": "योद्धृ", "उरस": "उरस्", "कोटिः": "कोटि"}
GENDERFIX = {"SH-000044": "m"}
lines = []; meta = {}
for x in d:
    g = GENDERFIX.get(x["id"]) or {"masculine": "m", "feminine": "f", "neuter": "n"}.get(x["gender"], "m")
    base = STEMFIX.get(x["lemma"], x["stem"]["base"])
    nyap = x["category"] != "pronoun" and g == "f" and (base.endswith("ा") or base in NYAP_I)
    lines.append(f"{x['id']}\t{slp1(base)}\t{g}" + ("\tnyap" if nyap else ""))
out = subprocess.run(["/home/claude/src/vbuild/target/release/sup"], input="\n".join(lines) + "\n", capture_output=True, text=True).stdout
gen = collections.defaultdict(dict)
for l in out.splitlines():
    i, vi, va, fs = l.split("\t")
    forms = [deva(f) for f in fs.split("|") if f]
    voiced = {"द्": "त्", "ग्": "क्", "ड्": "ट्", "ब्": "प्"}
    forms = [f for f in forms if not (f[-2:] in voiced and f[:-2] + voiced[f[-2:]] in forms)]
    gen[i][(va, vi)] = list(dict.fromkeys(forms))
import re
VO = "ािीुूृॄेैोौ"
def fix(lemma, base, va, vi, fs):
    # 1. agent nouns in -तृ: strong stem -तार्
    if base in ("दातृ", "धातृ", "योद्धृ") and ((vi in ("prathama", "sambodhana") and va != "singular") or (vi == "dvitiya" and va != "plural")):
        fs = [f.replace("तरम्", "तारम्").replace("तरौ", "तारौ").replace("तरः", "तारः").replace("द्धरम्", "द्धारम्").replace("द्धरौ", "द्धारौ").replace("द्धरः", "द्धारः") for f in fs]
    # 2. -उस्/-इस् stems: स् → ष् before vowels (8.3.59)
    if re.search(r"[ुि]स्$", base):
        fs = [re.sub(r"([ुि])स(?!्)", r"\1ष", f) for f in fs]
    return fs
MANUAL = {}
def table(rows):
    vib = ["prathama", "dvitiya", "tritiya", "chaturthi", "panchami", "shashthi", "saptami", "sambodhana"]
    t = {}
    for va, row in zip(("singular", "dual", "plural"), rows):
        for vi, f in zip(vib, row.split()): t[(va, vi)] = [f]
    return t
def ugit(nom, voc, strong, weak):
    # strong cases use strong stem + vowel endings; weak from vidyut ok
    return {("singular","prathama"): [nom], ("singular","sambodhana"): [voc], ("singular","dvitiya"): [strong+"म्"],
            ("dual","prathama"): [strong+"ौ"], ("dual","dvitiya"): [strong+"ौ"], ("dual","sambodhana"): [strong+"ौ"],
            ("plural","prathama"): [strong+"ः"], ("plural","sambodhana"): [strong+"ः"]}
UG = {"SH-000077": ugit("श्रीमान्", "श्रीमन्", "श्रीमन्त", None), "SH-000078": ugit("धीमान्", "धीमन्", "धीमन्त", None),
      "SH-000079": ugit("भगवान्", "भगवन्", "भगवन्त", None), "SH-000080": ugit("महान्", "महन्", "महान्त", None),
      "SH-000081": ugit("गच्छन्", "गच्छन्", "गच्छन्त", None)}
MANUAL["SH-000074"] = table(["विद्वान् विद्वांसम् विदुषा विदुषे विदुषः विदुषः विदुषि विद्वन्",
                             "विद्वांसौ विद्वांसौ विद्वद्भ्याम् विद्वद्भ्याम् विद्वद्भ्याम् विदुषोः विदुषोः विद्वांसौ",
                             "विद्वांसः विदुषः विद्वद्भिः विद्वद्भ्यः विद्वद्भ्यः विदुषाम् विद्वत्सु विद्वांसः"])
MANUAL["SH-000126"] = table(["विश्वपाः विश्वपाम् विश्वपा विश्वपे विश्वपः विश्वपः विश्वपि विश्वपाः",
                             "विश्वपौ विश्वपौ विश्वपाभ्याम् विश्वपाभ्याम् विश्वपाभ्याम् विश्वपोः विश्वपोः विश्वपौ",
                             "विश्वपाः विश्वपः विश्वपाभिः विश्वपाभ्यः विश्वपाभ्यः विश्वपाम् विश्वपासु विश्वपाः"])
def yv(nom, c, cons, loc_sg=None):  # c = vowel stem before endings (e.g. सुधिय्, प्रध्य्, ग्रामण्य्, खलप्व्)
    a = c[:-1]  # drop virama
    L = loc_sg or a + "ि"
    return table([f"{nom} {a}म् {a}ा {a}े {a}ः {a}ः {L} {nom}",
                  f"{a}ौ {a}ौ {cons}भ्याम् {cons}भ्याम् {cons}भ्याम् {a}ोः {a}ोः {a}ौ",
                  f"{a}ः {a}ः {cons}भिः {cons}भ्यः {cons}भ्यः {a}ाम् {cons}षु {a}ः"])
MANUAL["SH-000130"] = yv("सुधीः", "सुधिय्", "सुधी")
MANUAL["SH-000127"] = yv("प्रधीः", "प्रध्य्", "प्रधी")
MANUAL["SH-000128"] = yv("ग्रामणीः", "ग्रामण्य्", "ग्रामणी", "ग्रामण्याम्")
MANUAL["SH-000129"] = yv("खलपूः", "खलप्व्", "खलपू")
def ifem(stem):  # feminine -इ like मति, singular only
    a = stem[:-1]
    return {("singular", "prathama"): [stem + "ः"], ("singular", "dvitiya"): [stem + "म्"], ("singular", "tritiya"): [a + "्या"],
            ("singular", "chaturthi"): [a + "्यै", a + "ये"], ("singular", "panchami"): [a + "्याः", a + "ेः"], ("singular", "shashthi"): [a + "्याः", a + "ेः"],
            ("singular", "saptami"): [a + "्याम्", a + "ौ"]}
for i, st in [("SH-000156", "विंशति"), ("SH-000160", "षष्टि"), ("SH-000161", "सप्तति"), ("SH-000162", "अशीति"), ("SH-000163", "नवति"), ("SH-000169", "कोटि")]:
    MANUAL[i] = ifem(st)
for x in d:
    if x["id"] in UG:
        for k, v in UG[x["id"]].items(): gen[x["id"]][k] = v
    if x["id"] in MANUAL:
        for k, v in MANUAL[x["id"]].items(): gen[x["id"]][k] = v
    base = STEMFIX.get(x["lemma"], x["stem"]["base"])
    for k in list(gen[x["id"]]): gen[x["id"]][k] = fix(x["lemma"], base, k[0], k[1], gen[x["id"]][k])
stat = collections.Counter(); changed = collections.defaultdict(list)
for x in d:
    old = x["declension"]; new = {}
    full = x["category"] in ("noun", "adjective", "participle") or int(x["id"][-3:]) in (170, 171, 172, 173, 174, 175)
    for va in ("singular", "dual", "plural"):
        new[va] = {}
        for vi in ("prathama", "dvitiya", "tritiya", "chaturthi", "panchami", "shashthi", "saptami", "sambodhana"):
            if vi == "sambodhana" and x["category"] in ("pronoun", "numeral"): continue
            if not full and not old[va].get(vi): continue
            fs = gen[x["id"]].get((va, vi), [])
            if not fs: continue
            new[va][vi] = " / ".join(fs)
            o = (old[va].get(vi) or "").replace("हे ", "").strip()
            same = o in fs or o == new[va][vi]
            stat["same" if same else ("added" if not o else "changed")] += 1
            if o and not same: changed[x["id"]].append((va, vi, o, new[va][vi]))
    x["declension_old"] = old; x["declension"] = new
    x["declension_source"] = "vidyut-prakriya (Pāṇinian derivation); review flags welcome"
    if x["id"] in changed: x["declension_changes"] = [{"number": a, "case": b, "old": c, "new": e} for a, b, c, e in changed[x["id"]]]
json.dump(d, open("/home/claude/mvp/shabda_regen.json", "w"), ensure_ascii=False, indent=1)
print(stat, "records with changes:", len(changed))
for i in list(changed)[:200:9]:
    print(i, [(a[:2], b[:4], c, e) for a, b, c, e in changed[i][:4]])
