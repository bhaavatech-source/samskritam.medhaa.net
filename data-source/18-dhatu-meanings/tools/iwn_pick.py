import pickle,json,re,sys,collections
sys.path.insert(0,'/home/claude/mean'); sys.path.insert(0,'/home/claude/dh400'); sys.path.insert(0,'/home/claude/tools/dhatu')
from slp import deva
syn,eng=pickle.load(open('/home/claude/mean/iwn.pkl','rb'))
src=open('/home/claude/mean/check.py').read()
ns={}; exec(src[:src.index("def norm(")].replace("print('rows'","pass #"),ns)   # gives eng_offsets, rows etc.
eng_offsets=ns['eng_offsets']
from wn import IDX
from en_verbs import BASE
lat=collections.defaultdict(set)
for l in open('/home/claude/dh400/tin.tsv'):
    c,lk,pr,pa,pu,va,fs=l.rstrip('\n').split('\t')
    if lk=='lat' and pr=='kartari' and pu=='prathama' and va=='eka':
        for f in fs.split('|'): lat[c].add(deva(f))
sa_idx=collections.defaultdict(list)
for i,ws in syn['sa'].items():
    for w in ws: sa_idx[w].append(i)
off2iwn=collections.defaultdict(list)
for i,es in eng.items():
    for e in es: off2iwn[e].append(i)
codes=open('/home/claude/dh400/codes.txt').read().split()
A={x['baseindex']:x for x in json.load(open('/home/claude/gh/ashdata/dhatu/data.txt',encoding='utf-8'))['data']}
U=json.load(open('/mnt/user-data/uploads/730f9fce-marked_dhatus_recitation.json',encoding='utf-8'))
M=json.load(open('/home/claude/dh400/map.json'))
given=collections.defaultdict(lambda:{'hi':set(),'te':set()})
for u in U:
    m=M[u['id']]
    if not m: continue
    k=m['code']+('+nic' if m['nic'] else '')
    for l in ('hi','te'):
        for w in re.split(r'[,/;]',u['meanings'].get(l) or ''):
            w=w.strip()
            if w: given[k][l].add(w)
def safs(c):
    a=A[c.split('+')[0]]['dhatu']; f={a, a.rstrip('्')}
    if c.startswith('10') or '+nic' in c: f|={x[:-2] for x in lat[c] if x.endswith('ति')}
    return f
TL=['ta','kn','ml','mr','bn','or','te','hi']
out={}; st=collections.Counter()
for c in codes:
    F=safs(c)
    ids_sa=[i for f in sorted(F) for i in sa_idx.get(f,[])]
    UPA=('प्र','परा','अप','सम्','सं','अनु','अव','निस्','निर्','दुस्','दुर्','वि','आ','नि','अधि','अपि','अति','सु','उत्','उद्','अभि','प्रति','परि','उप')
    ids_sap=[i for w,ii in sa_idx.items() for i in ii if any(w==u+f or w==u+' '+f for u in UPA for f in F if len(f)>1)]
    offs=eng_offsets(c)
    top=set(IDX.get(BASE[c].replace(' ','_'),IDX.get(BASE[c].split()[0],[]))[:2])
    ids_en=[i for o in offs for i in off2iwn.get(o,[])]
    rank={}
    base=IDX.get(BASE[c].replace(' ','_'),IDX.get(BASE[c].split()[0],[]))
    for o in offs:
        r=base.index(o) if o in base else 5
        for i in off2iwn.get(o,[]): rank[i]=min(rank.get(i,9),r)
    cand=list(dict.fromkeys(ids_sa+ids_sap+ids_en))
    def score(i):
        sc=0; why=[]
        if i in ids_sa: sc+=2; why.append('Sanskrit root')
        elif i in ids_sap: sc+=1; why.append('Sanskrit root with upasarga')
        if i in rank: sc+={0:3,1:2}.get(rank[i],1); why.append('English sense')
        if given[c]['hi'] & set(syn['hi'].get(i,[])): sc+=2; why.append('your Hindi meaning')
        if given[c]['te'] & set(syn['te'].get(i,[])): sc+=2; why.append('your Telugu meaning')
        return sc,why
    best=sorted(((score(i),-cand.index(i),i) for i in cand),reverse=True)
    if best and best[0][0][0]>=3:
        (sc,why),_,pick=best[0]; how='IndoWordNet — matched by '+', '.join(why)
    elif best and best[0][0][0]>=2:
        (sc,why),_,pick=best[0]; how='IndoWordNet — weak match ('+', '.join(why)+') — check'
    else: pick,how=None,None
    st[how]+=1
    rec={'iwn_id':pick,'how':how,'sanskrit_synset':syn['sa'].get(pick,[])[:6] if pick else []}
    for l in TL:
        ws=syn[l].get(pick,[]) if pick else []
        rec[l]=ws[:5]
    out[c]=rec
json.dump(out,open('/home/claude/mean/iwn_picks.json','w'),ensure_ascii=False,indent=1)
print(st)
