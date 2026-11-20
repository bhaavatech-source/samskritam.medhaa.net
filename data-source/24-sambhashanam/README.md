# 24 · सम्भाषणम् (graded spoken Sanskrit)

A three-level course in spoken Sanskrit, built on 2026-11-17.

## Levels

| Level | Status | Content |
|---|---|---|
| 1 | 20 lessons (`L1a.py`, `L1b.py`, `L1c.py`) | Greetings; the verb अस्; एषः/सः/कः; present tense (all persons); the seven cases and the vocative; indeclinables of place, time and question; लोट्; ऌट्; -त्वा; -तुम्; -तवत्; -त; -तव्य/-अनीय |
| 2 | 20 lessons (`L2a.py`, `L2b.py`, `L2c.py`) | आत्मनेपद लट्; लङ् (both padas); विधिलिङ्; numbers; time and weekdays; paired indeclinables (यदि…तर्हि, यद्यपि…तथापि); उपरि/अधः etc. with the 6th case; उपपदविभक्तयः; ल्यप्; क्त्वा ↔ ल्यप् ↔ तुमुन्; passive लट्; impersonal (भावे); कर्तरि ↔ कर्मणि; शतृ/शानच्; tense changes (लट् ↔ लङ् ↔ क्तवतु ↔ ऌट्); सर्व, अन्य, कश्चित्, किञ्चित्; adjective agreement; इ/उ/ऋ stems; conversations at the shop, on a journey, at the doctor's |
| 3 | 20 lessons (`L3a.py`, `L3b.py`, `L3c.py`) | causatives (णिच्); desideratives (सन्); लिट् in narration; मा + लुङ्; आशीर्लिङ्; ऌङ् conditionals; relative clauses (यः…सः, यत्र…तत्र, यथा…तथा); इति; सति सप्तमी; compounds (तत्पुरुष, कर्मधारय, द्विगु, द्वन्द्व, बहुव्रीहि, अव्ययीभाव); तद्धित suffixes; passive in other lakāras; -तुकाम/-तुमनस् and णमुल्; comparatives and superlatives; formal speech; telephone and letters; opinions and reasons; storytelling; mixed transformations |

## Lesson format

Each lesson in `L*.py` has these fields:

- `id`, `sa`, `en`
- `point`: key points in English with Sanskrit examples
- `pattern`: a table
- `vocab`: word, gender, English, Hindi, Telugu. With a gender given (`m`, `f`, `n`), the word is declined by `decl.py` for checking; `adj` declines it in all three genders.
- `s`: model sentences in Sanskrit with English, Hindi and Telugu
- `ex`: exercises
  - `("c", prompt, options, answer, hint)` — choose the right form or reply
  - `("t", sentence, instruction, options, answer)` — transform a sentence

Practice on the site adds two more exercise types made from the sentences: arranging the words, and choosing the meaning.

## Checking

`run_check.py L1a L1b L1c L2a L2b L2c L3a L3b L3c` checks every word of every sentence and every correct answer against:

- the verb tables (`app/public/rupa`: 357 roots, all lakāras, active and passive, prefixes, kṛt forms with their declension)
- the noun declensions (`words.json`)
- the vocabulary of each lesson (declined by `decl.py`, ṇatva included)
- the avyaya list and pronouns
- `common_forms.tsv` (forms checked by hand)

All three levels (60 lessons, 1,549 sentences and answers) pass with no unknown forms. Errors found this way and corrected:

- Level 1: वसिष्यथः → वत्स्यथः; लिखितुम् → लेखितुम्
- Level 2: प्रस्थास्यति → प्रस्थास्यते (प्र + स्था is आत्मनेपदी); आसन्दे → आसने
- Level 3 (while writing): उवासुः → ऊषुः (वस् लिट् 3rd plural)

Forms not in the tables (adjectives, causatives, desideratives, compounds, taddhitas, some aorists) were checked by hand and recorded in `common_forms.tsv`.

The paths in `checker.py` and `run_check.py` point to the workspace where the checks were run; adjust them to run locally.

## Building the site data

```
python build_sambhashanam.py data-source/24-sambhashanam app/src/data/sentences.json app/src/data/sambhashanam.json
```

Sentences that also appear in the sentence book (वाक्यकोशः) keep a link to their SN- id; the three levels share 30 of them.
