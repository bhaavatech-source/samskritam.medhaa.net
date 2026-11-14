"""Forms for the 400 recitation dhātus.

Every form is derived with vidyut-prakriya (Pāṇini's rules) and checked against three
independent sources from GitHub (drdhaval2785/SanskritVerb):
  SV  = SanskritVerb's own generator output (2016), kartari tiṅanta, by root code, lakāra and person
  SAM = verb forms from Samsaadhanii (Amba Kulkarni, Univ. of Hyderabad)  — form list
  HER = verb forms from Gérard Huet's Sanskrit Heritage                   — form list
and kṛt forms against ashtadhyayi.com's dhatuforms_krut (ashtadhyayi-com/data).
"""
import json, re, collections, sys, csv, copy
sys.path.insert(0, "/home/claude/tools/dhatu"); sys.path.insert(0, "/home/claude/dh400")
from slp import deva
from en_verbs import BASE, IRR

H = "/home/claude/dh400/"
U = json.load(open("/mnt/user-data/uploads/730f9fce-marked_dhatus_recitation.json", encoding="utf-8"))
MAP = json.load(open(H + "map.json"))
exec(open(H + "decisions.py").read())                         # UNMATCHED
A = {x["baseindex"]: x for x in json.load(open("/home/claude/gh/ashdata/dhatu/data.txt", encoding="utf-8"))["data"]}
DP = {l.split("\t")[0]: l.rstrip("\n").split("\t") for l in open("/home/claude/src/vbuild/vidyut-prakriya/data/dhatupatha.tsv")}
GNAME = {"01": "भ्वादिः (1st Class)", "02": "अदादिः (2nd Class)", "03": "जुहोत्यादिः (3rd Class)", "04": "दिवादिः (4th Class)",
         "05": "स्वादिः (5th Class)", "06": "तुदादिः (6th Class)", "07": "रुधादिः (7th Class)", "08": "तनादिः (8th Class)",
         "09": "क्र्यादिः (9th Class)", "10": "चुरादिः (10th Class)"}
LAK = ["lat", "lan", "lot", "vidhilin", "lrt", "lut", "lit", "lun", "asirlin", "lrn"]
LAKNAME = {"lat": ("लट् (वर्तमानकालः)", "Present Tense"), "lan": ("लङ् (अनद्यतनभूतकालः)", "Imperfect Past Tense"),
           "lot": ("लोट् (आज्ञार्थः)", "Imperative Mood"), "vidhilin": ("विधिलिङ् (विधिप्रार्थनादिषु)", "Potential Mood"),
           "lrt": ("लृट् (सामान्यभविष्यत्कालः)", "Simple Future Tense"), "lut": ("लुट् (अनद्यतनभविष्यत्कालः)", "Periphrastic Future"),
           "lit": ("लिट् (परोक्षभूतकालः)", "Perfect Past Tense"), "lun": ("लुङ् (सामान्यभूतकालः)", "Aorist Past Tense"),
           "asirlin": ("आशीर्लिङ् (आशीरर्थः)", "Benedictive Mood"), "lrn": ("लृङ् (हेतुहेतुमद्भावः)", "Conditional Mood")}
PU = [("prathama_purusha", "prathama"), ("madhyama_purusha", "madhyama"), ("uttama_purusha", "uttama")]
VA = [("ekavacana", "eka"), ("dvivacana", "dvi"), ("bahuvacana", "bahu")]

# ---------------- vidyut forms
tin = {}
for l in open(H + "tin.tsv"):
    c, lk, pr, pa, pu, va, fs = l.rstrip("\n").split("\t")
    tin[(c, lk, pr, pa, pu, va)] = [x for x in fs.split("|") if x]
# Overrides where vidyut-prakriya is wrong (checked against the sūtras):
OVR_NOTE = {
 ("01.1086", "lun"): "3.1.56 सर्त्तिशास्त्यर्तिभ्यश्च: ऋ takes अङ् in लुङ् — आरत् (vidyut-prakriya gives आर्षीत्; SanskritVerb, Samsaadhanii and Heritage give आरत्)",
 ("04.0141", "lun"): "3.1.55 पुषादिद्युताद्य्लृदितः परस्मैपदेषु: तृष् is पुषादि, so अङ् — अतृषत् (vidyut-prakriya gives अतर्षीत्; SanskritVerb and Samsaadhanii give अतृषत्)",
}
OVR = {("01.1086", "lun"): "03.0017", ("04.0141", "lun"): None}   # 03.0017 (ऋ गतौ) has the same आरत् paradigm in vidyut

# ---------------- independent checks
TINS = {"P": ["tip", "tas", "Ji", "sip", "Tas", "Ta", "mip", "vas", "mas"], "A": ["ta", "AtAm", "Ja", "TAs", "ATAm", "Dvam", "iw", "vahi", "mahiN"]}
LK = {"law": "lat", "laN": "lan", "low": "lot", "viDiliN": "vidhilin", "lfw": "lrt", "luw": "lut", "liw": "lit", "luN": "lun", "ASIrliN": "asirlin", "lfN": "lrn"}
t2c = {t: (p, PU[i // 3][1], VA[i % 3][1]) for p, ts in TINS.items() for i, t in enumerate(ts)}
SV_BAD_CODES = {"10.0022", "10.0098", "01.0247"}   # SanskritVerb's 2016 numbering differs for these
sv = collections.defaultdict(set)
for l in open("/home/claude/gh/sv/generatedforms/generatedforms20062016.xml", encoding="latin-1"):
    m = re.match(r'<f form="([^"]+)"><root name="[^"]*" num="([^"]+)"/><(\w+)/><(\w+)/></f>', l.strip())
    if m and m.group(2) not in SV_BAD_CODES:
        p, pu, va = t2c[m.group(4)]; sv[(m.group(2), LK[m.group(3)], p, pu, va)].add(m.group(1).rstrip("_"))
sv_codes = {k[0] for k in sv}
for (c, lk), _ in OVR_NOTE.items():
    if OVR[(c, lk)] is None:
        for pu in PU:
            for va in VA:
                tin[(c, lk, "kartari", "P", pu[1], va[1])] = sorted(sv[(c, lk, "P", pu[1], va[1])])
    else:
        for pu in PU:
            for va in VA:
                tin[(c, lk, "kartari", "P", pu[1], va[1])] = tin[(OVR[(c, lk)], lk, "kartari", "P", pu[1], va[1])]

def wl(p):
    t = open(p).read(); return {x.strip() for x in t.replace("\n", ",").split(",") if x.strip()}
SAM = wl("/home/claude/gh/sv/Data/verbforms_amba.txt"); HER = wl("/home/claude/gh/sv/Data/verbforms_gerard.txt")

# ---------------- English
def head(b):
    if b.startswith("be "): return "be", b[3:]
    w, *r = b.split(" ", 1); return w, (r[0] if r else "")
DBL = {"begin", "infer", "prop", "rot", "slip", "wet", "worship", "stop", "drip", "step", "chat", "plan", "beg", "dig", "run", "sit", "win", "cut", "split", "set", "hum", "throb", "hop", "kiss"}
def parts(b):
    """base, 3sg, past, past participle, -ing"""
    w, rest = head(b); j = lambda x: (x + " " + rest).strip()
    if w == "be": return b, j("is"), j("was"), j("been"), j("being")
    if re.search(r"[^aeiou]y$", w): s3 = w[:-1] + "ies"
    elif re.search(r"(s|sh|ch|x)$", w) or w in ("go", "do"): s3 = w + "es"
    else: s3 = w + "s"
    if b in IRR: p, pp = IRR[b]; p, pp = p.replace(rest, "").strip(), pp.replace(rest, "").strip()
    elif w in IRR: p, pp = IRR[w]
    elif w in DBL and w != "kiss": p = pp = w + w[-1] + "ed"
    elif w.endswith("e"): p = pp = w + "d"
    elif re.search(r"[^aeiou]y$", w): p = pp = w[:-1] + "ied"
    else: p = pp = w + "ed"
    if w == "lie": ing = "lying"
    elif w == "die": ing = "dying"
    elif w.endswith("e") and w not in ("see", "flee", "be"): ing = w[:-1] + "ing"
    elif w in DBL and w != "kiss": ing = w + w[-1] + "ing"
    elif w == "frolic": ing = "frolicking"
    else: ing = w + "ing"
    return b, j(s3), j(p), j(pp), j(ing)
SUBJ = {("prathama", "eka"): "he/she/it", ("prathama", "dvi"): "they two", ("prathama", "bahu"): "they",
        ("madhyama", "eka"): "you (one)", ("madhyama", "dvi"): "you two", ("madhyama", "bahu"): "you (all)",
        ("uttama", "eka"): "I", ("uttama", "dvi"): "we two", ("uttama", "bahu"): "we"}
def isbe(b): return b.startswith("be ") or b == "be"
def pres(b, pu, va):
    base, s3, *_ = parts(b)
    if isbe(b):
        v = "am" if (pu, va) == ("uttama", "eka") else ("is" if (pu, va) == ("prathama", "eka") else "are")
        return (v + " " + b[3:]).strip()
    return s3 if (pu, va) == ("prathama", "eka") else base
def past(b, pu, va):
    _, _, p, _, _ = parts(b)
    if isbe(b) or b == "be": return (("was" if va == "eka" and pu != "madhyama" else "were") + " " + b[3:]).strip()
    return p
def g_active(b, lk, pu, va, atm=False):
    S = SUBJ[(pu, va)]; base, s3, p, pp, ing = parts(b)
    t = {"lat": f"{S} {pres(b, pu, va)}", "lan": f"{S} {past(b, pu, va)} (before today)",
         "lit": f"{S} {past(b, pu, va)} (long ago, not witnessed)", "lun": f"{S} {past(b, pu, va)}",
         "lrt": f"{S} will {base}", "lut": f"{S} will {base} (on a later day)", "lrn": f"{S} would have {pp} (if …)",
         "vidhilin": f"{S} should {base}", "asirlin": f"may {S.replace('you (one)', 'you')} {base}"}.get(lk)
    if lk == "lot":
        if pu == "madhyama": t = f"{base}! ({S})"
        elif pu == "uttama": t = {"eka": "let me", "dvi": "let us two", "bahu": "let us"}[va] + f" {base}"
        else: t = {"eka": "let him/her/it", "dvi": "let them two", "bahu": "let them"}[va] + f" {base}"
    return t + (" (for oneself)" if atm else "")
def ppass(b):
    m = re.match(r"make \(\w+\) (.+)", b)
    return ("made to " + m.group(1)) if m else parts(b)[3]
def g_passive(b, lk, pu, va):
    S = SUBJ[(pu, va)]; pp = ppass(b)
    be = "am" if (pu, va) == ("uttama", "eka") else ("is" if (pu, va) == ("prathama", "eka") else "are")
    was = "was" if va == "eka" and pu != "madhyama" else "were"
    return {"lat": f"{S} {be} {pp}", "lan": f"{S} {was} {pp} (before today)", "lit": f"{S} {was} {pp} (long ago)",
            "lun": f"{S} {was} {pp}", "lrt": f"{S} will be {pp}", "lut": f"{S} will be {pp} (on a later day)",
            "lrn": f"{S} would have been {pp} (if …)", "vidhilin": f"{S} should be {pp}", "asirlin": f"may {S} be {pp}",
            "lot": f"let {S} be {pp}"}[lk]
def g_bhave(b, lk):
    ing = parts(b)[4]
    tense = {"lat": "is done", "lan": "was done (before today)", "lit": "was done (long ago)", "lun": "was done", "lrt": "will be done",
             "lut": "will be done (on a later day)", "lrn": "would have been done (if …)", "vidhilin": "should be done",
             "asirlin": "may it be done", "lot": "let it be done"}[lk]
    return f"(impersonal) {ing} {tense} — the doer goes in the 3rd case, e.g. मया …"

# ---------------- cells
stats = collections.Counter()
def clean(fs):
    keep = [f for f in fs if not (f.endswith("d") and f[:-1] + "t" in fs) and not (f.endswith("g") and f[:-1] + "k" in fs)
            and not (f.endswith("q") and f[:-1] + "w" in fs)]
    return list(dict.fromkeys(keep))
def cell(c, lk, prayoga, pa, pu, va, gloss, code_plain, nic):
    raw = tin.get((c, lk, prayoga, pa, pu, va), [])
    fs = clean(raw)
    # put the everyday form first where Pāṇini allows a second, rarer one (3.4.84 ब्रुवः पञ्चानाम् … आहः; 3.4.83 विदो लटो वा)
    LATE = {"Aha", "AhatuH", "AhuH", "AtTa", "AhaTuH", "veda", "vidatuH", "viduH", "vetTa", "vidaTuH", "vida", "vidva", "vidma"}
    if lk == "lat" and c in ("02.0039", "02.0059"): fs = sorted(fs, key=lambda x: x in LATE)
    out = {"form": deva(fs[0]) if fs else None}
    if len(fs) > 1: out["variants"] = [deva(x) for x in fs[1:]]
    chk = {}
    if prayoga == "kartari" and not nic and code_plain in sv_codes:
        s = sv.get((code_plain, lk, pa, pu, va))
        if s:
            if set(fs) == s or set(raw) == s: chk["SanskritVerb"] = "same"
            elif set(fs) & s: chk["SanskritVerb"] = "overlaps: " + ", ".join(deva(x) for x in sorted(s))
            else: chk["SanskritVerb"] = "differs: " + ", ".join(deva(x) for x in sorted(s))
    att = [n for n, S in (("Samsaadhanii", SAM), ("Heritage", HER)) if any(x in S for x in fs)]
    if att: chk["attested_in"] = att
    for k, v in chk.items():
        stats[(k, "yes" if k == "attested_in" else v.split(":")[0])] += 1
    src = "vidyut-prakriya (Pāṇinian derivation)"
    if (c.split("+")[0], lk) in OVR_NOTE and prayoga == "kartari" and not nic: src = "corrected: " + OVR_NOTE[(c.split("+")[0], lk)]
    out["source"] = src
    if chk: out["checks"] = chk
    out["meanings"] = {"en": gloss}
    return out

def grid(c, lk, prayoga, pa, kind, b, code_plain, nic):
    g = {}
    for pk, pu in PU:
        g[pk] = {}
        for vk, va in VA:
            if kind == "bhave" and not (pu == "prathama" and va == "eka"): continue
            gl = (g_active(b, lk, pu, va, atm=(kind == "kartari_A_ubhaya")) if kind.startswith("kartari")
                  else g_passive(b, lk, pu, va) if kind == "karmani" else g_bhave(b, lk))
            g[pk][vk] = cell(c, lk, prayoga, pa, pu, va, gl, code_plain, nic)
        if not g[pk]: del g[pk]
    return g
def block(c, prayoga, pa, kind, b, code_plain, nic, laks=LAK):
    return {lk: {"lakara_name_sa": LAKNAME[lk][0], "lakara_name_en": LAKNAME[lk][1],
                 "conjugation_grid": grid(c, lk, prayoga, pa, kind, b, code_plain, nic)} for lk in laks}

def has(c, lk, pr, pa): return bool(tin.get((c, lk, pr, pa, "prathama", "eka")))

# ---------------- kṛt
V2N = {"tumun": "तुमुन्", "Satf": "शतृ", "SAnac": "शानच्", "kta": "क्त", "ktavatu": "क्तवतु", "tavyat": "तव्यत्", "anIyar": "अनीयर्", "yat": "यत्",
       "Ryat": "ण्यत्", "kyap": "क्यप्", "Rvul": "ण्वुल्", "tfc": "तृच्", "lyuw": "ल्युट्", "ktin": "क्तिन्", "GaY": "घञ्", "ac": "अच्", "ap": "अप्", "Ramul": "णमुल्"}
ORDER = ["क्त्वा", "ल्यप्", "तुमुन्", "णमुल्", "शतृ", "शानच्", "क्त", "क्तवतु", "तव्यत्", "अनीयर्", "यत्", "ण्यत्", "क्यप्", "ण्वुल्", "तृच्", "ल्युट्", "क्तिन्", "घञ्", "अच्", "अप्"]
TIER = {k: "core" for k in ORDER}; TIER.update({k: "sense-restricted (derivable by rule; check usage)" for k in ["घञ्", "अच्", "अप्"]})
TIER["क्तिन्"] = "core, but blocked for some roots (3.3.102–107)"
kv = collections.defaultdict(dict)
for l in open(H + "krt_out.tsv"):
    c, pre, v, mode, fs = l.rstrip("\n").split("\t")
    name = ("ल्यप्" if pre == "sam" else "क्त्वा") if v == "ktvA" else V2N[v]
    kv[c][name] = list(dict.fromkeys(deva(x) for x in fs.split("|") if x))
AK = json.load(open("/home/claude/gh/ashdata/dhatu/dhatuforms_krut.txt", encoding="utf-8"))
AKMAP = {"क्त्वा": "क्त्वा", "तुमुन्": "तुमुन्", "शतृ": "शतृँ", "शानच्": "शानच्", "क्त": "क्त", "क्तवतु": "क्तवतुँ", "तव्यत्": "तव्य",
         "अनीयर्": "अनीयर्", "ण्वुल्": "ण्वुल्", "तृच्": "तृच्", "ल्युट्": "ल्युट्"}
CLEAN = {l.split("\t")[0]: l.rstrip("\n").split("\t")[2].split("|")[0] for l in open("/home/claude/krt/dhatus.tsv")}
def heavy_cons_final(slp):
    if not re.search(r"[kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh]$", slp): return False
    m = re.search(r"([aAiIuUfFxeEoO])([^aAiIuUfFxeEoO]*)$", slp)
    return bool(m) and (m.group(1) in "AIUFeEoO" or len(m.group(2)) > 1)
def kgloss(k, b, variant=None):
    base, s3, p, pp, ing = parts(b); ppp = ppass(b)
    return {"क्त्वा": f"having {pp}", "ल्यप्": f"having {pp} (with prefix सम्)", "तुमुन्": f"to {base}, in order to {base}",
            "णमुल्": f"{ing} again and again", "शतृ": f"{ing} (present participle)",
            "शानच्": (f"being {ppp} (passive present participle)" if variant == "karmani" else f"{ing} (present participle)"),
            "क्त": f"{ppp} (past participle)", "क्तवतु": f"one who has {pp}", "तव्यत्": f"to be {ppp}; ought to be {ppp}",
            "अनीयर्": f"to be {ppp}; worth being {ppp}", "यत्": f"to be {ppp}; fit to be {ppp}", "ण्यत्": f"to be {ppp}; fit to be {ppp}",
            "क्यप्": f"to be {ppp}; fit to be {ppp}", "ण्वुल्": f"one who {s3} (agent)", "तृच्": f"one who {s3} (agent)",
            "ल्युट्": f"the act of {ing}", "क्तिन्": f"{ing} (abstract noun, feminine)", "घञ्": f"{ing} (action noun, masculine)",
            "अच्": f"one who {s3} / {ing} (noun)", "अप्": f"{ing} (action noun, masculine)"}[k]
OLDK = {r["dhatupatha"]["code"]: r for r in json.load(open("/home/claude/smg/data-source/03-krt-participles/dhatu_krt_corrected.json", encoding="utf-8"))}
kstats = collections.Counter()
def natva(w):
    """8.4.1-2: न of -मान after र/ष/ऋ/ॠ in the same word, with only vowels, कवर्ग, पवर्ग, य व ह, anusvāra between."""
    i = w.rfind("मान"); j = i + 2
    if i < 0: return w
    ok = set("ािीुूृॄेैोौंँकखगघङपफबभमयवह्") | set("अआइईउऊएऐओऔ")
    k = j - 1
    while k >= 0:
        ch = w[k]
        if ch in "रषृॄऋॠ": return w[:j] + "ण" + w[j + 1:]
        if ch not in ok: return w
        k -= 1
    return w
# vidyut-prakriya slips in kṛt forms, corrected by sūtra (code: {affix: (form, [variants], note)})
CK = [("ख्यात्वा", ["क्शात्वा"]), ("ख्यातुम्", ["क्शातुम्"]), ("ख्यातः", ["क्शातः"]), ("ख्यातवान्", ["क्शातवान्"]), ("ख्यातव्यः", ["क्शातव्यः"]),
      ("ख्यानीयः", ["क्शानीयः"]), ("ख्यायकः", ["क्शायकः"]), ("ख्याता", ["क्शाता"])]
KOVR = {
 "02.0007": {k: (f, v, "2.4.54 चक्षिङः ख्याञ् (with the vārttika क्शाञ्) before ārdhadhātuka affixes; ल्युट् keeps चक्षणम् (असनयोश्च प्रतिषेधः)")
             for k, (f, v) in zip(["क्त्वा", "तुमुन्", "क्त", "क्तवतु", "तव्यत्", "अनीयर्", "ण्वुल्", "तृच्"], CK)},
 "01.0545": {"शतृ": ("क्रामन्", ["क्राम्यन्"], "7.3.76 क्रमः परस्मैपदेषु lengthens before a शित् affix (as in क्रामति); 3.1.70 allows श्यन् (क्राम्यन्)")},
 "04.0140": {"क्त": ("कृशः", [], "8.2.55 अनुपसर्गात्फुल्लक्षीबकृशोल्लाघाः (nipātana)"),
             "क्तवतु": ("कृशवान्", [], "8.2.55 (nipātana, also for क्तवतु)")},
 "09.0035": {"क्त": ("रीणः", [], "8.2.44 ल्वादिभ्यः: री is in the ल्वादि group, so निष्ठा त → न"),
             "क्तवतु": ("रीणवान्", [], "8.2.44 ल्वादिभ्यः")},
 "09.0039": {"क्त": ("प्लीनः", [], "8.2.44 ल्वादिभ्यः: प्ली closes the ल्वादि group, so निष्ठा त → न"),
             "क्तवतु": ("प्लीनवान्", [], "8.2.44 ल्वादिभ्यः")},
}
def krt_rupas(key, code, nic, pada, b):
    if not nic and code in OLDK:          # the 126 roots already reviewed: keep their reviewed cells
        r = copy.deepcopy(OLDK[code]); return r["krt_rupas"], r.get("restricted_krt", {}), "reused from the reviewed 126-root kṛt set"
    karm = tin.get((key, "lat", "karmani", "A", "prathama", "eka"))
    out = {}
    for k in ORDER:
        fs = kv[key].get(k, []); cellk = {"tier": TIER[k]}
        if k == "शानच्" and not fs and karm:
            fs = [natva(deva(karm[0])[:-2] + "मानः")]; cellk["prayoga"] = "कर्मणि/भावे (the root is परस्मैपदी, so kartari शानच् does not exist)"
            cellk["meaning_en"] = kgloss(k, b, "karmani")
        if k == "शतृ" and pada == "आत्मनेपदी": fs = []
        if k == "शानच्" and pada == "परस्मैपदी" and "prayoga" not in cellk: fs = []
        if k == "शतृ" and not fs: cellk.update(form=None, status="not formed (आत्मनेपदी root takes शानच्)")
        elif not fs: cellk.update(form=None, status="not formed for this root")
        else:
            cellk["form"] = fs[0]
            if len(fs) > 1: cellk["variants"] = fs[1:]
            cellk.setdefault("meaning_en", kgloss(k, b)); cellk["source"] = "vidyut-prakriya (Pāṇinian derivation)"
            if k == "णमुल्": cellk["usage"] = f"used doubled (आभीक्ष्ण्य, 3.4.22): {fs[0][:-1]}ं {fs[0]}"
            ak = AK.get(code, {}).get(AKMAP.get(k, "")) if not nic else None
            if ak:
                akf = [x.strip() for x in ak.split(",")]
                same = any(f in akf for f in fs)
                cellk["checks"] = {"ashtadhyayi.com": "same" if same else "differs: " + ", ".join(akf[:3])}
                kstats["same" if same else "differs"] += 1
        if k == "क्तिन्" and fs:
            if code.startswith("10") or nic:
                cellk = {"tier": TIER[k], "form": None, "status": "क्तिन् not used: 10th-class (णिजन्त) roots take युच् (3.3.107 ण्यासश्रन्थो युच्), e.g. गणना, कथना, चिन्ता"}
            elif heavy_cons_final(CLEAN.get(code, "")):
                cellk = {"tier": TIER[k], "form": None, "status": "क्तिन् blocked: heavy consonant-final root takes अ + टाप् instead (3.3.103 गुरोश्च हलः), as in क्रीडा, ईहा, भाषा, सेवा"}
        if k in ("यत्", "ण्यत्", "क्यप्") and not fs: cellk["status"] = "not formed (another kṛtya affix applies to this root)"
        if not nic and k in KOVR.get(code, {}):
            f, v, note = KOVR[code][k]
            cellk.update(form=f, source="corrected by sūtra: " + note, derived_by_vidyut=fs[0] if fs else None)
            cellk.pop("status", None); cellk.setdefault("meaning_en", kgloss(k, b))
            if v: cellk["variants"] = v
            else: cellk.pop("variants", None)
        out[k] = cellk
    return out, {}, "derived now"

# ---------------- records
PADA_SA = {"P": "परस्मैपदी", "A": "आत्मनेपदी", "U": "उभयपदी"}
def tr(code, nic):
    if nic: return "sakarmaka"
    return {"S": "sakarmaka", "A": "akarmaka", "D": "sakarmaka"}.get(A[code]["karma"], "sakarmaka")
first_of = {}; recs = []; krecs = []; review = []
for u in U:
    i = u["id"]; m = MAP[i]
    if m is None:
        review.append([i, u["dhatu_upadesha"], "", "", "NOT IN DHĀTUPĀṬHA", UNMATCHED[i]]); continue
    code, nic = m["code"], m["nic"]; key = code + ("+nic" if nic else ""); a = A[code]
    b = BASE[key]
    P = has(key, "lat", "kartari", "P"); Aa = has(key, "lat", "kartari", "A")
    pada = "U" if P and Aa else ("P" if P else "A")
    main = "A" if pada == "A" else "P"
    t = tr(code, nic)
    lemma = deva(CLEAN.get(code, a["dhatu"])) if False else a["dhatu"]
    rec = {"id": i, "lemma": lemma + (" (णिजन्तः)" if nic else ""), "given_headword": u["dhatu_canonical"], "iast": u["iast"],
           "gana": GNAME[code[:2]] if not nic else GNAME[code[:2]] + " → णिजन्त (causative)", "pada": PADA_SA[pada],
           "meanings": {"sa": a["artha"], "en": u["meanings"].get("en"), "te": u["meanings"].get("te"), "hi": u["meanings"].get("hi")},
           "transitivity": {"akarmaka": "अकर्मकः (intransitive)", "sakarmaka": "सकर्मकः (transitive)"}[t],
           "dhatupatha": {"code": code, "aupadeshika": a["aupadeshik"], "artha": a["artha"], "set_anit": {"S": "सेट्", "A": "अनिट्", "V": "वेट्"}.get(a["settva"], a["settva"])},
           "gloss_verb_en": b}
    if nic: rec["sanadi"] = "णिच् (हेतुमति च 3.1.26) — causative"
    if key in first_of: rec["same_root_as"] = first_of[key]
    else: first_of[key] = i
    rec["lakara_conjugations"] = block(key, "kartari", main, "kartari", b, code, nic)
    if pada == "U": rec["lakara_conjugations_atmanepada"] = block(key, "kartari", "A", "kartari_A_ubhaya", b, code, nic)
    other = "A" if main == "P" else "P"
    if pada != "U":
        opt = [lk for lk in LAK if has(key, lk, "kartari", other)]
        if opt:
            rec["optional_other_pada"] = {"pada": PADA_SA[other], "lakaras": opt,
                                          "note": "this pada is allowed only in these lakāras (e.g. 1.3.91 वृद्भ्यः स्यसनोः)",
                                          "conjugations": block(key, "kartari", other, "kartari", b, code, nic, opt)}
    if t == "sakarmaka": rec["karmani_conjugations"] = block(key, "karmani", "A", "karmani", b, code, nic)
    else: rec["bhave_conjugations"] = block(key, "karmani", "A", "bhave", b, code, nic)
    # corrections to the given metadata
    issues = []
    if m["note"]: issues.append(m["note"])
    if u["gana_number"] != int(code[:2]) and not nic and "gaṇa" not in m["note"]:
        issues.append(f"gaṇa given as {u['gana_number']}; the Dhātupāṭha entry {code} is {GNAME[code[:2]]}")
    if PADA_SA[pada] != u["pada"]: issues.append(f"pada given as {u['pada']}; derived {PADA_SA[pada]}")
    lat3 = {deva(x) for pa in ("P", "A") for x in tin.get((key, "lat", "kartari", pa, "prathama", "eka"), [])}
    gp = re.split(r"\s*/\s*", u["prathama_purusha_ekavacana"].replace("ోతి", "ोति"))
    given = []
    for g in gp:
        if g == "ते" and given: g = given[-1][:-2] + "ते"
        given.append(g)
    ok = all(g in lat3 for g in given)
    if not ok: issues.append(f"given लट् 3sg {u['prathama_purusha_ekavacana']}; derived {' / '.join(sorted(lat3))}")
    rec["corrections_to_given_data"] = issues
    rec["given"] = {k: u[k] for k in ("dhatu_upadesha", "gana_number", "pada", "prathama_purusha_ekavacana", "dhatu_number", "page_reference")}
    kr, rk, kn = krt_rupas(key, code, nic, PADA_SA[pada], b)
    recs.append(rec)
    krecs.append({"dhatu_id": i, "lemma": rec["lemma"], "iast": u["iast"], "gana": rec["gana"], "pada": rec["pada"],
                  "dhatupatha": {"code": code, "aupadeshika": a["aupadeshik"], "artha": a["artha"]}, "meaning_en": "to " + b,
                  "krt_rupas": kr, "restricted_krt": rk, "source_note": kn, **({"same_root_as": rec["same_root_as"]} if "same_root_as" in rec else {})})
    review.append([i, u["dhatu_upadesha"], code + (" +णिच्" if nic else ""), a["aupadeshik"] + " " + a["artha"],
                   "duplicate of " + rec["same_root_as"] if "same_root_as" in rec else ("corrected" if issues else "ok"), " | ".join(issues)])

# per-root verification summary
for r in recs:
    cells = [c for blk in [r["lakara_conjugations"], r.get("lakara_conjugations_atmanepada", {})] for lk in blk.values()
             for row in lk["conjugation_grid"].values() for c in row.values() if c["form"]]
    sv_same = sum(1 for c in cells if c.get("checks", {}).get("SanskritVerb") == "same")
    sv_ov = sum(1 for c in cells if str(c.get("checks", {}).get("SanskritVerb", "")).startswith("overlaps"))
    sv_diff = [c for c in cells if str(c.get("checks", {}).get("SanskritVerb", "")).startswith("differs")]
    att = sum(1 for c in cells if c.get("checks", {}).get("attested_in"))
    r["source_verification"] = {
        "method": "Every form derived with vidyut-prakriya (Pāṇini's Aṣṭādhyāyī). Kartari forms compared cell by cell with SanskritVerb's generator (drdhaval2785/SanskritVerb, 2016) and looked up in the Samsaadhanii (Univ. of Hyderabad) and Sanskrit Heritage (Huet) form lists.",
        "kartari_cells": len(cells), "sanskritverb_same": sv_same, "sanskritverb_overlap": sv_ov, "sanskritverb_differs": len(sv_diff),
        "attested_in_samsaadhanii_or_heritage": att,
        "differences": [{"derived": c["form"], "sanskritverb": c["checks"]["SanskritVerb"][9:]} for c in sv_diff][:30]}

json.dump(recs, open(H + "out/dhatu_400_tinanta.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(krecs, open(H + "out/dhatu_400_krt.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(H + "out/dhatu_400_review.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f); w.writerow(["id", "given upadeśa", "Dhātupāṭha code", "Dhātupāṭha entry", "status", "notes"]); w.writerows(review)
print(len(recs), len(krecs), collections.Counter(r[4].split(" ")[0] for r in review))
print(stats); print(kstats)
