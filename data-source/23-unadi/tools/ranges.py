import json,re,sys,bisect
sys.path.insert(0,'/home/claude/td'); from translit import slp
S=json.load(open('streams.json')); full=S['full']; fp=S['fpmap']
std=[l.split('\t') for l in open('/home/claude/src/vidyut/vidyut-prakriya/data/unadipatha.tsv').read().splitlines()[1:]]
codes=[c for c,_ in std]
pick=json.load(open('pick_full.json'))
# letter index -> char pos: rebuild back map
back=[]
for m in re.finditer(r'\S+',full):
    w2=re.sub(r'[^a-zA-Z]','',slp(m.group())).replace('M','m'); back+= [m.start()]*len(w2)
pos={}
for c in codes:
    if c in pick: pos[c]=back[min(pick[c][0],len(back)-1)]
# interpolate
known=[(i,pos[c]) for i,c in enumerate(codes) if c in pos]
for i,c in enumerate(codes):
    if c in pos: continue
    a=max((k for k in known if k[0]<i),default=(0,0)); b=min((k for k in known if k[0]>i),default=(len(codes),len(full)))
    pos[c]=a[1]+(b[1]-a[1])*(i-a[0])//(b[0]-a[0])
pstarts=[p for p,_ in fp]
def page(ch): return fp[bisect.bisect_right(pstarts,ch)-1][1]
out={}
for i,c in enumerate(codes):
    p0=page(pos[c]); p1=page(pos[codes[i+1]]) if i+1<len(codes) else 169
    out[c]=dict(text=dict(std)[c],deva=None,found=c in pick,score=round(pick[c][1],2) if c in pick else None,pages=[p0,max(p0,p1)+1 if p1<169 else 169],charpos=pos[c])
json.dump(out,open('sutra_pages.json','w'),ensure_ascii=False)
print(out['1.1'],out['3.100'],out['5.70'])
