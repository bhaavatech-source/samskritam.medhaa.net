import re,sys,json,numpy as np
sys.path.insert(0,'/home/claude/td'); from translit import slp
S=json.load(open('streams.json')); main=S['full']; pmap=S['fpmap']
# letters-only SLP1 with back-map
xs=[];back=[]
i=0
# transliterate char-by-char chunks: map via slp on whole text then can't back map; do per-line words
for m in re.finditer(r'\S+',main):
    w=slp(m.group())
    w2=re.sub(r'[^a-zA-Z]','',w).replace('M','m')
    for ch in w2: xs.append(ch); back.append(m.start())
T=np.frombuffer(''.join(xs).encode(),dtype=np.uint8); n=len(T); idx=np.arange(n+1)
print("letters",n)
std=[l.split('\t') for l in open('/home/claude/src/vidyut/vidyut-prakriya/data/unadipatha.tsv').read().splitlines()[1:]]
def search(p,k=4):
    P=np.frombuffer(p.encode(),dtype=np.uint8)
    prev=np.zeros(n+1,dtype=np.int32)
    for c in P:
        tmp=np.empty(n+1,dtype=np.int32); tmp[0]=prev[0]+1
        tmp[1:]=np.minimum(prev[:-1]+(T!=c),prev[1:]+1)
        prev=np.minimum.accumulate(tmp-idx)+idx
    # top-k local minima ends
    order=np.argsort(prev,kind='stable'); out=[]
    for e in order:
        if all(abs(e-o)>len(p) for _,o in out): out.append((int(prev[e]),int(e)))
        if len(out)>=k: break
    return out
res=[]
for code,t in std:
    p=re.sub(r'[^a-zA-Z]','',t).replace('M','m')
    res.append(dict(code=code,p=p,c=search(p,6)))
json.dump(res,open('align_full.json','w'))
