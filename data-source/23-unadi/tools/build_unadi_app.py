"""Build the site data for उणादयः from data-source/23-unadi.
   python data-source/23-unadi/tools/build_unadi_app.py
   → app/src/data/unadi.json       (all 748 sūtras; loaded when the उणादयः view opens)
   (with the four-level exam questions used by the quiz in रूपनिर्माणम्)"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(SRC)) if len(sys.argv) < 2 else sys.argv[1]
OUT = os.path.join(ROOT, "app", "src", "data")
DATE = "2026-11-15"
G = {"पुंलिङ्गम्": "पुं", "स्त्रीलिङ्गम्": "स्त्री", "नपुंसकलिङ्गम्": "नपुं", "अव्ययम्": "अव्य"}
def gender(g):
    return " / ".join(G.get(x.strip(), x.strip()) for x in g.split("/")) if g else ""
HEAD = re.compile(r"^\s*(?:[०-९0-9]+\s*[.)]\s*)?(?:[१-५1-5]\s*\.\s*)?\.?[०-९0-9]{1,3}\s*[.)]?\s*")
def prakriya(text, sutra):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    out = []
    for l in lines:
        l = HEAD.sub("", l) if not out else l
        l = re.sub(r"\s{2,}", " ", l)
        out.append(l)
    return "\n".join(out)
sys.path.insert(0, HERE)
from glossary import TERMS, RULE_TERM
from chunks import chunk_for
VID = json.load(open(os.path.join(SRC, f"unadi_prakriya_steps_{DATE}.json"), encoding="utf-8"))
VDATA = os.path.join(HERE, "vidyut-data")          # copies of vidyut-prakriya/data/*.tsv
def tsv(name, key=0, val=1):
    out = {}
    for l in list(open(os.path.join(VDATA, name), encoding="utf-8"))[1:]:
        f = l.rstrip("\n").split("\t")
        if len(f) > val: out[f[key]] = f[val]
    return out
SUTRA = tsv("sutrapatha.tsv"); VART = tsv("varttikas.tsv"); KAUM = tsv("kaumudi.tsv"); LING = tsv("linganushasanam.tsv")
DHP = {l.split("\t")[0]: l.rstrip("\n").split("\t") for l in list(open(os.path.join(VDATA, "dhatupatha.tsv"), encoding="utf-8"))[1:]}
UNP = tsv("unadipatha.tsv")
from deva import deva
UFIX = {}
used = set()
def rule_text(r):
    k, _, c = r.partition(":")
    if k == "A": return [f"{c}", deva(SUTRA.get(c, ""))]
    if k == "V": return [f"वा. {c}", deva(VART.get(c, ""))]
    if k == "U": return [f"उणादि {c}", UFIX.get(c) or deva(UNP.get(c, ""))]
    if k == "D": d = DHP.get(c); return [f"धातुपाठः {c}", deva(f"{d[1]} {d[2]}") if d else ""]
    if k == "L": return [f"लिङ्गानुशासनम् {c}", deva(LING.get(c, ""))]
    if k == "X" and "Kaumudi" in c: n = c[c.find("(") + 1:-1]; return [f"सि.कौ. {n}", deva(KAUM.get(n, ""))]
    return [c, ""]
def steps(lst):
    out = []
    for r, t, sup in lst:
        used.add(r); used.update(sup)
        out.append([r, t, sup])
    return out
sutras = []; words = []
ALL = []
for p in range(1, 6):
    ALL += json.load(open(os.path.join(SRC, f"unadi_pada{p}_{DATE}.json"), encoding="utf-8"))["sutras"]
NEIGH = {}
for i, r in enumerate(ALL):
    NEIGH[r["sutra_number"]] = [ALL[j]["prakriya"] for j in (i - 1, i + 1, i - 2, i + 2) if 0 <= j < len(ALL)]
for p in range(1, 6):
    d = json.load(open(os.path.join(SRC, f"unadi_pada{p}_{DATE}.json"), encoding="utf-8"))
    for r in d["sutras"]:
        pr = r["pratyaya"].split(" (")[0]
        UFIX[r["sutra_number"].translate(str.maketrans("०१२३४५६७८९", "0123456789"))] = r["sutra_text"]
        rup = []
        allw = [x["word"].split("/")[0].strip() for x in r["rupas"]]
        for x in r["rupas"]:
            key = f"{r['sutra_number']}|{x['word']}"
            v = VID.get(key)
            tp = ""
            for pk in [r["prakriya"]] + NEIGH.get(r["sutra_number"], []):
                tp = chunk_for(x["word"], pk, allw)
                if tp: break
            short = ""
            if x.get("prakriya"): short = x["prakriya"]
            elif not v and not tp:
                root = re.sub(r"\s*\(.*", "", x.get("dhatu", "")).strip()
                nip = bool(re.search(r"(निपात्य|आदयश्च|ादयः|ौ$|ाः$)", r["sutra_text"])) and not pr
                if root and pr: short = f"{root} + {pr} → … → {x['word']} (वि.सु.का.कृ.)"
                elif root: short = f"{root} + प्रत्ययः ({r['sutra_text']}) → … → {x['word']} (वि.सु.का.कृ.)"
                elif pr: short = f"धातुः + {pr} → … → {x['word']} (वि.सु.का.कृ.)"
                else: short = f"{x['word']} — {r['sutra_text']} इति सूत्रेण निपातनात् सिद्धम्।" if nip else f"{x['word']} — {r['sutra_text']} इति सूत्रेण सिद्धम् (वि.सु.का.कृ.)।"
            vd = None
            if v:
                vd = {"root": v["root"], "stem": v["stem"], "s": steps(v["s"]), "n": steps(v["n"])}
            rup.append([x["word"], x.get("dhatu", ""), gender(x.get("gender", "")), {k: val for k, val in x.get("meanings", {}).items() if val}, tp, vd, short])
        sutras.append([r["sutra_number"], r["sutra_text"], pr, prakriya(r["prakriya"], r["sutra_text"]), rup])
app = {
  "intro": [
    "उणादयः are kṛt suffixes taught outside the Aṣṭādhyāyī, in the Uṇādi-sūtras. Pāṇini admits them with one rule: उणादयो बहुलम् (3.3.1).",
    "They form many everyday nouns whose root is no longer obvious: कारुः, वायुः, इन्दुः, वृक्षः, हृदयम्, सूत्रम्, पुत्रः, गिरिः.",
    "The collection here follows the Pañcapādī: five pādas, 748 sūtras (157, 123, 160, 238, 70), named after the first suffix, उण्.",
    "बहुलम् means the suffixes apply variously: sometimes to roots not named, sometimes not where named, and with some changes taught only by example (निपातनम्).",
    "Each sūtra card gives the suffix, the words it makes with their meanings, and the step-by-step formation (प्रक्रिया).",
  ],
  "abbr": [["वि.सु.का.कृ.", "तादृशप्रकृतिप्रत्यय-विशिष्टात् सुबादिषु कार्येषु कृतेषु", "from that root-and-suffix, once the case ending (सुँ etc.) and its operations are applied, the final form results (e.g. इन्दुः)"]],
  "padas": [["प्रथमः पादः", 157], ["द्वितीयः पादः", 123], ["तृतीयः पादः", 160], ["चतुर्थः पादः", 238], ["पञ्चमः पादः", 70]],
  "s": sutras,
}
q = json.load(open(os.path.join(SRC, f"unadi_pariksha_levels_{DATE}.json"), encoding="utf-8"))
app["rules"] = {r: rule_text(r) + [RULE_TERM.get(r, "unadi" if r.startswith("U:") else "")] for r in sorted(used)}
app["terms"] = {k: list(v) for k, v in TERMS.items()}
app["levels"] = [[l["level_id"], l["name_sa"], l["name_en"].split(" (")[0], l["name_en"].split(" (", 1)[1].rstrip(")") if " (" in l["name_en"] else ""] for l in q["level_hierarchy"]]
app["exam"] = []
for x in q["questions"]:
    right = [o["text_sa"] for o in x["options"] if o["is_correct"]]
    if len(right) != 1: continue
    app["exam"].append({"id": x["question_id"], "lv": x["level_number"], "w": x["target_word"], "q": x["question_sa"], "qe": x["question_en"],
                        "o": [o["text_sa"] for o in x["options"]], "a": right[0], "s": x["panini_sutra"], "x": x["explanation_sa"]})
json.dump(app, open(os.path.join(OUT, "unadi.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("sūtras", len(sutras), "exam questions", len(app["exam"]))
