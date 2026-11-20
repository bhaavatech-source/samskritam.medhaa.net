"""data-source/04-taddhita/corrections_2026-11-20.py — corrections to the तद्धित entries of
taddhita_pratyaya_2026-11-15.json (that file is not edited). Read by tools/build_grammar.py after additions_2026-11-19.py.

Found in a check of every sūtra citation of the site against the sūtrapāṭha (20-11-2026):
  * TP-000011 … TP-000040 carried generated filler ("Pāṇinian affix operation via Sūtra …",
    "Morphological stem transformation and Sandhi applied.") and, in several, wrong numbers or invented sūtra texts:
      कृत्वसुच् cited 5.3.35 "संख्यायाः कृत्वसुच्" (it is 5.4.17), सुच् 5.3.43 (5.4.18), थमु "किमो त्थम्" (not a sūtra:
      5.3.24 इदमस्थमुः, 5.3.25 किमश्च), सात् "तदधीनं वचनं सात्" (5.4.52 विभाषा साति कार्त्स्न्ये; 5.4.54 तदधीनवचने),
      त्रा 5.4.55 "देवमनुष्यादिभ्यः त्रा" (5.4.56), दा "सर्वैकतदन्ययत्तत्कालेभ्यो दा" (5.3.15 सर्वैकान्यकिंयत्तदः काले दा),
      शस् "बहुबहुवचने शस्" (5.4.43 संख्यैकवचनाच्च वीप्सायाम्), विनि "विन्ौ", आलुच् "शीतोष्णाभ्याम् आलुच्" (a vārttika),
      तरप्/ईयसुन् "तरप्रीयसौ" (5.3.57 …तरबीयसुनौ), तमप्/इष्ठन् "अतिशयाने" (अतिशायने), कल्पप् "…देशीयः" (…देशीयरः).
    Each now has its effect, its sense label and the rules that form its examples, with the right sūtras.
  * TP-000003 ढक्, TP-000010 ठक्: "K-it marker causes Vṛddhi (किञ्च 7.3.51)" — the rule is किति च 7.2.118
    (7.3.51 इसुसुक्तान्तात् कः is about ठ → क).
  * TP-000020 तसिल्: इतः has इ by इदम इश् 5.3.3, not 5.3.4.
  * TP-000039 आलुच्: the sense is "who cannot bear" (शीतालुः, उष्णालुः), not "disposed to".
"""

FIX = {
  "TP-000003": {
    "eff": "क् is इत् (हलन्त्यम् 1.3.3), and कित्: the first vowel takes vṛddhi (किति च 7.2.118). ढ → एय् (आयनेयीनीयियः फढखच्छघां प्रत्ययादीनाम् 7.1.2).",
    "rules": ["ढ is replaced by एय (7.1.2).", "कित्: the first vowel takes vṛddhi (किति च 7.2.118): उ → औ, इ → ऐ, अ → आ.",
              "A final ई / आ of the stem drops (यस्येति च 6.4.148)."]},
  "TP-000010": {
    "eff": "ठ → इक (ठस्येकः 7.3.50). क् is इत्, and कित्: the first vowel takes vṛddhi (किति च 7.2.118)."},
  "TP-000011": {
    "eff": "च् is इत्. The last vowel of the stem with what follows it (the टि) drops (टेः 6.4.155).",
    "sa": "भावार्थकः (पुंलिङ्गः)",
    "rules": ["पृथ्वादिभ्य इमनिज्वा (5.1.122): after the words of the पृथु list, optionally, for “-ness”; the word is masculine: महिमा, लघिमा.",
              "टेः (6.4.155): the टि drops: महत् → महिमा, लघु → लघिमा.",
              "र ऋतो हलादेर्लघोः (6.4.161): पृथु → प्रथिमा, मृदु → म्रदिमा; गुरु → गर् (प्रियस्थिर… 6.4.157): गरिमा.",
              "Because of वा, त्व and तल् are also used: लघुत्वम्, लघुता."]},
  "TP-000012": {
    "eff": "प् is इत्; nothing changes in the stem.",
    "sa": "तुलनार्थकः (द्वयोः)",
    "rules": ["द्विवचनविभज्योपपदे तरबीयसुनौ (5.3.57): “more”, of two, or of one group against another: सुन्दरतरः.",
              "तरप् goes after any adjective; the stem does not change."]},
  "TP-000013": {
    "eff": "प् is इत्; nothing changes in the stem.",
    "sa": "तुलनार्थकः (बहूनाम्)",
    "rules": ["अतिशायने तमबिष्ठनौ (5.3.55): “most”, the highest among many: सुन्दरतमः, प्रियतमः.",
              "तमप् goes after any adjective; the stem does not change."]},
  "TP-000014": {
    "eff": "उ and न् are इत्. The टि of the stem drops (टेः 6.4.155).",
    "sa": "तुलनार्थकः (द्वयोः, गुणवचनात्)",
    "rules": ["द्विवचनविभज्योपपदे तरबीयसुनौ (5.3.57), only after a word for a quality (अजादी गुणवचनादेव 5.3.58): लघीयान्, गरीयान्.",
              "टेः (6.4.155): लघु → लघ् + ईयस्. Masculine nominative -ईयान् (नुम् 7.1.70; सान्तमहतः संयोगस्य 6.4.10).",
              "प्रशस्य → श्र (प्रशस्यस्य श्रः 5.3.60): श्रेयान्; गुरु → गर्, प्रिय → प्र (6.4.157): गरीयान्, प्रेयान्; बहु → भू (6.4.158): भूयान्; वृद्ध → ज्य (5.3.62): ज्यायान्."]},
  "TP-000015": {
    "eff": "न् is इत्. The टि of the stem drops (टेः 6.4.155).",
    "sa": "तुलनार्थकः (बहूनाम्, गुणवचनात्)",
    "rules": ["अतिशायने तमबिष्ठनौ (5.3.55), only after a word for a quality (अजादी गुणवचनादेव 5.3.58): लघिष्ठः, गरिष्ठः.",
              "टेः (6.4.155): महत् → महिष्ठः, लघु → लघिष्ठः.",
              "As with ईयसुन्: श्रेष्ठः (5.3.60), गरिष्ठः, प्रेष्ठः (6.4.157), ज्येष्ठः (5.3.62); बहु → भू + यिट् (6.4.158, इष्ठस्य यिट् च 6.4.159): भूयिष्ठः."]},
  "TP-000016": {
    "eff": "ट् is इत्: the feminine is in ङीप् (टिड्ढाणञ्… 4.1.15): -मयी.",
    "sa": "विकारार्थकः · प्राचुर्यार्थकः",
    "rules": ["मयड्वैतयोर्भाषायामभक्ष्याच्छादनयोः (4.3.143): “made of”: स्वर्णमयः, मृण्मयः.",
              "तत्प्रकृतवचने मयट् (5.4.21): “consisting mostly of”: अन्नमयः, आनन्दमयः.",
              "Before म a final stop may become nasal (यरोऽनुनासिकेऽनुनासिको वा 8.4.45): मृद् → मृन्- → मृण्मयः (ण after ऋ)."]},
  "TP-000017": {
    "eff": "प् is इत्; nothing changes in the stem.",
    "sa": "ईषदसमाप्त्यर्थकः",
    "rules": ["ईषदसमाप्तौ कल्पब्देश्यदेशीयरः (5.3.67): “almost, nearly”: पटुकल्पः, मृतकल्पः “all but dead”.",
              "देश्य and देशीयर् have the same sense: पटुदेश्यः, पटुदेशीयः."]},
  "TP-000018": {
    "eff": "प् is इत्; nothing changes in the stem (a final त् becomes द् before र: विद्वद्रूपः, 8.2.39).",
    "sa": "प्रशंसार्थकः",
    "rules": ["प्रशंसायां रूपप् (5.3.66): “an excellent …”: वैयाकरणरूपः “an excellent grammarian”, पटुरूपः."]},
  "TP-000019": {
    "eff": "प् is इत्; nothing changes in the stem.",
    "sa": "निन्दार्थकः (याप्ये)",
    "rules": ["याप्ये पाशप् (5.3.47): “a poor, contemptible …”: भिषक्पाशः “a quack”, वैयाकरणपाशः."]},
  "TP-000020": {
    "eff": "ल् is इत् and the इ is for pronunciation: what joins is तस्. The word is an avyaya (तद्धितश्चासर्वविभक्तिः 1.1.38).",
    "sa": "पञ्चम्यर्थकम् अव्ययम्",
    "rules": ["पञ्चम्यास्तसिल् (5.3.7): in the sense of the fifth case, after pronouns and बहु (किंसर्वनामबहुभ्योऽद्व्यादिभ्यः 5.3.2): ततः, सर्वतः, यतः.",
              "किम् → कु (कु तिहोः 7.2.104): कुतः; इदम् → इ (इदम इश् 5.3.3): इतः."]},
  "TP-000021": {
    "eff": "ल् is इत्: what joins is त्र. An avyaya (1.1.38).",
    "sa": "सप्तम्यर्थकम् अव्ययम्",
    "rules": ["सप्तम्यास्त्रल् (5.3.10): in the sense of the seventh case, after pronouns: तत्र, यत्र, सर्वत्र, अन्यत्र.",
              "किम् → कु (7.2.104): कुत्र; एतद् → अ (एतदोऽश् 5.3.5): अत्र. इदम् takes ह instead (इदमो हः 5.3.11): इह."]},
  "TP-000022": {
    "eff": "दा joins as it is. An avyaya (1.1.38).",
    "sa": "कालार्थकम् अव्ययम्",
    "rules": ["सर्वैकान्यकिंयत्तदः काले दा (5.3.15): after सर्व, एक, अन्य, किम्, यद्, तद्, in the sense of time: सर्वदा, एकदा, अन्यदा, यदा, तदा.",
              "किम् → क (किमः कः 7.2.103): कदा."]},
  "TP-000023": {
    "eff": "ल् is इत्: what joins is था. An avyaya (1.1.38).",
    "sa": "प्रकारार्थकम् अव्ययम्",
    "rules": ["प्रकारवचने थाल् (5.3.23): “in that manner”: यथा, तथा, सर्वथा, अन्यथा."]},
  "TP-000024": {
    "eff": "उ is इत्: what joins is थम्. An avyaya (1.1.38).",
    "sa": "प्रकारार्थकम् अव्ययम्",
    "rules": ["इदमस्थमुः (5.3.24): इदम् → इत् before थ (एतेतौ रथोः 5.3.4): इत्थम् “thus”.",
              "किमश्च (5.3.25): किम् → क (किमः कः 7.2.103): कथम् “how”."]},
  "TP-000025": {
    "eff": "धा joins as it is. An avyaya (1.1.38).",
    "sa": "संख्यायाः प्रकारार्थकम् अव्ययम्",
    "rules": ["संख्याया विधार्थे धा (5.3.42): after a number, “in so many ways”: एकधा, द्विधा, त्रिधा, शतधा; बहु counts as a number (बहुगणवतुडति संख्या 1.1.23): बहुधा."]},
  "TP-000026": {
    "eff": "च् is इत्: what joins is कृत्वस्, with visarga at the end (-कृत्वः). An avyaya (1.1.38).",
    "sa": "क्रियाभ्यावृत्तिगणनम्",
    "rules": ["संख्यायाः क्रियाऽभ्यावृत्तिगणने कृत्वसुच् (5.4.17): how many times an action is done: पञ्चकृत्वः, शतकृत्वः.",
              "द्वि, त्रि, चतुर् take सुच् instead (5.4.18): द्विः, त्रिः, चतुः."]},
  "TP-000027": {
    "eff": "च् is इत्: what joins is स्, which becomes visarga. An avyaya (1.1.38).",
    "sa": "क्रियाभ्यावृत्तिगणनम्",
    "rules": ["द्वित्रिचतुर्भ्यः सुच् (5.4.18), in the sense of 5.4.17: द्विः “twice”, त्रिः “thrice”.",
              "After चतुर् the स् drops (रात् सस्य 8.2.24) and र् becomes visarga: चतुः."]},
  "TP-000028": {
    "eff": "The इ is for pronunciation: what joins is वत्. An avyaya (1.1.38).",
    "sa": "सादृश्यार्थकम् अव्ययम्",
    "rules": ["तेन तुल्यं क्रिया चेद्वतिः (5.1.115): “acts like”: राजवत् (राज्ञा तुल्यम्), पुत्रवत्, ब्राह्मणवत्.",
              "तत्र तस्येव (5.1.116): also “as in / as of”: पितृवत्.",
              "राजन् → राज (नलोपः प्रातिपदिकान्तस्य 8.2.7)."]},
  "TP-000029": {
    "eff": "च् and the इ are इत्; the remaining व् drops (वेरपृक्तस्य 6.1.67), so nothing of the suffix is heard.",
    "sa": "अभूततद्भावे (5.4.50, वार्त्तिकम्)"},
  "TP-000030": {
    "eff": "सात् joins as it is. An avyaya (1.1.38).",
    "sa": "कार्त्स्न्ये · तदधीने",
    "rules": ["विभाषा साति कार्त्स्न्ये (5.4.52): “wholly turned into”, with कृ, भू, अस्, optionally instead of च्वि: भस्मसात् भवति (or भस्मीभवति), अग्निसात् करोति.",
              "तदधीनवचने (5.4.54): “made over to”: राजसात् करोति."]},
  "TP-000031": {
    "eff": "त्रा joins as it is. An avyaya (1.1.38).",
    "sa": "द्वितीयासप्तम्यर्थकम् अव्ययम्",
    "rules": ["देवमनुष्यपुरुषपुरुमर्त्येभ्यो द्वितीयासप्तम्योर्बहुलम् (5.4.56): in the sense of the 2nd or 7th case: देवत्रा (देवान् / देवेषु), मनुष्यत्रा, पुरुषत्रा.",
              "देये त्रा च (5.4.55): “to be given to”: ब्राह्मणत्रा करोति."]},
  "TP-000032": {
    "eff": "शस् joins as it is; स् becomes visarga. An avyaya (1.1.38).",
    "sa": "कारकार्थकम् अव्ययम् (बह्वल्पार्थात्)",
    "rules": ["बह्वल्पार्थाच्छस्कारकादन्यतरस्याम् (5.4.42): after words meaning much or little, standing for a kāraka: बहुशः ददाति “gives much”, अल्पशः, स्तोकशः."]},
  "TP-000033": {
    "eff": "प् is इत्; the feminine is in ङीप् (4.1.15).",
    "sa": "अवयवार्थकः",
    "rules": ["संख्याया अवयवे तयप् (5.2.42): a whole with so many parts: त्रितयम् “a triad”.",
              "द्वि, त्रि may take अयच् instead (द्वित्रिभ्यां तयस्यायज्वा 5.2.43): द्वयम्, त्रयम्.",
              "चतुर् + तय: र् → visarga (8.3.15) → ष् (इदुदुपधस्य चाप्रत्ययस्य 8.3.41), then त → ट (ष्टुना ष्टुः 8.4.41): चतुष्टयम्."]},
  "TP-000034": {
    "eff": "च् is इत्; the feminine is in ङीप् (4.1.15): -मात्री.",
    "sa": "प्रमाणार्थकः",
    "rules": ["प्रमाणे द्वयसज्दघ्नञ्मात्रचः (5.2.37): a measure: ऊरुमात्रम् “as high as the thigh”, जानुमात्रम्.",
              "Used also for “just, only”: क्षणमात्रम् “just a moment”."]},
  "TP-000035": {
    "eff": "च् is इत्; the feminine is in ङीप् (4.1.15): -द्वयसी.",
    "sa": "प्रमाणार्थकः (ऊर्ध्वमानम्)",
    "rules": ["प्रमाणे द्वयसज्दघ्नञ्मात्रचः (5.2.37): height up to: ऊरुद्वयसम् “up to the thigh”, जानुद्वयसम्."]},
  "TP-000036": {
    "eff": "च् is इत्; the feminine is in ङीप् (4.1.15): -दघ्नी.",
    "sa": "प्रमाणार्थकः (ऊर्ध्वमानम्)",
    "rules": ["प्रमाणे द्वयसज्दघ्नञ्मात्रचः (5.2.37): depth up to: जानुदघ्नम् “knee-deep”, ऊरुदघ्नम्."]},
  "TP-000037": {
    "eff": "The इ is for pronunciation: what joins is विन्. Masculine nominative -वी (सौ च 6.4.13; न् drops 8.2.7).",
    "sa": "मत्वर्थीयः",
    "rules": ["तपःसहस्राभ्यां विनीनी (5.2.102): तपस्वी.",
              "अस्मायामेधास्रजो विनिः (5.2.121): after stems in अस्, and माया, मेधा, स्रज्: तेजस्वी, यशस्वी, मायावी, मेधावी."]},
  "TP-000038": {
    "eff": "त् is इत् (svarita accent: तित्स्वरितम् 6.1.185); no vṛddhi.",
    "sa": "शरीरावयवार्थकः",
    "rules": ["शरीरावयवाद्यत् (5.1.6): “belonging to a part of the body”: दन्त्यः, कण्ठ्यः, ओष्ठ्यः, तालव्यः, मूर्धन्यः — the names of the places of articulation.",
              "A final अ drops (यस्येति च 6.4.148); a final उ → ओ → अव् (ओर्गुणः 6.4.146, वान्तो यि प्रत्यये 6.1.79): तालव्यः; मूर्धन् keeps its न् (ये चाभावकर्मणोः 6.4.168): मूर्धन्यः."]},
  "TP-000039": {
    "eff": "च् is इत्; the final अ of the stem drops (यस्येति च 6.4.148).",
    "sa": "असहनार्थकः",
    "m_en": "who cannot bear (cold, heat)", "m_te": "(చలి, వేడి) భరించలేనివాడు", "m_hi": "(ठंड, गर्मी) सहन न कर सकने वाला",
    "rules": ["शीतोष्णतृप्रेभ्यस्तन्न सहते (vārttika): “who cannot bear”: शीतालुः “who cannot bear cold”, उष्णालुः “who cannot bear heat”."]},
  "TP-000040": {
    "eff": "शस् joins as it is; स् becomes visarga. An avyaya (1.1.38).",
    "sa": "वीप्सार्थकम् अव्ययम्",
    "rules": ["संख्यैकवचनाच्च वीप्सायाम् (5.4.43): after a number, or a word for one unit, in a distributive sense: शतशः “by hundreds”, सहस्रशः, एकशः “one by one”, माषशः “a māṣa each”, पादशः “a quarter at a time”, अक्षरशः."]},
}
# notes of single examples: (suffix id, word) → note
EX_NOTE = {("TP-000020", "इतः"): "इ for इदम् (इदम इश् 5.3.3)"}
