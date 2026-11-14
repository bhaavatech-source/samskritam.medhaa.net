import csv,sys,json,re,collections
csv.field_size_limit(10**9)
sys.path.insert(0,'/home/claude/tools/dhatu'); sys.path.insert(0,'/home/claude/mean'); sys.path.insert(0,'/home/claude/dh400')
from slp import deva
from wn import SYN
def gk(g): return re.split(r'[;"]',g.strip().strip('"'))[0].strip().lower()
G={}
for o,(ws,g) in SYN.items(): G.setdefault((ws[0].lower(),gk(g)),o); G.setdefault(('*',gk(g)),o)
LANG={'ta':'tamil','kn':'kannada','ml':'malayalam','mr':'marathi','bn':'bengali','or':'oriya','te':'telugu','sa':'sanskrit','hi':None}
D='/home/claude/gh/iwnen/data/'
syn={l:{} for l in LANG}; eng={}; cat={}
def words(s):
    s=s.strip().strip('"').strip()
    return [w.strip().strip('"') for w in re.split(r'\s*,\s*',s) if w.strip().strip('"')]
for l,name in LANG.items():
    f=D+(f'english-hindi-{name}-linked.tsv' if name else 'english-hindi-linked.tsv')
    r=csv.reader(open(f,encoding='utf-8'),delimiter='\t')
    h=next(r)
    for p in r:
        if len(p)<len(h): continue
        d=dict(zip(h,p)); i=d.get('iwn_id') or d.get('hindi_id')
        c=d.get('iwn_category') or d.get('hindi_category_x'); cat[i]=c
        if c!='VERB': continue
        ew=d.get('english_synset_words','').split(',')[0].strip().lower(); g=gk(d.get('english_gloss',''))
        o=G.get((ew,g)) or G.get(('*',g))
        if o: eng.setdefault(i,set()).add(o)
        col=f'{name}_synset' if name else 'hindi_synset'
        syn[l][i]=words(d[col])
print({l:len(v) for l,v in syn.items()}, len(eng))
import pickle; pickle.dump((syn,eng),open('/home/claude/mean/iwn.pkl','wb'))
