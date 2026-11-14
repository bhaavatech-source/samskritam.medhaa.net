import json, re, sys, os, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.environ.get('PYPINYIN_SRC', ''))  # github.com/mozillazg/python-pinyin
from mula import M
C = {}
for m in ('core1', 'core2', 'core3'): C.update(importlib.import_module(m).C)
LANGS = ['ta','kn','ml','mr','bn','or','de','fr','es','ru','ar','zh','ja','ko']
TR = {l: importlib.import_module('tr_' + l).T for l in LANGS}
RJA = importlib.import_module('rom_ja').T; RAR = importlib.import_module('rom_ar').T
from pypinyin import lazy_pinyin, Style
PZ = {'，': ',', '。': '.', '；': ';', '：': ':', '？': '?', '！': '!', '（': '(', '）': ')', '“': '"', '”': '"', '、': ',', '——': ' — '}
def zh_roman(s):
    out = []
    for tok in lazy_pinyin(s, style=Style.TONE, errors=lambda x: list(x)):
        out.append(PZ.get(tok, tok))
    r = ' '.join(out)
    r = re.sub(r'\s+([,.;:?!)"])', r'\1', r); r = re.sub(r'([("])\s+', r'\1', r)
    for a, b in {'zhī zi': 'zhī zǐ', ' de guó': ' de guó', 'wèi le': 'wèile'}.items(): r = r.replace(a, b)
    r = re.sub(r'\s+', ' ', r).strip()
    for a, b in ZFIX: r = r.replace(a, b)
    return r
ZFIX = [('wèi zhòng wáng', 'wéi zhòng wáng'), ('bèi dì guī huán', 'bèi de guī huán'), ('dì bǎo hù', 'de bǎo hù'), ('dì fèng xíng', 'de fèng xíng'),
        ('dì huò qǔ', 'de huò qǔ'), ('dì xiǎng shòu', 'de xiǎng shòu'), ('jìng dì qián wǎng', 'jìng de qián wǎng'), ('ài dì huí lǐ', 'ài de huí lǐ'),
        ('àn wèi chéng qiáng', 'àn wéi chéng qiáng'), ('hǎi wèi hù chéng', 'hǎi wéi hù chéng'), ('zhù wèi biāo zhì', 'zhù wéi biāo zhì'),
        ('lüè wèi yǎn mù', 'lüè wéi yǎn mù'), ('rén wéi qiú zi', 'rén wèi qiú zǐ'), ('qiú zi', 'qiú zǐ'), ('wèi zi ', 'wèi zǐ '), ('de zi ', 'de zǐ '), ('wú zi', 'wú zǐ'), ('yì xíng fēi', 'yì háng fēi'), ('yī xíng fēi', 'yì háng fēi'),
        ('shēn zhe jié', 'shēn zhuó jié'), ('chuī dé wēn', 'chuī de wēn')]
PAGE = {11:19,12:20,13:21,14:23,15:24,16:26,17:27,18:29,19:30,20:32,21:34,22:36,23:37,24:39,25:40,26:42,27:44,28:45,29:47,30:48,
        31:50,32:51,33:52,34:54,35:55,36:57,37:58,38:59,39:61,40:63,41:65,42:66,43:67,44:68,45:70,46:71,47:72,48:74,49:76,50:78,
        51:79,52:81,53:82,54:83,55:85,56:86,57:88,58:89,59:91,60:93,61:95,62:96,63:97,64:99,65:100,66:102,67:103,68:105,69:106,70:108}
FREE = {13, 14, 15, 23, 38, 39, 40, 41, 42, 43, 44, 45, 49, 50, 51, 52, 53, 55}   # word order among the epithets is free: not used as anvaya puzzles
MISSING = {16, 28, 29, 58, 69}   # the page with the verse lines is not in the photographed set
VARIANT = {25: "वाविल्ल-पाठः 'धर्मायैव' (अन्यत्र 'धर्म एव')", 51: "वाविल्ल-पाठः 'विस्रम्भाय' (अन्यत्र 'विश्वासाय')",
           57: "वाविल्ल-पाठः 'पादौ' (अन्यत्र 'पादान्')", 61: "वाविल्ल-पाठः 'प्रशमितारिभिः' (अन्यत्र 'संशमितारिभिः')"}
out = []
for n in range(11, 71):
    pc, anv, en, hi, te, al = C[n]
    a, b = M[n].rstrip('॥').split('।')
    verse = a.strip() + '। ' + b.strip() + '॥'
    m = {'en': en, 'hi': hi, 'te': te}
    for l in LANGS: m[l] = TR[l][n]
    notes = ['अनुष्टुप्-छन्दसि']
    if al: notes.append('अलङ्कारः — ' + al)
    if n in VARIANT: notes.append(VARIANT[n])
    out.append({'id': f'RV-1.{n}', 'n': n, 'source': f'रघुवंशम् 1.{n}', 'verse': verse,
                'padaccheda': [w.strip() for w in pc.split(',')], 'anvaya': anv, 'notes': notes, 'free': n in FREE, 'm': m,
                'r': {'ar': RAR[n], 'zh': zh_roman(TR['zh'][n]), 'ja': RJA[n]},
                'book': {'edition': 'Vāvilla Press, Raghuvaṃśa with Telugu commentary', 'page': PAGE[n],
                         'verse_text': 'Mallinātha vulgate (book page not photographed)' if n in MISSING else 'checked against the book photograph'}})
# sanity: padaccheda words must all be recoverable
doc = {'title': 'रघुवंशम् — प्रथमः सर्गः, श्लोकाः 11–70', 'built': '2026-11-13',
       'about': 'Verse text and padaccheda follow the Vāvilla Press edition (Mallinātha text, Telugu commentary). Anvaya follows Mallinātha. '
                'Meanings in 17 languages written for the game (Telugu not yet compared with the book\'s bhāvamu). Verses 1–10 already in the game (Gold).',
       'verses': out}
json.dump(doc, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raghuvamsha_1_11-70_2026-11-13.json'), 'w'), ensure_ascii=False, indent=1)
print(len(out), out[0]['r']['zh'][:120])
