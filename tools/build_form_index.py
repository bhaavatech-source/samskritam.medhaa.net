"""tools/build_form_index.py — builds the form-search index used by the धातुकोशः search box and अन्वेषणम्.

Reads (nothing is edited):
  app/public/rupa/<code>.json      vidyut-prakriya tables, unprefixed part ("") — tiṅanta and kṛdanta
  app/public/rupa/index.json       root list (code, aupadeśika, lemma, artha, meaning)
  dhatu_400_tinanta.json           the 408 roots of the Verb book (lakāra grids)
  dhatu_400_krt.json               their kṛdantas
Writes:
  app/public/forms/roots.json      [code, lemma, meaning_en, MDH id or ""]
  app/public/forms/m000 … m199.json  shards by a hash of the SLP1 form (xhash):  { form_slp1: [[root, prayoga, slot, cell], ...] }

prayoga: P परस्मैपदम्, A आत्मनेपदम्, K कर्मणि, B भावे, k kṛt.  slot: lakāra key or kṛt name.  cell: 0–8
(प्रथम-एक … उत्तम-बहु) for tiṅanta, -1 for kṛt. Most prefixed forms are not stored: the app splits the
upasargas off the word it is given and looks up what is left, then checks the prefixed form in the
root's own vidyut table. The prefixed forms it cannot get back that way — ल्यप् (प्रभूय), ṇatva and ṣatva
inside the word (प्रणमति, अभिषिञ्चति), and other changes at the joint — are written to
  app/public/forms/x00.json … x99.json (by the same hash)  { form_slp1: [[root, prayoga, slot, cell, upasarga key], ...] }
strip() below must stay the same as strip() in app/src/search/forms.ts.

Causatives (णिच्: भावयति) and desideratives (सन्: बुभूषति) of the same roots, plain and with each upasarga, come
from tools/sanadi_forms.json. That file is made by vidyut-prakriya when the engine is given:
    python tools/build_form_index.py <path to rupa-batch> <path to dhatupatha.tsv>
(tools/rupa_engine/, third input column Ric / san). Without the arguments the saved file is used.
Their prayoga codes carry a c (णिच्) or s (सन्) in front: cP, cA, cK, cB, ck; sP … sk.

    python tools/build_form_index.py
"""
import json, os, glob, re, sys, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

V = {"अ": "a", "आ": "A", "इ": "i", "ई": "I", "उ": "u", "ऊ": "U", "ऋ": "f", "ॠ": "F", "ऌ": "x", "ॡ": "X", "ए": "e", "ऐ": "E", "ओ": "o", "औ": "O"}
M = {"ा": "A", "ि": "i", "ी": "I", "ु": "u", "ू": "U", "ृ": "f", "ॄ": "F", "ॢ": "x", "ॣ": "X", "े": "e", "ै": "E", "ो": "o", "ौ": "O"}
C = dict(zip("कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ", "kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL"))
def slp(s):
    o, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch in C:
            o.append(C[ch]); nx = s[i + 1] if i + 1 < len(s) else ""
            if nx == "्": i += 2; continue
            if nx in M: o.append(M[nx]); i += 2; continue
            o.append("a"); i += 1; continue
        if ch in V: o.append(V[ch])
        elif ch == "ं": o.append("M")
        elif ch == "ः": o.append("H")
        elif ch == "ँ": o.append("~")
        i += 1
    return "".join(o)

roots, rix = [], {}
def root(code, lemma, mean, mdh=""):
    if code not in rix:
        rix[code] = len(roots); roots.append([code, lemma, mean, mdh])
    elif mdh and not roots[rix[code]][3]: roots[rix[code]][3] = mdh
    return rix[code]

index = {}
def add(form, hit):
    for f in re.split(r"\s*[|/,]\s*", form):
        f = f.strip()
        if not f: continue
        k = f if re.fullmatch(r"[A-Za-z~']+", f) else slp(f)
        lst = index.setdefault(k, [])
        if hit not in lst: lst.append(hit)

# 1. the 408 roots of the Verb book (they carry the MDH ids the app opens)
T = json.load(open(P("dhatu_400_tinanta.json"), encoding="utf-8"))
for v in T:
    r = root(v["dhatupatha"]["code"], v["lemma"], v["meanings"].get("en", ""), v["id"])
    pada = "A" if "आत्मने" in v["pada"] else "P"
    for key, pr in (("lakara_conjugations", pada), ("lakara_conjugations_atmanepada", "A"), ("karmani_conjugations", "K"), ("bhave_conjugations", "B")):
        for lak, c in (v.get(key) or {}).items():
            for pi, pu in enumerate(("prathama_purusha", "madhyama_purusha", "uttama_purusha")):
                for vi, va in enumerate(("ekavacana", "dvivacana", "bahuvacana")):
                    cell = c["conjugation_grid"].get(pu, {}).get(va)
                    f = cell.get("form") if isinstance(cell, dict) else cell
                    if f: add(f, [r, pr, lak, pi * 3 + vi])
K = json.load(open(P("dhatu_400_krt.json"), encoding="utf-8"))
mdh_code = {v["id"]: v["dhatupatha"]["code"] for v in T}
for k in K:
    code = mdh_code.get(k["dhatu_id"])
    if not code: continue
    r = rix[code]
    for name, f in list(k["krt_rupas"].items()) + list(k.get("restricted_krt", {}).items()):
        for x in [f.get("form", "")] + f.get("variants", []):
            if x: add(x, [r, "k", name, -1])

# 2. vidyut tables of the रूपनिर्माणम् roots
IX = {r[0]: r for r in json.load(open(P("app/public/rupa/index.json"), encoding="utf-8"))}
for fn in sorted(glob.glob(P("app/public/rupa/*.json"))):
    code = os.path.basename(fn)[:-5]
    if code == "index": continue
    d = json.load(open(fn, encoding="utf-8")).get("", {})
    meta = IX.get(code, [code, "", code, "", ""])
    r = root(code, meta[2], meta[4] if len(meta) > 4 else "")
    for pk, laks in d.get("t", {}).items():
        pr = {"kartari_P": "P", "kartari_A": "A", "karmani": "K", "bhave": "B"}.get(pk, pk)
        for lak, cells in laks.items():
            for i, f in enumerate(cells):
                if f: add(f, [r, pr, lak, i])
    for name, f in d.get("k", {}).items():
        for x in (f if isinstance(f, list) else [f]):
            if isinstance(x, str) and x: add(x, [r, "k", name, -1])

# 2b. causatives and desideratives (see the note at the top)
SAN_FILE = P("tools/sanadi_forms.json")
UPS = ["pra", "parA", "apa", "sam", "anu", "ava", "nis", "nir", "dus", "dur", "vi", "AN", "ni", "aDi", "api", "ati", "su", "ud", "aBi", "prati", "pari", "upa"]
FIXED = {"02.0012", "02.0041", "02.0042", "10.0368"}   # roots that keep their own upasarga (as in build_rupa_tables.py)
SAN = {"Ric": "c", "san": "s"}
PR = {"kartari_P": "P", "kartari_A": "A", "karmani": "K", "bhave": "B"}
san_raw = None
if len(sys.argv) == 3:
    jobs = "".join(f"{c}\t{u}\t{sn}\n" for c in sorted(rix) for sn in SAN for u in [""] + ([] if c in FIXED else UPS))
    r = subprocess.run([sys.argv[1], sys.argv[2]], input=jobs, capture_output=True, text=True, check=True)
    san_raw = {}
    for line in r.stdout.splitlines():
        code, pre, t, k, sn = line.split("\t")
        san_raw.setdefault(code, {}).setdefault(sn, {})[pre] = {"t": json.loads(t), "k": json.loads(k)}
for c in FIXED:
    if c in rix: roots[rix[c]].append(1)          # 5th field: takes no other upasarga

out = P("app/public/forms"); os.makedirs(out, exist_ok=True)
for f in glob.glob(os.path.join(out, "*.json")): os.remove(f)   # old shards, including x*.json
# plain causative / desiderative forms go into the main index; the prefixed ones are handled in step 3
san_plain, san_x = {}, []
if os.path.exists(SAN_FILE) and san_raw is None:
    saved = json.load(open(SAN_FILE, encoding="utf-8")); san_plain, san_x = saved["plain"], saved["prefixed"]
def add_plain(code, sn, d):
    r = rix[code]; c = SAN[sn]
    for pk, laks in d.get("t", {}).items():
        for lak, cells in laks.items():
            for i, f in enumerate(cells):
                if f: add(f, [r, c + PR[pk], lak, i])
    for name, f in d.get("k", {}).items():
        if f: add(f, [r, c + "k", name, -1])
if san_raw is not None:
    san_plain = {code: {sn: e.get("", {}) for sn, e in d.items()} for code, d in san_raw.items()}
for code, d in san_plain.items():
    for sn, e in d.items(): add_plain(code, sn, e)
def xhash(f, n=40):    # same as xhash() in search/forms.ts
    h = 0
    for ch in f: h = (h * 31 + ord(ch)) % 1000003
    return h % n
MAIN_N, X_N = 200, 100     # shard counts: keep the same as in search/forms.ts
shards = {}
for k, v in index.items():
    shards.setdefault("m%03d" % xhash(k, MAIN_N), {})[k] = v
for h, d in shards.items():
    json.dump(d, open(os.path.join(out, h + ".json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump(roots, open(os.path.join(out, "roots.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(index), "forms of", len(roots), "roots in", len(shards), "shards")

# 3. prefixed forms the app's upasarga splitter cannot recover (same rule as strip() in search/forms.ts)
VOW = "aAiIuUfFxXeEoO"
SURF = {"sam": ["sam", "saM", "saN", "saY", "saR", "san"], "ud": ["ud", "ut", "uc", "uj", "uq", "un", "ul", "uw"],
        "nis": ["nis", "niH", "niS", "niz", "nir"], "nir": ["nir", "niH", "niS", "niz", "nis"],
        "dus": ["dus", "duH", "duS", "duz", "dur"], "dur": ["dur", "duH", "duS", "duz", "dus"]}
PAIRS = [("A", "aA"), ("e", "iIe"), ("o", "uUo"), ("E", "eE"), ("O", "oO"), ("Ar", "f"), ("ar", "f")]
NATVA = {"pra", "parA", "nir", "dur", "pari", "prati"}            # र् in the upasarga: न → ण at the start of the root
SATVA = {"ni", "vi", "aBi", "pari", "prati", "anu", "su", "aDi", "api", "ati", "upa", "nis", "dus"}   # स → ष
def strip(q, p):
    return [y for x in strip0(q, p) + joint(q, p) for y in ([x] + (["n" + x[1:]] if x[:1] == "R" and p in NATVA else [])
                                                            + (["s" + x[1:]] if x[:1] == "z" and p in SATVA else [])
                                                            + ([x[1:]] if x[:2] == "cC" else []))]   # आ/वि + छ → आच्छ, विच्छ
def joint(q, p):
    """निर्/दुर् + र → नीर/दूर (निस् + रोचते = नीरोचते)"""
    if p in ("nis", "nir", "dus", "dur"):
        long = "nI" if p[0] == "n" else "dU"
        if q.startswith(long + "r"): return [q[len(long):]]
    return []
def strip0(q, p):
    out = []; body = "A" if p == "AN" else p; last = body[-1]
    if last in VOW:
        stem = body[:-1]
        if q.startswith(body) and len(q) > len(body) and q[len(body)] not in VOW: out.append(q[len(body):])
        if not q.startswith(stem): return out
        r = q[len(stem):]
        if last in "aA":
            for surf, starts in PAIRS:
                if r.startswith(surf): out += [s0 + r[len(surf):] for s0 in starts]
        elif last in "iI":
            if r.startswith("I"): out += ["i" + r[1:], "I" + r[1:]]
            if r[:1] == "y" and r[1:2] and r[1] in VOW and r[1] not in "iI": out.append(r[1:])
        elif last in "uU":
            if r.startswith("U"): out += ["u" + r[1:], "U" + r[1:]]
            if r[:1] == "v" and r[1:2] and r[1] in VOW and r[1] not in "uU": out.append(r[1:])
        return out
    for sf in SURF.get(p, [p]):
        if q.startswith(sf) and len(q) > len(sf):
            r = q[len(sf):]; out.append(r)
            if p == "ud" and sf == "ud" and r.startswith("D"): out.append("h" + r[1:])
            if p == "ud" and sf == "ut" and r[:1] in ("T", "t"): out.append("s" + r)   # उद् + स्था = उत्था, उद् + स्तम्भ = उत्तम्भ
    return out
def recovered(q, keys, bare):
    cur = [q]
    for p in keys: cur = [r for c in cur for r in strip(c, p)]
    return any(c in bare for c in cur)
alts = lambda c: [x for x in (c or "").split("|") if x]
extra, total = {}, 0
def xadd(f, hit):
    lst = extra.setdefault(f, [])
    if hit not in lst: lst.append(hit)
for fn in sorted(glob.glob(P("app/public/rupa/*.json"))):
    code = os.path.basename(fn)[:-5]
    if code == "index": continue
    t = json.load(open(fn, encoding="utf-8")); r = rix[code]; base = t.get("", {})
    for key, e in t.items():
        if not key: continue
        keys = key.split(",")
        for pk, laks in e.get("t", {}).items():
            pr = {"kartari_P": "P", "kartari_A": "A", "karmani": "K", "bhave": "B"}.get(pk, pk)
            for lak, cells in laks.items():
                bcells = base.get("t", {}).get(pk, {}).get(lak, [])
                for i, c in enumerate(cells):
                    bare = set(alts(bcells[i] if i < len(bcells) else ""))
                    for f in alts(c):
                        total += 1
                        if not recovered(f, keys, bare): xadd(f, [r, pr, lak, i, key])
        for name, c in e.get("k", {}).items():
            bare = set(alts(base.get("k", {}).get(name, "")))
            for f in alts(c if isinstance(c, str) else ""):
                total += 1
                if not recovered(f, keys, bare): xadd(f, [r, "k", "lyap" if name == "ktvA" and f.endswith("ya") else name, -1, key])
if san_raw is not None:
    san_x = []
    for code, d in san_raw.items():
        r = rix[code]
        for sn, by in d.items():
            base = by.get("", {}); c = SAN[sn]
            for key, e in by.items():
                if not key: continue
                keys = key.split(",")
                for pk, laks in e.get("t", {}).items():
                    for lak, cells in laks.items():
                        bcells = base.get("t", {}).get(pk, {}).get(lak, [])
                        for i, cl in enumerate(cells):
                            bare = set(alts(bcells[i] if i < len(bcells) else ""))
                            for f in alts(cl):
                                if not recovered(f, keys, bare): san_x.append([f, r, c + PR[pk], lak, i, key])
                for name, cl in e.get("k", {}).items():
                    bare = set(alts(base.get("k", {}).get(name, "")))
                    for f in alts(cl):
                        if not recovered(f, keys, bare): san_x.append([f, r, c + "k", "lyap" if name == "ktvA" and f.endswith("ya") else name, -1, key])
    json.dump({"note": "made by tools/build_form_index.py from vidyut-prakriya; causative (Ric) and desiderative (san) forms",
               "plain": san_plain, "prefixed": san_x}, open(SAN_FILE, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
for f, *hit in san_x: xadd(f, hit)
print(sum(1 for d in san_plain.values() for _ in d), "sanādi stems;", len(san_x), "prefixed sanādi forms stored whole")
xs = {}
for k, v in extra.items():
    xs.setdefault("x%02d" % xhash(k, X_N), {})[k] = v
for h, d in xs.items():
    json.dump(d, open(os.path.join(out, h + ".json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(extra), "of", total, "prefixed forms need their own entry;", len(xs), "x shards")
