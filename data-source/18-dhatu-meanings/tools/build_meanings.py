"""Build data-source/18-dhatu-meanings from the drafts (draft_foreign_*.tsv), checked against Open Multilingual Wordnet (check.py)."""
import json,csv,sys,collections,os
sys.path.insert(0,'/home/claude/dh400'); from en_verbs import BASE
R=json.load(open('/home/claude/mean/foreign_checked.json'))
A={x['baseindex']:x for x in json.load(open('/home/claude/gh/ashdata/dhatu/data.txt',encoding='utf-8'))['data']}
U=json.load(open('/mnt/user-data/uploads/730f9fce-marked_dhatus_recitation.json',encoding='utf-8'))
M=json.load(open('/home/claude/dh400/map.json'))
ids=collections.defaultdict(list); given=collections.defaultdict(lambda:{'en':[],'te':[],'hi':[]})
for u in U:
    m=M[u['id']]
    if not m: continue
    k=m['code']+('+nic' if m['nic'] else ''); ids[k].append(u['id'])
    for l in ('en','te','hi'):
        v=u['meanings'].get(l)
        if v and v not in given[k][l]: given[k][l].append(v)
L=['de','fr','es','ru','ar','zh','ja','ko']
P=json.load(open('/home/claude/mean/iwn_picks.json'))
DR={}
for line in open('/home/claude/mean/draft_indic.tsv',encoding='utf-8'):
    p_=line.rstrip('\n').split('\t')
    if p_[0]!='code': DR[p_[0]]=dict(zip(['ta','kn','ml','mr','bn','or'],p_[1:]))
def clean(x): return x.replace('_',' ').strip().rstrip('.')
MISS=collections.Counter()
DR_CELL={('01.0003','or'):'ପ୍ରତିଯୋଗିତା କରିବା',('01.0024','or'):'ଖେଳିବା',('01.0070','mr'):'आनंदित होणे',('05.0023','mr'):'धार लावणे',
 ('08.0001','ta'):'நீட்டு',('08.0001','mr'):'ताणणे',('08.0001','bn'):'প্রসারিত করা',('08.0001','or'):'ବିସ୍ତାର କରିବା',('10.0199','ta'):'ஆலோசி',('10.0251','or'):'ଘୋଷଣା କରିବା'}
def indic(c,l):
    if c in DR: return {"text":DR[c][l],"status":"draft"}
    v=P[c]; ws=[clean(x) for x in v[l]]
    if not ws and (c,l) in DR_CELL: return {"text":DR_CELL[(c,l)],"status":"draft"}
    if not ws: MISS[(c,l)]+=1; return {"text":None,"status":"missing (IndoWordNet has no word for this sense)"}
    strong=v['how'].startswith('IndoWordNet — matched')
    r={"text":ws[0],"status":"sourced" if strong else "check","source":v['how']}
    if len(ws)>1: r["synonyms"]=ws[1:4]
    return r
sys.path.insert(0,'/home/claude/mean'); from indic_fixes import ROW, CELL_ANY
def fix(c,l,r):
    if c in ROW:
        return {"text":ROW[c][l],"status":"draft","note":"IndoWordNet's link gave another sense"+(f" ({r['text']})" if r.get('text') else "")+"; replaced by Claude"}
    t=r.get('text')
    v=CELL_ANY.get(f"{t}@{c}") or CELL_ANY.get(t)
    if t and v:
        return {"text":v,"status":"draft","note":f"IndoWordNet gives {t}; corrected form"}
    return r
out={}
for c in open('/home/claude/dh400/codes.txt').read().split():
    a=A[c.split('+')[0]]; nic='+' in c
    out[c]={"entries":ids[c],"lemma":a['dhatu']+(' (णिजन्तः)' if nic else ''),"dhatupatha_artha":a['artha'],"sense_en":"to "+BASE[c],
            "meanings":{
              "en":{"text":"; ".join(given[c]['en']),"status":"given (your list)"},
              "te":{"text":" / ".join(given[c]['te']),"status":"given (your list)"},
              "hi":{"text":" / ".join(given[c]['hi']),"status":"given (your list)",**({"ashtadhyayi_com":a.get('artha_hindi')} if a.get('artha_hindi') and not nic else {})},
              **{l:{"text":R[c][l]['draft'],"status":R[c][l]['status'],**({"wordnet_candidates":R[c][l]['wordnet_candidates']} if R[c][l]['status']=='draft' and R[c][l]['wordnet_candidates'] else {})} for l in L},
              **{l:fix(c,l,indic(c,l)) for l in ['ta','kn','ml','mr','bn','or']}}}
    for l in ('hi','te'):
        w=[clean(x) for x in P[c][l]] if P[c]['how'] and '+nic' not in c else []
        if w: out[c]['meanings'][l]['indowordnet']=w[:4]
D='/home/claude/smg/data-source/18-dhatu-meanings/'; os.makedirs(D+'review',exist_ok=True)
json.dump(out,open(D+'dhatu_400_meanings.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
NAME={'ta':'Tamil','kn':'Kannada','ml':'Malayalam','mr':'Marathi','bn':'Bengali','or':'Odia','de':'German','fr':'French','es':'Spanish','ru':'Russian','ar':'Arabic','zh':'Chinese','ja':'Japanese','ko':'Korean'}
for l in L+['ta','kn','ml','mr','bn','or']:
    with open(D+f'review/review_{l}_{NAME[l]}.csv','w',newline='',encoding='utf-8-sig') as f:
        w=csv.writer(f); w.writerow(['code','dhātu','Dhātupāṭha artha','English sense',f'{NAME[l]} (proposed)','status','wordnet suggestions','✓ correct? (yes/no)','correction','reviewer note'])
        for c,v in out.items():
            m=v['meanings'][l]; w.writerow([c,v['lemma'],v['dhatupatha_artha'],v['sense_en'],m['text'],m['status'],', '.join(m.get('wordnet_candidates',m.get('synonyms',[]))),'','',''])
st=collections.Counter((l,v['meanings'][l]['status']) for v in out.values() for l in L+['ta','kn','ml','mr','bn','or'])
LL=L+['ta','kn','ml','mr','bn','or']
print({l:(st[(l,'sourced')],st[(l,'check')],st[(l,'draft')]) for l in LL}); print('missing',MISS)
