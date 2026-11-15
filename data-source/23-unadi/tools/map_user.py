import json,re,sys,difflib,collections
sys.path.insert(0,'/home/claude/unadi/tools')
from translit import slp; from deva import deva
B='/home/claude/unadi/book/'
SP=json.load(open(B+'sutra_pages.json'))
S=json.load(open(B+'streams.json')); full=S['full']; fp=S['fpmap']
codes=list(SP)
def nz(s): return re.sub(r'[^a-zA-Z]','',s).replace('M','m')
NS={c:nz(SP[c]['text']) for c in codes}
# page texts in letters
import bisect
ptext=collections.defaultdict(str)
for i,(st,pn) in enumerate(fp):
    en=fp[i+1][0] if i+1<len(fp) else len(full)
    ptext[pn]=nz(slp(full[st:en]))
def best_sutra(t):
    x=nz(slp(t)); sc=[]
    for c in codes:
        sm=difflib.SequenceMatcher(None,x,NS[c],autojunk=False)
        if sm.real_quick_ratio()<0.5: continue
        sc.append((sm.ratio(),c))
    sc.sort(reverse=True); return sc[0] if sc else (0,None)
import numpy as np
def fuzzy_in(word,text):
    """min edit distance of word as substring of text (Sellers)"""
    if not word or not text: return 99
    T=np.frombuffer(text.encode(),dtype=np.uint8); n=len(T); idx=np.arange(n+1)
    prev=np.zeros(n+1,dtype=np.int32)
    for c in word.encode():
        tmp=np.empty(n+1,dtype=np.int32); tmp[0]=prev[0]+1
        tmp[1:]=np.minimum(prev[:-1]+(T!=c),prev[1:]+1)
        prev=np.minimum.accumulate(tmp-idx)+idx
    return int(prev.min())
def stem(w):
    w=w.split('/')[0].strip(); x=nz(slp(w))
    for suf in ('H','m'):  # drop final visarga/m
        if x.endswith(suf) and len(x)>3: x=x[:-1]; break
    return x
def range_text(c,pad=0):
    a,b=SP[c]['pages']; return ''.join(ptext[p] for p in range(max(1,a-pad),min(169,b+pad)+1))
