# data-source/21-upasarga/corrections_2026-11-15.py
# Corrections to the उपसर्गाः tab (Gold file upasarga_gold_data.json is not edited).
# Used by tools/build_grammar.py. Every change has a reason.

# ── text from the Gold file ─────────────────────────────────────
PADA = ("उपसर्गाः अपि सुबन्तपदानि एव। अव्ययात् परः सुप्-प्रत्ययः लुप्यते (अव्ययादाप्सुपः 2.4.82), "
        "अतः तेषां रूपम् एकमेव दृश्यते।")
# Gold: "… केवलं प्रथमैकवचनप्रत्ययः (सुः) एव भवति". Wrong: any sup ending may follow an avyaya;
# 2.4.82 deletes it. It is not restricted to सु.

CLS = "उपसर्गाः अव्ययेषु अन्तर्भवन्ति (प्रादयः 1.4.58 निपाताः; स्वरादिनिपातमव्ययम् 1.1.37)।"
# Gold gave the statement without its source; sūtras added.

NATURE = ("उपसर्गाः सर्वदा धातुना योगे सत्येव भवन्ति (उपसर्गाः क्रियायोगे 1.4.59), लौकिकभाषायां सर्वदा "
          "धातोः अव्यवहितपूर्वाश्च भवन्ति (ते प्राग्धातोः 1.4.80)। वैयाकरणमते एतेषां स्वतन्त्रः अर्थः न वर्तते; "
          "केवलं धातोः विद्यमानम् अर्थमेव (धात्वर्थमेव) प्रकाशयन्ति (द्योतकत्वपक्षः)।")
# Gold: ". " in place of a daṇḍa; the dyotaka view was stated as plain fact. Now named as the
# grammarians' view, with the sūtras for “with a verb” and “before the verb”.

COUNT_NOTE = "22 upasargas; निस्/निर्, दुस्/दुर् and उत्/उद् are shown together, as in the Upasargārthacandrikā (दुर् (दुस्))."
# Gold: total_count 20 — the traditional count of prādi is 22 (निस् and दुस् counted separately).

# ── the three ways (धात्वर्थं बाधते …) ──────────────────────────────
THREE = [
    ["बाधते", "shifts or reverses the root's sense",
     "आ + गम् → आगच्छति “comes” (गच्छति “goes”); प्र + स्था → प्रतिष्ठते “sets out” (स्था “stays”)"],
    ["अनुवर्तते", "follows it, adds nothing",
     "अधि + इ → अधीते “studies” (इङ् already means अध्ययन)"],
    ["विशिनष्टि", "narrows or intensifies it",
     "परि + त्यज् → परित्यजति “abandons completely”"],
]
# Old: the हृ examples (प्रहार, आहार …) were given under विशिनष्टि. The verse that cites them
# (उपसर्गेण धात्वर्थो बलादन्यत्र नीयते) gives them as examples of the meaning being carried
# elsewhere, i.e. बाधते. They stay in the हृ row below, now introduced by that verse.

VERSE2 = "उपसर्गेण धात्वर्थो बलादन्यत्र नीयते। प्रहाराहारसंहारविहारपरिहारवत्।।"
VERSE2_EN = "An upasarga carries the root's meaning by force to another sense, as in प्रहार, आहार, संहार, विहार and परिहार."

# ── examples in the list (UP in build_grammar.py) ─────────────────
UP_FIX = {
    "परा": ("away, back, against", [("पराजयते", "overcomes, defeats"), ("पराक्रमः", "valour")]),
    # “पराजयते: is defeated” — wrong; पराजयते is active (1.3.19); “is defeated” is पराजीयते.
    "अति": ("beyond, very", [("अतिक्रामति", "goes beyond"), ("अतिशेते", "surpasses")]),
    # अतिथिः is not अति + a root (traditionally from अत् “to wander”); replaced.
    "परि": ("around, fully", [("परिक्रामति", "walks around"), ("परिहारः", "avoidance")]),
    # परिक्रमति → परिक्रामति (7.3.76 क्रमः परस्मैपदेषु lengthens the vowel).
}

# rows of the list → ids in upasarga_dhatu_mappings (UP-xx)
ROW_IDS = {
    "प्र": ["UP-01"], "परा": ["UP-02"], "अप": ["UP-03"], "सम्": ["UP-04"], "अनु": ["UP-05"], "अव": ["UP-06"],
    "निस्/निर्": ["UP-07", "UP-08"], "दुस्/दुर्": ["UP-09", "UP-10"], "वि": ["UP-11"], "आ": ["UP-12"],
    "नि": ["UP-13"], "अधि": ["UP-14"], "अपि": ["UP-15"], "अति": ["UP-16"], "सु": ["UP-17"], "उत्/उद्": ["UP-18"],
    "अभि": ["UP-19"], "प्रति": ["UP-20"], "परि": ["UP-21"], "उप": ["UP-22"],
}
