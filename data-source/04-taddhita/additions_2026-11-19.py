"""data-source/04-taddhita/additions_2026-11-19.py

Additions to the तद्धित section from the review of taddhita_vritti-v2.json and taddhita_game_levels-v2.json
(19-11-2026). Neither uploaded file is used directly: both had many errors (see the summary at the end).
What was taken from them was checked first:
  * every form with vidyut-prakriya where the engine derives it ("vidyut-prakriya"), otherwise by the sūtra ("sūtra");
  * every sūtra number and text against the Aṣṭādhyāyī sūtrapāṭha (the Bālapriyā .docx; standard pāda counts).

tools/build_grammar.py reads this file after taddhita_pratyaya_2026-11-15.json (which is not edited):
  ADD_EX   more examples for existing suffixes (by id)
  FIX_IT   a missing इत् letter (यत्)
  NEW      new suffixes, already in the app's shape (id, p, g, lv, it, rem, eff, sutra, num, vidh, m, rules, ex)
  GROUPS   a new group for the compound-final suffixes
  MAP      the तद्धित adhikāra: where each section starts and ends, for the animated map
  PADAS    sūtras in each pāda from 4.1.76 to 5.4.160
"""

def ex(b, w, en, te, hi, chk, note=""):
    return {"b": b, "w": w, "m": {"en": en, "te": te, "hi": hi}, "note": note, "chk": chk}

V, SU = "vidyut-prakriya", "sūtra"

# ── 1. more examples for suffixes that are already there ─────────────────────
ADD_EX = {
    "TP-000003": [ex("मातृष्वसृ", "मातृष्वसेयः", "son of one's mother's sister", "పిన్నమ్మ కుమారుడు", "मौसी का पुत्र", V,
                     "मातृष्वसुश्च (4.1.134) with ढकि लोपः (4.1.133): ढक्, and the ऋ of the stem drops. Also मातृष्वस्रीयः (छण्).")],
    "TP-000006": [ex("देव", "देवता", "deity (the same as देव)", "దేవత", "देवता", V,
                     "देवात्तल् (5.4.27): तल् स्वार्थे, the meaning does not change. Not “divinity”, which is देवत्वम् (5.1.119).")],
    "TP-000014": [ex("वृद्ध", "ज्यायान्", "elder, older", "పెద్దవాడు", "बड़ा, ज्येष्ठ", V,
                     "वृद्धस्य च (5.3.62): वृद्ध → ज्य; ज्यादादीयसः (6.4.160): ई → आ. Also वर्षीयान् (6.4.157)."),
                  ex("प्रिय", "प्रेयान्", "dearer", "మరింత ప్రియమైనవాడు", "अधिक प्रिय", V, "प्रियस्थिर… (6.4.157): प्रिय → प्र")],
    "TP-000015": [ex("वृद्ध", "ज्येष्ठः", "eldest", "అందరికన్నా పెద్దవాడు", "सबसे बड़ा", V,
                     "वृद्धस्य च (5.3.62): वृद्ध → ज्य. Also वर्षिष्ठः (6.4.157)."),
                  ex("प्रिय", "प्रेष्ठः", "dearest", "అత్యంత ప్రియుడు", "सबसे प्रिय", V, "प्रियस्थिर… (6.4.157): प्रिय → प्र")],
    "TP-000021": [ex("एतद्", "अत्र", "here", "ఇక్కడ", "यहाँ", V, "एतदोऽश् (5.3.5): एतद् → अ. (इदम् + त्रल् gives इह, by इदमो हः 5.3.11.)")],
    "TP-000040": [ex("एक", "एकशः", "one by one", "ఒక్కొక్కటిగా", "एक-एक करके", V, "संख्यैकवचनाच्च वीप्सायाम् (5.4.43)")],
    "TP-000041": [ex("पण्डित", "पाण्डित्यम्", "learning, scholarship", "పాండిత్యము", "पाण्डित्य, विद्वत्ता", SU)],
}

# ── 2. new suffixes ─────────────────────────────────────────────────────────
def suf(id, p, g, lv, it, rem, eff, sutra, num, vidh, m, rules, exs):
    return {"id": id, "p": p, "g": g, "lv": lv, "it": it, "rem": rem, "eff": eff, "sutra": sutra, "num": num,
            "vidh": vidh, "m": m, "rules": rules, "ex": exs}

NEW = [
  suf("TP-000056", "ण्य", "apatya", "intermediate", "ण्", "य",
      "ण्-marker: vṛddhi of the first vowel (तद्धितेष्वचामादेः 7.2.117); the final इ of the stem drops (यस्येति च 6.4.148).",
      "दित्यदित्यादित्यपत्युत्तरपदाण्ण्यः", "4.1.85", "",
      {"sa": "दिति-अदिति-आदित्य-पत्युत्तरपदेभ्यः अपत्यादिषु ण्यः", "en": "son / descendant of Diti, Aditi, or of a name ending in -pati",
       "te": "దితి, అదితి, -పతి అంతమగు శబ్దముల సంతానము", "hi": "दिति, अदिति या -पति अन्त वाले शब्द की संतान"},
      ["Before ण्य, the first vowel takes vṛddhi: दि → दै, अ → आ, प्र → प्रा, बृ → बा(र्).",
       "The final इ of दिति, अदिति, प्रजापति drops (यस्येति च 6.4.148)."],
      [ex("दिति", "दैत्यः", "son of Diti (a daitya)", "దితి కుమారుడు (దైత్యుడు)", "दिति का पुत्र (दैत्य)", V),
       ex("अदिति", "आदित्यः", "son of Aditi (an āditya)", "అదితి కుమారుడు (ఆదిత్యుడు)", "अदिति का पुत्र (आदित्य)", V),
       ex("प्रजापति", "प्राजापत्यः", "descendant of Prajāpati", "ప్రజాపతి వంశజుడు", "प्रजापति का वंशज", V),
       ex("बृहस्पति", "बार्हस्पत्यः", "descendant / follower of Bṛhaspati", "బృహస్పతి సంబంధి", "बृहस्पति से सम्बन्धित", V)]),
  suf("TP-000057", "अञ्", "apatya", "intermediate", "ञ्", "अ",
      "ञ्-marker: vṛddhi of the first vowel (7.2.117); final अ drops (6.4.148); final उ → ओ → अव् (ओर्गुणः 6.4.146, 6.1.78).",
      "अनृष्यानन्तर्ये बिदादिभ्योऽञ्", "4.1.104", "Only for the words of the बिदादि list, in the गोत्र sense.",
      {"sa": "बिदादिभ्यः गोत्रापत्ये अञ्", "en": "descendant (gotra) of — for names in the Bida list",
       "te": "బిదాది శబ్దముల గోత్రాపత్యము", "hi": "बिदादि शब्दों से गोत्रापत्य (वंशज)"},
      ["The first vowel takes vṛddhi: क → का, भ → भा, उ → औ.",
       "उपमन्यु: उ → ओ (6.4.146) → अव् (6.1.78): औपमन्यवः."],
      [ex("कश्यप", "काश्यपः", "descendant of Kaśyapa", "కశ్యపుని గోత్రజుడు", "कश्यप का वंशज", V),
       ex("भरद्वाज", "भारद्वाजः", "descendant of Bharadvāja", "భరద్వాజుని గోత్రజుడు", "भरद्वाज का वंशज", V),
       ex("उपमन्यु", "औपमन्यवः", "descendant of Upamanyu", "ఉపమన్యుని గోత్రజుడు", "उपमन्यु का वंशज", V)]),
  suf("TP-000058", "फक्", "apatya", "expert", "क्", "आयन",
      "फ → आयन् (आयनेयीनीयियः फढखच्छघां प्रत्ययादीनाम् 7.1.2); कित्: vṛddhi of the first vowel (किति च 7.2.118); final अ drops (6.4.148).",
      "नडादिभ्यः फक्", "4.1.99", "Only for the words of the नडादि list, in the गोत्र sense.",
      {"sa": "नडादिभ्यः गोत्रापत्ये फक्", "en": "descendant (gotra) of — for names in the Naḍa list",
       "te": "నడాది శబ్దముల గోత్రాపత్యము", "hi": "नडादि शब्दों से गोत्रापत्य"},
      ["फ is replaced by आयन (7.1.2).", "चर → चारायणः: न → ण after र् (अट्कुप्वाङ्नुम्व्यवायेऽपि 8.4.2)."],
      [ex("नड", "नाडायनः", "descendant of Naḍa", "నడుని గోత్రజుడు", "नड का वंशज", V),
       ex("चर", "चारायणः", "descendant of Cara (Cārāyaṇa)", "చరుని గోత్రజుడు (చారాయణుడు)", "चर का वंशज (चारायण)", V)]),
  suf("TP-000059", "घ", "apatya", "intermediate", "", "इय",
      "घ → इय् (7.1.2); no marker, so no vṛddhi; final अ drops (6.4.148).",
      "क्षत्राद्घः; राष्ट्रावारपाराद्घखौ", "4.1.138, 4.2.93", "",
      {"sa": "क्षत्रात् अपत्ये घः; राष्ट्रात् शैषिके घः", "en": "born of (क्षत्र); of, belonging to (राष्ट्र)",
       "te": "క్షత్రము నుండి పుట్టినవాడు; రాష్ట్రమునకు సంబంధించినవాడు", "hi": "क्षत्र से उत्पन्न; राष्ट्र से सम्बन्धित"},
      ["घ is replaced by इय (7.1.2): क्षत्र + इय → क्षत्रियः.", "राष्ट्रियः is शैषिक (4.2.93), not अपत्य."],
      [ex("क्षत्र", "क्षत्रियः", "a kṣatriya (of the ruling class)", "క్షత్రియుడు", "क्षत्रिय", V),
       ex("राष्ट्र", "राष्ट्रियः", "of the kingdom, national", "రాష్ట్రమునకు సంబంధించిన", "राष्ट्र का, राष्ट्रीय", V)]),
  suf("TP-000060", "ढञ्", "sambandha", "intermediate", "ञ्", "एय",
      "ढ → एय् (7.1.2); ञ्-marker: vṛddhi of the first vowel (7.2.117); final vowel drops (6.4.148).",
      "कोशाड्ढञ्; चतुष्पाद्भ्यो ढञ्", "4.3.42, 4.1.135", "",
      {"sa": "कोशात् सम्भूते ढञ्; चतुष्पाद्भ्यः अपत्ये ढञ्", "en": "produced from (a cocoon); young of (a four-footed animal)",
       "te": "కోశమునుండి పుట్టినది; చతుష్పాదముల సంతానము", "hi": "कोश से उत्पन्न; चौपायों की संतान"},
      ["ढ is replaced by एय (7.1.2).", "The first vowel takes vṛddhi: को → कौ, क → का."],
      [ex("कोश", "कौशेयम्", "silk (from the cocoon)", "పట్టు వస్త్రము", "रेशम, कौशेय", V),
       ex("कमण्डलु", "कामण्डलेयः", "young of the animal named Kamaṇḍalu", "కమండలు అను జంతువు సంతానము", "कमण्डलु नामक पशु की संतान", V)]),
  suf("TP-000061", "यक्", "bhava", "intermediate", "क्", "य",
      "कित्: vṛddhi of the first vowel (किति च 7.2.118); final इ / अ drops (6.4.148).",
      "पत्यन्तपुरोहितादिभ्यो यक्", "5.1.128", "In the sense of 5.1.124: state or office (भावे कर्मणि च).",
      {"sa": "पत्यन्तेभ्यः पुरोहितादिभ्यश्च भावे कर्मणि च यक्", "en": "the office or state of (words ending in -pati, and पुरोहित etc.)",
       "te": "-పతి అంతమగు శబ్దముల పదవి / భావము", "hi": "-पति अन्त वाले शब्दों का पद या भाव"},
      ["The first vowel takes vṛddhi: अ → आ, पु → पौ, से → सै.", "The final इ / अ drops before य (6.4.148)."],
      [ex("अधिपति", "आधिपत्यम्", "lordship, supremacy", "ఆధిపత్యము", "आधिपत्य, स्वामित्व", SU),
       ex("पुरोहित", "पौरोहित्यम्", "the office of a purohita", "పౌరోహిత్యము", "पौरोहित्य", SU),
       ex("सेनापति", "सैनापत्यम्", "command of an army", "సైన్యాధిపత్యము", "सेनापतित्व", SU)]),
  suf("TP-000062", "अण् (भावे)", "bhava", "intermediate", "ण्", "अ",
      "ण्-marker: vṛddhi of the first vowel (7.2.117); final इ drops (6.4.148), final उ → ओ → अव् (6.4.146, 6.1.78).",
      "इगन्ताच्च लघुपूर्वात्", "5.1.131", "For stems ending in इ / उ / ऋ whose earlier syllable is light.",
      {"sa": "इगन्तात् लघुपूर्वात् भावे कर्मणि च अण्", "en": "-ness (from stems in इ / उ / ऋ after a light syllable)",
       "te": "భావము (ఇ/ఉ/ఋ అంతమగు శబ్దములకు)", "hi": "भाव (इ/उ/ऋ अन्त वाले शब्दों से)"},
      ["शुचि: शु → शौ, the final इ drops → शौचम्.", "लघु: ल → ला, उ → ओ → अव् → लाघवम्."],
      [ex("शुचि", "शौचम्", "purity, cleanliness", "శౌచము, శుచిత్వము", "शौच, पवित्रता", SU),
       ex("मुनि", "मौनम्", "silence (the state of a muni)", "మౌనము", "मौन", SU),
       ex("लघु", "लाघवम्", "lightness, skill", "లాఘవము", "लाघव", SU),
       ex("गुरु", "गौरवम्", "weight, respect", "గౌరవము", "गौरव", SU),
       ex("पटु", "पाटवम्", "skill, cleverness", "పాటవము, నైపుణ్యము", "पटुता", SU)]),
  suf("TP-000063", "र्हिल्", "avyaya", "expert", "ल्", "र्हि",
      "An avyaya of time. इदम् → एत (एतेतौ रथोः 5.3.4); किम् → क (किमः कः 7.2.103).",
      "इदमो र्हिल्; अनद्यतने र्हिलन्यतरस्याम्", "5.3.16, 5.3.21", "",
      {"sa": "काले र्हिल्", "en": "at that time (then, when)", "te": "ఆ సమయమున", "hi": "उस समय"},
      ["इदम् + र्हिल् → एतर्हि (now).", "तद्, यद्, किम् + र्हिल् (not of today: अनद्यतने) → तर्हि, यर्हि, कर्हि."],
      [ex("इदम्", "एतर्हि", "now, at this time", "ఇప్పుడు", "अब, इस समय", V),
       ex("तद्", "तर्हि", "then, in that case", "అప్పుడు, అట్లయినచో", "तब, तो", V),
       ex("यद्", "यर्हि", "when", "ఎప్పుడైతే", "जब", V),
       ex("किम्", "कर्हि", "when?", "ఎప్పుడు?", "कब?", V)]),
  suf("TP-000064", "अकच्", "vishesha", "expert", "च्", "अक",
      "Not added at the end: it goes in before the last vowel and what follows it (the टि), प्राक् टेः.",
      "अव्ययसर्वनाम्नामकच् प्राक् टेः", "5.3.71", "In the senses of 5.3.70 onwards (small, unknown, pitied…).",
      {"sa": "अव्ययानां सर्वनाम्नां च टेः प्राक् अकच्", "en": "small / unknown / pitied — for pronouns and avyayas, inserted inside the word",
       "te": "సర్వనామములకు అవ్యయములకు టి కి ముందు అకచ్", "hi": "सर्वनाम और अव्यय में टि से पहले अकच्"},
      ["सर्वे → सर्वके: अक goes in before the last vowel.", "उच्चैः → उच्चकैः, नीचैः → नीचकैः."],
      [ex("सर्व", "सर्वके", "all (these little ones)", "అందరు (అల్పార్థము)", "सब (अल्पार्थ में)", V),
       ex("उच्चैस्", "उच्चकैः", "rather high, loudly", "కొంచెము ఎత్తుగా", "कुछ ऊँचे", SU),
       ex("नीचैस्", "नीचकैः", "rather low", "కొంచెము క్రిందుగా", "कुछ नीचे", SU)]),
  suf("TP-000065", "डाच्", "cvi", "expert", "ड् च्", "आ",
      "With कृ, भू, अस् after an imitative sound of at least two syllables; the sound is doubled and the टि drops (डित्).",
      "अव्यक्तानुकरणाद्द्व्यजवरार्धादनितौ डाच्", "5.4.57", "",
      {"sa": "अव्यक्तानुकरणात् कृभ्वस्तियोगे डाच्", "en": "making a sound (imitative word + कृ / भू)",
       "te": "ధ్వనిని అనుకరించుట", "hi": "ध्वनि का अनुकरण"},
      ["पटत् + डाच् → doubled (डाचि बहुलं द्वे भवतः, vārttika): पटत्पटत् + आ.",
       "डित्: the टि (अत्) of the second half drops; नित्यमाम्रेडिते डाचि (6.1.100): त् + प → प: पटपटा + करोति."],
      [ex("पटत्", "पटपटाकरोति", "makes a crackling sound", "పటపట అని శబ్దము చేయును", "पटपट की आवाज़ करता है", SU)]),
  # ── समासान्ताः: added at the end of compounds ──
  suf("TP-000066", "टच्", "samasanta", "expert", "ट् च्", "अ",
      "राजन्: the टि (अन्) drops (नस्तद्धिते 6.4.144); सखि: the इ drops (6.4.148). महत् → महा (आन्महतः… 6.3.46).",
      "राजाऽहस्सखिभ्यष्टच्", "5.4.91", "In a tatpuruṣa ending in राजन्, अहन् or सखि.",
      {"sa": "राजन्-अहन्-सख्यन्तात् तत्पुरुषात् टच्", "en": "compound-final -a after राजन्, अहन्, सखि",
       "te": "రాజన్, అహన్, సఖి అంతమగు తత్పురుషమునకు టచ్", "hi": "राजन्, अहन्, सखि अन्त वाले तत्पुरुष में टच्"},
      ["महान् राजा → महाराजः, not *महाराजा.", "कृष्णस्य सखा → कृष्णसखः."],
      [ex("महत् + राजन्", "महाराजः", "great king", "మహారాజు", "महाराज", SU),
       ex("कृष्ण + सखि", "कृष्णसखः", "Kṛṣṇa's friend (Arjuna)", "కృష్ణుని స్నేహితుడు", "कृष्ण का सखा", SU)]),
  suf("TP-000067", "अ (समासान्तः)", "samasanta", "expert", "", "अ",
      "Added at the end of a compound ending in ऋच्, पुर्, अप्, धुर् or पथिन् (except धुर् of an axle, अक्षे).",
      "ऋक्पूरप्धूःपथामानक्षे", "5.4.74", "",
      {"sa": "ऋक्-पुर्-अप्-धुर्-पथिन्-अन्तात् समासात् अः", "en": "compound-final -a after ऋच्, पुर्, अप्, धुर्, पथिन्",
       "te": "ఋచ్, పుర్, అప్, ధుర్, పథిన్ అంతమగు సమాసమునకు అ", "hi": "ऋच्, पुर्, अप्, धुर्, पथिन् अन्त वाले समास में अ"},
      ["अर्धम् ऋचः → अर्धर्चः.", "विष्णोः पूः → विष्णुपुरम्."],
      [ex("अर्ध + ऋच्", "अर्धर्चः", "half a verse", "అర్ధ ఋక్కు", "आधी ऋचा", SU),
       ex("विष्णु + पुर्", "विष्णुपुरम्", "Viṣṇu's city", "విష్ణుపురము", "विष्णुपुर", SU)]),
  suf("TP-000068", "कप्", "samasanta", "expert", "प्", "क",
      "Added at the end of a bahuvrīhi ending in उरस् etc., or in a नदी word or ऋ.",
      "उरःप्रभृतिभ्यः कप्; नद्यृतश्च", "5.4.151, 5.4.153", "",
      {"sa": "बहुव्रीहौ उरःप्रभृतिभ्यः नद्यृदन्तेभ्यश्च कप्", "en": "compound-final -ka in a bahuvrīhi",
       "te": "బహువ్రీహి సమాసాంత కప్", "hi": "बहुव्रीहि समास के अन्त में कप्"},
      ["व्यूढम् उरः यस्य सः → व्यूढोरस्कः.", "बहवः कर्तारः यस्मिन् → बहुकर्तृकः."],
      [ex("व्यूढ + उरस्", "व्यूढोरस्कः", "broad-chested", "విశాలమైన వక్షస్సు గలవాడు", "चौड़ी छाती वाला", SU),
       ex("बहु + कर्तृ", "बहुकर्तृकः", "having many doers", "అనేక కర్తలు గలది", "अनेक कर्ताओं वाला", SU)]),
  suf("TP-000069", "षच्", "samasanta", "expert", "ष् च्", "अ",
      "षित्: the feminine takes ङीष् (षिद्गौरादिभ्यश्च 4.1.41): जलजाक्षी.",
      "बहुव्रीहौ सक्थ्यक्ष्णोः स्वाङ्गात् षच्", "5.4.113", "",
      {"sa": "बहुव्रीहौ स्वाङ्गवाचिभ्यां सक्थि-अक्षिभ्यां षच्", "en": "compound-final -a after सक्थि (thigh), अक्षि (eye) as body parts",
       "te": "సక్థి, అక్షి అంతమగు బహువ్రీహికి షచ్", "hi": "सक्थि, अक्षि अन्त वाले बहुव्रीहि में षच्"},
      ["दीर्घे सक्थिनी यस्य → दीर्घसक्थः.", "जलजे इव अक्षिणी यस्याः → जलजाक्षी."],
      [ex("दीर्घ + सक्थि", "दीर्घसक्थः", "long-thighed", "పొడవైన తొడలు గలవాడు", "लम्बी जाँघों वाला", SU),
       ex("जलज + अक्षि", "जलजाक्षी", "lotus-eyed (woman)", "కమలాక్షి", "कमलनयनी", SU)]),
  suf("TP-000070", "असिच्", "samasanta", "expert", "च्", "अस्",
      "After नञ्, सु, दुस् (from 5.4.121), at the end of a bahuvrīhi ending in प्रजा or मेधा.",
      "नित्यमसिच् प्रजामेधयोः", "5.4.122", "",
      {"sa": "नञ्दुःसुभ्यः प्रजामेधान्तात् बहुव्रीहेः असिच्", "en": "compound-final -as after प्रजा, मेधा (with अ-, सु-, दुस्-)",
       "te": "ప్రజా, మేధా అంతమగు బహువ్రీహికి అసిచ్", "hi": "प्रजा, मेधा अन्त वाले बहुव्रीहि में असिच्"},
      ["शोभना मेधा यस्य → सुमेधस् → सुमेधाः.", "दुष्टा मेधा यस्य → दुर्मेधाः."],
      [ex("सु + मेधा", "सुमेधाः", "intelligent", "మంచి మేధ గలవాడు", "बुद्धिमान्", SU),
       ex("दुस् + मेधा", "दुर्मेधाः", "dull-witted", "మందబుద్ధి", "मन्दबुद्धि", SU),
       ex("सु + प्रजा", "सुप्रजाः", "having good offspring", "మంచి సంతానము గలవాడు", "उत्तम संतान वाला", SU)]),
  suf("TP-000071", "अनिच्", "samasanta", "expert", "च्", "अन्",
      "At the end of a bahuvrīhi whose last word is धर्म alone (केवलात्).",
      "धर्मादनिच् केवलात्", "5.4.124", "",
      {"sa": "केवलात् धर्मात् बहुव्रीहौ अनिच्", "en": "compound-final -an after धर्म",
       "te": "ధర్మ అంతమగు బహువ్రీహికి అనిచ్", "hi": "धर्म अन्त वाले बहुव्रीहि में अनिच्"},
      ["कल्याणः धर्मः यस्य → कल्याणधर्मन् → कल्याणधर्मा."],
      [ex("कल्याण + धर्म", "कल्याणधर्मा", "of virtuous nature", "శుభ ధర్మము గలవాడు", "कल्याणकारी धर्म वाला", SU),
       ex("सु + धर्म", "सुधर्मा", "righteous", "సుధర్ముడు", "सुधर्मा, धर्मात्मा", SU)]),
]

# ── 3. a correction to an existing suffix ───────────────────────────────────
# यत् had no इत् letter listed: its final त् is इत् (हलन्त्यम् 1.3.3; तित् → svarita accent, तित्स्वरितम् 6.1.185)
FIX_IT = {"TP-000038": "त्"}

GROUPS = {"samasanta": ["समासान्ताः", "Added at the end of compounds"]}

# ── 4. the adhikāra map (start sūtra, first and last sūtra of the section) ──────
# last = the sūtra before the next heading (4.4.2 तेन दीव्यति…, 4.4.76, 5.1.37, 5.3.27, 5.4.68 …)
MAP = [
  {"s": "तद्धिताः", "n": "4.1.76", "a": "4.1.76", "z": "5.4.160", "p": "", "en": "all taddhita suffixes: to the end of the 5th adhyāya", "ex": ""},
  {"s": "प्राग्दीव्यतोऽण्", "n": "4.1.83", "a": "4.1.83", "z": "4.4.1", "p": "अण्", "en": "the default suffix up to तेन दीव्यति… (4.4.2)", "ex": "शैवः, औपगवः"},
  {"s": "तस्यापत्यम्", "n": "4.1.92", "a": "4.1.92", "z": "4.1.178", "p": "अण्, इञ्, ढक्, यञ्…", "en": "son, descendant", "ex": "दाशरथिः, कौन्तेयः, गार्ग्यः"},
  {"s": "तदस्मिन्नस्तीति देशे तन्नाम्नि", "n": "4.2.67", "a": "4.2.67", "z": "4.2.91", "p": "अण्…", "en": "the four place-name senses (चातुरर्थिकाः)", "ex": ""},
  {"s": "शेषे", "n": "4.2.92", "a": "4.2.92", "z": "4.3.133", "p": "अण्, छ, ठञ्, त्यप्…", "en": "the remaining relations: of, from, born in, found in (शैषिकाः)", "ex": "शालीयः, दैनिकम्, तत्रत्यः"},
  {"s": "तस्य विकारः", "n": "4.3.134", "a": "4.3.134", "z": "4.3.168", "p": "अण्, मयट्…", "en": "made of, a product of", "ex": "मृण्मयः"},
  {"s": "प्राग्वहतेष्ठक्", "n": "4.4.1", "a": "4.4.2", "z": "4.4.74", "p": "ठक्", "en": "plays with, lives by, does (up to तद्वहति… 4.4.76)", "ex": "आक्षिकः, धार्मिकः"},
  {"s": "प्राग्घिताद्यत्", "n": "4.4.75", "a": "4.4.76", "z": "5.1.4", "p": "यत्", "en": "bears, fit for (up to तस्मै हितम् 5.1.5)", "ex": "धुर्यः"},
  {"s": "प्राक्क्रीताच्छः", "n": "5.1.1", "a": "5.1.1", "z": "5.1.36", "p": "छ", "en": "good for, meant for (up to तेन क्रीतम् 5.1.37)", "ex": ""},
  {"s": "तस्य भावस्त्वतलौ", "n": "5.1.119", "a": "5.1.119", "z": "5.1.136", "p": "त्व, तल्, इमनिच्, ष्यञ्…", "en": "-ness: the abstract noun", "ex": "लघुत्वम्, सौन्दर्यम्, महिमा"},
  {"s": "तदस्यास्त्यस्मिन्निति मतुप्", "n": "5.2.94", "a": "5.2.94", "z": "5.2.140", "p": "मतुप्, इनि, ठन्, विनि…", "en": "having, possessing (मत्वर्थीयाः)", "ex": "गुणवान्, धनी, तपस्वी"},
  {"s": "प्राग्दिशो विभक्तिः", "n": "5.3.1", "a": "5.3.1", "z": "5.3.26", "p": "तसिल्, त्रल्, दा, थाल्…", "en": "adverbs from pronouns: from, where, when, how", "ex": "ततः, तत्र, तदा, तथा"},
  {"s": "अतिशायने तमबिष्ठनौ", "n": "5.3.55", "a": "5.3.55", "z": "5.3.65", "p": "तमप्, इष्ठन्, तरप्, ईयसुन्", "en": "more and most", "ex": "प्रियतमः, श्रेष्ठः, गरीयान्"},
  {"s": "कृभ्वस्तियोगे सम्पद्यकर्तरि च्विः", "n": "5.4.50", "a": "5.4.50", "z": "5.4.67", "p": "च्वि, सात्, त्रा, डाच्", "en": "becoming, turning into", "ex": "शुक्लीभवति, भस्मसात्"},
  {"s": "समासान्ताः", "n": "5.4.68", "a": "5.4.68", "z": "5.4.160", "p": "टच्, अ, कप्, षच्…", "en": "added at the end of compounds", "ex": "महाराजः, व्यूढोरस्कः"},
]
PADAS = [["4.1", 76, 178], ["4.2", 1, 145], ["4.3", 1, 168], ["4.4", 1, 144],
         ["5.1", 1, 136], ["5.2", 1, 140], ["5.3", 1, 119], ["5.4", 1, 160]]   # 1,115 sūtras

INTRO_ADD = ("तद्धिताः (4.1.76) is a heading that runs to the end of the fifth adhyāya (5.4.160): 1,115 sūtras. "
             "Inside it, headings like प्राग्दीव्यतोऽण् (4.1.83) give a default suffix and the sūtras that follow give its exceptions.")
