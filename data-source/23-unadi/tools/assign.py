from map_user import *
import numpy as np
DIG=str.maketrans('०१२३४५६७८९','0123456789')
def num(c): p,n=c.split('.'); return (int(p),int(n))
def dist(a,b):
    try: pa,pb=num(a),num(b)
    except: return 9999
    return abs((pa[0]-pb[0])*300+pa[1]-pb[1])
order={c:i for i,c in enumerate(codes)}
B=json.load(open('slides_mapped.json'))
slide_txt=collections.defaultdict(str)
for b in B: slide_txt[b['code']]+=nz(slp(b['head']+' '+b['body']))
def best_near(t,claimed):
    x=nz(slp(t))
    if len(x)<3: return (0,None)
    sc=[]
    for c in codes:
        sm=difflib.SequenceMatcher(None,x,NS[c],autojunk=False)
        if sm.real_quick_ratio()<0.5 or sm.quick_ratio()<0.5: continue
        sc.append((sm.ratio(),c))
    if not sc: return (0,None)
    top=max(s for s,_ in sc); near=[z for z in sc if z[0]>=top-0.02]
    near.sort(key=lambda z:(-round(z[0],2),dist(z[1],claimed))); return near[0]
def in_book(x,c,pad=0):
    tol=max(1,len(x)//5); return fuzzy_in(x,range_text(c,pad))<=tol
U='/home/claude/unadi/src/'
out=[]
for p in range(1,6):
    d=json.load(open(U+f'unadi_pada{p}_complete.json'))
    for r in d['sutras']:
        claimed=r['sutra_number'].translate(DIG)
        sc,rc=best_near(r['sutra_text'],claimed)
        rc_ok = sc>=0.8
        for w in r.get('rupas',[]):
            x=stem(w['word']); cand=[]
            # slide evidence
            sl=[c for c in codes if x and len(x)>=3 and x in slide_txt[c]]
            how=None; code=None
            if rc_ok and (rc in sl or in_book(x,rc,0)): code,how=rc,'sutra-text+'+('slide' if rc in sl else 'book')
            elif sl:
                ref=rc if rc_ok else claimed
                code=min(sl,key=lambda c:dist(c,ref)); how='slide'
            else:
                ref=rc if rc_ok else claimed
                # book search near ref (±25 sutras)
                i0=order.get(ref, None)
                if i0 is None:
                    try: i0=order[min(codes,key=lambda c:dist(c,ref))]
                    except: i0=0
                near=[codes[j] for j in range(max(0,i0-25),min(len(codes),i0+26))]
                hits=[c for c in near if in_book(x,c,0)]
                if hits: code=min(hits,key=lambda c:dist(c,ref)); how='book'
                else: code=rc if rc_ok else None; how='unverified'
            out.append(dict(file=p,rec=r['sutra_id'],claimed=claimed,rec_text=r['sutra_text'],rec_score=round(sc,2),rec_code=rc,word=w['word'],stem=x,code=code,how=how,
                            book=in_book(x,code,1) if code else False, rupa=w, pratyaya=r.get('pratyaya')))
json.dump(out,open('assign.json','w'),ensure_ascii=False)
C=collections.Counter(o['how'] for o in out); print(C)
print("book-verified",sum(o['book'] for o in out),"of",len(out))
print("code==claimed",sum(1 for o in out if o['code']==o['claimed']))
