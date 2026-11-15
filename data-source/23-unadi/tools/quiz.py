from map_user import *
from deva import deva
DIG=str.maketrans('०१२३४५६७८९','0123456789'); DEV=str.maketrans('0123456789','०१२३४५६७८९')
q=json.load(open('/home/claude/unadi/out/unadi_pariksha_levels_2026-11-15.json'))
B=json.load(open('built.json')); forms={}
for p in B['padas'].values():
    for r in p: forms[r['sutra_number'].translate(DIG)]=[x['word'] for x in r['rupas']]
rows=[]
for x in q['questions']:
    ps=x['panini_sutra']
    for m in re.finditer(r'([^()/]+?)\s*\(\s*उणादि\s*([०-९]+\.[०-९]+)',ps):
        name=m.group(1).strip(" '‘’"); num=m.group(2).translate(DIG)
        xn=nz(slp(name)); sc=sorted(((difflib.SequenceMatcher(None,xn,NS[c]).ratio(),c) for c in codes),reverse=True)[0]
        tw=x['target_word']; inf=any(stem(tw)==stem(f) for f in forms.get(sc[1],[]))
        rows.append((x['question_id'],name,num,sc[1],round(sc[0],2),deva(SP[sc[1]]['text']),tw,inf))
for r in rows: print(('OK ' if r[2]==r[3] else 'FIX')+(' ' if r[7] else '*'),r)
