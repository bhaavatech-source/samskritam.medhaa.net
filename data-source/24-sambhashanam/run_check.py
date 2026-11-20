import sys, re, json, importlib, collections
sys.path.insert(0, '.')
from checker import FORMS, check
from decl import decline
def norm(t):
    return t[:-1] + 'म्' if t.endswith('ं') else t
COMMON = {}   # forms used often but not in the tables, checked by hand (form -> note)
for ln in open('common_forms.tsv', encoding='utf-8') if __import__('os').path.exists('common_forms.tsv') else []:
    p = ln.rstrip('\n').split('\t')
    if p and p[0]: COMMON[p[0]] = p[1] if len(p) > 1 else ''
def lesson_forms(les):
    ok = set()
    for v in les.get('vocab', []):
        w, g = v[0], v[1]
        for x in re.split(r'\s*/\s*', w):
            ok.add(x)
            if g in ('m', 'f', 'n'): ok.update(decline(x, g))
            if g == 'adj':
                ok.update(decline(x, 'm')); ok.update(decline(x, 'n'))
                if x.endswith(('्','न','त')) is False and x[-1] not in 'ािीुूृेैोौ': ok.update(decline(x + 'ा', 'f')); ok.update(decline(x + 'ी', 'f'))
    return ok
def run(mods):
    unknown = collections.Counter(); where = collections.defaultdict(list); n = 0
    vocab_all = set()
    lessons = []
    for m in mods: lessons += importlib.import_module(m).L
    for les in lessons: vocab_all |= lesson_forms(les)
    for les in lessons:
        texts = [s[0] for s in les['s']]
        for e in les['ex']:
            texts.append(e[3] if e[0] == 'c' else e[4])
            if e[0] == 't': texts.append(e[1])
        for t in texts:
            n += 1
            for tok in re.findall(r'[ऀ-ॿ]+', t.replace('।', ' ').replace('॥', ' ')):
                x = norm(tok)
                if x in FORMS or x in vocab_all or x in COMMON or tok in FORMS: continue
                unknown[x] += 1; where[x].append(les['id'])
    print(len(lessons), 'lessons,', n, 'sentences/answers checked;', len(unknown), 'unknown forms')
    for w, c in unknown.most_common(): print(w, c, sorted(set(where[w]))[:4])
if __name__ == '__main__': run(sys.argv[1:])
