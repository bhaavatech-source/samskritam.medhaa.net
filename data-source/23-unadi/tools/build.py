from map_user import *
from translit import iast
from book_p1 import BOOK_RUPAS
VP=json.load(open('/home/claude/unadi/tools/vid_pratyaya.json'))
DIG=str.maketrans('०१२३४५६७८९','0123456789'); DEV=str.maketrans('0123456789','०१२३४५६७८९')
TEXT_FIX={
 '1.27':('अर्जिदृशिकम्यमिपंसिबाधामृजिपशितुक्धुक्दीर्घहकाराश्च','roots अर्जि, दृशि, कमि, अमि, पंसि, बाधृ; substitutes ऋजि, पशि, तुक्, धुक्, दीर्घ, हकार (ऋजुः, पशुः, कन्तुः, अन्धुः, पांसुः, बाहुः)'),
 '2.2':('हनिकुषिनीरमिकाशिभ्यः क्थन्','नीरमि (नी, रम्) and क्थन्: हथः, कुष्ठम्, नीथः, रथः, काष्ठम्'),
 '3.10':('कॄवृजॄसिद्रुपन्यनिस्वपिभ्यो नित्','वृ, not वॄ (वर्णः)'),
 '3.68':('उन्दिगुधिकुषिभ्यश्च','गुधि, not गुथि'),
 '3.83':('आणको लूधूशिङ्घिधाञ्भ्यः','लू, धू, शिङ्घि (लवाणकः, धवाणकः, शिङ्घाणकः)'),
 '3.91':('जेर्मूट् चोदात्तः','मूट् (जीमूतः)'),
 '4.20':('फर्फरीकादयश्च','फर्फरीक (फर्फरीकम्)'),
 '4.34':('घसेः किच्च','किच्च, not किश्च'),
 '4.183':('दृणातेर्ह्रस्वश्च','the vārttika तितुत्रेष्वग्रहादीनामितीट् belongs to the commentary of 4.182, not to this sūtra'),
 '4.215':('अञ्च्यञ्जियुजिभृजिभ्यः कुश्च','कुश्च (कुः च), not कुञ्च'),
 '5.16':('स्रंसेः शिः कुट् किच्च','किच्च, not किश्च'),
}
def num(c): p,n=c.split('.'); return (int(p),int(n))
def dist(a,b):
    try: pa,pb=num(a),num(b)
    except: return 9999
    return abs((pa[0]-pb[0])*300+pa[1]-pb[1])
order={c:i for i,c in enumerate(codes)}
B=json.load(open('slides_mapped.json'))
blocks=collections.defaultdict(list)
for b in B: blocks[b['code']].append(b)
SHARED={'1.51':'1.49','1.83':'1.82','1.85':'1.84','1.131':'1.130'}
def slide_text(c): return ' '.join(b['head']+' '+b['body'] for b in blocks.get(c,[])+blocks.get(SHARED.get(c,''),[]))
def toks(s): return {nz(slp(t)) for t in re.split(r'[\s,।|;:()\-–/]+',s) if t}
STOK={c:toks(slide_text(c)) for c in codes}
SLT={c:nz(slp(slide_text(c))) for c in codes}
STEMS={c:{(t[:-1] if t[-1:] in ('H','m') and len(t)>3 else t) for t in STOK[c]} for c in codes}
def book_has(x,c,pad=1):
    if len(x)<4: return False
    t=range_text(c,pad)
    if x in t: return True
    return len(x)>=6 and fuzzy_in(x,t)<=1
def slide_has(x,c):
    if not x: return False
    return x in {t[:len(x)] for t in STOK[c]} or (len(x)>=4 and x in SLT[c])
# ---------- forms from slides
FORM=[re.compile(r'वि\s*\.?\s*सु\s*\.?\s*का\s*\.?\s*कृ\.?\s*([^\s,।|;]+)'),
      re.compile(r'([^\s,।|;]+)\s+इति\s+(?:च\s+)?(?:रूपम्|रूपं|सिद्ध्यति|सिद्धम्|सिध्यति|रूपद्वयम्)')]
BAD=re.compile(r'(े|ौ|ायाम्|त्वे|त्वात्|ेन)$')
def junk(w):
    if len(nz(slp(w)))<3 or w in ('सं','सम्'): return True
    if re.search(r'[क-ह]$',w): return True            # bare stem ending in inherent a (हरित, गृत्स)
    if re.search(r'[िु]र्[क-ह][\u093e-\u094c]?[क-ह]',w) and w.endswith('ः') and len(w)>7: return True   # form+gloss joined by sandhi
    return False
def slide_forms(c):
    out=[]
    for b in blocks.get(c,[]):
        t=b['head']+'\n'+b['body']
        for rx in FORM:
            for m in rx.finditer(t):
                w=m.group(1).strip(' .\'"‘’')
                if len(w)>=2 and not junk(w) and not BAD.search(w) and re.match(r'^[ऀ-ॿ]+$',w) and w not in ('इति','रूपम्'):
                    if w not in out: out.append(w)
    return out

STOP=set("प्रत्ययः रूपम् रूपं इति च एवम् एवं गुणः वृद्धिः लोपः आदेशः इत्यर्थः भवति स्यात् निपात्यते निपात्यन्ते सूत्रम् अर्थः धातुः धातोः अन्तोदात्तः आद्युदात्तः स्वरः पक्षी".split())
END=re.compile(r'(ः|म्|ं|ा|ी|ू|ु)$')
def slide_forms2(c):
    out=[]
    for b in blocks.get(c,[]):
        t=b['head']+'\n'+b['body']
        for seg in re.split(r'[।\n]',t):
            for cl in re.split(r',',seg):
                tk=[w.strip(' .\'"‘’()') for w in cl.split() if re.match(r'^[\u0900-\u097F]+$',w.strip(' .\'"‘’()'))]
                if not tk: continue
                cands=[]
                if len(tk)==1: cands.append((tk[0],True))
                elif len(tk)==2 and '।' in t: cands.append((tk[0],True))
                if len(tk)>=2 and re.search(r'(े|ौ)$',tk[-2]): cands.append((tk[-1],False))
                for w,needbook in cands:
                    if w in STOP or not END.search(w) or len(nz(slp(w)))<4 or re.search(r'(ेः|ोः|ायाः|स्य|ात्|भ्यः|भ्याम्|नाम्)$',w) or nz(slp(w)) in NS[c]: continue
                    if w in out or junk(w): continue
                    k=nz(slp(w))
                    if needbook and not book_has(k[:-1] if k[-1:] in ('H','m') else k,c): continue
                    out.append(w)
    return out
# ---------- user records
U='/home/claude/unadi/src/'
recs=[]
for p in range(1,6):
    for r in json.load(open(U+f'unadi_pada{p}_complete.json'))['sutras']: recs.append(r)
def best_near(t,claimed):
    x=nz(slp(t))
    if len(x)<3: return (0,None)
    sc=[]
    for c in codes:
        sm=difflib.SequenceMatcher(None,x,NS[c],autojunk=False)
        if sm.real_quick_ratio()<0.5 or sm.quick_ratio()<0.5: continue
        sc.append((sm.ratio(),c))
    if not sc: return (0,None)
    top=max(s for s,_ in sc); near=[z for z in sc if z[0]>=top-0.02]
    near.sort(key=lambda z:(-round(z[0],2),dist(z[1],claimed))); return near[0]
assigned=collections.defaultdict(list); removed=[]; renum=[]; pratyaya={}
for r in recs:
    claimed=r['sutra_number'].translate(DIG)
    sc,rc=best_near(r['sutra_text'],claimed); rc_ok=sc>=0.8
    if rc_ok:
        pratyaya.setdefault(rc,r.get('pratyaya'))
        if rc!=claimed: renum.append(dict(record=r['sutra_id'],was=r['sutra_number'],sutra_text=r['sutra_text'],now=rc.translate(DEV)))
    ref=rc if rc_ok else claimed
    for w in r.get('rupas',[]):
        x=stem(w['word'])
        near=sorted([c for c in codes if dist(c,ref)<=40],key=lambda c:dist(c,ref))
        code=None; ev=None
        bk=[c for c,lst in BOOK_RUPAS.items() if any(stem(f)==x for f,_ in lst)]
        exact=bk or [c for c in codes if x and len(x)>=3 and x in STEMS[c]]
        if exact: code,ev=min(exact,key=lambda c:dist(c,ref)),('book' if bk else 'slide')
        if not code:
            for c in near:
                if slide_has(x,c): code,ev=c,'slide'; break
        if not code:
            full=nz(slp(w['word'].split('/')[0].strip()))
            for c in near:
                t=range_text(c,0)
                if len(full)>=5 and (full in t or (len(full)>=7 and fuzzy_in(full,t)<=1)): code,ev=c,'book'; break
        if not code and rc_ok and sc>=0.9:
            code,ev=rc,'record'
        if code:
            assigned[code].append((w,ev,r['sutra_id']))
        else:
            removed.append(dict(record=r['sutra_id'],record_number=r['sutra_number'],record_text=r['sutra_text'],word=w['word'],
                reason='not in the slide notes or the book near this sūtra'))
# ---------- assemble
SK={c:i+1 for i,c in enumerate(codes)}
padas=collections.defaultdict(list); stats=collections.Counter()
for c in codes:
    p,n=num(c)
    text=TEXT_FIX[c][0] if c in TEXT_FIX else __import__('deva').deva(SP[c]['text'])
    rupas=[]; seen=set()
    for w,ev,src in assigned.get(c,[]):
        k=stem(w['word'])
        if k in seen: continue
        seen.add(k); r=dict(w); r['check']=ev; rupas.append(r); stats['rupa_user']+=1
    for f,dh in BOOK_RUPAS.get(c,[]):
        k=stem(f)
        if k in seen:
            for r in rupas:
                if stem(r['word'])==k: r['check']=r['check']+'+book' if 'book' not in r['check'] else r['check']
            continue
        seen.add(k); rupas.append(dict(word=f,iast=iast(f),dhatu=dh,gender='',meanings={},notes='',check='book')); stats['rupa_book']+=1
    sf=slide_forms(c)
    sf=[f for f in sf if not any(g!=f and g.startswith(f) for g in sf)]
    for f in sf:
        k=stem(f)
        if k in seen: continue
        seen.add(k)
        rupas.append(dict(word=f,iast=iast(f),dhatu='',gender='',meanings={},notes='',check='slide'+('+book' if book_has(k,c) else ''))); stats['rupa_slide']+=1
    if not rupas:
        for f in slide_forms2(c):
            k=stem(f)
            if k in seen: continue
            seen.add(k); rupas.append(dict(word=f,iast=iast(f),dhatu='',gender='',meanings={},notes='',check='slide'+('+book' if book_has(k,c) else ''))); stats['rupa_slide2']+=1
    prak=[]
    for b in blocks.get(c,[]):
        body=re.sub(r'[ \t]+',' ',b['body']).strip(); body=re.sub(r'\n{2,}','\n',body)
        prak.append((b['head'].strip()+('\n'+body if body else '')).strip())
    pr=pratyaya.get(c) or ''
    vp=[v.rstrip('_') for v in VP.get(c,[])]
    if pr:
        pk=nz(slp(re.split(r'[\s(]',pr.strip())[0]))
        prk=nz(slp(' '.join(b['head']+' '+b['body'] for b in blocks.get(c,[]))))
        if not pk or not (pk in NS[c] or pk in prk or pk[:-1] in NS[c] and len(pk)>2): pr=''
    if vp: pr=' / '.join(dict.fromkeys(vp))+' ('+' / '.join(dict.fromkeys(iast(v) for v in vp))+')'
    rec=dict(sutra_id=f"UN-{p}.{n:03d}",pada=p,sutra_number=f"{p}.{n}".translate(DEV),
             sutra_text=text,sutra_iast=iast(text),pratyaya=pr,
             prakriya='\n'.join(prak) if prak else '', prakriya_shared_with=SHARED.get(c,'') and SHARED[c].translate(DEV),
             rupas_count=len(rupas),rupas=rupas)
    if not rec['prakriya_shared_with']: del rec['prakriya_shared_with']
    padas[p].append(rec)
    if not rupas: stats['no_rupa']+=1
    if not prak: stats['no_prakriya']+=1
json.dump(dict(padas=padas,removed=removed,renum=renum,stats=stats,textfix=TEXT_FIX),open('built.json','w'),ensure_ascii=False)
print(stats, 'removed',len(removed),'renumbered records',len(renum))
