import re,sys,json,glob,difflib
sys.path.insert(0,'/home/claude/td'); from translit import slp
from lines import lines2
DIG=str.maketrans('०१२३४५६७८९','0123456789')
main=""; comm={}; pmap=[]
for pg in sorted(glob.glob('tsv/p-*.tsv')):
    pn=int(pg[-7:-4]); L=lines2(pg)
    if not L: continue
    body=L[1:]  # drop running head
    cut=len(body)
    for i,l in enumerate(body):
        if l['pitch'] and l['pitch']>88: cut=i+1; break
    if pn==1:  # page 1: uṇādi starts at "अथोणादयः"
        pass
    pmap.append((len(main),pn))
    main+="\n".join(l['text'] for l in body[:cut])+"\n"
    comm[pn]="\n".join(l['text'] for l in body[cut:])
json.dump(dict(main=main,comm=comm,pmap=pmap),open('streams.json','w'),ensure_ascii=False)
# number tokens in main
toks=[]
for m in re.finditer(r'(?<![०-९\d])([०-९]{1,3}|[1-9]\d{0,2})(?![०-९\d])',main):
    n=int(m.group(1).translate(DIG)); toks.append((m.start(),m.end(),n))
# greedy increasing chain with lookahead: pick tokens forming longest increasing subsequence with step small
best=[];
# LIS where consecutive diff in 1..4
import bisect
N=len(toks); dp=[1]*N; prv=[-1]*N
for i in range(N):
    for j in range(max(0,i-60),i):
        d=toks[i][2]-toks[j][2]
        if 1<=d<=4 and dp[j]+1>dp[i]: dp[i]=dp[j]+1; prv[i]=j
i=max(range(N),key=lambda k:dp[k]); chain=[]
while i>=0: chain.append(i); i=prv[i]
chain=chain[::-1]
print("tokens",N,"chain",len(chain),"first",toks[chain[0]][2],"last",toks[chain[-1]][2])
segs=[]
for a,b in zip(chain,chain[1:]+[None]):
    s=toks[a][1]; e=toks[b][0] if b is not None else len(main)
    pn=max(p for pos,p in pmap if pos<=toks[a][0])
    segs.append(dict(sk=toks[a][2],page=pn,text=main[s:e].strip()))
json.dump(segs,open('sk_segs.json','w'),ensure_ascii=False,indent=0)
missing=sorted(set(range(1,toks[chain[-1]][2]+1))-{s['sk'] for s in segs})
print("missing SK numbers:",len(missing),missing[:80])
