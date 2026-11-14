"""Add the meaning of each lakāra to every lakāra block, and bring the English form-glosses in line with it.

usage: python apply_lakara.py <dhatu json> [more files]   (rewrites the files in place)
Glosses: लङ् "(on an earlier day)"; लिट् "(long ago, out of the speaker's sight)"; लुङ् "(today or earlier)";
विधिलिङ् "should / may". Running it twice changes nothing.
"""
import json, os, re, sys

INFO = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lakara_meanings.json"), encoding="utf-8"))

def fix(lk, t):
    if not isinstance(t, str): return t
    if lk == "lan": t = t.replace("(before today)", "(on an earlier day)")
    if lk == "lit":
        t = t.replace("(long ago, not witnessed)", "(long ago, out of the speaker's sight)")
        t = re.sub(r"\(long ago\)", "(long ago, out of the speaker's sight)", t)
    if lk == "lun" and "today or earlier" not in t:
        if " — " in t: a, b = t.split(" — ", 1); t = f"{a} (today or earlier) — {b}"
        elif t.endswith(" (for oneself)"): t = t[:-14] + " (today or earlier) (for oneself)"
        else: t = t + " (today or earlier)"
    if lk == "vidhilin" and "should / may" not in t: t = t.replace("should", "should / may", 1)
    return t

def walk_block(block):
    n = 0
    for lk, v in block.items():
        if lk not in INFO or not isinstance(v, dict): continue
        v["lakara_meaning"] = {k: INFO[lk][k] for k in ("sutra", "sa", "en", "term")}
        for row in v.get("conjugation_grid", {}).values():
            for c in row.values():
                m = c.get("meanings", {})
                if "en" in m:
                    new = fix(lk, m["en"])
                    if new != m["en"]: m["en"] = new; n += 1
    return n

for f in sys.argv[1:]:
    d = json.load(open(f, encoding="utf-8"))
    n = 0
    for r in d:
        for k, v in r.items():
            if k.endswith("conjugations") and isinstance(v, dict): n += walk_block(v)
            if k == "optional_other_pada": n += walk_block(v["conjugations"])
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f, "glosses changed:", n)
