from map_user import *
from deva import deva
R=json.load(open('/home/claude/unadi/book/align_full.json')); pick=json.load(open('/home/claude/unadi/book/pick_full.json'))
f=S['full']
L=''.join(re.sub(r'[^a-zA-Z]','',slp(m.group())).replace('M','m') for m in re.finditer(r'\S+',f))
B=json.load(open('slides_mapped.json')); head={}
for b in B:
    h=re.sub(r'^\s*(?:[०-९0-9]+\s*[.)]\s*)?(?:[१-५1-5]\s*\.\s*)?\.?[०-९0-9]{1,3}\s*[.)]?\s*','',b['head'])
    h=re.split(r'[।|]| - | – |\s{3,}|\t',h)[0]
    head.setdefault(b['code'],h.strip())
def sim(a,b): return difflib.SequenceMatcher(None,a,b,autojunk=False).ratio()
out=[]
for r in R:
    c=r['code']
    if c not in pick or c not in head: continue
    e=pick[c][0]; s=nz(SP[c]['text']); h=nz(slp(head[c]))
    if not h or h==s: continue
    win=L[max(0,e-len(s)-4):e+4]
    # best alignment of s and h inside window
    def bs(x):
        return max(sim(x,win[i:i+len(x)]) for i in range(0,max(1,len(win)-len(x)+1)))
    a,b=bs(s),bs(h)
    if b>a+0.03 and sim(h,s)>0.6: out.append((c,deva(SP[c]['text']),head[c],round(a,2),round(b,2)))
for o in out: print(o)
