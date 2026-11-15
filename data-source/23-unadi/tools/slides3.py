import json,re,glob,subprocess,os,hashlib,sys
sys.path.insert(0,'/home/claude/unadi/tools')
from map_user import nz,slp,SP,codes
import difflib
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
DIG=str.maketrans('०१२३४५६७८९','0123456789')
NS={c:nz(SP[c]['text']) for c in codes}
def ocr(blob,ext):
    h=hashlib.md5(blob).hexdigest()[:10]; fn=f'/home/claude/unadi/work/pics/{h}.{ext}'
    if not os.path.exists(fn): open(fn,'wb').write(blob)
    return subprocess.run(['tesseract',fn,'-','-l','san','--tessdata-dir','/home/claude/tesseract-ocr/tessdata_best','--psm','6'],capture_output=True,text=True).stdout.strip()
NUM=re.compile(r'^\s*(?:[०-९0-9]+\s*[.)]\s*)?(?:([१-५1-5])\s*\.\s*)?\.?\s*([०-९0-9]{1,3})\s*[.)]?\s+')
PIC=re.compile(r'॥\s*([१-५])\s*[—\-–]+\s*([०-९]{1,3})\s*॥')
def deckpadas(name,n):
    return {37:[2],57:[4,5],38:[3],84:[1]}[n]
def score_line(x,c):
    s=NS[c]
    if not x or not s: return 0
    a=difflib.SequenceMatcher(None,x[:len(s)+3],s,autojunk=False).ratio()
    return a
blocks=[]
for f in sorted(glob.glob('/home/claude/unadi/src/*.pptx')):
    p=Presentation(f); name=os.path.basename(f); pads=deckpadas(name,len(p.slides))
    cand=[c for c in codes if int(c.split('.')[0]) in pads]
    lines=[]  # (slide, text, forced_code)
    for si,s in enumerate(p.slides,1):
        for sh in s.shapes:
            if sh.has_text_frame and sh.text_frame.text.strip():
                for ln in sh.text_frame.text.replace('\x0b','\n').split('\n'): lines.append((si,ln,None))
            elif sh.has_table:
                for r in sh.table.rows: lines.append((si," | ".join(c.text.strip() for c in r.cells),None))
            elif sh.shape_type==MSO_SHAPE_TYPE.PICTURE and len(sh.image.blob)!=22832:
                t=ocr(sh.image.blob,sh.image.ext); m=PIC.search(t)
                if m: lines.append((si,re.sub(r'॥[^॥]*॥','',t).replace('\n',' '),f"{m.group(1).translate(DIG)}.{int(m.group(2).translate(DIG))}"))
                else: lines.append((si,re.sub(r'॥[^॥]*॥','',t).replace('\n',' ').strip(),'PICTXT'))
    last=-1; cur=None; cols=None
    order={c:i for i,c in enumerate(cand)}
    def detect(ln,forced):
        if forced and forced!='PICTXT': return forced,1.0
        m=NUM.match(ln) if forced!='PICTXT' else None
        txt=ln[m.end():] if m else ln
        head=re.split(r'[।,|]|\s{2,}| - | – ',txt)[0]
        x=nz(slp(head))
        if len(x)<3: return None,0
        if m:
            pd=m.group(1).translate(DIG) if m.group(1) else (cur['code'].split('.')[0] if cur else str(pads[0]))
            cl=f"{pd}.{int(m.group(2).translate(DIG))}"
            if cl in NS and (score_line(x,cl)>=0.6 or NS[cl].startswith(x[:6]) or x in NS[cl]): return cl,score_line(x,cl)
        win=[c for c in cand if last-3<=order[c]<=last+12] if last>=0 else cand
        best=max(((score_line(x,c),c) for c in win),default=(0,None))
        thr=0.72 if m else 0.85
        if best[0]>=thr and len(x)<=len(NS[best[1]])*1.8+4: return best[1],best[0]
        return None,0
    for si,ln,forced in lines:
        cells=[c for c in re.split(r'\t{2,}|\t\s*\t|\s{4,}',ln)] if forced is None else [ln]
        found=[]
        if len(cells)>1:
            for k,cell in enumerate(cells):
                c,sc=detect(cell.strip(),None)
                if c: found.append((k,c,sc,cell))
        if len(found)>=2:
            cols=[]
            for k,c,sc,cell in found:
                cur=dict(deck=name,slide=si,code=c,score=round(sc,2),head=cell.strip(),body=''); blocks.append(cur); cols.append(cur)
                if c in order: last=max(last,order[c])
            continue
        code,sc=detect(ln,forced)
        if code and (cur is None or code!=cur['code']):
            cur=dict(deck=name,slide=si,code=code,score=round(sc,2),head=ln.strip(),body=''); blocks.append(cur); cols=None
            if code in order: last=max(last,order[code])
        elif cols and len(cells)>1:
            nonempty=[c for c in cells if c.strip()]
            for k,cell in enumerate(nonempty[:len(cols)]): cols[k]['body']+=cell.strip()+'\n'
            for cell in nonempty[len(cols):]: cols[-1]['body']+=cell.strip()+'\n'
        elif cols:
            cols[0]['body']+=ln+'\n'
        elif cur is not None: cur['body']+=ln+'\n'
json.dump(blocks,open('slides_mapped.json','w'),ensure_ascii=False,indent=0)
import collections
have=collections.Counter(b['code'] for b in blocks)
miss=[c for c in codes if c not in have]
print("blocks",len(blocks),"sutras",len(have),"dups",[c for c,n in have.items() if n>1])
print("missing",len(miss),miss)
