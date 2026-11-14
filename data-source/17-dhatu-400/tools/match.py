import json,re,collections,difflib
U=json.load(open('/mnt/user-data/uploads/730f9fce-marked_dhatus_recitation.json',encoding='utf-8'))
A=json.load(open('/home/claude/gh/ashdata/dhatu/data.txt',encoding='utf-8'))['data']
def s(x): return re.sub(r'[ँ॒॑\s]','',x or '')
def ar(x): return re.sub(r'(एव|च|इत्यन्ये|इत्येके)$','',s(x))
out={}; rows=[]
for u in U:
    up=u['dhatu_upadesha'].split(); r=s(up[0]); a=ar(''.join(up[1:])); can=s(u['dhatu_canonical'])
    best=[]
    for x in A:
        sc=0; ax=ar(x['artha'])
        if s(x['aupadeshik'])==r: sc+=4
        elif s(x['aupadeshik']).startswith(r) or r.startswith(s(x['aupadeshik'])): sc+=2
        if s(x['dhatu'])==can: sc+=2
        if ax==a: sc+=3
        elif a and (a in ax or ax in a): sc+=2
        else: sc+=difflib.SequenceMatcher(None,a,ax).ratio()
        if int(x['gana'])==u['gana_number']: sc+=0.5
        if sc>=4: best.append((sc,x))
    best.sort(key=lambda t:-t[0])
    top=best[0] if best else (0,None)
    amb = len(best)>1 and best[1][0]>=top[0]-0.01
    rows.append((u,top,amb,best[:3]))
    if top[1]: out[u['id']]=top[1]['baseindex']
json.dump(out,open('/home/claude/dh400/map_auto.json','w'))
n=0
for u,(sc,x),amb,b in rows:
    if x is None or sc<8 or amb:
        n+=1; print(u['id'],u['dhatu_upadesha'],'g',u['gana_number'],'|',[(round(t[0],1),t[1]['baseindex'],t[1]['aupadeshik'],t[1]['artha']) for t in b])
print('flag',n,'of',len(rows))
gm=sum(1 for u,(sc,x),amb,b in rows if x and int(x['gana'])!=u['gana_number']); print('gana mismatches',gm)
