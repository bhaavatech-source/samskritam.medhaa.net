"""tools/build_dhatu_index.py → app/public/vidyut/dhatus.json: the root list for रूपनिर्माणम्.

Inputs:  app/public/vidyut/dhatupatha.tsv   (vidyut-prakriya's Dhātupāṭha: code, upadeśa, artha; SLP1)
         tools/dhatu_lemmas_slp1.tsv        (code, upadeśa, root without markers, e.g. 01.1046 hf\\Y hf)
         dhatu_400_tinanta.json             (English meanings of the 408 roots in the verb book)
Output:  [[code, upadeśa, root, artha, English meaning or "", 1 if the root is in the verb book else 0], …] in Devanāgarī.
"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = {"a": "अ", "A": "आ", "i": "इ", "I": "ई", "u": "उ", "U": "ऊ", "f": "ऋ", "F": "ॠ", "x": "ऌ", "X": "ॡ", "e": "ए", "E": "ऐ", "o": "ओ", "O": "औ"}
M = {"a": "", "A": "ा", "i": "ि", "I": "ी", "u": "ु", "U": "ू", "f": "ृ", "F": "ॄ", "x": "ॢ", "X": "ॣ", "e": "े", "E": "ै", "o": "ो", "O": "ौ"}
C = dict(zip("kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL", "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ"))
def deva(s):
    s = s.replace("\\", "").replace("^", "")
    out, prev = [], False
    for ch in s:
        if ch in C:
            if prev: out.append("्")
            out.append(C[ch]); prev = True
        elif ch in V:
            out.append(M[ch] if prev else V[ch]); prev = False
        else:
            if prev: out.append("्")
            out.append({"M": "ं", "H": "ः", "~": "ँ", "'": "ऽ"}.get(ch, ch)); prev = False
    if prev: out.append("्")
    return "".join(out)
lem = {l.split("\t")[0]: l.rstrip("\n").split("\t")[2] for l in open(os.path.join(ROOT, "tools/dhatu_lemmas_slp1.tsv"), encoding="utf-8")}
en = {}
mp = json.load(open(os.path.join(ROOT, "data-source/17-dhatu-400/tools/map.json"), encoding="utf-8"))
for r in json.load(open(os.path.join(ROOT, "dhatu_400_tinanta.json"), encoding="utf-8")):
    m = mp.get(r["id"])
    if m and not m.get("nic"): en.setdefault(m["code"], r["meanings"].get("en") or "")
rows = []
for i, l in enumerate(open(os.path.join(ROOT, "app/public/vidyut/dhatupatha.tsv"), encoding="utf-8")):
    f = l.rstrip("\n").split("\t")
    if i == 0 or len(f) < 3 or f[1] == "-": continue
    code, up, artha = f[0], f[1], f[2]
    root = lem.get(code) or re.sub(r"[~\\^]", "", up)
    rows.append([code, deva(up), deva(root), deva(artha), en.get(code, ""), 1 if code in en else 0])
json.dump(rows, open(os.path.join(ROOT, "app/public/vidyut/dhatus.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(rows), "roots;", sum(r[5] for r in rows), "in the verb book")
