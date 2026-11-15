"""Build app/src/data/upasarga_forms.json: the full verb tables of the 155 upasarga + root verbs.

Forms come from vidyut-prakriya (the same Pāṇinian engine used for the 400 roots), with the
prefixes passed to the engine so that it applies the prefix rules itself:
  अट्/आट् after the prefix (अन्वभवत्), ṇatva (प्रणमति), ṣatva (निषीदति), उद् + स्था (उत्तिष्ठति),
  and the Ātmanepada sūtras (संगच्छते 1.3.29, प्रतिष्ठते 1.3.22, विजयते 1.3.19, आदत्ते 1.3.20 …).

Inputs (this folder):
  upa_forms_vidyut.tsv     output of upa.rs:  id lakara prayoga pada purusha vacana forms(SLP1, |-joined)
  dhatupatha_codes.json    combination id → vidyut Dhātupāṭha code
  ../upasarga_dhatu_mappings_2026-11-15.json
To regenerate the TSV, build upa.rs as a bin in the vidyut-prakriya workspace and run
  upa dhatupatha.tsv UDC-000001=01.1046=pra …   (one argument per combination; see main() below)

Run:  python data-source/21-upasarga/tools/build_upasarga_forms.py
"""
import json, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
LAK = ["lat", "lan", "lot", "vidhilin", "lrt", "lut", "lit", "lun", "asirlin", "lrn"]
CELLS = [(p, v) for p in ("prathama", "madhyama", "uttama") for v in ("eka", "dvi", "bahu")]

# SLP1 → Devanāgarī (enough for verb forms)
V = {"a": "अ", "A": "आ", "i": "इ", "I": "ई", "u": "उ", "U": "ऊ", "f": "ऋ", "F": "ॠ", "x": "ऌ", "e": "ए", "E": "ऐ", "o": "ओ", "O": "औ"}
M = {"a": "", "A": "ा", "i": "ि", "I": "ी", "u": "ु", "U": "ू", "f": "ृ", "F": "ॄ", "x": "ॢ", "e": "े", "E": "ै", "o": "ो", "O": "ौ"}
C = dict(zip("kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh", "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह"))
def deva(s):
    out, prev_c = [], False
    for ch in s:
        if ch in C:
            if prev_c: out.append("्")
            out.append(C[ch]); prev_c = True
        elif ch in V:
            out.append(M[ch] if prev_c else V[ch]); prev_c = False
        else:
            if prev_c: out.append("्")
            out.append({"M": "ं", "H": "ः", "~": "ँ", "'": "ऽ"}.get(ch, ch)); prev_c = False
    if prev_c: out.append("्")
    return "".join(out)

def main():
    F = collections.defaultdict(list)
    for l in open(os.path.join(HERE, "upa_forms_vidyut.tsv"), encoding="utf-8"):
        i, lk, pr, pa, pu, va, fs = l.rstrip("\n").split("\t")
        # common written form first: त् before the optional द् at a pause (8.4.56 वावसाने), ं before the nasal
        F[(i, lk, pr, pa, pu, va)] = sorted((deva(x) for x in fs.split("|")), key=lambda f: (f.endswith("द्"), "ङ्" in f or "ञ्" in f or "ण्" in f or "न्" in f[:-1] or "म्" in f[:-1]))
    m = json.load(open(os.path.join(HERE, "..", "upasarga_dhatu_mappings_2026-11-15.json"), encoding="utf-8"))
    out, report = {}, collections.Counter()
    for c in m["upasarga_dhatu_combinations"]:
        cid, want = c["id"], c["present_3s"]
        if not want or cid == "UDC-000133":          # nominal-only entries; आज्ञापयति is a causative
            report["no table"] += 1; continue
        def table(pr, pa):
            t = {lk: [" / ".join(F.get((cid, lk, pr, pa, pu, va), [])) for pu, va in CELLS] for lk in LAK}
            return {lk: cells for lk, cells in t.items() if any(cells)}
        modes = {}
        P, A = table("kartari", "P"), table("kartari", "A")
        p_has = want in F.get((cid, "lat", "kartari", "P", "prathama", "eka"), [])
        a_has = want in F.get((cid, "lat", "kartari", "A", "prathama", "eka"), [])
        first = "A" if a_has and not p_has else "P"
        for pa in (first, "A" if first == "P" else "P"):
            if (P if pa == "P" else A):
                modes["kartari_" + pa] = P if pa == "P" else A
        K = table("karmani", "A")
        if K: modes["karmani"] = K
        if not (p_has or a_has):
            report["headword not generated (kept: " + cid + ")"] += 1
        out[cid] = modes
        report["tables"] += 1
    path = os.path.join(ROOT, "app/src/data/upasarga_forms.json")
    json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(dict(report), os.path.getsize(path), "bytes")

if __name__ == "__main__":
    main()
