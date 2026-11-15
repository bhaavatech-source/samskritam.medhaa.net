"""tools/build_rupa_tables.py — the tables behind रूपनिर्माणम् (धातुकोशः).

For every root of the verb book (data-source/17-dhatu-400/tools/map.json → Dhātupāṭha codes) it writes
app/public/rupa/<code>.json with all forms
  ""        → the root alone
  "pra" …   → with each of the 22 upasargas
  "sam,AN"… → the two- and three-upasarga verbs of data-source/21-upasarga
Each entry: {"t": {mode: {lakāra: [9 cells]}}, "k": {kṛt: forms}}; cells are SLP1, alternatives joined by "|".
Modes: kartari_P, kartari_A, karmani, bhave. Index: app/public/rupa/index.json.

Forms are derived with vidyut-prakriya (the program used for all verb tables of the site) through the
batch program `rupa-batch` (tools/rupa_engine/, see its README), run on the build machine:
  python tools/build_rupa_tables.py <path to rupa-batch> <path to dhatupatha.tsv>
"""
import json, os, sys, subprocess, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BATCH, DP = sys.argv[1], sys.argv[2]
UPS = ["pra", "parA", "apa", "sam", "anu", "ava", "nis", "nir", "dus", "dur", "vi", "AN", "ni", "aDi", "api", "ati", "su", "ud", "aBi", "prati", "pari", "upa"]
DEVA2SLP = {"प्र": "pra", "परा": "parA", "अप": "apa", "सम्": "sam", "अनु": "anu", "अव": "ava", "निस्": "nis", "निर्": "nir", "दुस्": "dus", "दुर्": "dur",
            "वि": "vi", "आङ्": "AN", "नि": "ni", "अधि": "aDi", "अपि": "api", "अति": "ati", "सु": "su", "उद्": "ud", "अभि": "aBi", "प्रति": "prati", "परि": "pari", "उप": "upa"}
FIXED = {"02.0012", "02.0041", "02.0042", "10.0368"}   # roots that always carry their own upasarga (आङ् शास्, अधि इ …): no other prefixes

mp = json.load(open(os.path.join(ROOT, "data-source/17-dhatu-400/tools/map.json"), encoding="utf-8"))
codes = sorted({m["code"] for m in mp.values() if m and not m.get("nic")})
combos = json.load(open(os.path.join(ROOT, "data-source/21-upasarga/tools/dhatupatha_codes.json"), encoding="utf-8"))
um = json.load(open(os.path.join(ROOT, "data-source/21-upasarga/upasarga_dhatu_mappings_2026-11-15.json"), encoding="utf-8"))
extra = collections.defaultdict(set)
for c in um["upasarga_dhatu_combinations"]:
    if len(c["upasargas"]) > 1:
        extra[combos[c["id"]]].add(",".join(DEVA2SLP[u] for u in c["upasargas"]))

jobs = []
for code in codes:
    jobs.append((code, ""))
    if code in FIXED: continue
    jobs += [(code, u) for u in UPS] + [(code, k) for k in sorted(extra.get(code, ()))]
r = subprocess.run([BATCH, DP], input="".join(f"{c}\t{p}\n" for c, p in jobs), capture_output=True, text=True, check=True)
out = collections.defaultdict(dict)
for line in r.stdout.splitlines():
    code, pre, t, k = line.split("\t")
    t, k = json.loads(t), json.loads(k)
    if t or k: out[code][pre] = {"t": t, "k": k}
dest = os.path.join(ROOT, "app/public/rupa"); os.makedirs(dest, exist_ok=True)
total = 0
for code, d in out.items():
    p = os.path.join(dest, f"{code}.json")
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":")); total += os.path.getsize(p)
# index.json: [code, upadeśa, root, artha, English, [multi-upasarga keys]] in Devanāgarī, for the root list
V = {"a": "अ", "A": "आ", "i": "इ", "I": "ई", "u": "उ", "U": "ऊ", "f": "ऋ", "F": "ॠ", "x": "ऌ", "X": "ॡ", "e": "ए", "E": "ऐ", "o": "ओ", "O": "औ"}
M = {"a": "", "A": "ा", "i": "ि", "I": "ी", "u": "ु", "U": "ू", "f": "ृ", "F": "ॄ", "x": "ॢ", "X": "ॣ", "e": "े", "E": "ै", "o": "ो", "O": "ौ"}
C = dict(zip("kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL", "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ"))
def deva(s):
    s = s.replace("\\", "").replace("^", "")
    o, prev = [], False
    for ch in s:
        if ch in C:
            if prev: o.append("्")
            o.append(C[ch]); prev = True
        elif ch in V: o.append(M[ch] if prev else V[ch]); prev = False
        else:
            if prev: o.append("्")
            o.append({"M": "ं", "H": "ः", "~": "ँ", "'": "ऽ"}.get(ch, ch)); prev = False
    if prev: o.append("्")
    return "".join(o)
lem = {l.split("\t")[0]: l.rstrip("\n").split("\t")[2] for l in open(os.path.join(ROOT, "tools/dhatu_lemmas_slp1.tsv"), encoding="utf-8")}
dpt = {l.split("\t")[0]: l.rstrip("\n").split("\t") for l in open(DP, encoding="utf-8")}
en = {}
for r in json.load(open(os.path.join(ROOT, "dhatu_400_tinanta.json"), encoding="utf-8")):
    m = mp.get(r["id"])
    if m and not m.get("nic"): en.setdefault(m["code"], r["meanings"].get("en") or "")
index = [[c, deva(dpt[c][1]), deva(lem.get(c, dpt[c][1])), deva(dpt[c][2]), en.get(c, ""), sorted(k for k in out[c] if "," in k)] for c in sorted(out)]
json.dump(index, open(os.path.join(dest, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("index:", len(index), "roots")
