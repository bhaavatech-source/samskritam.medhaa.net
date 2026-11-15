import re,json,sys
sys.path.insert(0,'.'); from deva import deva
src=open('/home/claude/src/vidyut/vidyut-prakriya/src/krt/unadipatha.rs').read().split('\n')
cur=None; m2={}
for ln in src:
    m=re.match(r'^\s*((?:U::\w+\s*\|?\s*)+)=>',ln)
    if m: cur=re.findall(r'U::(\w+)',m.group(1))
    for c in re.findall(r'UP\("(\d\.\d+)',ln):
        if cur: m2.setdefault(c,[])
        for u in (cur or []):
            if u not in m2[c]: m2[c].append(u)
# devanagari of pratyaya names (SLP1 with markers)
out={c:[deva(u) for u in v] for c,v in m2.items()}
json.dump(out,open('vid_pratyaya.json','w'),ensure_ascii=False)
print(len(out)); print({k:out[k] for k in list(out)[:15]})
