import json,re,copy
q=json.load(open('/home/claude/unadi/src/unadi_pariksha_levels.json')); orig=copy.deepcopy(q)
FIX={ # question_id: [(old,new)], reason
 'UNP-L1-002':([('उणादि १.११','उणादि १.१२')],'उन्देरिच्चादेः is 1.12 (book: १२)'),
 'UNP-L2-001':([('उणादि १.१२२','उणादि १.१२४'),('गण शकुनौ','गण् शकुनौ')],'गण् शकुनौ is 1.124'),
 'UNP-L2-004':([('उणादि ३.१','उणादि २.१२२')],'कॄगॄशॄवृञ्चतिभ्यः ष्वरच् is 2.122; 3.1 is छित्वरछत्वर…'),
 'UNP-L2-007':([('उणादि १.६०','उणादि १.३८')],'मन्दिवाशि… उरच् is 1.38'),
 'UNP-L2-008':([('उणादि २.२३','उणादि १.९०')],'दरिद्रातेर्यालोपश्च is 1.90'),
 'UNP-L2-010':([('मदेः स्यन् (उणादि ४.२)','ऋतन्यञ्जिवन्यञ्ज्यर्पिमद्यत्यङ्गिकुयुकृशिभ्यः कत्निच्यतुजलिजिष्ठुजिष्ठजिसन्स्यनिथिनुल्यसासानुकः (उणादि ४.२ — मदेः स्यन्)')],
               '“मदेः स्यन्” is not a separate sūtra; मद् + स्यन् is one pairing within 4.2'),
 'UNP-L4-001':([('उणादि १.८८','उणादि ५.५२'),('तनेर्डउः सन्वच्च','तनोतेर्डउः सन्वच्च')],'तनोतेर्डउः सन्वच्च is 5.52'),
 'UNP-L4-002':([('उणादि २.२१५','उणादि ४.२१५')],'अञ्च्यञ्जियुजिभृजिभ्यः कुश्च is 4.215'),
}
log=[]
for x in q['questions']:
    if x['question_id'] in FIX:
        subs,why=FIX[x['question_id']]
        s=json.dumps(x,ensure_ascii=False); before=s
        for a,b in subs: s=s.replace(a,b)
        x.clear(); x.update(json.loads(s))
        log.append(dict(question=x['question_id'],change=[f'{a} → {b}' for a,b in subs],reason=why,applied=before!=s))
q['version']='1.0.1'
q['_audit']=dict(note='Internal audit only.',date='2026-11-15',corrections=log,
                 checked='Every “उणादि N.N” reference was matched to the sūtra text in the pāda-wise numbering and to the target word.')
json.dump(q,open('/home/claude/unadi/out/unadi_pariksha_levels_2026-11-15.json','w'),ensure_ascii=False,indent=1)
for l in log: print(l)
