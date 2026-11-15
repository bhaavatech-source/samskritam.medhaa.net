import json,collections,sys
sys.path.insert(0,'/home/claude/unadi/tools'); from translit import slp
DIG=str.maketrans('०१२३४५६७८९','0123456789')
J=json.loads
D=collections.defaultdict(list)
for l in open('/home/claude/unadi/vid/detail_out.tsv'):
    f=l.rstrip('\n').split('\t')
    if len(f)<7: continue
    code,un,g,stem,sh,nom,nh=f[:7]
    D[nom].append((code,un,g,stem,J(sh),J(nh)))
scan=collections.defaultdict(set)
for l in open('/home/claude/unadi/vid/scan.tsv'):
    us,code,un,stem=l.rstrip('\n').split('\t')
    for u in us.split(','): scan[u].add((code,un,stem))
