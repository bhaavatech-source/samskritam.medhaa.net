# Further corrections and additions to the sandhi data, reviewed 2026-11-19.
# Applied by tools/build_grammar.py after rules_2026-11-08.py. The Gold file
# (06-gold-data/Sandhi_Gold_Data_UPDATED_COMPLETE_P1.json) is not changed.
# Example index = order printed by  python tools/build_grammar.py --list

# ── corrected examples ─────────────────────────────────────────────
EX_FIX = {
 # Gold: "सुध् + ध्य् उपास्य" — an inner step shown as if it were the starting words
 115: {"a": "सुधी", "b": "उपास्यः", "r": "सुद्ध्युपास्यः / सुध्युपास्यः",
       "note": "यण् (इको यणचि 6.1.77): सुध्य् + उपास्यः; then ध् may be doubled (अनचि च 8.4.47) and the first ध् becomes द् (झलां जश् झशि 8.4.53)", "game": 0},
 # Gold: "रामाद् + (nothing)" — the change happens at a pause, not before another word
 122: {"b": "", "r": "रामात् / रामाद्", "note": "at a pause (अवसानम्) the final झल् may become चर्: वाऽवसाने (8.4.56)", "game": 0},
 # Gold: "लक्ष्मीत् + छाया" — not a typo: the त् is the तुक् already added (छे च / पदान्ताद्वा); श्चुत्व then makes it च्
 138: {"note": "after तुक् has been added (लक्ष्मी + त् + छाया, see तुगागमः): त् → च् by श्चुत्व"},
}

# ── added examples (source: sandhi_samasa_game_levels_v2.json, checked) ──
ADD = {
 "jash": [
  {"a": "वाक्", "b": "अपि", "r": "वागपि", "scope": "ext", "note": "क् → ग् at the end of a word (झलां जशोऽन्ते 8.2.39)", "game": 1},
  {"a": "तत्", "b": "अपि", "r": "तदपि", "scope": "ext", "note": "त् → द् at the end of a word (झलां जशोऽन्ते 8.2.39)", "game": 1},
 ],
 "purvarupa": [
  {"a": "गो", "b": "अग्रम्", "r": "गवाग्रम् / गोऽग्रम् / गो अग्रम्", "scope": "exc",
   "note": "सर्वत्र विभाषा गोः (6.1.122): गो + अ optionally stays apart or takes पूर्वरूप; अवङ् स्फोटायनस्य (6.1.123): or गो → गव", "game": 0},
 ],
}

# ── a new rule: प्रकृतिभावः (no sandhi), from the Gold's EXCEPTIONS_TO_SVARA_SANDHI (PART_7) ──
NEW_RULES = [
 ("purvarupa", {  # placed after this rule
  "id": "prakriti", "group": "svara", "name": "प्रकृतिभावः", "en": "no sandhi: the vowel stays as it is",
  "sutra": "प्लुतप्रगृह्या अचि नित्यम् (6.1.125) · ईदूदेद्द्विवचनं प्रगृह्यम् (1.1.11) · अदसो मात् (1.1.12) · निपात एकाजनाङ् (1.1.14) · ओत् (1.1.15)",
  "what": "a प्लुत vowel, or a प्रगृह्य vowel (dual ई/ऊ/ए, अमी/अमू of अदस्, a one-vowel निपात, a निपात ending in ओ) does not join a following vowel",
  "ex": [
   {"a": "हरी", "b": "एतौ", "r": "हरी एतौ", "scope": "exc", "note": "dual ending ई is प्रगृह्य (1.1.11) — no यणादेशः", "game": 0},
   {"a": "राम३", "b": "अत्र", "r": "राम३ अत्र", "scope": "exc", "note": "प्लुत vowel (३) — no sandhi", "game": 0},
   {"a": "राम३", "b": "इह", "r": "राम३ इह", "scope": "exc", "note": "प्लुत vowel (३) — no sandhi", "game": 0},
   {"a": "इ", "b": "इन्द्रः", "r": "इ इन्द्रः", "scope": "exc", "note": "one-vowel निपात (1.1.14) — no दीर्घः", "game": 0},
   {"a": "उ", "b": "उमेशः", "r": "उ उमेशः", "scope": "exc", "note": "one-vowel निपात (1.1.14) — no दीर्घः", "game": 0},
   {"a": "अहो", "b": "ईशाः", "r": "अहो ईशाः", "scope": "exc", "note": "निपात ending in ओ (1.1.15) — no अवादेशः", "game": 0},
   {"a": "अमी", "b": "ईशाः", "r": "अमी ईशाः", "scope": "exc", "note": "ई after म् of अदस् (1.1.12) — no दीर्घः", "game": 0},
   {"a": "अमू", "b": "इमौ", "r": "अमू इमौ", "scope": "exc", "note": "ऊ after म् of अदस् (1.1.12) — no यणादेशः", "game": 0},
  ]}),
]
