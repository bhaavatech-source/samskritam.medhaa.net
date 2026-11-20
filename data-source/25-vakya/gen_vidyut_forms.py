"""data-source/25-vakya/gen_vidyut_forms.py — makes vidyut_forms_2026-11-20.json with vidyut-prakriya (run once, on the build machine).

  nouns      the lexicon's nouns that words.json does not have: 8 cases × 3 numbers
  adjectives masculine and neuter from the first stem, feminine from the second
  pronouns   यद्, तद् in three genders (for यः … सः)
  roots      verb tables (rupa format) for roots the site's rupa tables do not have yet: कथ, पूज्, श्रु

    python gen_vidyut_forms.py <sup binary> <rupa-batch binary> <dhatupatha.tsv> <deva/translit tools dir>
The `sup` program (vidyut subanta, gen/src/bin/sup.rs) reads "id \\t stem(slp1) \\t m|f|n [\\t nyap]" and prints
"id \\t vibhakti \\t vacana \\t forms"; rupa-batch is the program behind app/public/rupa (tools/rupa_engine).
"""
import json, os, runpy, subprocess, sys
SUP, BATCH, DP, TOOLS = sys.argv[1:5]
sys.path.insert(0, TOOLS)
from translit import slp
from deva import deva
HERE = os.path.dirname(os.path.abspath(__file__))
L = runpy.run_path(os.path.join(HERE, "vakya_lexicon_2026-11-20.py"))
VIB = ["prathama", "dvitiya", "tritiya", "chaturthi", "panchami", "shashthi", "saptami", "sambodhana"]
VAC = ["singular", "dual", "plural"]

def pausal(forms):
    """vidyut lists both pausal and sandhi-ready variants (गृहात्|गृहाद्): the pausal one first"""
    fs = list(dict.fromkeys(forms))
    fs.sort(key=lambda f: f.endswith("d") or f.endswith("g") or f.endswith("q") or f.endswith("b"))
    return fs

def decline(items):
    """items: [(key, stem, linga, nyap)] → {key: [[8 sg], [8 du], [8 pl]]}"""
    inp = "".join(f"{i}\t{slp(s)}\t{g}{chr(9) + 'nyap' if ny else ''}\n" for i, (k, s, g, ny) in enumerate(items))
    r = subprocess.run([SUP], input=inp, capture_output=True, text=True, check=True)
    out = {k: [[""] * 8 for _ in VAC] for k, *_ in items}
    for line in r.stdout.splitlines():
        i, vi, va, fs = line.split("\t")
        k = items[int(i)][0]
        out[k][VAC.index(va)][VIB.index(vi)] = "|".join(deva(f) for f in pausal(fs.split("|")) if f)
    for k, t in out.items():
        assert all(all(c for c in row) for row in t), (k, t)
    return out

nouns = [(s, s, g, bool(x.get("nyap"))) for s, g, en, pl, kind, x in L["N"] if s not in L["FROM_WORDS"]]
adj = []
for m, f, en, desc in L["A"]:
    adj += [(m + "|m", m, "m", False), (m + "|n", m, "n", False), (m + "|f", f, "f", f.endswith("ी") or f.endswith("ा"))]
# the pronouns of the relative clause: यः … सः (all three genders)
pron = [(f"{s}|{g}", s, g, False) for s in ("यद्", "तद्") for g in "mfn"]
N = decline(nouns)
P = {}
for k, t in decline(pron).items():
    s, g = k.split("|"); P.setdefault(s, {})[g] = t
Araw = decline(adj)
A = {}
for k, t in Araw.items():
    m, g = k.split("|"); A.setdefault(m, {})[g] = t

have = {f[:-5] for f in os.listdir(os.path.join(HERE, "../../app/public/rupa")) if f[0].isdigit()}
need = sorted({v["code"] for v in L["V"].values()} - have)
r = subprocess.run([BATCH, DP], input="".join(f"{c}\t{v.get('pre', '')}\n" for c in need for v in [{}]), capture_output=True, text=True, check=True)
R = {}
for line in r.stdout.splitlines():
    code, pre, t, k = line.split("\t")
    R.setdefault(code, {})[pre] = {"t": json.loads(t), "k": json.loads(k)}
json.dump({"nouns": N, "adjectives": A, "pronouns": P, "roots": R}, open(os.path.join(HERE, "vidyut_forms_2026-11-20.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=0)
print(len(N), "nouns,", len(A), "adjectives,", len(R), "roots:", ", ".join(R))
