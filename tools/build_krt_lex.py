"""tools/build_krt_lex.py — data-source/14-krt-meanings/*.tsv → app/src/data/krtlex.json
Each language's table gives, per root, the few verb forms from which the app builds the meaning of
every kṛdanta (…कर, తాగి, nachdem er getrunken hat, 飲んで …). See app/src/i18n/krtForms.ts."""
import json, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = {}
for f in sorted(glob.glob(os.path.join(ROOT, "data-source/14-krt-meanings/*.tsv"))):
    lang = os.path.basename(f)[:-4]
    rows = {}
    for line in open(f, encoding="utf-8"):
        if line.startswith("#") or not line.strip(): continue
        cols = line.rstrip("\n").split("\t")
        rows[cols[0]] = cols[1:]
    out[lang] = rows
json.dump(out, open(os.path.join(ROOT, "app/src/data/krtlex.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print({k: len(v) for k, v in out.items()})
