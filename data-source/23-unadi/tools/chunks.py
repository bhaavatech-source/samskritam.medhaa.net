import json,re
DIG=str.maketrans('०१२३४५६७८९','0123456789')
def clauses(t):
    t=re.sub(r'[ \t]+',' ',t)
    return [c.strip(' ,') for c in re.split(r'[।\n]|(?<=[ःम्ु])\s*,\s*(?=[^\s])',t) if c.strip(' ,')]
def chunk_for(word, prak, others):
    w0=word.split('/')[0].strip()
    cl=[c for c in re.split(r'[।\n]', re.sub(r'[ \t]+',' ',prak)) if c.strip()]
    # prefer a clause that ends a derivation with the word (after वि सु का कृ / इति रूपम् / a comma chain)
    hits=[i for i,c in enumerate(cl) if re.search(r'(^|[\s,])'+re.escape(w0)+r'($|[\s,।.])',c)]
    if not hits: return ''
    def is_deriv(c): return bool(re.search(r'वि\s*\.?\s*सु|इति\s+(रूपम्|सिद्ध्यति|सिद्धम्)|,|गुणे|वृद्धौ|आदेशे|लोपे|आगमे|त्वे\b|त्वात्',c))
    best=None
    for i in hits:
        if is_deriv(cl[i]): best=i; break
    if best is None: best=hits[0]
    out=[cl[best].strip()]
    j=best-1
    # walk back over derivation lines that do not name another word
    while j>=0 and len(out)<4:
        c=cl[j].strip()
        if any(re.search(r'(^|[\s,])'+re.escape(o)+r'($|[\s,])',c) for o in others if o!=w0): break
        if not is_deriv(c) and not re.search(r'[क-ह]्?\s+[अ-औ]',c): break
        out.insert(0,c); j-=1
    s=' । '.join(out)
    s=re.sub(r'^\s*(?:[०-९0-9]+\s*\.\s*)?[०-९0-9]\s*\.\s*[०-९0-9]+\s*[^-–।]*[-–]\s*','',s)   # leading 'N.N sūtra -'
    if not re.search(r'वि\s*\.?\s*सु|इति\s+(रूपम्|सिद्ध्यति|सिद्धम्)|[क-ह]्\s+[अ-औ]|गुणे|वृद्धौ|आदेशे|लोपे|आगमे|त्वे|निपातन',s): return ''
    return s if len(s)>=6 else ''
