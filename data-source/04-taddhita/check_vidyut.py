"""Check every taddhita example with vidyut-prakriya (tad2). Writes vidyut_check.json and adds
example["check"] = "vidyut-prakriya" | "sūtra (vidyut gives …)" | "sūtra (not in vidyut)"."""
import json, subprocess, sys, collections
from translit import slp
SUF = {"अण्": "aR", "इञ्": "iY", "ढक्": "Qak", "यञ्": "yaY", "छ": "Ca", "तल्": "tal", "त्व": "tva", "मतुप्": "matup", "इनि": "ini", "ठक्": "Wak",
       "इमनिच्": "imanic", "तरप्": "tarap", "तमप्": "tamap", "ईयसुन्": "Iyasun", "इष्ठन्": "izWan", "मयट्": "mayaw", "कल्पप्": "kalpap", "रूपप्": "rUpap",
       "पाशप्": "pASap", "तसिल्": "tasil", "त्रल्": "tral", "दा": "dA", "थाल्": "TAl", "थमु": "Tamu", "धा": "DA", "कृत्वसुच्": "kftvasuc", "सुच्": "suc",
       "वति": "vati", "च्वि": "cvi", "सात्": "sAti", "त्रा": "trA", "शस्": "Sas", "तयप्": "tayap", "मात्रच्": "mAtrac", "द्वयसच्": "dvayasac",
       "दघ्नच्": "daGnac", "विनि": "vini", "यत्": "yat", "आलुच्": None, "ष्यञ्": "zyaY", "डट्": "qaw", "तमट्": None, "तीय": "tIya", "डट् + थुक्": "qaw",
       "कन्": "kan", "ख": "Ka", "ठञ्": "WaY", "इतच्": "itac", "चरट्": "caraw", "अण् (शैषिकः)": "aR", "त्यप्": "tyap", "ट्युल्": "wyul", "दानीम्": "dAnIm", "ह": "ha"}
d = json.load(open(sys.argv[1], encoding="utf-8"))
rows = []
for x in d["pratyayas"]:
    t = SUF.get(x["sanskrit_name"])
    for k, e in enumerate(x["examples"]):
        if t:
            for l in ("m", "n", "f"):
                rows.append(f'{x["id"]}#{k}\t{slp(e["base"]).replace("~","")}\t{t}\t{l}\t-')
r = subprocess.run(["/home/claude/src/vbuild/target/release/tad2"], input="\n".join(rows) + "\n", capture_output=True, text=True)
got = collections.defaultdict(set)
for l in r.stdout.splitlines():
    f = l.split("\t")
    for col in (5, 6):
        if len(f) > col: got[f[0]] |= {s for s in f[col].split("|") if s and s not in "?!"}
stat = collections.Counter(); bad = []
for x in d["pratyayas"]:
    for k, e in enumerate(x["examples"]):
        key = f'{x["id"]}#{k}'; want = slp(e["derived_form"])
        # च्वि examples are verbs (शुक्लीभवति): compare the stem part
        w2 = want.replace("Bavati", "").replace("karoti", "")
        g = got.get(key, set())
        if not SUF.get(x["sanskrit_name"]) or not g:
            e["check"] = "sūtra (not derivable in vidyut-prakriya)"; stat["not in vidyut"] += 1
        elif want in g or w2 in g or any(s.rstrip("H") == want.rstrip("H") for s in g):
            e["check"] = "vidyut-prakriya"; stat["vidyut agrees"] += 1
        else:
            e["check"] = "sūtra (vidyut-prakriya gives " + ", ".join(sorted(g)[:3]) + ")"; stat["differs"] += 1
            bad.append((x["id"], x["sanskrit_name"], e["base"], e["derived_form"], sorted(g)[:4]))
json.dump(d, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(dict(stat))
for b in bad: print(b)
