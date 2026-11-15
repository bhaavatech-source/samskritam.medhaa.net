"""data-source/04-taddhita/taddhita_2026-11-15.py

Builds taddhita_pratyaya_2026-11-15.json from taddhita_pratyaya_corrected.json (not edited):
  1. corrections (sūtra texts, wrong sūtras, examples under the wrong sūtra),
  2. more examples (at least 3–4 for every productive suffix),
  3. 15 suffixes that were missing (ष्यञ्, डट्, तमट्, तीय, थुक्, कन्, ख, ठञ्, इतच्, चरट्,
     अण् in its शैषिक / तदधीते senses, त्यप्, ट्युल्, दानीम्, ह).
Each change is logged in "_audit" at the end of the output (internal, not shown in the app).
Every example is then checked with vidyut-prakriya where the engine supports the suffix (check_vidyut.py).
"""
import json, copy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from translit import iast

SRC, OUT = sys.argv[1], sys.argv[2]
D = json.load(open(SRC, encoding="utf-8"))
O = copy.deepcopy(D)
BY = {x["id"]: x for x in D}
LOG = []
def log(i, what, old, new, why): LOG.append({"id": i, "field": what, "old": old, "new": new, "reason": why})

def ex(base, form, en, te, hi, note=None):
    e = {"base": base, "base_iast": iast(base), "derived_form": form, "derived_iast": iast(form),
         "meaning_en": en, "meaning_te": te, "meaning_hi": hi}
    if note: e["note"] = note
    return e

# ── 1. corrections ────────────────────────────────────────────────
def fix_sutra(i, key, new, why):
    old = BY[i]["panini_sutra"].get(key); BY[i]["panini_sutra"][key] = new; log(i, "panini_sutra." + key, old, new, why)

for i in ("TP-000012", "TP-000014"):
    fix_sutra(i, "sutra", "द्विवचनविभज्योपपदे तरबीयसुनौ", "sūtra text: तरप्रीयसौ → तरबीयसुनौ")
for i in ("TP-000013", "TP-000015"):
    fix_sutra(i, "sutra", "अतिशायने तमबिष्ठनौ", "sūtra text: अतिशयाने → अतिशायने")
fix_sutra("TP-000011", "sutra", "पृथ्वादिभ्य इमनिज्वा", "sūtra text: इमनिच् वा → इमनिज्वा")
fix_sutra("TP-000017", "sutra", "ईषदसमाप्तौ कल्पब्देश्यदेशीयरः", "sūtra text ends in देशीयरः")
fix_sutra("TP-000010", "vidhayaka_sutra", "4.4.1 प्राग्वहतेष्ठक् prescribes ठक् in the meanings of 4.4.2 onwards; other sūtras (4.2.47, 4.2.60) also prescribe it",
          "the heading 4.4.2 does not cover धार्मिकः (4.4.41) or नैयायिकः (4.2.60)")
fix_sutra("TP-000016", "vidhayaka_sutra", "5.4.21 तत्प्रकृतवचने मयट् (abounding in: अन्नमयः); 4.3.143 मयड्वैतयोर्भाषायामभक्ष्याच्छादनयोः (made of: स्वर्णमयः)",
          "स्वर्णमयः (made of gold) is 4.3.143, not 5.4.21")
fix_sutra("TP-000037", "vidhayaka_sutra", "5.2.102 तपःसहस्राभ्यां विनीनी (तपस्वी); 5.2.121 अस्मायामेधास्रजो विनिः (तेजस्वी, यशस्वी, मेधावी, मायावी)",
          "तेजस्वी is from 5.2.121 (stems in अस्), not 5.2.102")
fix_sutra("TP-000039", "sutra", "शीतोष्णतृप्रेभ्यस्तन्न सहते (वार्त्तिकम्, 5.2.122)", "a vārttika under 5.2.122, not a sūtra “शीतोष्णाभ्याम् आलुच्”")
old = BY["TP-000039"]["category"]; BY["TP-000039"]["category"] = "matvarthiya_possessive"
BY["TP-000039"]["category_name_sa"] = "मत्वर्थीय-तद्धितः (तन्न सहते)"
log("TP-000039", "category", old, "matvarthiya_possessive", "this आलुच् is a taddhita; the kṛt आलुच् is 3.2.158 (स्पृहयालुः)")

def drop(i, form, why):
    old = [e["derived_form"] for e in BY[i]["examples"]]
    BY[i]["examples"] = [e for e in BY[i]["examples"] if e["derived_form"] != form]
    log(i, "examples", form, None, why)
drop("TP-000006", "जनता", "जनता “a crowd” is samūha (4.2.43 ग्रामजनबन्धुसहायेभ्यस्तल्), not the abstract -ness of 5.1.119")
drop("TP-000010", "सामाजिकः", "no clear sūtra for this sense under ठक्; removed")
drop("TP-000032", "क्रमशः", "not covered by 5.4.42 (words meaning much / little)")
drop("TP-000032", "अक्षरशः", "belongs to 5.4.43 (vīpsā: letter by letter); moved to TP-000040")

def note_ex(i, form, note, why):
    for e in BY[i]["examples"]:
        if e["derived_form"] == form: e["note"] = note; log(i, f"examples[{form}].note", None, note, why)
note_ex("TP-000010", "धार्मिकः", "4.4.41 धर्मं चरति", "sūtra of this example")
note_ex("TP-000010", "नैयायिकः", "4.2.60 क्रतूक्थादिसूत्रान्ताट्ठक् (तदधीते तद्वेद); ऐ by 7.3.3 न य्वाभ्यां पदान्ताभ्यां …", "sūtra of this example")
note_ex("TP-000016", "स्वर्णमयः", "4.3.143 (made of)", "sūtra of this example")
note_ex("TP-000037", "तेजस्वी", "5.2.121 अस्मायामेधास्रजो विनिः", "sūtra of this example")
note_ex("TP-000005", "भवदीयः", "4.2.115 भवतष्ठक्छसौ", "sūtra of this example")
note_ex("TP-000005", "तदीयः", "त्यदादीनि च 1.1.74 makes तद् vṛddha", "why 4.2.114 applies")

# ── 2. more examples ──────────────────────────────────────────────
ADD = {
 "TP-000002": [ex("दक्ष", "दाक्षिः", "son of Dakṣa", "దక్షుని కుమారుడు", "दक्ष का पुत्र"),
               ex("सुमित्रा", "सौमित्रिः", "son of Sumitrā (Lakṣmaṇa)", "సుమిత్ర కుమారుడు (లక్ష్మణుడు)", "सुमित्रा का पुत्र (लक्ष्मण)", "बाह्वादि, 4.1.96")],
 "TP-000003": [ex("गङ्गा", "गाङ्गेयः", "son of Gaṅgā (Bhīṣma)", "గంగ కుమారుడు (భీష్ముడు)", "गंगा का पुत्र (भीष्म)"),
               ex("राधा", "राधेयः", "son of Rādhā (Karṇa)", "రాధ కుమారుడు (కర్ణుడు)", "राधा का पुत्र (कर्ण)")],
 "TP-000004": [ex("जमदग्नि", "जामदग्न्यः", "descendant of Jamadagni (Paraśurāma)", "జమదగ్ని వంశజుడు (పరశురాముడు)", "जमदग्नि के वंशज (परशुराम)"),
               ex("पुलस्ति", "पौलस्त्यः", "descendant of Pulasti (Rāvaṇa)", "పులస్తి వంశజుడు (రావణుడు)", "पुलस्ति के वंशज (रावण)")],
 "TP-000005": [ex("अस्मद्", "मदीयः", "mine", "నాది", "मेरा", "मद् for अस्मद्, 7.2.98"),
               ex("युष्मद्", "त्वदीयः", "yours", "నీది", "तुम्हारा", "त्वद् for युष्मद्, 7.2.98"),
               ex("स्वसृ", "स्वस्रीयः", "sister's son", "సోదరి కుమారుడు", "भानजा", "4.1.143 स्वसुश्छः")],
 "TP-000006": [ex("शूर", "शूरता", "bravery", "శౌర్యము", "वीरता"), ex("मूर्ख", "मूर्खता", "foolishness", "మూర్ఖత్వము", "मूर्खता")],
 "TP-000007": [ex("मनुष्य", "मनुष्यत्वम्", "humanity", "మనుష్యత్వము", "मनुष्यता"), ex("गुरु", "गुरुत्वम्", "weight, greatness", "గురుత్వము", "गुरुता")],
 "TP-000008": [ex("धी", "धीमान्", "wise", "బుద్ధిమంతుడు", "बुद्धिमान"), ex("बल", "बलवान्", "strong", "బలవంతుడు", "बलवान", "म् → व् 8.2.9"),
               ex("ज्ञान", "ज्ञानवान्", "learned", "జ్ఞానవంతుడు", "ज्ञानवान", "म् → व् 8.2.9")],
 "TP-000009": [ex("दण्ड", "दण्डी", "one with a staff", "దండము కలవాడు", "दंडधारी"), ex("बल", "बली", "strong", "బలశాలి", "बलशाली")],
 "TP-000010": [ex("अक्ष", "आक्षिकः", "gambler (plays with dice)", "జూదగాడు", "जुआरी", "4.4.2 तेन दीव्यति"),
               ex("हस्तिन्", "हास्तिकम्", "a herd of elephants", "ఏనుగుల గుంపు", "हाथियों का झुंड", "4.2.47 अचित्तहस्तिधेनोष्ठक्")],
 "TP-000011": [ex("पृथु", "प्रथिमा", "breadth", "వెడల్పు", "चौड़ाई", "र ऋतो हलादेर्लघोः 6.4.161"),
               ex("मृदु", "म्रदिमा", "softness", "మృదుత్వము", "कोमलता", "6.4.161")],
 "TP-000012": [ex("लघु", "लघुतरः", "lighter", "మరింత తేలికైన", "अधिक हल्का"), ex("प्रिय", "प्रियतरः", "dearer", "మరింత ప్రియమైన", "अधिक प्रिय")],
 "TP-000013": [ex("लघु", "लघुतमः", "lightest", "అత్యంత తేలికైన", "सबसे हल्का"), ex("प्रिय", "प्रियतमः", "dearest", "అత్యంత ప్రియమైన", "सबसे प्रिय")],
 "TP-000014": [ex("लघु", "लघीयान्", "lighter", "మరింత తేలికైన", "अधिक हल्का"), ex("महत्", "महीयान्", "greater", "మరింత గొప్ప", "अधिक महान"),
               ex("बहु", "भूयान्", "more", "ఎక్కువ", "अधिक", "6.4.158 बहोर्लोपो भू च बहोः")],
 "TP-000015": [ex("लघु", "लघिष्ठः", "lightest", "అత్యంత తేలికైన", "सबसे हल्का"), ex("महत्", "महिष्ठः", "greatest", "అత్యంత గొప్ప", "सबसे महान"),
               ex("बहु", "भूयिष्ठः", "most", "అత్యధిక", "सबसे अधिक", "6.4.159 इष्ठस्य यिट् च")],
 "TP-000016": [ex("अन्न", "अन्नमयः", "consisting of food (अन्नमयः कोशः)", "అన్నమయమైన", "अन्नमय", "5.4.21"),
               ex("आनन्द", "आनन्दमयः", "full of bliss", "ఆనందమయమైన", "आनंदमय", "5.4.21"),
               ex("मृद्", "मृण्मयः", "made of clay", "మట్టితో చేసిన", "मिट्टी का बना", "4.3.143; द् → ण् 8.4.45")],
 "TP-000017": [ex("मृत", "मृतकल्पः", "almost dead", "దాదాపు చనిపోయిన", "मृतप्राय"), ex("अमृत", "अमृतकल्पः", "nearly like nectar", "అమృతతుల్యమైన", "अमृत समान")],
 "TP-000018": [ex("वैयाकरण", "वैयाकरणरूपः", "an excellent grammarian", "ప్రశస్తుడైన వైయాకరణుడు", "उत्तम वैयाकरण"),
               ex("पटु", "पटुरूपः", "very skilful", "మిక్కిలి నేర్పరి", "अत्यंत कुशल")],
 "TP-000019": [ex("वैयाकरण", "वैयाकरणपाशः", "a poor grammarian", "అల్ప వైయాకరణుడు", "तुच्छ वैयाकरण")],
 "TP-000020": [ex("यद्", "यतः", "from which; because", "దేనినుండి; ఎందుకనగా", "जिससे; क्योंकि"),
               ex("किम्", "कुतः", "from where? why?", "ఎక్కడినుండి? ఎందుకు?", "कहाँ से? क्यों?", "कु for किम्, 7.2.104"),
               ex("इदम्", "इतः", "from here", "ఇక్కడినుండి", "यहाँ से", "इ for इदम्, 5.3.4")],
 "TP-000021": [ex("सर्व", "सर्वत्र", "everywhere", "అంతటా", "सब जगह"), ex("अन्य", "अन्यत्र", "elsewhere", "వేరేచోట", "अन्यत्र"),
               ex("किम्", "कुत्र", "where?", "ఎక్కడ?", "कहाँ?", "7.2.104")],
 "TP-000022": [ex("सर्व", "सर्वदा", "always", "ఎల్లప్పుడు", "सदा"), ex("एक", "एकदा", "once, at one time", "ఒకప్పుడు", "एक बार"),
               ex("अन्य", "अन्यदा", "at another time", "మరొకప్పుడు", "दूसरे समय"), ex("किम्", "कदा", "when?", "ఎప్పుడు?", "कब?")],
 "TP-000023": [ex("सर्व", "सर्वथा", "in every way", "అన్నివిధాలా", "सर्वथा"), ex("अन्य", "अन्यथा", "otherwise", "లేనిచో", "अन्यथा")],
 "TP-000025": [ex("बहु", "बहुधा", "in many ways", "అనేకవిధాలా", "अनेक प्रकार से"), ex("त्रि", "त्रिधा", "in three ways", "మూడువిధాలా", "तीन प्रकार से"),
               ex("शत", "शतधा", "in a hundred ways", "వందవిధాలా", "सौ प्रकार से")],
 "TP-000026": [ex("दशन्", "दशकृत्वः", "ten times", "పదిసార్లు", "दस बार"), ex("सहस्र", "सहस्रकृत्वः", "a thousand times", "వేయిసార్లు", "हज़ार बार")],
 "TP-000027": [ex("चतुर्", "चतुः", "four times", "నాలుగుసార్లు", "चार बार", "र् dropped (8.2.24 रात्सस्य)")],
 "TP-000028": [ex("ब्राह्मण", "ब्राह्मणवत्", "like a brāhmaṇa (ब्राह्मणवदधीते)", "బ్రాహ్మణునివలె", "ब्राह्मण की तरह"),
               ex("पुत्र", "पुत्रवत्", "like a son", "కుమారునివలె", "पुत्र की तरह")],
 "TP-000029": [ex("कृष्ण", "कृष्णीकरोति", "makes black", "నల్లగా చేయును", "काला करता है"),
               ex("भस्मन्", "भस्मीभवति", "becomes ashes", "బూడిద అగును", "भस्म हो जाता है", "न् dropped (8.2.7)")],
 "TP-000030": [ex("जल", "जलसात्", "into water (जलसात् करोति)", "నీటిపాలు", "जल में"),
               ex("राजन्", "राजसात्", "into the king's power", "రాజు ఆధీనము", "राजा के अधीन", "5.4.54 तदधीनवचने")],
 "TP-000031": [ex("मनुष्य", "मनुष्यत्रा", "among men (Vedic)", "మనుష్యులలో", "मनुष्यों में"), ex("पुरुष", "पुरुषत्रा", "among men (Vedic)", "పురుషులలో", "पुरुषों में")],
 "TP-000032": [ex("स्तोक", "स्तोकशः", "little by little", "కొద్దికొద్దిగా", "थोड़ा-थोड़ा")],
 "TP-000033": [ex("चतुर्", "चतुष्टयम्", "a group of four", "నాలుగింటి సమూహము", "चार का समूह")],
 "TP-000034": [ex("ऊरु", "ऊरुमात्रम्", "thigh-deep", "తొడలలోతు", "जाँघ भर"), ex("जानु", "जानुमात्रम्", "knee-deep", "మోకాలిలోతు", "घुटने भर")],
 "TP-000035": [ex("जानु", "जानुद्वयसम्", "knee-high", "మోకాలి ఎత్తు", "घुटने तक")],
 "TP-000036": [ex("ऊरु", "ऊरुदघ्नम्", "thigh-deep", "తొడలలోతు", "जाँघ तक गहरा")],
 "TP-000037": [ex("यशस्", "यशस्वी", "famous", "కీర్తిమంతుడు", "यशस्वी", "5.2.121"), ex("मेधा", "मेधावी", "intelligent", "మేధావి", "मेधावी", "5.2.121"),
               ex("माया", "मायावी", "deceitful, magician", "మాయావి", "मायावी", "5.2.121")],
 "TP-000038": [ex("ओष्ठ", "ओष्ठ्यः", "labial", "ఓష్ఠ్యము", "ओष्ठ्य"), ex("तालु", "तालव्यः", "palatal", "తాలవ్యము", "तालव्य", "ओर्गुणः 6.4.146, वान्तो यि 6.1.79"),
               ex("मूर्धन्", "मूर्धन्यः", "cerebral (retroflex)", "మూర్ధన్యము", "मूर्धन्य")],
 "TP-000040": [ex("अक्षर", "अक्षरशः", "letter by letter", "అక్షరాక్షరముగా", "अक्षरशः"), ex("पाद", "पादशः", "foot by foot, quarter by quarter", "పాదము పాదముగా", "पद-पद"),
               ex("माष", "माषशः", "a māṣa each", "మాషము చొప్పున", "माषा-माषा")],
}
for i, xs in ADD.items():
    BY[i]["examples"] += xs
    log(i, "examples", None, [x["derived_form"] for x in xs], "more examples")

# ── 3. missing suffixes ───────────────────────────────────────────
def new(i, name, level, cat, cat_sa, its, kept, effect, sutra, num, sutra_en, meanings, exs, rules, vidhayaka=None):
    x = {"id": i, "sanskrit_name": name, "iast": iast(name), "level": level, "category": cat, "category_name_sa": cat_sa,
         "anubandha_info": {"it_markers": its, "retained_affix_sa": kept, "retained_affix_iast": iast(kept), "grammatical_effect": effect},
         "panini_sutra": {"sutra": sutra, "number": num, "meaning_en": sutra_en, **({"vidhayaka_sutra": vidhayaka} if vidhayaka else {})},
         "grammatical_properties": {}, "meanings": meanings, "examples": exs, "morphological_rules": rules,
         "verification": {"status": "added 2026-11-15", "review_notes": ["Added by Claude against the sūtras; please confirm before release."]}}
    D.append(x); BY[i] = x; log(i, "entry", None, name, "missing suffix added")

new("TP-000041", "ष्यञ्", "basic", "bhavarthe_abstract", "भावार्थक-तद्धितः", ["ष्", "ञ्"], "य",
    "ञ्: vṛddhi of the first vowel (7.2.117); ष्: feminine in ङीष् (4.1.41)", "गुणवचनब्राह्मणादिभ्यः कर्मणि च", "5.1.124",
    "From adjectives of quality and from ब्राह्मण etc., in the sense of the state or the action.",
    {"sa": "तस्य भावः कर्म वा", "en": "-ness, the quality or office of", "te": "తనము, గుణము", "hi": "-ता, -पन, गुण"},
    [ex("सुन्दर", "सौन्दर्यम्", "beauty", "సౌందర్యము", "सुंदरता"), ex("मधुर", "माधुर्यम्", "sweetness", "మాధుర్యము", "मधुरता"),
     ex("चतुर", "चातुर्यम्", "cleverness", "చాతుర్యము", "चतुराई"), ex("धीर", "धैर्यम्", "courage", "ధైర్యము", "धैर्य"),
     ex("शूर", "शौर्यम्", "valour", "శౌర్యము", "शौर्य"), ex("ब्राह्मण", "ब्राह्मण्यम्", "the state of a brāhmaṇa", "బ్రాహ్మణ్యము", "ब्राह्मणत्व")],
    ["First vowel takes vṛddhi (7.2.117): सु → सौ, म → मा.", "Final अ of the stem is dropped before य (6.4.148 यस्येति च)."])
new("TP-000042", "डट्", "intermediate", "puranarthaka_ordinal", "पूरणार्थक-तद्धितः", ["ड्", "ट्"], "अ",
    "ड्: the last vowel with what follows (टि) is dropped (6.4.143 टेः); ट्: feminine in ङीप् (4.1.15)", "तस्य पूरणे डट्", "5.2.48",
    "After a number, in the sense of “completing” it: the ordinal.",
    {"sa": "तस्य पूरणः", "en": "the …th (ordinal)", "te": "…వ (క్రమసంఖ్య)", "hi": "…वाँ (क्रमसूचक)"},
    [ex("एकादशन्", "एकादशः", "eleventh", "పదకొండవ", "ग्यारहवाँ"), ex("विंशति", "विंशः", "twentieth", "ఇరవయ్యవ", "बीसवाँ", "6.4.142 तिविंशतेर्डिति"),
     ex("पञ्चन्", "पञ्चमः", "fifth", "ఐదవ", "पाँचवाँ", "with the augment मट्, 5.2.49 नान्तादसंख्यादेर्मट्"),
     ex("दशन्", "दशमः", "tenth", "పదవ", "दसवाँ", "मट्, 5.2.49")],
    ["Numbers in -न् take the augment मट् (5.2.49): पञ्चमः, सप्तमः, अष्टमः, नवमः, दशमः.", "विंशति drops ति (6.4.142): विंशः."])
new("TP-000043", "तमट्", "intermediate", "puranarthaka_ordinal", "पूरणार्थक-तद्धितः", ["ट्"], "तम", "ट्: feminine in ङीप्",
    "विंशत्यादिभ्यस्तमडन्यतरस्याम्", "5.2.56", "After विंशति etc., optionally, for the ordinal; after षष्टि etc. only तमट् (5.2.58).",
    {"sa": "तस्य पूरणः", "en": "the …th (ordinal of 20 and above)", "te": "…వ (క్రమసంఖ్య)", "hi": "…वाँ"},
    [ex("विंशति", "विंशतितमः", "twentieth", "ఇరవయ్యవ", "बीसवाँ"), ex("शत", "शततमः", "hundredth", "నూరవ", "सौवाँ"),
     ex("त्रिंशत्", "त्रिंशत्तमः", "thirtieth", "ముప్పయ్యవ", "तीसवाँ"), ex("षष्टि", "षष्टितमः", "sixtieth", "అరవయ్యవ", "साठवाँ", "only तमट्, 5.2.58")],
    ["With विंशति, त्रिंशत् etc. both forms occur: विंशः / विंशतितमः."])
new("TP-000044", "तीय", "basic", "puranarthaka_ordinal", "पूरणार्थक-तद्धितः", [], "तीय", "—",
    "द्वेस्तीयः; त्रेः सम्प्रसारणं च", "5.2.54–55", "After द्वि and त्रि for the ordinal; त्रि becomes तृ.",
    {"sa": "तस्य पूरणः", "en": "second, third", "te": "రెండవ, మూడవ", "hi": "दूसरा, तीसरा"},
    [ex("द्वि", "द्वितीयः", "second", "రెండవ", "दूसरा"), ex("त्रि", "तृतीयः", "third", "మూడవ", "तीसरा", "र् → ऋ, 5.2.55")],
    ["त्रि → तृ (संप्रसारणम्) before तीय."])
new("TP-000045", "डट् + थुक्", "intermediate", "puranarthaka_ordinal", "पूरणार्थक-तद्धितः", ["ड्", "ट्"], "थ",
    "the augment थुक् is added to the number before डट्", "षट्कतिकतिपयचतुरां थुक्", "5.2.51", "षष्, कति, कतिपय and चतुर् take थुक् before डट्.",
    {"sa": "तस्य पूरणः", "en": "fourth, sixth, the how-many-th", "te": "నాలుగవ, ఆరవ", "hi": "चौथा, छठा"},
    [ex("चतुर्", "चतुर्थः", "fourth", "నాలుగవ", "चौथा"), ex("षष्", "षष्ठः", "sixth", "ఆరవ", "छठा", "थ् → ठ् after ष् (8.4.41)"),
     ex("कति", "कतिथः", "the how-many-th", "ఎన్నవ", "कौन-सा (क्रम में)")],
    [], vidhayaka="5.2.48 तस्य पूरणे डट् (the suffix); 5.2.51 (the augment)")
new("TP-000046", "कन्", "intermediate", "alparthaka_diminutive", "अल्पार्थक-तद्धितः", ["न्"], "क", "—",
    "ह्रस्वे; अनुकम्पायाम्; अज्ञाते", "5.3.86, 5.3.76, 5.3.73",
    "For something small, for affection or pity, and for something unknown (कुत्सिते too, 5.3.74).",
    {"sa": "ह्रस्वः, अनुकम्पितः, अज्ञातः", "en": "small, dear, little (diminutive)", "te": "చిన్న, ప్రియమైన", "hi": "छोटा, प्यारा"},
    [ex("वृक्ष", "वृक्षकः", "a small tree", "చిన్న చెట్టు", "छोटा पेड़", "ह्रस्वे 5.3.86"),
     ex("पुत्र", "पुत्रकः", "dear little son", "ప్రియమైన చిన్నకొడుకు", "प्यारा बेटा", "अनुकम्पायाम् 5.3.76"),
     ex("अश्व", "अश्वकः", "a horse (whose owner is not known)", "ఎవరిదో గుర్రము", "किसी का घोड़ा", "अज्ञाते 5.3.73")],
    [])
new("TP-000047", "ख", "intermediate", "sambandharthaka_relational", "सम्बन्धार्थक-तद्धितः", [], "ईन", "ख → ईन (7.1.2 आयनेयीनीयियः फढखछघां प्रत्ययादीनाम्)",
    "कुलात्खः; आत्मन्विश्वजनभोगोत्तरपदात्खः", "4.1.139, 5.1.9", "After कुल (of good family) and after आत्मन्, विश्वजन… (good for).",
    {"sa": "कुले भवः; तस्मै हितम्", "en": "of good family; good for", "te": "కులీనుడు; మేలుకరమైన", "hi": "कुलीन; हितकर"},
    [ex("कुल", "कुलीनः", "of noble family", "కులీనుడు", "कुलीन"), ex("विश्वजन", "विश्वजनीनम्", "good for all people", "అందరికీ హితమైన", "सर्वजनहितकारी"),
     ex("आत्मन्", "आत्मनीनम्", "good for oneself", "తనకు హితమైన", "अपने लिए हितकर")],
    ["ख is replaced by ईन (7.1.2)."])
new("TP-000048", "ठञ्", "intermediate", "kalarthaka", "कालार्थक-तद्धितः", ["ञ्"], "इक", "ठ → इक (7.3.50); ञ्: vṛddhi (7.2.117)",
    "कालाट्ठञ्", "4.3.11", "After words for time: “belonging to, happening in”.",
    {"sa": "काले भवः", "en": "daily, monthly, yearly …", "te": "దైనిక, మాసిక, వార్షిక", "hi": "दैनिक, मासिक, वार्षिक"},
    [ex("दिन", "दैनिकम्", "daily", "ప్రతిదినపు", "दैनिक"), ex("मास", "मासिकम्", "monthly", "నెలవారీ", "मासिक"),
     ex("वर्ष", "वार्षिकम्", "yearly", "సంవత్సరపు", "वार्षिक"), ex("संवत्सर", "सांवत्सरिकम्", "annual", "సాంవత్సరిక", "सांवत्सरिक")],
    ["ठ → इक (7.3.50 ठस्येकः); first vowel vṛddhi."])
new("TP-000049", "इतच्", "intermediate", "matvarthiya_possessive", "सञ्जातार्थक-तद्धितः", ["च्"], "इत", "—",
    "तदस्य सञ्जातं तारकादिभ्य इतच्", "5.2.36", "After तारका, पुष्प etc.: “in which … has appeared”.",
    {"sa": "तदस्य सञ्जातम्", "en": "having … come out (flowered, starred)", "te": "…కలిగిన (పూచిన)", "hi": "…युक्त (पुष्पित)"},
    [ex("पुष्प", "पुष्पितः", "in flower", "పూచిన", "पुष्पित"), ex("कुसुम", "कुसुमितः", "blossomed", "వికసించిన", "कुसुमित"),
     ex("फल", "फलितः", "bearing fruit", "ఫలించిన", "फलित"), ex("तारका", "तारकितम्", "full of stars", "నక్షత్రాలు కలిగిన", "तारों भरा")],
    [])
new("TP-000050", "चरट्", "expert", "bhutapurva", "भूतपूर्वार्थक-तद्धितः", ["ट्"], "चर", "ट्: feminine in ङीप्",
    "भूतपूर्वे चरट्", "5.3.53", "“Formerly …”.", {"sa": "भूतपूर्वः", "en": "former, ex-", "te": "పూర్వపు", "hi": "भूतपूर्व"},
    [ex("आढ्य", "आढ्यचरः", "formerly rich", "పూర్వము ధనికుడైన", "पूर्व में धनी"),
     ex("सेनापति", "सेनापतिचरः", "a former commander", "పూర్వపు సేనాపతి", "भूतपूर्व सेनापति")], [])
new("TP-000051", "अण् (शैषिकः)", "intermediate", "sambandharthaka_relational", "शैषिक-तद्धितः", ["ण्"], "अ", "vṛddhi of the first vowel (7.2.117)",
    "साऽस्य देवता; तदधीते तद्वेद; तस्येदम्", "4.2.24, 4.2.59, 4.3.120",
    "The same अण् as TP-000001, in other meanings: devotee of a deity, one who studies a subject, belonging to.",
    {"sa": "साऽस्य देवता; तदधीते; तस्येदम्", "en": "devotee of; student of; belonging to", "te": "…భక్తుడు; …అధ్యయనము చేయువాడు", "hi": "…का उपासक; …का अध्येता"},
    [ex("शिव", "शैवः", "a worshipper of Śiva", "శైవుడు", "शैव", "4.2.24"), ex("विष्णु", "वैष्णवः", "a worshipper of Viṣṇu", "వైష్ణవుడు", "वैष्णव", "4.2.24"),
     ex("व्याकरण", "वैयाकरणः", "a grammarian", "వైయాకరణుడు", "वैयाकरण", "4.2.59; ऐ by 7.3.3"),
     ex("उपगु", "औपगवम्", "belonging to Upagu", "ఉపగునిది", "उपगु का", "4.3.120")],
    ["First vowel vṛddhi; with य्/व् after the first letter, ऐ/औ is inserted before it (7.3.3): वैयाकरणः."],
    vidhayaka="4.1.83 प्राग्दीव्यतोऽण्")
new("TP-000052", "त्यप्", "intermediate", "sambandharthaka_relational", "भवार्थक-तद्धितः", ["प्"], "त्य", "—",
    "अव्ययात्त्यप्", "4.2.104", "After the adverbs अत्र, तत्र, इह …: “who / which is there”.",
    {"sa": "तत्र भवः", "en": "belonging to here / there", "te": "ఇక్కడి, అక్కడి", "hi": "यहाँ का, वहाँ का"},
    [ex("अत्र", "अत्रत्यः", "of this place", "ఇక్కడి", "यहाँ का"), ex("तत्र", "तत्रत्यः", "of that place", "అక్కడి", "वहाँ का"),
     ex("इह", "इहत्यः", "of this world, local", "ఇహలోకపు", "यहाँ का")], [])
new("TP-000053", "ट्युल्", "intermediate", "kalarthaka", "कालार्थक-तद्धितः", ["ट्", "ल्"], "तन", "यु → अन (7.1.1) with the augment तुट्",
    "सायंचिरम्प्राह्णेप्रगेऽव्ययेभ्यष्ट्युट्युलौ तुट् च", "4.3.23", "After सायम्, चिरम् and time adverbs: “of that time”.",
    {"sa": "तत्काले भवः", "en": "of that time (-tana)", "te": "ఆ కాలపు", "hi": "उस समय का"},
    [ex("अद्य", "अद्यतनः", "of today, modern", "ఈనాటి", "आज का"), ex("पुरा", "पुरातनः", "ancient", "ప్రాచీన", "पुराना"),
     ex("चिरम्", "चिरन्तनः", "long-standing", "చిరకాలపు", "पुराना"), ex("सायम्", "सायन्तनः", "of the evening", "సాయంకాలపు", "शाम का")], [])
new("TP-000054", "दानीम्", "basic", "kalarthaka_avyaya", "कालार्थक-तद्धितः (अव्ययम्)", [], "दानीम्", "—",
    "दानीं च", "5.3.18", "After इदम् and तद्, for time: “now, then”.", {"sa": "तस्मिन् काले", "en": "now, then", "te": "ఇప్పుడు, అప్పుడు", "hi": "अब, तब"},
    [ex("इदम्", "इदानीम्", "now", "ఇప్పుడు", "अब"), ex("तद्", "तदानीम्", "then", "అప్పుడు", "तब")], [])
new("TP-000055", "ह", "basic", "vibhaktyarthaka_avyaya", "विभक्त्यर्थक-तद्धितः (अव्ययम्)", [], "ह", "—",
    "इदमो हः", "5.3.11", "After इदम्, in the sense of the locative (instead of त्रल्).", {"sa": "अस्मिन्", "en": "here", "te": "ఇక్కడ", "hi": "यहाँ"},
    [ex("इदम्", "इह", "here", "ఇక్కడ", "यहाँ", "इ for इदम्, 5.3.3")], [])

# ── output ────────────────────────────────────────────────────────
out = {"title": "तद्धितप्रत्ययाः — Taddhita suffixes", "version": "2026-11-15",
       "source": "data-source/04-taddhita/taddhita_pratyaya_corrected.json, corrected and extended",
       "count": {"suffixes": len(D), "examples": sum(len(x["examples"]) for x in D)},
       "pratyayas": D,
       "_audit": {"note": "Internal audit record. Not for display to learners.", "changes": LOG}}
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(D), "suffixes,", out["count"]["examples"], "examples,", len(LOG), "logged changes")
