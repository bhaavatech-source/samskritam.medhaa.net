"""data-source/25-vakya/vakya_lexicon_2026-11-20.py — the lexicon of वाक्यरचना (sentence building) in क्रीडाङ्गणम्.

Every form the game shows is looked up, never made by the game:
  nouns      — app/src/data/words.json (checked declensions), or vidyut_forms_2026-11-20.json for words added here
  adjectives — vidyut_forms_2026-11-20.json (all three genders, made with vidyut-prakriya)
  verbs      — app/public/rupa/<code>.json (the verb tables of the site, vidyut-prakriya), or vidyut_forms… for कथ, पूज्, श्रु
This file only says which words go together, so that sentences make sense:
  who can do an action (agent classes), what it can be done to, where, with what, for whom, from where.

Agent classes:  per = a person · herb = a grazing animal (cow, horse, elephant) · monkey · dog · lion · bird
Place kinds:    home garden school city village temple market field forest mountain river sea road ground tree seat
Writing: words are written without sandhi between them (the usual way in teaching), except that a final म् before
a consonant is written as anusvāra (मोऽनुस्वारः 8.3.23): फलं खादति.
"""

# ── nouns ── (stem, gender, English singular, English plural, kind, extra)
#   kind: per / ani / thing / food / drink / text / song / story / place / time / tool / veh / tree / deity / abstract
#   extra: cls (agent class), kin (can be "X's …"), elder (bowed to, served), place kind, eaters, tags
N = [
    # persons — from words.json
    ("बालक", "m", "boy", "boys", "per", {}),
    ("बाला", "f", "girl", "girls", "per", {}),
    ("छात्र", "m", "student", "students", "per", {}),
    ("पुरुष", "m", "man", "men", "per", {}),
    ("नारी", "f", "woman", "women", "per", {}),
    ("नृप", "m", "king", "kings", "per", {"elder": 1, "rules": 1, "owner": 1}),
    ("कवि", "m", "poet", "poets", "per", {"sings": 1}),
    ("मुनि", "m", "sage", "sages", "per", {"elder": 1}),
    ("गुरु", "m", "teacher", "teachers", "per", {"elder": 1, "kin": 1, "teaches": 1}),
    ("आचार्य", "m", "preceptor", "preceptors", "per", {"elder": 1, "kin": 1, "teaches": 1}),
    ("शिशु", "m", "child", "children", "per", {"small": 1}),
    ("पितृ", "m", "father", "fathers", "per", {"elder": 1, "kin": 1}),
    ("मातृ", "f", "mother", "mothers", "per", {"elder": 1, "kin": 1}),
    ("भ्रातृ", "m", "brother", "brothers", "per", {"kin": 1}),
    ("स्वसृ", "f", "sister", "sisters", "per", {"kin": 1}),
    ("पुत्र", "m", "son", "sons", "per", {"kin": 1}),
    ("मित्र", "n", "friend", "friends", "per", {"kin": 1}),
    ("कृषक", "m", "farmer", "farmers", "per", {}),
    ("लेखक", "m", "writer", "writers", "per", {}),
    ("गायक", "m", "singer", "singers", "per", {"sings": 1}),
    ("नर्तक", "m", "dancer", "dancers", "per", {}),
    ("सेवक", "m", "servant", "servants", "per", {}),
    ("पण्डित", "m", "scholar", "scholars", "per", {"elder": 1}),
    ("चिकित्सक", "m", "doctor", "doctors", "per", {}),
    # persons — added (vidyut)
    ("सखी", "f", "friend (f.)", "friends (f.)", "per", {"kin": 1, "nyap": 1}),
    ("बालिका", "f", "little girl", "little girls", "per", {"nyap": 1, "small": 1}),
    # animals
    ("गज", "m", "elephant", "elephants", "ani", {"cls": "herb", "big": 1}),
    ("अश्व", "m", "horse", "horses", "ani", {"cls": "herb", "veh": 1}),
    ("धेनु", "f", "cow", "cows", "ani", {"cls": "herb"}),
    ("श्वन्", "m", "dog", "dogs", "ani", {"cls": "dog"}),
    ("पक्षिन्", "m", "bird", "birds", "ani", {"cls": "bird"}),
    ("सिंह", "m", "lion", "lions", "ani", {"cls": "lion"}),
    ("वानर", "m", "monkey", "monkeys", "ani", {"cls": "monkey"}),
    ("मयूर", "m", "peacock", "peacocks", "ani", {"cls": "bird", "dances": 1}),
    ("काक", "m", "crow", "crows", "ani", {"cls": "bird"}),
    # food and drink
    ("फल", "n", "fruit", "fruits", "food", {"eaters": ["per", "herb", "monkey", "bird"], "falls": 1, "fruit": 1}),
    ("ओदन", "m", "rice", "rice", "food", {"eaters": ["per", "dog"], "mass": 1, "cooked": 1}),
    ("मोदक", "m", "sweet", "sweets", "food", {"eaters": ["per"]}),
    ("दधि", "n", "curd", "curd", "food", {"eaters": ["per"], "mass": 1}),
    ("तृण", "n", "grass", "grass", "food", {"eaters": ["herb"], "mass": 1}),
    ("भोजन", "n", "meal", "meals", "food", {"eaters": ["per"], "cooked": 1}),
    ("जल", "n", "water", "water", "drink", {"drinkers": ["per", "herb", "monkey", "dog", "lion", "bird"], "mass": 1}),
    ("दुग्ध", "n", "milk", "milk", "drink", {"drinkers": ["per"], "mass": 1}),
    # things
    ("पुस्तक", "n", "book", "books", "thing", {"text": 1, "readable": 1}),
    ("पत्र", "n", "letter", "letters", "thing", {"text": 1, "readable": 1, "writable": 1}),
    ("पुष्प", "n", "flower", "flowers", "thing", {"flower": 1, "falls": 1, "plant": 1}),
    ("रत्न", "n", "gem", "gems", "thing", {}),
    ("वस्त्र", "n", "garment", "garments", "thing", {"cloth": 1}),
    ("लेखनी", "f", "pen", "pens", "thing", {"pen": 1, "nyap": 1}),
    ("धन", "n", "wealth", "wealth", "abstract", {"mass": 1, "gain": 1}),
    ("ज्ञान", "n", "knowledge", "knowledge", "abstract", {"mass": 1, "gain": 1}),
    ("सत्य", "n", "truth", "truth", "abstract", {"mass": 1, "said": 1}),
    ("कार्य", "n", "work", "tasks", "abstract", {"done": 1}),
    # texts and sounds
    ("पाठ", "m", "lesson", "lessons", "text", {"readable": 1}),
    ("श्लोक", "m", "verse", "verses", "song", {"readable": 1, "writable": 1, "sung": 1, "heard": 1}),
    ("गीत", "n", "song", "songs", "song", {"sung": 1, "heard": 1, "writable": 1}),
    ("कथा", "f", "story", "stories", "story", {"readable": 1, "writable": 1, "told": 1, "heard": 1, "nyap": 1}),
    # places
    ("गृह", "n", "house", "houses", "place", {"pk": "home", "built": 1}),
    ("उद्यान", "n", "garden", "gardens", "place", {"pk": "garden"}),
    ("विद्यालय", "m", "school", "schools", "place", {"pk": "school", "built": 1}),
    ("नगर", "n", "city", "cities", "place", {"pk": "city"}),
    ("ग्राम", "m", "village", "villages", "place", {"pk": "village"}),
    ("देवालय", "m", "temple", "temples", "place", {"pk": "temple", "built": 1}),
    ("आपण", "m", "market", "markets", "place", {"pk": "market"}),
    ("क्षेत्र", "n", "field", "fields", "place", {"pk": "field"}),
    ("वन", "n", "forest", "forests", "place", {"pk": "forest"}),
    ("पर्वत", "m", "mountain", "mountains", "place", {"pk": "mountain"}),
    ("नदी", "f", "river", "rivers", "place", {"pk": "river"}),
    ("समुद्र", "m", "sea", "seas", "place", {"pk": "sea"}),
    ("मार्ग", "m", "road", "roads", "place", {"pk": "road"}),
    ("भूमि", "f", "ground", "ground", "place", {"pk": "ground", "mass": 1}),
    ("आसन", "n", "seat", "seats", "place", {"pk": "seat"}),
    ("वृक्ष", "m", "tree", "trees", "tree", {"pk": "tree", "plant": 1}),
    # others
    ("रथ", "m", "chariot", "chariots", "veh", {}),
    ("हस्त", "m", "hand", "hands", "tool", {"hand": 1}),
    ("देव", "m", "god", "gods", "deity", {}),
    ("रिपु", "m", "enemy", "enemies", "foe", {}),
    ("सूर्य", "m", "sun", "suns", "sky", {"one": 1}),
]
# words.json supplies these (by stem); the rest are made with vidyut-prakriya
FROM_WORDS = {"बालक", "बाला", "छात्र", "पुरुष", "नारी", "नृप", "कवि", "मुनि", "गुरु", "आचार्य", "शिशु", "पितृ", "मातृ", "भ्रातृ",
              "स्वसृ", "पुत्र", "मित्र", "कृषक", "लेखक", "गायक", "नर्तक", "सेवक", "पण्डित", "चिकित्सक", "गज", "अश्व", "धेनु",
              "श्वन्", "पक्षिन्", "फल", "दधि", "जल", "पुस्तक", "पुष्प", "रत्न", "वन", "ग्राम", "नदी", "समुद्र", "पर्वत", "वृक्ष",
              "हस्त", "देव", "रिपु", "सूर्य", "ज्ञान"}

# English place phrases: (where, to where, from where)
PLACE_EN = {"road": "on the", "ground": "on the", "seat": "on the", "mountain": "on the", "field": "in the", "tree": "in the"}

# ── adjectives ── (masculine/neuter stem, feminine stem, English, describes: kinds / tags)
A = [
    ("मधुर", "मधुरा", "sweet", ["fruit", "मोदक", "दुग्ध", "जल", "song"]),
    ("शीतल", "शीतला", "cool", ["जल", "दुग्ध", "उद्यान", "वन", "नदी"]),
    ("उष्ण", "उष्णा", "hot", ["ओदन", "दुग्ध", "भोजन", "जल"]),
    ("नूतन", "नूतना", "new", ["thing", "built", "रथ", "song", "story"]),
    ("प्राचीन", "प्राचीना", "ancient", ["built", "पुस्तक", "श्लोक", "story", "वृक्ष", "नगर", "ग्राम"]),
    ("विशाल", "विशाला", "large", ["गृह", "उद्यान", "विद्यालय", "नगर", "क्षेत्र", "वन", "पर्वत", "नदी", "समुद्र", "वृक्ष", "देवालय", "big"]),
    ("श्वेत", "श्वेता", "white", ["flower", "cloth", "अश्व", "धेनु", "गज", "दुग्ध"]),
    ("रक्त", "रक्ता", "red", ["flower", "cloth", "fruit"]),
    ("पक्व", "पक्वा", "ripe", ["fruit"]),
    ("दीर्घ", "दीर्घा", "long", ["मार्ग", "story", "पत्र"]),
    ("उच्च", "उच्चा", "tall", ["वृक्ष", "पर्वत", "built"]),
    ("चतुर", "चतुरा", "clever", ["per!", "वानर"]),
    ("कुशल", "कुशला", "skilful", ["गायक", "नर्तक", "लेखक", "कृषक", "चिकित्सक", "कवि", "सेवक"]),
    ("उत्तम", "उत्तमा", "excellent", ["पुस्तक", "song", "story", "भोजन", "छात्र", "गायक", "कवि", "लेखक", "पाठ"]),
    ("प्रसन्न", "प्रसन्ना", "happy", ["per!"]),
    ("बुभुक्षित", "बुभुक्षिता", "hungry", ["per!", "ani"]),
    ("सुन्दर", "सुन्दरी", "beautiful", ["flower", "उद्यान", "नगर", "गृह", "देवालय", "song", "cloth", "मयूर", "बाला", "बालिका", "नारी"]),
    ("प्रिय", "प्रिया", "dear", ["kin"]),
    ("वृद्ध", "वृद्धा", "old", ["पुरुष", "नारी", "पितृ", "मातृ", "मुनि", "गुरु", "आचार्य", "पण्डित", "कृषक", "धेनु", "गज", "अश्व", "श्वन्"]),
    ("पवित्र", "पवित्रा", "holy", ["नदी", "देवालय", "श्लोक"]),
]
# "per!" = adult persons and children; "ani" = animals; other entries are kinds, tags or stems.

# ── verbs ──
#   code / pre / mode: where the forms are (rupa table, upasarga, voice)
#   en: base, 3rd sg present, past
#   ag: agent classes · obj: what it takes in the 2nd case (kinds, tags or stems; "!" = always needs one)
#   dest: the object is where one goes · loc: place kinds for "in / at" · src: "from" (kinds/tags) · rec: gives / tells "to" someone
#   inst: "with / by" (stems) · com: "together with" a person · man: manners · ktva: may be an earlier action (…-त्वा)
#   tum: may be the purpose (…-तुम्) of going/coming/wanting · purpose: takes a purpose (…-तुम्)
V = {
    "पठ्": dict(code="01.0381", en=("read", "reads", "read"), ag=["per"], obj=["readable"], loc=["home", "school", "garden", "temple", "seat"], com=1, man=["well", "loud", "slow", "careful", "daily"], ktva=1, tum=1),
    "लिख्": dict(code="06.0092", en=("write", "writes", "wrote"), ag=["per"], obj=["writable", "पाठ"], loc=["home", "school", "seat"],
                 inst=["लेखनी"], man=["well", "fast", "slow", "careful"], ktva=1, tum=1),
    "खाद्": dict(code="01.0051", en=("eat", "eats", "ate"), ag=["per", "herb", "monkey", "dog", "bird"], obj=["food!"],
                 loc=["home", "garden", "forest", "field", "tree", "seat"], inst=["हस्त"], com=1, man=["fast", "slow"], ktva=1, tum=1),
    "पा": dict(code="01.1074", en=("drink", "drinks", "drank"), ag=["per", "herb", "monkey", "dog", "lion", "bird"], obj=["drink!"],
               loc=["home", "garden", "forest", "river", "seat"], com=1, man=["fast", "slow"], ktva=1, tum=1),
    "गम्": dict(code="01.1137", en=("go", "goes", "went"), ag=["per", "herb", "dog", "lion", "monkey"], obj=["place"], dest=1,
                inst=["रथ", "अश्व"], com=1, man=["fast", "slow", "daily"], ktva=1, purpose=1),
    "आगम्": dict(code="01.1137", pre="AN", en=("come", "comes", "came"), ag=["per", "herb", "dog"], obj=["place"], dest=1,
                  src=["place"], inst=["रथ", "अश्व"], com=1, man=["fast", "slow", "daily"], ktva=1, ktva_main="आगत्य", purpose=1),
    "धाव्": dict(code="01.0685", en=("run", "runs", "ran"), ag=["per", "herb", "dog", "lion", "monkey"], loc=["road", "garden", "field", "forest", "ground"],
                 com=1, man=["fast", "daily"], ktva_form="धावित्वा", ktva=1, tum=0),
    "क्रीड्": dict(code="01.0405", en=("play", "plays", "played"), ag=["per", "dog", "monkey"], loc=["garden", "field", "ground", "home", "road"],
                   com=1, man=["happy", "daily"], ktva=1, tum=1, young=1),
    "गै": dict(code="01.1065", en=("sing", "sings", "sang"), ag=["per", "bird"], obj=["sung"], obj_ag=["per"], loc=["temple", "garden", "home", "school", "tree"],
               com=1, man=["well", "loud", "happy", "slow"], ktva=1, tum=1),
    "वद्": dict(code="01.1164", en=("speak", "speaks", "spoke"), ag=["per"], obj=["said!"], loc=["home", "school", "temple"],
                man=["loud", "slow", "always"], ktva=0, tum=0),
    "कथ": dict(code="10.0389", en=("tell", "tells", "told"), ag=["per"], obj=["told!"], rec=["per"], loc=["home", "school", "garden", "seat"],
               man=["well", "loud", "slow"], ktva=1, tum=0),
    "दा": dict(code="03.0010", en=("give", "gives", "gave"), ag=["per"], obj=["thing!", "food", "drink", "धन"], rec=["per", "eaters"],
               loc=["home", "temple", "school", "market", "garden"], man=["happy"], ktva=1, tum=0),
    "दृश्": dict(code="01.1143", en=("see", "sees", "saw"), ag=["per", "herb", "dog", "lion", "monkey", "bird"],
                 obj=["per", "ani", "place", "tree", "thing", "sky", "रथ"], loc=["garden", "forest", "road", "field", "city", "village", "tree", "mountain"],
                 com=1, man=["daily"], ktva=1, tum=1),
    "नम्": dict(code="01.1136", en=("bow to", "bows to", "bowed to"), ag=["per"], obj=["elder!", "देव"], loc=["temple", "home", "school"],
                man=["daily", "happy"], ktva=1, tum=0, obj_per_human=1),
    "वस्": dict(code="01.1160", en=("live", "lives", "lived"), ag=["per", "herb", "monkey", "dog", "lion", "bird"], loc=["home", "village", "city", "forest", "mountain", "tree"],
                com=1, man=["happy"], ktva=0, tum=0, need_loc=1),
    "स्ना": dict(code="02.0047", en=("bathe", "bathes", "bathed"), ag=["per", "herb"], loc=["river", "sea", "home"],
                 com=1, man=["daily"], ktva=1, tum=1),
    "पत्": dict(code="01.0979", en=("fall", "falls", "fell"), ag=["falls"], loc=["ground", "road", "garden", "river"], src=["वृक्ष"],
                man=["slow", "fast"], ktva=0, tum=0, thing_agent=1),
    "आनी": dict(code="01.1049", pre="AN", mode="kartari_P", en=("bring", "brings", "brought"), ag=["per"], obj=["thing!", "food", "drink", "पुष्प"],
                src=["market", "garden", "home", "river", "forest"], com=1, man=["fast"], ktva=1, tum=1),
    "पच्": dict(code="01.1151", mode="kartari_P", en=("cook", "cooks", "cooked"), ag=["per"], obj=["cooked!"], loc=["home"],
                man=["well", "daily"], ktva=1, tum=1),
    "सेव्": dict(code="01.0574", mode="kartari_A", en=("serve", "serves", "served"), ag=["per"], obj=["elder!", "देव"], loc=["home", "temple"],
                 man=["happy", "daily", "always"], ktva=1, tum=1, obj_per_human=1),
    "लभ्": dict(code="01.1130", mode="kartari_A", en=("obtain", "obtains", "obtained"), ag=["per"], obj=["gain!", "पुस्तक", "फल"], src=["teaches", "नृप", "पितृ", "मातृ"],
                loc=["school", "market", "temple"], man=[], ktva=1, tum=1),
    "रक्ष्": dict(code="01.0746", en=("protect", "protects", "protected"), ag=["per", "dog"], obj=["per!", "ani", "गृह", "नगर", "ग्राम", "क्षेत्र"],
                  man=["well", "always"], ktva=1, tum=1, guard=1),
    "चर्": dict(code="01.0640", en=("graze", "grazes", "grazed"), ag=["herb"], loc=["field", "forest"], com=1, man=["slow", "daily"], ktva=0, tum=1),
    "हस्": dict(code="01.0822", en=("laugh", "laughs", "laughed"), ag=["per"], loc=["home", "school", "garden"], com=1, man=["loud", "happy"], ktva=1, tum=0),
    "जि": dict(code="01.1096", en=("conquer", "conquers", "conquered"), ag=["rules"], obj=["foe!", "नगर"], inst=["रथ"],
               man=["fast"], ktva=1, tum=1),
    "पूज्": dict(code="10.0144", en=("worship", "worships", "worshipped"), ag=["per"], obj=["देव!"], inst=["पुष्प"], loc=["temple", "home"],
                 man=["daily", "happy"], ktva=1, tum=1),
    "श्रु": dict(code="01.1092", en=("listen to", "listens to", "listened to"), ag=["per"], obj=["heard!"], loc=["home", "school", "temple", "garden", "seat"],
                 com=1, man=["happy", "careful"], ktva=1, tum=1),
    "नृत्": dict(code="04.0010", en=("dance", "dances", "danced"), ag=["per", "dances"], loc=["garden", "temple", "forest", "home"], com=1,
                 man=["well", "happy"], ktva=1, tum=1),
    "सिच्": dict(code="06.0170", en=("water", "waters", "watered"), ag=["per"], obj=["plant!"], inst=["जल"], loc=["garden", "field"],
                 man=["daily", "careful"], ktva=1, tum=1),
    "कृ": dict(code="08.0010", mode="kartari_P", en=("do", "does", "did"), ag=["per"], obj=["done!"], loc=["home", "school", "field", "market"],
               man=["well", "fast", "careful", "daily"], ktva=1, tum=1),
    "क्री": dict(code="09.0001", mode="kartari_P", en=("buy", "buys", "bought"), ag=["per"], obj=["thing!", "food", "मोदक"], loc=["market"],
                 man=[], ktva=1, tum=1),
    "उपविश्": dict(code="06.0160", pre="upa", en=("sit", "sits", "sat"), ag=["per"], loc=["seat", "ground", "garden"], com=1,
                    man=["slow", "happy"], ktva=1, tum=0),
    "इष्": dict(code="06.0078", en=("want", "wants", "wanted"), ag=["per"], purpose=1, need_purpose=1, man=[], ktva=0, tum=0),
}

# manners: (Sanskrit, English, tenses it may go with)
MAN = {
    "well": ("सम्यक्", "well", None), "loud": ("उच्चैः", "loudly", None), "slow": ("मन्दम्", "slowly", None),
    "fast": ("शीघ्रम्", "quickly", None), "careful": ("सावधानम्", "carefully", None), "happy": ("सुखेन", "happily", None),
    "daily": ("प्रतिदिनम्", "every day", ["lat", "vidhilin"]), "always": ("सदा", "always", ["lat", "vidhilin"]),
}
# time words: (Sanskrit, English, tenses).  लङ् is the past not of today (अनद्यतने लङ् 3.2.111): never with अद्य or with
# a time of today; श्वः is left out (the future not of today is लुट्, 3.3.15).
# where animals go, stay and act (persons may be anywhere a verb allows)
PLACE_FOR = {"herb": ["forest", "field", "village", "river"], "dog": ["home", "village", "road", "garden", "field"],
             "lion": ["forest", "mountain", "river"], "monkey": ["forest", "tree", "garden", "mountain"],
             "bird": ["tree", "forest", "garden", "river", "field"]}
# what a person may own: "the X's Y"
OWNED = ["kin", "thing", "herb", "dog", "गृह", "क्षेत्र", "उद्यान", "रथ"]
TIME = [
    ("अद्य", "today", ["lat", "lrt", "lot", "vidhilin"]),
    ("ह्यः", "yesterday", ["lan"]),
    ("इदानीम्", "now", ["lat", "lot"]),
    ("प्रातः", "in the morning", ["lat", "lrt", "lot", "vidhilin"]),
    ("सायङ्काले", "in the evening", ["lat", "lrt", "lot", "vidhilin"]),
    ("रात्रौ", "at night", ["lat", "lrt", "lot", "vidhilin"]),
]
TENSES = {"lat": "present", "lan": "past", "lrt": "future", "lot": "imperative", "vidhilin": "should"}
