# 25-vakya — वाक्यरचना (sentence building) in क्रीडाङ्गणम्

The data behind the third tab of क्रीडाङ्गणम् (**वाक्यरचना · Sentences**): sentences of 3 to 40 words that the
learner grows (वर्धय), builds from tiles (रचय) or corrects (शोधय).

| File | What it is |
|---|---|
| `vakya_lexicon_2026-11-20.py` | Which words go together: 78 nouns, 20 adjectives, 33 verbs; who can do each action, what it can be done to, where, with what, for whom, from where; manners and time words with the tenses they allow |
| `gen_vidyut_forms.py` | Makes the forms the site's tables do not have yet, with vidyut-prakriya (run once on the build machine) |
| `vidyut_forms_2026-11-20.json` | Its output: 32 added nouns, the 20 adjectives in three genders, यद्/तद्, and the verb table of श्रु |

`tools/build_vakya.py` puts these together with `app/src/data/words.json` and `app/public/rupa/` into
`app/src/data/vakya.json`. Nothing is edited.

**No form is made by the game.** Every word form shown is a cell of a checked table: words.json declensions,
the rupa verb tables (vidyut-prakriya), or the vidyut forms above. The game only puts each word in the case,
gender, number, person and tense its role needs:

- doer → 1st case; the verb agrees in person and number (two doers joined by च → dual, more → plural)
- object → 2nd · destination of going → 2nd, and the 4th is accepted too (गत्यर्थकर्मणि द्वितीयाचतुर्थ्यौ चेष्टायामनध्वनि 2.3.12)
- instrument, companion with सह → 3rd · recipient → 4th · source → 5th
- owner → 6th · place → 7th · adjective → the gender, case and number of its noun
- यः … सः → the gender and number of the noun
- -त्वा (an earlier action of the same doer), -तुम् (a purpose, with going, coming and wanting)

**Explanations** cite the sūtra that gives each case (कर्मणि द्वितीया 2.3.2, कर्तृकरणयोस्तृतीया 2.3.18, सहयुक्तेऽप्रधाने 2.3.19,
चतुर्थी सम्प्रदाने 2.3.13, अपादाने पञ्चमी 2.3.28, षष्ठी शेषे 2.3.50, सप्तम्यधिकरणे च 2.3.36; the doer: अभिहिते कर्तरि प्रथमा),
and for -त्वा 3.4.21 (ल्यप् 7.1.37), for -तुम् 3.3.10 or, with a verb of wishing, 3.3.158.

**Sense.** The lexicon keeps sentences meaningful: cows graze in fields, birds live in trees, only people
write with pens, fruit falls from trees, a purpose fits its place (to bathe → river), and so on.

**Tense.** लङ् is the past not of today (अनद्यतने लङ् 3.2.111), so it never goes with अद्य; श्वः is left out
(the future not of today is लुट्, 3.3.15). The command (लोट्) is used only with "you".

**Writing.** Words are written apart, as in teaching, with ं for म् before a consonant (मोऽनुस्वारः 8.3.23).

**Word order.** Phrases of a clause may go in any order; the words of one phrase stay together (adjective + noun,
X सह, an object with its -त्वा, X Y च); यदा- and यः-clauses come first.

**Checks (2026-11-20).**
- In 7,500 sentences of every length, every form was found in the tables, and every agreement, sense and tense
  rule held.
- 3,000 reordered sentences (phrases moved) were accepted, and all 990 with an adjective moved away from its noun
  were rejected.
- In Grow, 44,000 form choices had the right answer exactly once; Build and Fix were tested on 4,400 rounds.
