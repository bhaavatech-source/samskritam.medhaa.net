import re,collections
W='/home/claude/gh/nd/packages/corpora/wordnet/'
IDX={}
for l in open(W+'index.verb'):
    if l.startswith(' '): continue
    p=l.split(); lem=p[0]; n=int(p[2]); np_=int(p[3]); offs=p[4+np_+2:]
    IDX[lem]=offs
SYN={}
for l in open(W+'data.verb',encoding='latin-1'):
    if l.startswith(' '): continue
    off=l[:8]; head,_,gloss=l.partition('| ')
    p=head.split(); wc=int(p[3],16); words=[p[4+2*i] for i in range(wc)]
    SYN[off]=(words,gloss.strip())
def cands(phrase):
    k=phrase.replace(' ','_')
    if k in IDX: return k,IDX[k]
    h=phrase.split()[0]
    if h=='be' and len(phrase.split())>1: return None,[]
    return (h,IDX.get(h,[]))
