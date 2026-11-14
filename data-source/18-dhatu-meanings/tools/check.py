import json,re,sys,collections,unicodedata
sys.path.insert(0,'/home/claude/mean'); sys.path.insert(0,'/home/claude/dh400')
from wn import IDX,SYN
from en_verbs import BASE
L=['de','fr','es','ru','ar','zh','ja','ko']
rows={}
for i in range(1,5):
    for l in open(f'draft_foreign_{i}.tsv',encoding='utf-8'):
        p=l.rstrip('\n').split('\t')
        if p[0]=='code': continue
        assert len(p)==9,(i,p[0],len(p)); rows[p[0]]=dict(zip(L,p[1:]))
codes=open('/home/claude/dh400/codes.txt').read().split()
miss=[c for c in codes if c not in rows]; extra=[c for c in rows if c not in codes]
print('rows',len(rows),'missing',miss,'extra',extra)
ISO={'de':['wikt/wn-wikt-deu'],'fr':['fra/wn-data-fra','wikt/wn-wikt-fra'],'es':['mcr/wn-data-spa','wikt/wn-wikt-spa'],'ru':['wikt/wn-wikt-rus'],
     'ar':['arb/wn-data-arb','wikt/wn-wikt-arb'],'zh':['cow/wn-data-cmn','wikt/wn-wikt-cmn'],'ja':['jpn/wn-data-jpn','wikt/wn-wikt-jpn'],'ko':['wikt/wn-wikt-kor']}
def strip_ar(s): return ''.join(ch for ch in unicodedata.normalize('NFKD',s) if not unicodedata.combining(ch)).replace('أ','ا').replace('إ','ا').replace('آ','ا')
WN={l:collections.defaultdict(set) for l in L}
for l,fs in ISO.items():
    for f in fs:
        for line in open(f'/home/claude/gh/omw/wns/{f}.tab',encoding='utf-8'):
            p=line.rstrip('\n').split('\t')
            if len(p)<3 or not p[0].endswith('-v') or not p[1].endswith('lemma'): continue
            WN[l][p[0][:8]].add(p[2].replace('_',' ').strip())
U=json.load(open('/mnt/user-data/uploads/730f9fce-marked_dhatus_recitation.json',encoding='utf-8'))
M=json.load(open('/home/claude/dh400/map.json'))
uen=collections.defaultdict(set)
for u in U:
    m=M[u['id']]
    if not m: continue
    k=m['code']+('+nic' if m['nic'] else '')
    for w in re.split(r'[,/;]',u['meanings']['en']):
        w=w.strip(); w=re.sub(r'^to ','',w).strip()
        if w and len(w.split())<=2: uen[k].add(w)
def eng_offsets(c):
    keys=[BASE[c]]+sorted(uen[c])
    offs=[]
    for k in keys:
        k2=k.replace(' ','_')
        for kk in (k2, k2.split('_')[0] if not k2.startswith('be_') else None):
            if kk and kk in IDX:
                offs+= [o for o in IDX[kk][:6] if o not in offs]; break
    return offs
def norm(l,w):
    w=w.strip().lower()
    if l=='fr': w=re.sub(r"^(se |s')",'',w)
    if l=='de': w=re.sub(r'^sich ','',w)
    if l=='es': w=re.sub(r'se$','',w) if w.endswith(('arse','erse','irse')) else w
    if l=='ru': w=re.sub(r'(ся|сь)$','',w)
    if l=='ar': w=strip_ar(w)
    if l=='ja': w=w.replace('+','')
    if l=='ko' and w.endswith('하다'): w=w[:-2]
    return w
def forms(l,d):
    out=set()
    for x in re.split(r'\s*/\s*',d):
        n=norm(l,x); out.add(n)
        if l=='ar' and n.startswith('ي'): out.add(n[1:]); out.add('ا'+n[1:])
        if l=='ar' and n.startswith('ي') and len(n)==4 and n[2] in 'يو': out.add(n[1]+'ا'+n[3])
        if l=='ar' and n.startswith('ي') and len(n)==4 and n[3] in 'يى': out.add(n[1:3]+'ى'); out.add(n[1:3]+'ا')
        if l=='ja' and n.endswith('する'): out.add(n[:-2])
    return out
res={}; stat=collections.Counter()
for c in codes:
    offs=eng_offsets(c); res[c]={}
    for l in L:
        d=rows[c][l]; F=forms(l,d)
        cand=[]; hit=False
        for o in offs:
            lem=WN[l].get(o,set())
            nl={norm(l,x) for x in lem}
            if l=='ar': nl|={x[1:] for x in nl if x.startswith('ي')}
            if F & nl: hit=True
            for x in sorted(lem, key=len):
                if x not in cand: cand.append(x)
        res[c][l]={'draft':d,'status':'sourced' if hit else 'draft','wordnet_candidates':cand[:6]}
        stat[(l,'sourced' if hit else ('draft, wordnet has others' if cand else 'draft, wordnet has none'))]+=1
json.dump(res,open('foreign_checked.json','w'),ensure_ascii=False,indent=1)
for l in L: print(l,{k[1]:v for k,v in stat.items() if k[0]==l})
