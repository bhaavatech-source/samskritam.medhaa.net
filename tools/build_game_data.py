import re
"""Build the game data (app/src/data/*.json) from the reviewed files in data-source/.

Run from anywhere:  python tools/build_game_data.py
Then rebuild the game:  cd app && npm run build
"""
import json, re, sys
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import avyaya85

LANGS = ["sa", "en", "te", "hi", "ta", "kn", "ml", "bn", "or", "mr", "de", "fr", "es", "ru", "ar", "zh", "ja", "ko"]
VIB = ["prathama", "dvitiya", "tritiya", "chaturthi", "panchami", "shashthi", "saptami", "sambodhana"]
NUM = ["singular", "dual", "plural"]

# ---- words
import glob
words = []
for x in json.load(open(os.path.join(ROOT, "data-source/01-shabda-words/shabda_with_declensions.json"), encoding="utf-8")):
    # Hold this unresolved headword out of learner content until its lemma and meanings are confirmed.
    if x.get("lemma") == "रेधस्":
        continue
    m = {}
    for l in LANGS:
        ms = x["meanings"].get(l) or []
        if ms:
            m[l] = [" ; ".join(y["text"] for y in ms[:2]), min((y.get("confidence", "reviewed") for y in ms),
                    key=["draft", "corrected", "linked", "standard", "direct", "reviewed"].index)]
    decl = [[(x["declension"].get(n, {}).get(v) or "") for v in VIB] for n in NUM]
    words.append({"id": x["id"], "w": x["lemma"], "iast": x["iast"], "g": x["gender"][0], "cat": x["category"], "m": m, "d": decl,
                  "ch": len(x.get("declension_changes", [])), "notes": x.get("review_notes_meanings", [])})

# ---- halanta śabdas added later (tools/add_halanta.py)
for af in sorted(glob.glob(os.path.join(ROOT, "data-source/01-shabda-words/halanta_additions_*.json"))):
    words.extend(json.load(open(af, encoding="utf-8")))
# गिर् was stored under the lemma गीर्, so its vowel-case forms came out as गीरम् …: only the pada-final forms
# lengthen (वोरुपधाया दीर्घ इकः 8.2.76: गीः, गीर्भ्याम्, गीर्षु); before a vowel it stays गिर् (गिरम्, गिरा)
for w in words:
    if w["w"] == "गीर्":
        w["d"] = [[re.sub(r"^गीर(?!्)", "गिर", f) for f in row] for row in w["d"]]

# ---- reviewed corrections (data-source/01-shabda-words/corrections_*.json), applied in date order
for cf in sorted(glob.glob(os.path.join(ROOT, "data-source/01-shabda-words/corrections_*.json"))):
    corr = json.load(open(cf, encoding="utf-8"))
    for w in words:
        c = corr.get(w["id"])
        if not c: continue
        if "g" in c: w["g"] = c["g"]
        if "cat" in c: w["cat"] = c["cat"]
        for lang, txt in c.get("m", {}).items(): w["m"][lang] = [txt, "corrected"]

# ---- verbs (25 dhātus)
PU = ["prathama_purusha", "madhyama_purusha", "uttama_purusha"]; VA = ["ekavacana", "dvivacana", "bahuvacana"]
LAK = ["lat", "lan", "lot", "vidhilin", "lrt", "lut", "lit", "lun", "asirlin", "lrn"]
def grid(block):
    out = {}
    for lk in LAK:
        g = block[lk]["conjugation_grid"]; rows = []
        for p in PU:
            row = []
            for v in VA:
                c = g.get(p, {}).get(v)
                row.append([c["form"], " / ".join(c.get("variants", [])), c["meanings"]["en"], c.get("book_page") or 0,
                            1 if "DIFFERS" in c.get("source", "") else 0] if c else None)
            rows.append(row)
        out[lk] = rows
    return out
verbs = []
ML = json.load(open(os.path.join(ROOT, "data-source/02-dhatu-verbs/dhatu_meanings_multilang.json"), encoding="utf-8"))
for x in json.load(open(os.path.join(ROOT, "data-source/02-dhatu-verbs/dhatu_25_corrected.json"), encoding="utf-8")):
    v = {"id": x["id"], "w": x["lemma"], "iast": x["iast"], "gana": x["gana"], "pada": x["pada"], "trans": x["transitivity"],
         "artha": x["dhatupatha"]["artha"], "m": {k: x["meanings"].get(k, "") for k in ("en", "te", "hi")}, "P": grid(x["lakara_conjugations"])}
    if "lakara_conjugations_atmanepada" in x: v["A"] = grid(x["lakara_conjugations_atmanepada"])
    if "karmani_conjugations" in x: v["K"] = grid(x["karmani_conjugations"])
    if "bhave_conjugations" in x: v["B"] = grid(x["bhave_conjugations"])
    v["mc"] = {k: "direct" for k in ("en", "te", "hi") if v["m"].get(k)}
    for lang, (txt, conf) in ML.get(v["w"], {}).items():   # the other 14 languages (drafts until reviewed)
        v["m"][lang] = txt; v["mc"][lang] = conf
    verbs.append(v)

# ---- kṛdantas
krt = []
for x in json.load(open(os.path.join(ROOT, "data-source/03-krt-participles/dhatu_krt_corrected.json"), encoding="utf-8")):
    f = {}
    for k, c in x["krt_rupas"].items():
        if c.get("form"):
            f[k] = [c["form"], c.get("meaning_en", ""), 1 if c.get("attested_in_dictionary") is True else 0, c["tier"][:4]]
    krt.append({"id": x["dhatu_id"], "w": x["lemma"], "gana": x["gana"], "pada": x["pada"], "en": x["meaning_en"], "f": f,
                "notes": x["review_notes"]})

# ---- sentences (220), with the known slips fixed
FIX = {"कुशालिनः": "कुशलिनः", "पााकं": "पाकं", "कार्याालये": "कार्यालये", "कयणम्": "क्रयणम्", "निश्चिन्ततः": "निश्चिन्तः"}
sents = []
for doc in json.load(open(os.path.join(ROOT, "data-source/06-gold-data/Example_Simple_sentences.json"), encoding="utf-8")):
    for c in doc["categories"]:
        cat = c["category_name_en"]; cat_sa = c.get("category_name_sa", "")
        for k, v in FIX.items(): cat_sa = cat_sa.replace(k, v)
        for s in c["sentences"]:
            sa = s["sa"]; fixed = []
            for k, v in FIX.items():
                if k in sa: sa = sa.replace(k, v); fixed.append(f"{k} → {v}")
            sents.append({"id": f"SN-{len(sents)+1:03d}", "sa": sa, "en": s["en"], "cat": cat, "cat_sa": cat_sa, "fixed": fixed})

# ---- sentence meanings in more languages (data-source/08-sentence-meanings/*.tsv: id, lang1, lang2 …)
import csv
for tf in sorted(glob.glob(os.path.join(ROOT, "data-source/08-sentence-meanings/*.tsv"))):
    with open(tf, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
    by_id = {r["id"]: r for r in rows}
    for snt in sents:
        r = by_id.get(snt["id"])
        if r:
            snt.setdefault("m", {}).update({k: v for k, v in r.items() if k != "id" and v})

# ---- hand-written Latin readings for languages that cannot be romanised by rule (ar, zh, ja)
with open(os.path.join(ROOT, "data-source/11-romanization/sentences_roman_ar_zh_ja.tsv"), encoding="utf-8") as fh:
    RR = {r["id"]: r for r in csv.DictReader(fh, delimiter="\t")}
for snt in sents:
    r = RR.get(snt["id"])
    if r: snt["r"] = {k: v for k, v in r.items() if k != "id" and v}

# ---- error-correction pairs (reviewed): only "ok" and "fixed" go into the game
er = json.load(open(os.path.join(ROOT, "data-source/09-error-correction/error_pairs_reviewed.json"), encoding="utf-8"))
errors = [{"id": x["id"], "wrong": x["incorrect"], "right": x["correct"], "note": x.get("why", "")}
          for x in er["pairs"] if x["status"] in ("ok", "fixed")]

# ---- padaccheda (Gold, Rāmāyaṇa ślokas)
pc = json.load(open(os.path.join(ROOT, "data-source/06-gold-data/Padaccheda.json"), encoding="utf-8"))
padaccheda = [{"id": f"PC-{i+1:03d}", "sloka": x["input"].strip(), "padas": [w.strip() for w in x["output"].split(",") if w.strip()]}
              for i, x in enumerate(pc["data_pairs"])]

# ---- पद्यविश्लेषणम् (verse analysis): the method + every analysed verse, normalised to one shape
pv = json.load(open(os.path.join(ROOT, "data-source/06-gold-data/Padyavishleshanam_G.json"), encoding="utf-8"))
PV_FIX = {"उडुपिन": "उडुपेन", "अपहास्यताम्": "उपहास्यताम्"}                      # typo in the Gold padaccheda (reviewed 2026-11-08)
def _pc(x):
    lst = x if isinstance(x, list) else [w.strip() for w in str(x).split(",")]
    return [PV_FIX.get(w, w) for w in lst if w]
def _karaka(k):
    out = []
    if isinstance(k, dict):
        for role, word in k.items(): out.append({"word": str(word), "role": role})
    elif isinstance(k, list):
        for r in k: out.append({"word": r.get("word", ""), "role": r.get("role", ""), "vibhakti": r.get("vibhakti", ""), "of": r.get("relation_to", "")})
    ROLE = [("प्रधानक्रिया", "क्रियापदम्"), ("अध्याहृत", "क्रियापदम् (अध्याहृतम्)"), ("कर्तृविशेषण", "कर्तृविशेषणम्"), ("कर्मविशेषण", "कर्मविशेषणम्"),
            ("अपादानविशेषण", "अपादानविशेषणम्"), ("कालविशेषण", "कालवाचकम् अव्ययम्"), ("adhikaraṇa", "अधिकरणम्"), ("अधिकरणकारक", "अधिकरणम्"), ("kartṛ", "कर्ता"), ("कर्तृकारक", "कर्ता"),
            ("karma", "कर्म"), ("कर्मकारक", "कर्म"), ("karaṇa", "करणम्"), ("करणकारक", "करणम्"), ("saṁpradāna", "सम्प्रदानम्"), ("sampradāna", "सम्प्रदानम्"),
            ("अपादानकारक", "अपादानम्"), ("adhikaraṇa", "अधिकरणम्"), ("अधिकरणकारक", "अधिकरणम्"), ("saṁbandha", "सम्बन्धः (षष्ठी — कारकं न)")]
    for r in out:
        note = ""
        m = re.search(r"\s*\((.*)\)\s*$", r["word"])
        if m and re.search(r"[A-Za-z]", m.group(1)): note, r["word"] = m.group(1).replace("$", ""), r["word"][:m.start()].strip()
        r["word"] = PV_FIX.get(r["word"], r["word"]).rstrip(".… ")
        r["note"] = note
        raw = r["role"].strip()
        r["role"] = next((v for k, v in ROLE if k in raw), raw)
        if r["word"].startswith("लोभात्"): r["role"] = "हेतुः (पञ्चमी · विभाषा गुणेऽस्त्रियाम् 2.3.25)"
        if r.get("of") == "वाल्मिकिः": r["of"] = "वाल्मीकिः"
    return out
intro = pv[0]
fe = intro["first_example"]; se = intro["second_example"]
verses = [{"id": "RV-1.1", "source": "रघुवंशम् 1.1", "verse": fe["verse"], "padaccheda": _pc(fe["padaccheda"]), "anvaya": fe["anvaya_krama"],
           "artha_sa": fe.get("artha", ""), "words": [{"word": w["word"], "form": w["form"]} for w in fe["detailed_word_form_analysis"]],
           "karaka": [], "notes": [fe["viśeṣāḥ"].get("meter", ""), fe["viśeṣāḥ"].get("alaṅkāra", "")]},
          {"id": "RV-1.2", "source": "रघुवंशम् 1.2", "verse": se["verse"], "padaccheda": _pc(se["padaccheda"]), "anvaya": "", "artha_sa": "",
           "words": [], "karaka": [], "notes": [se.get("note", "")]}]
# the first worked example's word list: वागर्थाविव is वागर्थौ + इव, not an avyaya in prathamā
for w in verses[0]["words"]:
    if w["word"] == "वागर्थाविव": w["form"] = "वागर्थौ (द्वितीया-द्विवचनम्) + इव (अव्ययम्, उपमायाम्)"
for v in pv[1]["verse_analyses"]:
    verses.append({"id": "RV-" + v["verse_number"], "source": "रघुवंशम् " + v["verse_number"], "verse": v["verse"], "padaccheda": _pc(v["padaccheda"]),
                   "anvaya": v.get("anvaya_krama", ""), "artha_sa": "", "words": [], "karaka": _karaka(v.get("kāraka_analysis")),
                   "notes": [str(v.get("alaṅkāra", ""))] if v.get("alaṅkāra") else []})
for v in pv[2]["shlokas"]:
    verses.append({"id": "VR-" + v["id"], "source": "वाल्मीकिरामायणम् " + v["id"], "verse": v["sanskrit_verse"], "padaccheda": _pc(v["padaccheda"]),
                   "anvaya": v.get("anvaya_krama", ""), "artha_sa": "", "words": [], "karaka": _karaka(v.get("karaka_analysis")), "notes": []})
PV_TEXT = {"गमिष्याम्यपहास्यताम्": "गमिष्याम्युपहास्यताम्", "अपहास्यताम्": "उपहास्यताम्", "कवियशः प्रार्थी": "कवियशःप्रार्थी",
           "यथापराथदण्डानाम्": "यथापराधदण्डानाम्", "पार्वतीपरमेश्वरौ वागर्थप्रतिपत्तये वन्दे इति।": "पार्वतीपरमेश्वरौ वागर्थप्रतिपत्तये वन्दे।"}
ANVAYA_ADD = {"RV-1.2": "सूर्यप्रभवः वंशः क्व, अल्पविषया (मम) मतिः च क्व? (अहम्) मोहात् दुस्तरं सागरम् उडुपेन तितीर्षुः अस्मि।"}
PV_R = json.load(open(os.path.join(ROOT, "data-source/11-romanization/padya_roman_ar_zh_ja.json"), encoding="utf-8"))
PV_M = json.load(open(os.path.join(ROOT, "data-source/10-verse-analysis/padya_meanings.json"), encoding="utf-8"))
for v in verses:
    for k in ("verse", "anvaya"):
        for a, b in PV_TEXT.items(): v[k] = v[k].replace(a, b)
    v["anvaya"] = v["anvaya"] or ANVAYA_ADD.get(v["id"], "")
    v["m"] = PV_M.get(v["id"], {})
    v["r"] = PV_R.get(v["id"], {})
# kāraka corrections after review (2026-11-08) — see docs/REVIEW-2026-11-08.md §Verse analysis
KARAKA_FIX = {
 ("RV-1.3", "वामनः इव (अहम्)"): {"word": "(अहम्)", "role": "कर्ता", "note": "उपमानम्: उद्बाहुः वामनः इव"},
 ("RV-1.3", "फले"): {"role": "अधिकरणम्", "note": "विषयसप्तमी — greed for the fruit"},
 ("RV-1.4", "पूर्वसूरिभिः"): {"role": "कर्ता", "note": "अनुक्तः कर्ता of कृत- (कर्मणि क्तः) — तृतीया by कर्तृकरणयोस्तृतीया 2.3.18; not करणम्"},
 ("RV-1.7", "त्यागाय, सत्याय, यशसे, प्रजायै"): {"role": "तादर्थ्यम् (चतुर्थी — कारकं न)", "note": "तादर्थ्ये चतुर्थी (वार्त्तिकम्) — 'for the sake of'; not सम्प्रदानम्"},
 ("RV-1.9", "चापलाय"): {"role": "तादर्थ्यम् (चतुर्थी — कारकं न)", "note": "तादर्थ्ये चतुर्थी — 'into rashness'; not सम्प्रदानम्"},
 ("RV-1.9", "तद्गुणैः"): {"role": "कर्ता (अनुक्तः) / हेतुः", "note": "agent of प्रचोदितः (कर्मणि क्तः), तृतीया 2.3.18; may also be read as हेतौ तृतीया 2.3.23"},
 ("VR-1.1.4", "कस्य"): {"role": "अपादानम् (अर्थतः) — षष्ठी", "note": "भीत्रार्थानां भयहेतुः 1.4.25 gives अपादानम्; the poet says कस्य — षष्ठी शेषे 2.3.50 (शेषत्वविवक्षा)"},
 ("VR-1.1.4", "जातरोषस्य"): {"role": "विशेषणम्", "of": "कस्य"},
 ("VR-1.1.2", "अस्ति"): {"note": "अध्याहृतम् — supplied, not in the verse"},
 ("VR-1.1.3", "अस्ति"): {"note": "अध्याहृतम् — supplied, not in the verse"},
}
for v in verses:
    for k in v["karaka"]:
        fx = KARAKA_FIX.get((v["id"], k["word"]))
        if fx: k.update(fx)
        if k.get("of"): k["of"] = re.sub(r"\s*\((first|second|third|fourth|fifth|implied Kartā)\)", "", k["of"])
padya = {"method": [{"n": st["step_number"], "title": st["sanskrit_action"], "details": st["details"]} for st in intro["analysis_steps"]],
         "adjectives": intro["special_note_on_adjectives"], "verses": verses}

data = {"words": words, "verbs": verbs, "krt": krt, "sents": sents, "avyaya": avyaya85.load(), "avyaya_cats": avyaya85.CAT,
        "built": "2026-11-08"}
# write the files the game reads (app/src/data/)
out = os.path.join(ROOT, "app", "src", "data")
def put(name, obj):
    with open(os.path.join(out, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
put("words.json", data["words"]); put("verbs.json", data["verbs"]); put("krt.json", data["krt"])
put("sentences.json", data["sents"]); put("errors.json", errors); put("padaccheda.json", padaccheda); put("padya.json", padya); put("avyaya.json", {"items": data["avyaya"], "cats": data["avyaya_cats"]})
print({k: len(v) for k, v in data.items() if isinstance(v, list)})
print(sum(1 for x in sents if x["fixed"]), "sentences had spelling fixed;", len(errors), "error pairs;", len(padaccheda), "padaccheda ślokas;", len(verses), "analysed verses")
