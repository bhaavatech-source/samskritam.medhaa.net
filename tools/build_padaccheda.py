"""Build the corrected padaccheda list.

in : data-source/16-padaccheda/Updated_Padaccheda_2025-11-21.json   (author, base)
     data-source/06-gold-data/Padaccheda.json                       (Gold, for the dropped entries)
     data-source/16-padaccheda/corrections_2026-11-12.py
out: data-source/16-padaccheda/Padaccheda_corrected_2026-11-12.json  (same shape as the author's file)
     data-source/16-padaccheda/CHANGES_2026-11-12.md
The game build (build_game_data.py) reads the corrected file.
"""
import json, os, re, runpy, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data-source/16-padaccheda")
C = runpy.run_path(os.path.join(D, "corrections_2026-11-12.py"))
base = json.load(open(os.path.join(D, "Updated_Padaccheda_2025-11-21.json"), encoding="utf-8-sig"))
gold = json.load(open(os.path.join(ROOT, "data-source/06-gold-data/Padaccheda.json"), encoding="utf-8"))["data_pairs"]
upd = {x["input"].strip(): x for x in base["data_pairs"]}

DEV = r"[ऀ-ॿ]"
def colon(s):  return re.sub(rf"(?<={DEV})\s?:", "ः", s)
def padas(s):  return [w.strip() for w in s.split(",") if w.strip()]

used_in, used_out = set(), set()
log = []                     # (gold no., source, [changes])

# ---------- 1. merge in Gold order, fix
rows = []
for g, gx in enumerate(gold, 1):
    key = gx["input"].strip()
    src = "Updated" if key in upd else "Gold (dropped in Updated)"
    x = upd.get(key, gx)
    ch = []
    if key in upd and upd[key]["output"] != gx["output"]:
        a, b = padas(gx["output"]), padas(upd[key]["output"])
        ch.append(f"already fixed in Updated: {' · '.join(w for w in a if w not in b)} → {' · '.join(w for w in b if w not in a)}")
    s = x["input"].strip()
    for i, (w, r, why) in enumerate(C["INPUT_FIX"]):
        if w in s:
            s = s.replace(w, r); used_in.add(i); ch.append(f"śloka: {w} → {r} ({why})")
    if ":" in s:
        s = colon(s); ch.append("śloka: ASCII ':' → ः")
    p = padas(x["output"])
    if any(":" in w for w in p):
        p = [colon(w) for w in p]; ch.append("pada: ASCII ':' → ः")
    q = []
    for w in p:
        for i, (bad, good, why) in enumerate(C["OUTPUT_FIX"]):
            if w == bad:
                used_out.add(i); ch.append(f"pada: {bad} → {' · '.join(good) if isinstance(good, list) else good} ({why})")
                q.extend(good if isinstance(good, list) else [good]); break
        else:
            q.append(w)
    rows.append({"g": g, "src": src, "sloka": s, "padas": q, "ch": ch})

miss = [C["INPUT_FIX"][i][0] for i in range(len(C["INPUT_FIX"])) if i not in used_in] + \
       [C["OUTPUT_FIX"][i][0] for i in range(len(C["OUTPUT_FIX"])) if i not in used_out]
assert not miss, f"fixes not used: {miss}"

# ---------- 2. split into one item per śloka
def halves(s):
    return [h.strip() for h in re.split(r"\s*(?:।।|॥|।)\s*", s) if h.strip()]

def core(w):
    w = re.sub(r"(्|ः|ं)$", "", w)
    w = re.sub(r"[ा-ौ]$", "", w) if len(w) > 2 else w      # drop a final vowel sign
    return w

def align(hs, ps):
    """Give each pada the half-line it comes from (by finding its stem in the text)."""
    text, bounds, pos = "", [], 0
    for h in hs:
        t = h.replace(" ", "").replace("ऽ", ""); text += t; bounds.append(len(text))
    ENC = {"इव", "एव", "अपि", "च", "इति", "हि", "तु", "वा", "ह", "नु", "स्म"}
    hits, cur = [], 0
    for w in ps:
        c = core(w); hit = -1
        for cand in (c, c[1:], c[:-1], c[1:-1]):
            if len(cand) >= 2:
                k = text.find(cand, cur, cur + len(c) + 12)
                if k >= 0: hit = k; break
        if hit < 0 and len(c) == 1:                     # स, न ... : only right at the cursor
            k = text.find(c, cur, cur + 4)
            if k >= 0: hit, cand = k, c
        if hit >= 0: cur = hit + max(1, len(cand) - 1)
        hits.append(hit)
    line_of = lambda h: next(i for i, b in enumerate(bounds) if h < b or i == len(bounds) - 1)
    out = []
    for j, (w, h) in enumerate(zip(ps, hits)):
        if h >= 0: out.append(line_of(h)); continue
        prev = out[-1] if out else 0
        nxt = next((line_of(x) for x in hits[j + 1:] if x >= 0), prev)
        out.append(prev if w in ENC or nxt == prev else nxt)
    return out

items, splits = [], []
for r in rows:
    hs = halves(r["sloka"])
    if len(hs) <= 2:
        s = " । ".join(hs) + " ।।" if len(hs) == 2 else hs[0] + " ।।"
        items.append({**r, "sloka": s, "part": ""}); continue
    groups = [hs[i:i + 2] for i in range(0, len(hs), 2)]
    if len(groups[-1]) == 1 and len(groups) > 1:
        last = groups.pop(); groups[-1] += last
    lines = align(hs, r["padas"])
    assert lines == sorted(lines), (r["g"], lines)
    gi, start = [], 0
    for grp in groups:
        gi.append(range(start, start + len(grp))); start += len(grp)
    for n, rg in enumerate(gi):
        ps = [w for w, l in zip(r["padas"], lines) if l in rg]
        assert ps, (r["g"], n)
        s = " । ".join(groups[n]) + " ।।"
        items.append({**r, "sloka": s, "padas": ps, "part": chr(ord("a") + n),
                      "ch": r["ch"] + ([f"split into {len(gi)} ślokas"] if n == 0 and len(gi) > 1 else [])})
    if len(gi) > 1: splits.append((r["g"], len(gi)))
    if len(gi) == 1: items[-1]["part"] = ""

# ---------- 3. write
for i, it in enumerate(items, 1):
    it["id"] = f"PC-{i:03d}"
out = {"task_name": base.get("task_name", "Padaccheda (Sandhi Splitting)"),
       "instructions": base.get("instructions", ""),
       "reviewed": "2026-11-12: corrected and split one śloka per item; see CHANGES_2026-11-12.md",
       "data_pairs": [{"input": it["sloka"], "output": ", ".join(it["padas"]) + ","} for it in items]}
json.dump(out, open(os.path.join(D, "Padaccheda_corrected_2026-11-12.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)

L = ["# Padaccheda — changes, 2026-11-12", "",
     f"Gold entries: {len(gold)} · Updated (2025-11-21) entries: {len(upd)} · corrected items: {len(items)}", "",
     "Base: the author's Updated file. Entries it dropped come back from the Gold file with the same fixes.",
     "Convention: compounds whole, avyayas separate, ः for visarga, one śloka per item.",
     "All śloka lines: dandas spaced the same way (' । ' between half-lines, ' ।।' at the end).", "",
     "| Gold no. | new id(s) | source | changes |", "|---|---|---|---|"]
for r in rows:
    ids = [it["id"] for it in items if it["g"] == r["g"]]
    ch = [c for it in items if it["g"] == r["g"] for c in it["ch"]]
    ch = list(dict.fromkeys(ch))
    if ch or r["src"] != "Updated":
        L.append(f"| {r['g']} | {', '.join(ids)} | {r['src']} | {'; '.join(ch) or '—'} |")
open(os.path.join(D, "CHANGES_2026-11-12.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")

if "--show" in sys.argv:
    for it in items:
        if it["part"]:
            print(it["id"], it["g"], it["part"], it["sloka"]); print("      ", " · ".join(it["padas"]))
print(f"{len(items)} items from {len(rows)} entries; {len(splits)} entries split")
