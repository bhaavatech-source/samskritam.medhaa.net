import json
exec(open('/home/claude/dh400/match.py').read().split("n=0")[0])
exec(open('/home/claude/dh400/decisions.py').read())
M={}
for u,(sc,x),amb,b in rows:
    i=u['id']
    if i in UNMATCHED: M[i]=None; continue
    if i in D: c,m,n=D[i]; M[i]={"code":c,"nic":m=="nic","note":n,"how":"hand"}
    elif x is not None and sc>=8 and not amb: M[i]={"code":x['baseindex'],"nic":False,"note":"","how":"auto"}
    else: raise SystemExit("undecided "+i)
json.dump(M,open('/home/claude/dh400/map.json','w'),ensure_ascii=False,indent=0)
keys=sorted({m['code']+('+nic' if m['nic'] else '') for m in M.values() if m})
open('/home/claude/dh400/codes.txt','w').write('\n'.join(keys)+'\n')
print(len(M),sum(1 for m in M.values() if m),len(keys))
