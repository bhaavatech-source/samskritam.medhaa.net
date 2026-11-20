"""Form checker for सम्भाषणम्: every word in a lesson must be a known form
   (verb tables, kṛt forms with their declension, noun declensions, pronouns, avyayas) or listed in EXTRA."""
import json, glob, re, sys
sys.path.insert(0, '/home/claude/unadi/out/tools'); from deva import deva
FORMS = {}    # form -> set of descriptions
def add(f, why):
    for x in f.split('|'):
        x = x.strip()
        if x: FORMS.setdefault(x, set()).add(why)
ROOT = '/home/claude/rupa2/root/app/public/rupa/'
idx = json.load(open(ROOT + 'index.json'))
ROOTS = {c: (up, r, artha, en) for c, up, r, artha, en, _ in idx}
LAK = {}
for f in glob.glob(ROOT + '[0-9]*.json'):
    code = f.split('/')[-1][:-5]; t = json.load(open(f))
    for pre, e in t.items():
        for voice, ls in e['t'].items():
            for lak, forms in ls.items():
                for i, x in enumerate(forms):
                    for y in x.split('|'):
                        dv = deva(y); add(dv, f'{code}:{pre}:{voice}:{lak}:{i}')
                        LAK.setdefault((code, pre, voice, lak), forms)
        for k, x in e['k'].items():
            for y in x.split('|'):
                dv = deva(y); add(dv, f'{code}:{pre}:{k}')
                # declined forms of participles / kṛtyas (nominative and accusative, three genders)
                s = y
                if k in ('kta', 'tavyat', 'anIyar', 'yat', 'Ryat') and s.endswith('aH'):
                    st = s[:-2]
                    for suf in ('aH', 'O', 'AH', 'am', 'An', 'A', 'e', 'AH', 'Am', 'ani', 'ena', 'AyAm', 'e', 'Ani', 'AnAm', 'asya', 'Aya', 'At', 'ayA'):
                        add(deva(st + suf), f'{code}:{pre}:{k}~')
                if k == 'ktavatu' and s.endswith('vAn'):
                    st = s[:-3]
                    for suf in ('vAn', 'vantO', 'vantaH', 'vatI', 'vatyO', 'vatyaH', 'vat', 'vantam'):
                        add(deva(st + suf), f'{code}:{pre}:ktavatu~')
                if k == 'Satf' and s.endswith('n'):
                    st = s[:-1]
                    for suf in ('n', 'ntO', 'ntaH', 'ntI', 'ntyO', 'ntyaH', 't', 'ntam'):
                        add(deva(st + suf), f'{code}:{pre}:Satf~')
W = json.load(open('/home/claude/site/app/src/data/words.json'))
for w in W:
    for row in w.get('d', []):
        for x in (row if isinstance(row, list) else [row]):
            for y in str(x).split('/'): add(y.strip(), 'noun:' + w['w'])
A = json.load(open('/home/claude/site/app/src/data/avyaya.json'))
def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('w', 'sa', 'word') and isinstance(v, str): add(v.strip(), 'avyaya')
            else: walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(A)
for t in re.findall(r'[ऀ-ॿ]+', open('/home/claude/site/app/src/i18n/pronouns.ts').read()): add(t, 'pronoun')
EXTRA = {}   # filled by lesson files: forms known to be correct but missing from the tables, with a note
def check(sa, extra=()):
    bad = []
    for t in re.findall(r'[ऀ-ॿ]+', sa.replace('।', ' ').replace('॥', ' ')):
        if t in FORMS or t in EXTRA or t in extra: continue
        bad.append(t)
    return bad
if __name__ == '__main__':
    print(len(FORMS), 'forms')
    for s in ['सः विद्यालयं गच्छति।', 'अहं पुस्तकं पठितवती।', 'भोजनं कृत्वा गच्छामि।', 'मया पाठः पठितः।', 'त्वं कुत्र गमिष्यसि?']:
        print(s, check(s))
