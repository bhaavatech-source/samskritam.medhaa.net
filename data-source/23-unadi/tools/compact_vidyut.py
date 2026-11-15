"""Compact the vidyut-prakriya derivations chosen for each word (vid/selected.json, made by
   select.py from the un tool's output) into unadi_prakriya_vidyut_<date>.json.
   Each step: [rule, result, [rules that only named something, applied since the last change]]."""
import json, sys
sel = json.load(open(sys.argv[1])); DEV = str.maketrans('0123456789', '०१२३४५६७८९')
def keep(h):
    res = []; prev = None; sup = []
    for r, t in h:
        plain = t.replace('*', '')
        if prev is None or plain != prev or r.startswith('U:'):
            res.append([r, t, sup]); sup = []
        elif r not in sup:
            sup.append(r)
        prev = plain
    return res
out = {}
for tgt, word, orig, v in sel:
    out[f"{tgt.translate(DEV)}|{word}"] = {"root": v['code'], "un": v['un'], "stem": v['stem'], "g": v['g'],
                                           "s": keep(v['sh']), "n": keep(v['nh'])[1:]}
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out))
