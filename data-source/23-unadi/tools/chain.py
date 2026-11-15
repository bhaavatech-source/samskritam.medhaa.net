import json
R=json.load(open('align_full.json'))
# DP over sutras: state = chosen end position; allow skip
items=[]
for i,r in enumerate(R):
    L=len(r['p']); cs=[(e,1-d/L) for d,e in r['c'] if 1-d/L>=0.55]
    items.append(cs)
# DP: best[i][cand] = max total score with last pos; use list of (pos,score,back)
import bisect
states=[(-1,0.0,None)]  # (pos,total,chainref)
for i,cs in enumerate(items):
    new=list(states)
    for e,s in cs:
        # best state with pos<e
        bestp=max((st for st in states if st[0]<e),key=lambda st:st[1],default=None)
        if bestp: new.append((e,bestp[1]+s,(i,e,s,bestp[2])))
    # prune: keep pareto (pos increasing, total increasing)
    new.sort(key=lambda x:(x[0],-x[1])); pr=[];bt=-1
    for st in new:
        if st[1]>bt: pr.append(st); bt=st[1]
    states=pr
best=max(states,key=lambda s:s[1]); ch=best[2]; pick={}
while ch: i,e,s,ch=ch; pick[i]=(e,s)
print("matched",len(pick),"of",len(R))
import collections
by=collections.Counter(R[i]['code'].split('.')[0] for i in pick); print(by)
json.dump({R[i]['code']:pick[i] for i in pick},open('pick_full.json','w'))
lo=[(R[i]['code'],round(pick[i][1],2)) for i in pick if pick[i][1]<0.7]; print(len(lo),lo[:20])
