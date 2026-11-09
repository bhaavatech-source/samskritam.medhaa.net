"""
tools/build_grammar.py — builds app/src/data/grammar.json: सन्धिः, समासः, प्रत्ययाः (कृत्), उपसर्गाः.

Sources (Gold data, never edited in place):
  data-source/06-gold-data/Sandhi_Gold_Data_UPDATED_COMPLETE_P1.json
  data-source/06-gold-data/Samasa_Gold_Data_G.json
  data-source/06-gold-data/Kritya_Krit_Pratyayas_G.json, upasarga_gold_data.json
Corrections (reviewed 2026-11-08, every change has a reason):
  data-source/13-sandhi/rules_2026-11-08.py      rule names, sūtras, fixed examples
  data-source/12-samasa/corrections_2026-11-08.py fixed compounds, vigrahas, types

Run:  python tools/build_grammar.py          (python tools/build_grammar.py --list  prints the sandhi examples with their index)
"""
import json, os, re, sys, runpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = lambda f: json.load(open(os.path.join(ROOT, "data-source/06-gold-data", f), encoding="utf-8"))
SR = runpy.run_path(os.path.join(ROOT, "data-source/13-sandhi/rules_2026-11-08.py"))
SC = runpy.run_path(os.path.join(ROOT, "data-source/12-samasa/corrections_2026-11-08.py"))

# ═════════ सन्धिः ═════════
sd = G("Sandhi_Gold_Data_UPDATED_COMPLETE_P1.json")
rules, n, listing = [], 0, []
for part in ["PART_7_SVARA_SANDHI_COMPREHENSIVE", "PART_8_VYANJANA_SANDHI", "PART_9_THREE_VARNA_SANDHI", "PART_10_VISARGA_SANDHI_EXPANDED"]:
    for rk, rv in sd[part].items():
        if not isinstance(rv, dict) or rk not in SR["RULES"]: continue
        rid, group, name, en, sutra, what = SR["RULES"][rk]
        exs = []
        for k, v in rv.items():
            if not (isinstance(v, list) and v and isinstance(v[0], dict) and ("first" in v[0] or "before" in v[0])): continue
            scope = "int" if k.startswith("internal") else "ext" if k.startswith("external") or k.startswith("avyaya") else "exc" if k.startswith("exception") else "ext"
            for e in v:
                if "first" in e: a, b, r, note = e["first"], e["second"], e["result"], e.get("replacement", "")
                else:
                    bf = (e.get("before") or "").strip()
                    parts = [p.strip() for p in re.split(r"\s*\+\s*|\s+", bf, maxsplit=1)] if bf else ["", ""]
                    if " + " in bf: parts = [p.strip() for p in bf.split(" + ", 1)]
                    a, b = (parts + [""])[:2]
                    r, note = e.get("after") or "", e.get("note") or e.get("explanation") or ""
                fx = SR["EX_FIX"].get(n)
                listing.append(f"{n}\t{rk}\t{a} + {b} = {r}")
                n += 1
                if fx == "drop" or not r: continue
                ex = {"a": a, "b": b, "r": r, "scope": scope, "note": note, "game": 1}
                if fx: ex.update(fx)
                if "/" in ex["r"] or " " in ex["a"] + ex["b"]: ex["game"] = 0   # optional results / multi-part splits: shown, not quizzed
                if ex["note"] in ("ए remains", "ओ remains"): ex["note"] = ex["note"].replace("remains", "stays, अ drops (ऽ)")
                exs.append(ex)
        if rk == "RULE_1_CHATVA":                                 # the Gold gives one worked example
            exs = [{"a": "तत्", "b": "शिवः", "r": "तच्छिवः / तच्शिवः", "scope": "ext", "note": "त्→द्→ज् (श्चुत्व)→च् (चर्त्व); श्→छ्", "game": 0}]
        rules.append({"id": rid, "group": group, "name": name, "en": en, "sutra": sutra, "what": what, "ex": exs})
if "--list" in sys.argv: print("\n".join(listing)); sys.exit()

p5 = sd["PART_5_INTERNAL_VS_EXTERNAL_SANDHI"]
sandhi = {
    "definition": sd["PART_2_DEFINITION_OF_SANDHI"]["definition_sloka"],
    "kinds": [  # Part 3, with the Gold's own examples
        {"name": "आगमः", "en": "a sound is added", "ex": "सुगण् + ईशः → सुगण्णीशः"},
        {"name": "आदेशः", "en": "a sound is replaced", "ex": "चित् + मयम् → चिन्मयम्"},
        {"name": "एकादेशः", "en": "two sounds are replaced by one", "ex": "राम + अयनम् → रामायणम्"},
        {"name": "लोपः", "en": "a sound is dropped", "ex": "सः + इच्छति → स इच्छति"},
    ],
    "not_sandhi": "वनम् अत्र — just saying two words one after the other is not sandhi; something must be added, replaced or dropped.",
    "layers": [{"name": "अन्तरङ्गसन्धिः", "en": "inside a word (stem + suffix, or the parts of a compound) — compulsory", "ex": "नै + अकः → नायकः"},
               {"name": "बहिरङ्गसन्धिः", "en": "between words in a sentence — optional in slow speech, made in connected speech and always in verse", "ex": "अस्ति + अत्र → अस्त्यत्र"}],
    "questions": [{"q": "कः भवति?", "en": "what does it become?"}, {"q": "कदा भवति?", "en": "when — before which sound?"}, {"q": "कस्य भवति?", "en": "which sound changes?"}],
    "groups": {"svara": ["स्वरसन्धिः", "vowel + vowel"], "vyanjana": ["व्यञ्जनसन्धिः", "consonant meets a sound"], "agama": ["आगमसन्धिः", "a sound is added"], "visarga": ["विसर्गसन्धिः", "visarga meets a sound"]},
    "rules": rules,
    # PART_11 rewritten: the Gold named the wrong rules (यणादेश for ए→अय्, यणादेश for स्→य्)
    "stages": [
        {"title": "हरे + इह → हर इह", "steps": [["हरे + इह", "vocative हरे before a vowel"], ["हरय् + इह", "एचोऽयवायावः (6.1.78): ए → अय्"], ["हर इह", "लोपः शाकल्यस्य (8.3.19): य् drops"]],
         "note": "Once य् has dropped, अ + इ do not make ए: the dropping is असिद्ध (पूर्वत्रासिद्धम् 8.2.1) for the vowel rules of book 6."},
        {"title": "देवाः + अत्र → देवा अत्र", "steps": [["देवास् + अत्र", "the visarga is स् (रु) underneath (ससजुषो रुः 8.2.66)"], ["देवाय् + अत्र", "भोभगोअघोअपूर्वस्य योऽशि (8.3.17): रु → य्"], ["देवा अत्र", "लोपः शाकल्यस्य (8.3.19): य् drops"]],
         "note": "आ + अ do not then lengthen: the dropping is असिद्ध for 6.1.101."},
    ],
}

# ═════════ समासः ═════════
sm = G("Samasa_Gold_Data_G.json")["sections"]
T = lambda s: s.replace("तत्पुरष", "तत्पुरुष").replace("वाराणासी", "वाराणसी").replace("पूर्वपदंं", "पूर्वपदं").replace("मध्‍येशबदयुक्‍त", "मध्येशब्दयुक्त").replace("‍", "")
MAJOR = lambda t: ("अव्ययीभावः" if "अव्ययीभाव" in t else "द्वन्द्वः" if ("द्वन्द्व" in t or "एकशेष" in t) else "बहुव्रीहिः" if "बहुव्रीहि" in t
                   else "केवलसमासः" if "केवल" in t else "तत्पुरुषः")
ex = []
for i, e in enumerate(sm["samaasa_examples"]):
    fx = SC["FIX"].get(i)
    if fx == "drop": continue
    t = SC["NAME"].get(e["samasa_name"], e["samasa_name"])
    row = {"w": e["samastapadam"].strip().rstrip(":").replace(" ", ""), "l": e["laukika_vigraha"].strip(), "a": re.sub(r"\s+", " ", e["alaukika_vigraha"]).strip(), "t": t, "n": ""}
    if row["w"].endswith(":"): row["w"] = row["w"][:-1] + "ः"
    if i in SC["NAN_FIX_RANGE"] and row["a"].startswith("न सु "): row["a"] = "न " + row["a"][5:]
    if fx: row.update({ {"w": "w", "l": "l", "a": "a", "t": "t", "n": "n"}[k]: v for k, v in fx.items() })
    row["w"] = row["w"].replace("ः:", "ः")
    row["m"] = MAJOR(row["t"])
    if row["t"] == "एकशेषः" and not row["n"]: row["n"] = "एकशेषः is a separate vṛtti (सरूपाणामेकशेष एकविभक्तौ 1.2.64), taught with the द्वन्द्वः"
    ex.append(row)
th, cl = sm["introduction_and_theory"], sm["samasa_types_and_classification"]
md = cl["classification_by_meaning_dominance"]
samasa = {
    "definition": th["samasa_definition"],
    "vigraha": {"definition": th["vigraha_vaakyam"]["definition"], "types": [{"type": x["type"], "details": x["details"]} for x in th["vigraha_vaakyam"]["types"]]},
    "occurrence": cl["classification_by_occurrence"],
    "count": cl["classification_by_word_count"],
    "dominance": {"title": md["title"], "details": md["details"], "types": json.loads(T(json.dumps(md["types"], ensure_ascii=False)))},
    "pos": cl["classification_by_parts_of_speech"],
    "notes": cl["general_note_on_samasa"],
    "ex": ex,
}

# ═════════ कृत्-प्रत्ययाः (the 20 in the game's kṛdanta tables, + 3 more from the Gold list) ═════════
PR = [  # pratyaya, it-letters, what is added, sūtra(s), meaning, kind
 ("क्त्वा", "क्", "त्वा", "समानकर्तृकयोः पूर्वकाले (3.4.21)", "having done — the earlier of two actions by the same doer", "avyaya"),
 ("ल्यप्", "ल्, प्", "य", "समासेऽनञ्पूर्वे क्त्वो ल्यप् (7.1.37)", "replaces क्त्वा when the root has a prefix: आगम्य, संभूय", "avyaya"),
 ("तुमुन्", "उ, न्", "तुम्", "तुमुन्ण्वुलौ क्रियायां क्रियार्थायाम् (3.3.10)", "in order to do — purpose", "avyaya"),
 ("णमुल्", "ण्, उ, ल्", "अम्", "आभीक्ष्ण्ये णमुल् च (3.4.22)", "doing again and again (usually said twice: भावं भावम्)", "avyaya"),
 ("शतृ", "श्, ऋ", "अत्", "लटः शतृशानचावप्रथमासमानाधिकरणे (3.2.124)", "doing (present participle, parasmaipada roots)", "adj"),
 ("शानच्", "श्, च्", "आन (मान after अ)", "लटः शतृशानचौ… (3.2.124) · आने मुक् (7.2.82)", "doing (present participle, ātmanepada roots)", "adj"),
 ("क्त", "क्", "त", "निष्ठा (3.2.102) · क्तक्तवतू निष्ठा (1.1.26)", "done (past participle — passive with a transitive root)", "adj"),
 ("क्तवतु", "क्, उ", "तवत्", "निष्ठा (3.2.102)", "one who has done (past active participle)", "adj"),
 ("तव्यत्", "त्", "तव्य", "तव्यत्तव्यानीयरः (3.1.96)", "to be done, ought to be done (kṛtya)", "kritya"),
 ("अनीयर्", "र्", "अनीय", "तव्यत्तव्यानीयरः (3.1.96)", "to be done, worth doing (kṛtya)", "kritya"),
 ("यत्", "त्", "य", "अचो यत् (3.1.97)", "fit to be done (kṛtya) — roots ending in a vowel", "kritya"),
 ("ण्यत्", "ण्, त्", "य (+ वृद्धि)", "ऋहलोर्ण्यत् (3.1.124)", "fit to be done (kṛtya) — roots in ऋ or a consonant", "kritya"),
 ("क्यप्", "क्, प्", "य", "एतिस्तुशास्वृदृजुषः क्यप् (3.1.109)", "fit to be done (kṛtya) — only the listed roots: इत्यः, स्तुत्यः, शिष्यः…", "kritya"),
 ("ण्वुल्", "ण्, ल्", "वु → अक", "ण्वुल्तृचौ (3.1.133) · युवोरनाकौ (7.1.1)", "one who does (agent)", "agent"),
 ("तृच्", "च्", "तृ", "ण्वुल्तृचौ (3.1.133)", "one who does (agent)", "agent"),
 ("अच्", "च्", "अ", "नन्दिग्रहिपचादिभ्यो ल्युणिन्यचः (3.1.134)", "one who does (agent; पचादि roots)", "agent"),
 ("ल्युट्", "ल्, ट्", "यु → अन", "ल्युट् च (3.3.115) · करणाधिकरणयोश्च (3.3.117)", "the act of doing (neuter), also the instrument or place", "noun"),
 ("घञ्", "घ्, ञ्", "अ (+ वृद्धि)", "भावे (3.3.18)", "the act of doing (masculine action noun)", "noun"),
 ("अप्", "प्", "अ", "ऋदोरप् (3.3.57)", "the act (masculine) — roots in ऋ and उ: भवः, स्तवः", "noun"),
 ("क्तिन्", "क्, न्", "ति", "स्त्रियां क्तिन् (3.3.94)", "the act (feminine abstract noun)", "noun"),
 ("तव्य", "—", "तव्य", "तव्यत्तव्यानीयरः (3.1.96)", "same as तव्यत्; the two differ only in accent", "kritya"),
 ("णिनि", "ण्, इ", "इन्", "सुप्यजातौ णिनिस्ताच्छील्ये (3.2.78)", "one who habitually does (with a word before it): उष्णभोजिन्", "agent"),
 ("केलिमर्", "क्, र्", "एलिम", "केलिमर उपसङ्ख्यानम् (vārttika on 3.1.96)", "ready to be done: पचेलिमाः माषाः (beans that cook easily)", "kritya"),
]
KIND = {"avyaya": ["अव्ययम्", "indeclinable"], "adj": ["कृदन्तविशेषणम्", "participle (declined like an adjective)"],
        "kritya": ["कृत्यप्रत्ययः", "kṛtya — 'to be done'"], "agent": ["कर्तरि", "agent noun"], "noun": ["भावे / करणादौ", "action noun"]}
pratyaya = {"intro": [
    "कृदतिङ् (3.1.93): a suffix added straight to a root, other than a tiṅ (verb) ending, is a कृत्. The word it makes is a कृदन्तम्, and gets its own sup endings.",
    "तयोरेव कृत्यक्तखलर्थाः (3.4.70): kṛtya suffixes, क्त and खल्-type suffixes express the object (or the bare action), not the doer.",
    "कर्तरि कृत् (3.4.67): every other kṛt suffix names the doer — unless a sūtra gives it another meaning (भावे, करणे, अधिकरणे).",
    "The letters that drop (इत्) are signals: क्/ङ् block guṇa and vṛddhi (क्ङिति च 1.1.5); ञ्/ण् bring vṛddhi (अचो ञ्णिति 7.2.115).",
  ], "list": [{"p": p, "it": it, "rem": rem, "sutra": s, "artha": a, "kind": k} for p, it, rem, s, a, k in PR], "kinds": KIND}

# ═════════ उपसर्गाः ═════════
up = G("upasarga_gold_data.json")["gold_data_upasarga"]
UP = {  # sense, examples (word, meaning)
 "प्र": ("forward, forth, very", [("प्रभवति", "arises, is able"), ("प्रहारः", "a blow")]),
 "परा": ("away, back, against", [("पराजयते", "is defeated"), ("पराक्रमः", "valour")]),
 "अप": ("away, off", [("अपगच्छति", "goes away"), ("अपकारः", "harm")]),
 "सम्": ("together, completely", [("सङ्गच्छते", "meets"), ("संहारः", "destruction, withdrawal")]),
 "अनु": ("after, along", [("अनुगच्छति", "follows"), ("अनुभवः", "experience")]),
 "अव": ("down, off", [("अवतरति", "descends"), ("अवगच्छति", "understands")]),
 "निस्/निर्": ("out, without", [("निर्गच्छति", "goes out"), ("निर्जलम्", "without water")]),
 "दुस्/दुर्": ("bad, difficult", [("दुर्गमः", "hard to reach"), ("दुष्करम्", "hard to do")]),
 "वि": ("apart, variously, without", [("विहारः", "a walk, play"), ("वियोगः", "separation")]),
 "आ": ("towards, up to, reversal", [("आगच्छति", "comes"), ("आहारः", "food (what is taken in)")]),
 "नि": ("down, into", [("निपतति", "falls down"), ("निवसति", "dwells")]),
 "अधि": ("over, upon, about", [("अधितिष्ठति", "presides over"), ("अधीते", "studies")]),
 "अपि": ("on, close to (rare)", [("अपिधानम्", "a lid (also पिधानम्)"), ("अपिनह्यति", "ties on")]),
 "अति": ("beyond, very", [("अतिक्रामति", "goes beyond"), ("अतिथिः", "guest")]),
 "सु": ("well, easily", [("सुकरम्", "easy to do"), ("स्वागतम्", "welcome")]),
 "उत्/उद्": ("up, out", [("उत्तिष्ठति", "stands up"), ("उद्गच्छति", "rises")]),
 "अभि": ("towards, against", [("अभिगच्छति", "goes towards"), ("अभिमुखः", "facing")]),
 "प्रति": ("back, against, each", [("प्रतिगच्छति", "goes back"), ("प्रतिकारः", "remedy, retaliation")]),
 "परि": ("around, fully", [("परिक्रमति", "walks around"), ("परिहारः", "avoidance")]),
 "उप": ("near, under, sub-", [("उपगच्छति", "approaches"), ("उपकारः", "help")]),
}
upasarga = {"sloka": up["definition"]["sanskrit"], "sloka_en": up["definition"]["english"], "pada": up["type of pada"], "cls": up["class"],
            "nature": up["nature_of_upasargas"], "three": [["बाधते", "reverses the root's sense", "आ + गम् → आगच्छति (comes), from गच्छति (goes)"],
                                                         ["अनुवर्तते", "follows it, adds nothing", "अधि + इ → अधीते (studies) = इ in अध्ययन sense"],
                                                         ["विशिनष्टि", "specifies it", "हृ: प्रहारः blow, आहारः food, संहारः destruction, विहारः walk, परिहारः avoidance"]],
            "hr": [["प्र", "प्रहारः", "a blow"], ["आ", "आहारः", "food"], ["सम्", "संहारः", "destruction"], ["वि", "विहारः", "a stroll"], ["परि", "परिहारः", "avoidance"], ["उप", "उपहारः", "a gift"], ["अभि", "अभिहारः", "an attack"]],
            "list": [{"u": u, "en": UP[u][0], "ex": UP[u][1]} for u in up["list_of_upasargas"]]}

out = {"sandhi": sandhi, "samasa": samasa, "pratyaya": pratyaya, "upasarga": upasarga}
json.dump(out, open(os.path.join(ROOT, "app/src/data/grammar.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(rules), "sandhi rules,", sum(len(r["ex"]) for r in rules), "examples;", len(ex), "compounds;", len(PR), "kṛt pratyayas;", len(upasarga["list"]), "upasargas")
