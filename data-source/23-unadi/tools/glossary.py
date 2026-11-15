# Terms and techniques used in the Uṇādi prakriyā (shown on the site as पारिभाषिकशब्दाः),
# and which Aṣṭādhyāyī rules apply each one (so every derivation step can name its technique).
# key: (Sanskrit name, English name, defining/applying sūtras, explanation, example)
TERMS = {
 "dhatu":   ("धातुः", "verbal root", "भूवादयो धातवः (1.3.1)",
             "A root listed in the Dhātupāṭha. Uṇādi suffixes are added to roots, as other kṛt suffixes are.",
             "कृ, वा, पा, जि, उन्द्"),
 "unadi":   ("उणादिप्रत्ययविधानम्", "the Uṇādi suffix is added", "उणादयो बहुलम् (3.3.1)",
             "The Uṇādi-sūtra named in the step adds its suffix to the root. Pāṇini admits all these suffixes with the one rule उणादयो बहुलम्.",
             "कृ + उण् (उणादि 1.1)"),
 "bahula":  ("बाहुलकम्", "variable application", "उणादयो बहुलम् (3.3.1)",
             "बहुलम् means a rule may also apply where it is not stated, may not apply where it is stated, or may apply with a difference. Words explained 'बाहुलकात्' rest on this.",
             "बाहुलकात् ऋचेरपि थक् → ऋक्थम्"),
 "nipatana":("निपातनम्", "form taught ready-made", "",
             "The sūtra itself names the finished word. Whatever changes are needed to reach it (a substitute, a dropped letter, an irregular vowel) are accepted as taught, without a separate rule.",
             "तिथपृष्ठगूथयूथप्रोथाः (उणादि 2.12) → तिथः, पृष्ठम्…"),
 "it":      ("इत्संज्ञा, अनुबन्धलोपः", "marker letters and their removal", "उपदेशेऽजनुनासिक इत् (1.3.2), हलन्त्यम् (1.3.3), आदिर्ञिटुडवः (1.3.5), षः प्रत्ययस्य (1.3.6), चुटू (1.3.7), लशक्वतद्धिते (1.3.8), तस्य लोपः (1.3.9)",
             "Some letters of a root or suffix are only markers (इत्). They signal an operation and are then dropped. ण्/ञ् bring vṛddhi, क्/ङ् block guṇa, न्/च् fix the accent, ष् brings the feminine ङीष्.",
             "उण् → उ (the ण् is a marker; it causes vṛddhi)"),
 "kit":     ("कित्त्वम्, ङित्त्वम्", "guṇa and vṛddhi blocked", "क्ङिति च (1.1.5)",
             "When the suffix carries the marker क् or ङ्, the guṇa or vṛddhi that would otherwise apply does not.",
             "इष् + उ (कित्) → इषुः, not एषुः"),
 "guna":    ("गुणः", "guṇa (a, e, o; ar, al)", "अदेङ् गुणः (1.1.2); इको गुणवृद्धी (1.1.3); सार्वधातुकार्धधातुकयोः (7.3.84); पुगन्तलघूपधस्य च (7.3.86)",
             "The vowels अ, ए, ओ are called guṇa. Before most suffixes a final इ/उ/ऋ of the root, or a short इ/उ/ऋ in the penultimate place, is replaced by its guṇa: इ→ए, उ→ओ, ऋ→अर्.",
             "भू + अन्त → भो + अन्त; दॄ + उ → दर् + उ"),
 "vrddhi":  ("वृद्धिः", "vṛddhi (ā, ai, au; ār, āl)", "वृद्धिरादैच् (1.1.1); अचो ञ्णिति (7.2.115); अत उपधायाः (7.2.116)",
             "The vowels आ, ऐ, औ are called vṛddhi. Before a suffix marked ञ् or ण्, a final vowel and a penultimate अ are replaced by vṛddhi.",
             "कृ + उण् → कार् + उ → कारुः"),
 "rapara":  ("रपरत्वम्", "r (or l) follows the substitute", "उरण् रपरः (1.1.51)",
             "When ऋ or ॠ is replaced by अ, आ (guṇa or vṛddhi), र् is added after the substitute.",
             "कृ → कर्, कार्"),
 "upadha":  ("उपधा", "the penultimate letter", "अलोऽन्त्यात्पूर्व उपधा (1.1.65)",
             "The letter just before the last letter of a root. Several rules act on it (guṇa, vṛddhi, lengthening, dropping न्).",
             "वच् → उपधा अ; कृष् → उपधा ऋ"),
 "ti":      ("टिः, टिलोपः", "the last vowel and what follows it, dropped", "अचोऽन्त्यादि टि (1.1.64); टेः (6.4.143)",
             "टि is the last vowel of a word together with any consonants after it. Before a suffix marked ड् (डित्), the टि of the base is dropped.",
             "गम् + डो → ग् + ओ → गौः"),
 "samprasarana": ("सम्प्रसारणम्", "a semivowel becomes its vowel", "इग्यणः सम्प्रसारणम् (1.1.45); सम्प्रसारणाच्च (6.1.108)",
             "य्, व्, र्, ल् are replaced by इ, उ, ऋ, ऌ. The vowel that followed then merges into it (पूर्वरूपम्).",
             "व्यथ् → विथ् (विथुरः); प्रथ् → पृथ् (पृथुः)"),
 "yan":     ("यणादेशः", "a vowel becomes a semivowel", "इको यणचि (6.1.77)",
             "इ, उ, ऋ, ऌ before a different vowel are replaced by य्, व्, र्, ल्.",
             "शु + अश् → श्वश्"),
 "ayadi":   ("अयादिसन्धिः", "e, ai, o, au before a vowel", "एचोऽयवायावः (6.1.78)",
             "ए, ऐ, ओ, औ before a vowel become अय्, आय्, अव्, आव्.",
             "भो + अन्त → भवन्त"),
 "sandhi":  ("अच्सन्धिः", "vowels joining", "अकः सवर्णे दीर्घः (6.1.101); आद्गुणः (6.1.87); अतो गुणे (6.1.97); अमि पूर्वः (6.1.107)",
             "Two vowels that meet combine into one: like vowels lengthen, अ + इ/उ give ए/ओ, and so on.",
             "अप + अस् → अपस्"),
 "agama":   ("आगमः", "an augment is inserted", "आद्यन्तौ टकितौ (1.1.46); मिदचोऽन्त्यात्परः (1.1.47)",
             "An augment adds a sound without replacing anything: marked ट् it goes before its host, marked क् after it, marked म् after the last vowel.",
             "पा + उ → पा + य् + उ → पायुः (युक्)"),
 "yuk":     ("युगागमः", "the augment y", "आतो युक् चिण्कृतोः (7.3.33)",
             "A root ending in आ takes य् before a ञित्/णित् kṛt suffix.",
             "पा + उण् → पायुः; जि→जा + उण् → जायुः"),
 "tuk":     ("तुगागमः", "the augment t", "ह्रस्वस्य पिति कृति तुक् (6.1.71)",
             "A short vowel takes त् before a पित् kṛt suffix.",
             ""),
 "num":     ("नुमागमः", "the augment n", "इदितो नुम् धातोः (7.1.58); उगिदचां सर्वनामस्थानेऽधातोः (7.1.70)",
             "Roots marked with इ (इदित्) take न् after their last vowel; some stems take न् before strong endings.",
             "मदि → मन्द्; भवत् → भवान्"),
 "adesha":  ("आदेशः", "a substitute replaces a sound or a stem", "स्थानेऽन्तरतमः (1.1.50); अलोऽन्त्यस्य (1.1.52); अनेकाल्शित्सर्वस्य (1.1.55)",
             "A substitute takes the place of what is named. A one-letter substitute replaces only the last letter; a longer one, or one marked श्, replaces the whole.",
             "स्यन्द् → सिन्ध् (सिन्धुः)"),
 "lopa":    ("लोपः", "a sound is dropped", "अदर्शनं लोपः (1.1.60); अतो लोपः (6.4.48); लोपो व्योर्वलि (6.1.66); संयोगान्तस्य लोपः (8.2.23)",
             "लोप is the disappearance of a sound. The step names the rule that drops it.",
             ""),
 "nalopa":  ("नलोपः", "n is dropped", "अनिदितां हल उपधायाः क्ङिति (6.4.24); नलोपः प्रातिपदिकान्तस्य (8.2.7)",
             "The penultimate न् of a root not marked इ is dropped before a कित्/ङित् suffix; a final न् of a stem is dropped at the end of a word.",
             "स्कन्द् → कन्द्; राजन् → राजा"),
 "dirgha":  ("दीर्घः", "a vowel is lengthened", "ऊकालोऽज्झ्रस्वदीर्घप्लुतः (1.2.27); सर्वनामस्थाने चासम्बुद्धौ (6.4.8); नोपधायाः (6.4.7)",
             "A short vowel is replaced by its long counterpart where a rule requires.",
             "राजन् + सुँ → राजान्"),
 "abhyasa": ("द्वित्वम्, अभ्यासः", "doubling, and the reduplicated part", "एकाचो द्वे प्रथमस्य (6.1.1); पूर्वोऽभ्यासः (6.1.4); ह्रस्वः (7.4.59); हलादिः शेषः (7.4.60)",
             "Some suffixes require the root to be doubled. The first copy (अभ्यासः) is then shortened and keeps only its first consonant.",
             "शो → शिशुः; या → ययुः"),
 "natva":   ("णत्वम्", "n becomes ṇ", "रषाभ्यां नो णः समानपदे (8.4.1); अट्कुप्वाङ्नुम्व्यवायेऽपि (8.4.2)",
             "न् becomes ण् after र् or ष् in the same word, even across vowels, h, y, v, r and k-/p-sounds.",
             "कर् + न → कर्णः; कृष् + न → कृष्णः"),
 "satva":   ("षत्वम्", "s becomes ṣ", "आदेशप्रत्यययोः (8.3.59); इण्कोः (8.3.57)",
             "स् of a suffix or substitute becomes ष् after इ, उ, ऋ, ए, ओ, ऐ, औ, ह्, य्, व्, र्, ल् or a k-sound.",
             "वृक् + स → वृक्षः"),
 "kutva":   ("कुत्वम्", "c/j/ś become k/g", "चोः कुः (8.2.30); षढोः कः सि (8.2.41); व्रश्चभ्रस्ज… षः (8.2.36)",
             "A palatal at the end of a word or before certain consonants becomes a velar.",
             "वाच् → वाक्"),
 "jastva":  ("जश्त्वम्", "voiced unaspirated stop", "झलां जशोऽन्ते (8.2.39); झलां जश् झशि (8.4.53)",
             "A stop at the end of a word, or before a voiced stop, becomes the voiced unaspirated stop of its class.",
             "शप् + द → शब्दः"),
 "cartva":  ("चर्त्वम्", "voiceless unaspirated stop", "खरि च (8.4.55); वाऽवसाने (8.4.56)",
             "A stop before a voiceless sound becomes voiceless; at a pause it may optionally do so.",
             "मद् + स्य → मत्स्यः; वाग् / वाक्"),
 "anusvara":("अनुस्वारः, परसवर्णः", "nasal before a consonant", "मोऽनुस्वारः (8.3.23); नश्चापदान्तस्य झलि (8.3.24); अनुस्वारस्य ययि परसवर्णः (8.4.58)",
             "म्/न् before a consonant becomes anusvāra, which then becomes the nasal of the following consonant's class.",
             "मन्स → मांसम्; शन्ख → शङ्खः"),
 "angam":   ("अङ्गसंज्ञा", "the base before a suffix", "यस्मात्प्रत्ययविधिस्तदादि प्रत्ययेऽङ्गम् (1.4.13)",
             "What a suffix is added to is called अङ्ग with respect to it. Rules of the 6th and 7th books act on the अङ्ग.",
             ""),
 "ardha":   ("आर्धधातुकसंज्ञा", "non-finite suffix class", "आर्धधातुकं शेषः (3.4.114)",
             "Kṛt suffixes that are not शित् are आर्धधातुक; guṇa (7.3.84) applies before them.",
             ""),
 "pratipadika": ("प्रातिपदिकसंज्ञा", "nominal stem", "अर्थवदधातुरप्रत्ययः प्रातिपदिकम् (1.2.45); कृत्तद्धितसमासाश्च (1.2.46)",
             "A word ending in a kṛt suffix is a प्रातिपदिक, so case endings can be added to it.",
             "कारु"),
 "stri":    ("स्त्रीप्रत्ययः", "feminine suffix", "अजाद्यतष्टाप् (4.1.4); षिद्गौरादिभ्यश्च (4.1.41); ऋन्नेभ्यो ङीप् (4.1.5)",
             "A feminine word takes टाप् (-ā), ङीष् or ङीप् (-ī) before the case ending.",
             "शलाक + टाप् → शलाका"),
 "sup":     ("सुप्, विभक्तिः", "the case ending", "स्वौजसमौट्छष्टाभ्याम्भिस्ङेभ्याम्भ्यस्ङसिभ्याम्भ्यस्ङसोसाम्ङ्योस्सुप् (4.1.2); ङ्याप्प्रातिपदिकात् (4.1.1)",
             "Case endings are added to a prātipadika. The nominative singular ending is सुँ; its उँ is a marker.",
             "कारु + सुँ"),
 "snam":    ("सर्वनामस्थानम्", "strong case endings", "सुडनपुंसकस्य (1.1.43)",
             "The first five endings (सुँ, औ, जस्, अम्, औट्) outside the neuter are सर्वनामस्थान; several stem changes apply only before them.",
             ""),
 "halnyab": ("हल्ङ्याब्भ्यो… लोपः", "the ending s is dropped", "हल्ङ्याब्भ्यो दीर्घात् सुतिस्यपृक्तं हल् (6.1.68)",
             "After a consonant-final stem, or a feminine in -ā/-ī, the single-letter ending स् is dropped.",
             "शलाका + स् → शलाका; राजान् + स् → राजान्"),
 "rutva":   ("रुत्वम्, विसर्गः", "final s → r → ḥ", "ससजुषो रुः (8.2.66); खरवसानयोर्विसर्जनीयः (8.3.15)",
             "A final स् becomes रुँ, and at a pause (or before a voiceless consonant) रुँ becomes visarga.",
             "कारु + स् → कारुरुँ → कारुः"),
 "pada":    ("पदसंज्ञा", "a finished word", "सुप्तिङन्तं पदम् (1.4.14)",
             "What ends in a case ending (or a verb ending) is a पद, a word ready for use in a sentence.",
             "कारुः"),
 "visukakr":("वि.सु.का.कृ.", "case ending and its operations", "कृत्तद्धितसमासाश्च (1.2.46) → (4.1.2) → (1.3.2, 1.3.9) → (8.2.66) → (8.3.15) → (1.4.14)",
             "तादृशप्रकृतिप्रत्यय-विशिष्टात् सुबादिषु कार्येषु कृतेषु: once the stem is made, it is a prātipadika; the ending सुँ is added, its उँ dropped, स् becomes रुँ and then visarga; the result is a पद.",
             "इन्दु → इन्दु + सुँ → इन्दु + स् → इन्दुरुँ → इन्दुः"),
 "svara":   ("स्वरः", "accent", "ञ्नित्यादिर्नित्यम् (6.1.197); चितः (6.1.163); आद्युदात्तश्च (3.1.3)",
             "Markers न्/ञ् make the first syllable accented, च् the last. The accent does not change the written form.",
             ""),
}
# rule code (as vidyut-prakriya writes it) → term key
RULE_TERM = {}
def _set(key, *codes):
    for c in codes: RULE_TERM[c] = key
_set("dhatu", "A:1.3.1")
_set("it", "A:1.3.2", "A:1.3.3", "A:1.3.4", "A:1.3.5", "A:1.3.6", "A:1.3.7", "A:1.3.8", "A:1.3.9", "V:1.3.3.1")
_set("kit", "A:1.1.5", "A:1.1.6")
_set("guna", "A:7.3.84", "A:7.3.86", "A:7.3.82", "A:7.3.85")
_set("vrddhi", "A:7.2.115", "A:7.2.116", "A:7.2.117", "A:7.2.118")
_set("rapara", "A:1.1.51")
_set("ti", "A:6.4.143", "A:6.4.144", "A:1.1.64")
_set("samprasarana", "A:1.1.45", "A:6.1.15", "A:6.1.16", "A:6.1.17", "A:6.1.108")
_set("yan", "A:6.1.77")
_set("ayadi", "A:6.1.78", "A:6.1.79")
_set("sandhi", "A:6.1.101", "A:6.1.87", "A:6.1.88", "A:6.1.97", "A:6.1.107", "A:6.1.94", "A:6.1.84", "A:6.1.110", "A:6.1.111")
_set("agama", "A:1.1.46", "A:1.1.47")
_set("yuk", "A:7.3.33")
_set("tuk", "A:6.1.71", "A:6.1.73")
_set("num", "A:7.1.58", "A:7.1.70", "A:7.1.72", "A:7.1.59")
_set("adesha", "A:1.1.50", "A:1.1.52", "A:1.1.55", "A:6.1.64", "A:6.1.65", "A:7.1.94", "A:7.1.1", "A:7.1.2", "A:7.1.3")
_set("lopa", "A:6.4.48", "A:6.4.51", "A:6.4.64", "A:6.1.66", "A:8.2.23", "A:6.4.134", "A:6.4.137", "A:6.4.148", "A:6.4.137", "A:6.1.67", "A:8.2.24")
_set("nalopa", "A:6.4.24", "A:8.2.7")
_set("dirgha", "A:6.4.8", "A:6.4.7", "A:6.4.11", "A:6.4.14", "A:6.4.13", "A:6.3.111", "A:8.2.76", "A:8.2.77", "A:8.2.78", "A:6.4.15")
_set("abhyasa", "A:6.1.1", "A:6.1.4", "A:6.1.5", "A:7.4.59", "A:7.4.60", "A:7.4.62", "A:7.4.66", "A:8.4.54", "A:7.4.79")
_set("natva", "A:8.4.1", "A:8.4.2", "A:8.4.37")
_set("satva", "A:8.3.59", "A:8.3.57", "A:8.4.41", "A:8.4.40")
_set("kutva", "A:8.2.30", "A:8.2.41", "A:8.2.36", "A:7.3.52", "A:8.2.31", "A:8.2.29")
_set("jastva", "A:8.2.39", "A:8.4.53", "A:8.2.37")
_set("cartva", "A:8.4.55", "A:8.4.56")
_set("anusvara", "A:8.3.23", "A:8.3.24", "A:8.4.58", "A:8.4.59")
_set("angam", "A:1.4.13", "A:1.4.17", "A:1.4.18")
_set("ardha", "A:3.4.114", "A:3.4.113", "A:3.1.32", "A:3.1.25", "A:3.1.6", "A:3.1.31")
_set("pratipadika", "A:1.2.45", "A:1.2.46", "A:1.2.47")
_set("stri", "A:4.1.4", "A:4.1.5", "A:4.1.15", "A:4.1.41", "A:4.1.44", "A:4.1.13", "A:4.1.3")
_set("sup", "A:4.1.2", "A:4.1.1", "A:1.4.7", "A:1.4.3", "A:1.4.21", "A:1.4.22", "A:2.3.46", "A:1.2.41")
_set("snam", "A:1.1.43")
_set("halnyab", "A:6.1.68")
_set("rutva", "A:8.2.66", "A:8.3.15", "A:8.3.111", "A:8.3.110", "A:8.3.13")
_set("pada", "A:1.4.14")
_set("svara", "A:6.1.197", "A:6.1.163", "A:3.1.3", "A:3.1.4")
