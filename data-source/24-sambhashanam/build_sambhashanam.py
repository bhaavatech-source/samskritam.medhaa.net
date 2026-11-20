"""Build app/src/data/sambhashanam.json from the lesson files (data-source/24-sambhashanam).
   python build_sambhashanam.py <lesson-dir> <sentences.json> <out.json>"""
import json, sys, importlib, os, glob, re
src, sent_path, out = sys.argv[1:4]
sys.path.insert(0, src)
LEVELS = [
 [1, "प्रथमः स्तरः", "Level 1 · Foundations", "Greetings, the seven cases, everyday indeclinables, present, imperative and future, -त्वा, -तुम्, -तवत्, -त and should/must, with the commonest roots."],
 [2, "द्वितीयः स्तरः", "Level 2 · Building up", "More roots, more indeclinables, the past tense, passive and impersonal sentences, participles, and changing one construction into another."],
 [3, "तृतीयः स्तरः", "Level 3 · Fluency", "Causatives, conditionals, relative and reported speech, compounds and longer connected conversation."],
]
existing = {re.sub(r'\s+', ' ', s['sa']).strip(): s['id'] for s in json.load(open(sent_path, encoding='utf-8'))}
lessons = []
for f in sorted(glob.glob(os.path.join(src, 'L[0-9]*.py'))):
    mod = importlib.import_module(os.path.basename(f)[:-3])
    for L in mod.L:
        lv = int(L['id'].split('-')[0])
        sents = []
        for s in L['s']:
            row = list(s[:4]); ref = existing.get(re.sub(r'\s+', ' ', s[0]).strip())
            row.append(ref or ""); sents.append(row)
        ex = []
        for e in L['ex']:
            if e[0] == 'c': ex.append(["c", e[1], list(e[2]), e[3], e[4]])
            else: ex.append(["t", e[1], list(e[3]), e[4], e[2]])
            assert ex[-1][3] in ex[-1][2], (L['id'], e)
        lessons.append({"id": L['id'], "lv": lv, "sa": L['sa'], "en": L['en'], "point": L['point'], "pattern": L.get('pattern', []),
                        "vocab": [[v[0], v[2], v[3], v[4]] for v in L.get('vocab', [])], "s": sents, "ex": ex})
lessons.sort(key=lambda l: [int(x) for x in l['id'].split('-')])
json.dump({"levels": LEVELS, "lessons": lessons}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
n = sum(len(l['s']) for l in lessons); r = sum(1 for l in lessons for s in l['s'] if s[4])
print(len(lessons), 'lessons,', n, 'sentences (', r, 'shared with the sentence book ),', sum(len(l['ex']) for l in lessons), 'exercises')
