exec(open('/home/claude/unadi/vid/match.py').read())
sys.path.insert(0,'/home/claude/unadi/tools'); from deva import deva
std=dict(l.rstrip('\n').split('\t') for l in list(open('/home/claude/src/vidyut/vidyut-prakriya/data/unadipatha.tsv'))[1:])
NS={c:std[c].replace(' ','') for c in std}
code2sut=collections.defaultdict(set)
for u,ss in scan.items():
    for t in ss: code2sut[t].add(u)
GEN={'पुंलिङ्गम्':'m','स्त्रीलिङ्गम्':'f','नपुंसकलिङ्गम्':'n'}
def num(c): a,b=c.split('.'); return int(a),int(b)
def root_of(hist):
    for r,t in hist:
        if r=='A:1.3.9': return t.split()[0].lstrip('*')
    return hist[0][1].split()[0].lstrip('*')
def named(root,c):
    t=NS[c]; r=root.rstrip('~')
    for k in range(min(len(r),4),1,-1):
        if r[:k] in t: return True
    return False
GENERAL={'4.188','4.158','4.117','4.144','4.119','1.111','4.138'}
out={}; moves=[]
for p in range(1,6):
    for r in json.load(open(f'/home/claude/unadi/out/unadi_pada{p}_2026-11-15.json'))['sutras']:
        c=r['sutra_number'].translate(DIG)
        for x in r['rupas']:
            w=slp(x['word'].split('/')[0].strip()).replace(' ','')
            gs={GEN.get(g.strip()) for g in (x.get('gender') or '').split('/')}-{None}
            cands=[]
            for d in D.get(w,[]):
                for s in code2sut[(d[0],d[1],d[3])]:
                    cands.append((s,d))
            if not cands: continue
            own=[(s,d) for s,d in cands if s==c]
            target=c; label=None; pick=None
            if own: pick=own
            else:
                near=[(s,d) for s,d in cands if s not in GENERAL and num(s)[0]==num(c)[0] and abs(num(s)[1]-num(c)[1])<=3]
                if near:
                    s0,d0=near[0]; rt=root_of(d0[4])
                    if named(rt,c): pick=near; label=s0            # vidyut mislabel: keep our sūtra
                    elif named(rt,s0): pick=near; target=s0; moves.append((c,s0,x['word']))
            if not pick: continue
            pick.sort(key=lambda sd:(sd[1][2] not in gs, len(sd[1][4])+len(sd[1][5])))
            s,d=pick[0]
            out[(target,x['word'],c)]=dict(code=d[0],un=d[1],g=d[2],stem=d[3],sh=d[4],nom=w,nh=d[5],vlabel=s)
print('derivations',len(out),'moves',len(moves)); print(moves)
json.dump([[k[0],k[1],k[2],v] for k,v in out.items()],open('/home/claude/unadi/vid/selected.json','w'),ensure_ascii=False)
