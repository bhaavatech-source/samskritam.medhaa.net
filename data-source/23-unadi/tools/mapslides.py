from map_user import *
def num(c): p,n=c.split('.'); return (int(p),int(n))
def sim(a,b): return difflib.SequenceMatcher(None,a,b,autojunk=False).ratio()
def best_near(x,claimed):
    sc=[(sim(x,NS[c]),c) for c in codes if difflib.SequenceMatcher(None,x,NS[c]).real_quick_ratio()>=0.5]
    if not sc: return (0,None)
    top=max(s for s,_ in sc); near=[z for z in sc if z[0]>=top-0.02]
    cp=num(claimed) if re.match(r'^\d\.\d+$',claimed) else (9,0)
    near.sort(key=lambda z:(-round(z[0],2),abs((num(z[1])[0]-cp[0])*1000+num(z[1])[1]-cp[1]))); return near[0]
SL=json.load(open('/home/claude/unadi/work/blocks2.json'))
for b in SL:
    cl=b['claimed']
    if cl.startswith('?'): cl='1'+cl[1:]
    head=re.split(r'[।,]| - |–',b['head'])[0]
    x=nz(slp(head))
    if cl in NS and len(x)>=2:
        s=max(sim(x,NS[cl]), sim(x,NS[cl][:len(x)]) if len(x)<len(NS[cl]) else 0)
        if s>=0.6: b['code'],b['mscore']=cl,round(s,2); continue
    s,c=best_near(x,cl) if len(x)>=3 else (0,None)
    b['code']=c if s>=0.7 else None; b['mscore']=round(s,2)
json.dump(SL,open('slides_mapped.json','w'),ensure_ascii=False,indent=0)
have=collections.Counter(b['code'] for b in SL if b['code'])
miss=[c for c in codes if c not in have]
print("blocks",len(SL),"mapped",sum(1 for b in SL if b['code']),"sutras",len(have))
print("renumbered:",[(b['claimed'],b['code']) for b in SL if b['code'] and b['code']!=b['claimed'].replace('?','1')])
print("unmapped:",[(b['claimed'],b['head'][:25],b['mscore']) for b in SL if not b['code']])
print("dup:",[c for c,n in have.items() if n>1])
print("missing",len(miss),miss)
