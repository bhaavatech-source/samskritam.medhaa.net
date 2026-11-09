# Reviewing the data by playing

You never need to open a JSON file. Everything can be checked inside the game.

## 1. Open the game
Double-click `play\index.html`. Chrome or Edge works best. You need internet only for the fonts.

## 2. Choose the meaning language
Use **अर्थभाषा · Meanings in** at the top right of every screen. Telugu is the default. Meanings exist for
19 languages. Verbs and avyayas have English, Hindi and Telugu. Other languages fall back to English.

## 3. Learner view and Reviewer mode
By default the game shows only the content: forms, meanings and tables, with no source labels, buttons or IDs.
For reviewing, tick **समीक्षकः · Reviewer mode** in the footer. That shows:
- where each meaning came from (direct / linked / corrected / draft)
- ✓ and ⚑ next to every form and meaning
- notes, IDs, Dhāturūpa Mañjarī page numbers and the review list
Untick it to see the page the way children will.

## 3a. Where to look
| Tab | What you can check |
|-----|--------------------|
| 🗺️ यात्रा | 21 stations in three regions. Tick **सर्वम् उद्घाटय · open all** to open every station without earning stars. |
| 📖 शब्दकोशः | All 210 words. You get the full 8 × 3 declension table and meanings in every language. Each meaning has a label for its source. 🔁 marks words whose forms were regenerated, so check those first. |
| 🌱 धातुकोशः | 25 roots × 10 lakāras, in active, passive and impersonal. "पृ. N" is the Dhāturūpa Mañjarī page. The kṛdantas are listed below each verb, and there are 103 more roots in the second tab. |
| 💬 वाक्यकोशः | 220 sentences and the 85 school avyayas. Their Hindi and Telugu meanings are drafts. |

Search works in Devanāgarī, IAST, English and Telugu.

## 4. Meanings of every form (new)
Under each form in the word and verb books, a grey line gives its meaning in the language you chose.
Examples: रामेण → Telugu "శ్రీరాముని చేత / శ్రీరామునితో", Hindi "श्री राम से", Japanese "ラーマで".
These lines come from one **pattern per language** (`app/src/i18n/forms.ts`):
- **Nouns**: the word's meaning plus that language's case marker. English, Hindi and Telugu also handle pronouns properly (मुझसे, నా చేత, by me).
- **Verbs**: pronoun · verb meaning · tense in that language. English has hand-written sentences ("they two go").
- **Kṛdantas**: verb meaning → what the suffix does in that language ("…చేసి", "…して").

A reviewer for each language only has to check **one full table**, e.g. राम, लता, फल, अस्मद्, गम्.
If a pattern is wrong, one ⚑ with the right wording fixes it for every word.

## 5. ✓ correct and ⚑ wrong
Each meaning and form-meaning has two small buttons:
- **✓**: "this is correct". It turns green. Tap again to undo.
- **⚑**: "this is wrong". Choose what is wrong, type the correct form if you know it, and add a note if you want.
Both are saved, and both go to Claude in the export. Entries marked ✓ count as reviewed.

## 6. Flag a mistake
Tap **⚑** next to any form or meaning. During a game, tap **⚑ दोषः? Report**.
Choose what is wrong. Type the correct form if you know it, and add a note if you want. Flagged items turn red,
and each list has a **⚑ only flagged** filter.

## 7. Send the flags to Claude
Footer → **⚑ दोषसूचनाः · Reported mistakes**:
- **⬇ JSON (for Claude)**: attach this file in the chat and ask "fix my flags". Claude corrects the master files in
  `data-source\` and rebuilds the game data.
- **⬇ Excel / CSV**: opens in Excel to read or share with a colleague.
- **⬆ Import flags…**: merges a JSON export from another computer or browser.

Flags are kept in the browser you used to make them. Edge and Chrome keep separate lists, so export before you clear browser data.
