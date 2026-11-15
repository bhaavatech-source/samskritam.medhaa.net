import csv,collections
def lines(p):
    L=collections.OrderedDict()
    for r in csv.DictReader(open(p),delimiter='\t',quoting=csv.QUOTE_NONE):
        if r['level']!='5' or not (r['text'] or '').strip(): continue
        k=(r['block_num'],r['par_num'],r['line_num'])
        L.setdefault(k,[]).append(r)
    out=[]
    for k,ws in L.items():
        hs=sorted(int(w['height']) for w in ws); top=min(int(w['top']) for w in ws)
        bot=max(int(w['top'])+int(w['height']) for w in ws)
        out.append(dict(top=top,h=hs[len(hs)//2],span=bot-top,text=' '.join(w['text'] for w in ws)))
    out.sort(key=lambda x:x['top'])
    # line pitch
    for i,l in enumerate(out):
        l['pitch']=(out[i+1]['top']-l['top']) if i+1<len(out) else None
    return out

def lines2(p):
    L=collections.OrderedDict()
    for r in csv.DictReader(open(p),delimiter='\t',quoting=csv.QUOTE_NONE):
        if r['level']!='5' or not (r['text'] or '').strip(): continue
        L.setdefault((r['block_num'],r['par_num'],r['line_num']),[]).append(r)
    out=[]
    for k,ws in L.items():
        top=min(int(w['top']) for w in ws); l=min(int(w['left']) for w in ws); rgt=max(int(w['left'])+int(w['width']) for w in ws)
        txt=' '.join(w['text'] for w in ws)
        import unicodedata
        base=sum(1 for ch in txt if unicodedata.category(ch) not in ('Mn','Mc') and not ch.isspace())
        out.append(dict(top=top,width=rgt-l,cpx=(rgt-l)/max(base,1),text=txt))
    out.sort(key=lambda x:x['top'])
    for i,x in enumerate(out): x['pitch']=(out[i+1]['top']-x['top']) if i+1<len(out) else None
    return out
