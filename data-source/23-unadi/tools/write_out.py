import json,re,collections,copy
D=json.load(open('built.json')); SP=json.load(open('/home/claude/unadi/book/sutra_pages.json'))
DIG=str.maketrans('०१२३४५६७८९','0123456789'); DEV=str.maketrans('0123456789','०१२३४५६७८९')
OUT='/home/claude/unadi/out/'; DATE='2026-11-15'
NAMES={1:'प्रथमः',2:'द्वितीयः',3:'तृतीयः',4:'चतुर्थः',5:'पञ्चमः'}
EN={1:'Prathamaḥ',2:'Dvitīyaḥ',3:'Tṛtīyaḥ',4:'Caturthaḥ',5:'Pañcamaḥ'}
TF=D['textfix']
from translit import iast
MEAN={}
for ln in list(open('/home/claude/unadi/mean/meanings_2026-11-15.tsv',encoding='utf-8'))[1:]:
    p=ln.rstrip('\n').split('\t'); MEAN[(p[0],p[1])]=p
GEN={'पुं':'पुंलिङ्गम्','स्त्री':'स्त्रीलिङ्गम्','नपुं':'नपुंसकलिङ्गम्','अव्य':'अव्ययम्'}
for p_,rs_ in D['padas'].items():
    for r in rs_:
        keep=[]
        for x in r['rupas']:
            m=MEAN.get((r['sutra_number'],x['word']))
            if m and not x.get('meanings'):
                if m[2]=='d': continue
                x['word']=m[3]; x['iast']=iast(m[3]); x['gender']=GEN.get(m[4],m[4])
                x['meanings']={'sa':m[5],'en':m[6],'hi':m[7],'te':m[8]}
            keep.append(x)
        # drop exact duplicates created by renaming
        seen=set(); r['rupas']=[x for x in keep if not (x['word'] in seen or seen.add(x['word']))]
        r['rupas_count']=len(r['rupas'])

# words filed under a neighbouring sūtra: the destination sūtra names the root (checked against the derivations and the sūtra texts)
MOVES={('१.४२','मसुरः'):'१.४३',('१.४६','मांसम्'):'३.६४',('१.४८','अव्यथिषः'):'१.४९',('१.४८','चन्दिरः'):'१.५१',('१.४७','ताविषः'):'१.४८',
 ('१.४९','किल्बिषम्'):'१.५०',('१.६७','सिन्दूरम्'):'१.६८',('१.८३','मर्जूः'):'१.८२',('१.७२','केतुः'):'१.७३',('१.१३०','सरट्'):'१.१३१',
 ('१.१३२','पारक्'):'१.१३३',('१.१३२','पारग्'):'१.१३३',('१.१५६','अष्टन्'):'१.१५५',('२.९','तीर्थम्'):'२.७',('३.८३','वातः'):'३.८६',('४.१५९','स्तोत्रम्'):'४.१५८'}
for w in ['तन्तुः','सेतुः','गन्तुः','मस्तु','सक्तुः','ओतुः','धातुः','क्रोष्टा']: MOVES[('१.६८',w)]='१.६९'
for w in ['खण्डः','अण्डः','चण्डः','पण्डा']: MOVES[('१.११०',w)]='१.१११'
for w in ['यक्षः','अर्मः','स्तोमः','सोमः','होमः','धर्मः','क्षेमः','भामः','यामः','वामः','पद्मम्','नेमः','दस्मः']: MOVES[('१.१३६',w)]='१.१३७'
for w in ['श्वा','उक्षा','पूषा','प्लीहा','क्लेदा','स्नेहा']: MOVES[('१.१५६',w)]='१.१५७'
BYN={r['sutra_number']:r for rs_ in D['padas'].values() for r in rs_}
moved_log=[]
for (frm,w),to in MOVES.items():
    src=BYN[frm]; hit=[x for x in src['rupas'] if x['word']==w]
    if not hit: continue
    src['rupas']=[x for x in src['rupas'] if x['word']!=w]
    if not any(y['word']==w for y in BYN[to]['rupas']): BYN[to]['rupas'].append(hit[0])
    moved_log.append(dict(word=w,was=frm,now=to))
json.dump(moved_log,open('/home/claude/unadi/out/tools/moves_2026-11-15.json','w'),ensure_ascii=False,indent=1)
# prakriyā written for words that had none (op: k keep, x remove with reason, r:<new word> rename, m:<sūtra> move)
removed_after_check=[]
PW={}
for ln in list(open('/home/claude/unadi/out/tools/prakriya_written_2026-11-15.tsv',encoding='utf-8'))[1:]:
    q=ln.rstrip('\n').split('\t'); PW[(q[0],q[1])]=(q[2],q[3])
for (sn,w),(op,txt) in PW.items():
    r=BYN.get(sn)
    if not r: continue
    hit=[x for x in r['rupas'] if x['word']==w]
    if not hit: continue
    x=hit[0]
    if op=='x':
        r['rupas']=[y for y in r['rupas'] if y is not x]; removed_after_check.append(dict(sutra=sn,word=w,reason=txt)); continue
    x['prakriya']=txt
    if op.startswith('r:'): x['word']=op[2:]; x['iast']=iast(op[2:])
    if op.startswith('m:'):
        r['rupas']=[y for y in r['rupas'] if y is not x]; BYN[op[2:]]['rupas'].append(x)
json.dump(removed_after_check,open('/home/claude/unadi/out/tools/removed_after_check_2026-11-15.json','w'),ensure_ascii=False,indent=1)
for rs_ in D['padas'].values():
    for r in rs_: r['rupas_count']=len(r['rupas'])

for p in range(1,6):
    rs=copy.deepcopy(D['padas'][str(p)]); audit=[]
    for r in rs:
        c=r['sutra_number'].translate(DIG)
        a=dict(sutra=r['sutra_number'],book_pages=SP[c]['pages'],
               rupa_evidence={x['word']:x['check'] for x in r['rupas']})
        if c in TF: a['text_corrected']=TF[c][1]
        audit.append(a)
        for x in r['rupas']: x.pop('check',None)
    n_r=sum(len(r['rupas']) for r in rs)
    doc=dict(project='Medhā Sanskrit Knowledge Base',
             title=f'उणादिसूत्राणि — {NAMES[p]} पादः · Uṇādi-sūtrāṇi — {EN[p]} Pādaḥ',
             pada=p,total_sutras=len(rs),total_rupas=n_r,
             abbreviations={'वि.सु.का.कृ.':'तादृशप्रकृतिप्रत्यय-विशिष्टात् सुबादिषु कार्येषु कृतेषु (इन्दुः इत्यादि रूपं सिद्ध्यति)'},
             sutras=rs,
             _audit=dict(note='Internal audit only; not for display.',
                 sources={'sutra_text_and_numbering':'Pañcapādī Uṇādi-sūtras in the pāda-wise numbering; checked against the Siddhānta Kaumudī Uṇādi section (Bālamanoramā–Tattvabodhinī edition, uploaded PDF, 169 pp.)',
                          'prakriya':"Teacher's slide notes (four .pptx decks)",
                          'meanings':'Earlier JSON where the word was confirmed; other forms await meanings'},
                 evidence_key={'slide':'form occurs in the slide notes for this sūtra','book':'form occurs in the book pages for this sūtra','slide+book':'both','record':'only in the earlier JSON record for this sūtra; to confirm'},
                 per_sutra=audit))
    json.dump(doc,open(OUT+f'unadi_pada{p}_{DATE}.json','w'),ensure_ascii=False,indent=1)
    print(p,len(rs),n_r)
