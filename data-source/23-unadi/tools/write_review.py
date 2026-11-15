import json,collections
D=json.load(open('built.json')); DIG=str.maketrans('०१२३४५६७८९','0123456789')
no_r=[];no_p=[];need=[];unv=[]
for p,rs in D['padas'].items():
    for r in rs:
        if not r['rupas']: no_r.append(f"{r['sutra_number']} {r['sutra_text']}")
        if not r['prakriya']: no_p.append(r['sutra_number'])
        for x in r['rupas']:
            if not x.get('meanings'): need.append(f"{r['sutra_number']} {x['word']}")
            if x['check']=='record': unv.append(f"{r['sutra_number']} {r['sutra_text']} — {x['word']}")
need=[]
for p_ in range(1,6):
    for r_ in json.load(open(f'/home/claude/unadi/out/unadi_pada{p_}_2026-11-15.json'))['sutras']:
        for x_ in r_['rupas']:
            if not x_.get('meanings'): need.append(f"{r_['sutra_number']} {x_['word']}")
rev=dict(title='Uṇādi data — review list (2026-11-15)',
  summary=dict(sutras=748,rupas=sum(len(r_['rupas']) for p_ in range(1,6) for r_ in json.load(open(f'/home/claude/unadi/out/unadi_pada{p_}_2026-11-15.json'))['sutras']),
               records_renumbered=len(D['renum']),words_set_aside=len(D['removed']),words_kept_unverified=len(unv),
               sutra_text_corrections=len(D['textfix']),sutras_without_rupas=len(no_r),
               sutras_without_slide_prakriya=len(no_p),forms_needing_meanings=len(need)),
  sutra_text_corrections=[dict(sutra=k.translate(str.maketrans('0123456789','०१२३४५६७८९')),text=v[0],reason=v[1]) for k,v in sorted(D['textfix'].items(),key=lambda kv:[int(x) for x in kv[0].split('.')])],
  records_renumbered=D['renum'],
  words_kept_unverified=dict(note='Kept under the sūtra your earlier record named, but not found in the slide notes or in the OCR of the book pages; please confirm.',list=unv),
  words_removed_after_check=json.load(open('/home/claude/unadi/out/tools/removed_after_check_2026-11-15.json')),
  words_set_aside=D['removed'],
  sutras_without_rupas=no_r,
  sutras_without_slide_prakriya=dict(note='1.1–1.41 are not in the slide decks; their forms are taken from the book.',list=no_p),
  forms_needing_meanings=need,
  meanings_added=dict(note='Meanings (sa/en/hi/te) written for forms new in this edition; native review advised.',file='tools/meanings_2026-11-15.tsv'))
json.dump(rev,open('/home/claude/unadi/out/unadi_review_2026-11-15.json','w'),ensure_ascii=False,indent=1)
print(rev['summary'])
