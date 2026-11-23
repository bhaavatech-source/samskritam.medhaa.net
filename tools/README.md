# tools

| Script | What it does | Runs on |
|--------|--------------|---------|
| `build_game_data.py` | Reads `data-source\` and writes `app\src\data\*.json` (words, verbs, kṛt, sentences, avyaya). It also fixes 5 known spelling slips in the Gold sentences. | Windows / any OS, Python 3 |
| `build_padaccheda.py` | Builds the corrected Padaccheda list from `data-source\16-padaccheda\` (the author's Updated file plus reviewed corrections). Run it before `build_game_data.py`. | Python 3 |
| `avyaya85.py` | The 85 school avyayas with category and English/Hindi/Telugu. `build_game_data.py` imports it. Edit the ROWS here to change an avyaya. | (imported) |
| `regen_sup.py` | Regenerates the 210 declension tables with the Pāṇinian engine *vidyut-prakriya*. It also applies the manual fixes for विद्वस्, सुधी, ग्रामणी, ugit stems, -तृ agent nouns, i-numerals and others. | Claude's workspace only. It needs the vidyut build and is kept here as the record of how the tables were made. |

Typical cycle after Claude has fixed the master files:
```powershell
cd D:\SamskritaMedhaa-Game
python tools\build_padaccheda.py
python tools\build_game_data.py
cd app
npm run build
```

## build_sahitya.py
`python tools/build_sahitya.py` reads `data-source/26-alankara/alankaras_complete-v3.json` and writes the complete Alankāra dataset to `app/src/data/alankara.json`, alongside the generated Chandas data.

## build_grammar.py
`python tools/build_grammar.py` → `app/src/data/grammar.json` (sandhi, samāsa, kṛt suffixes, upasargas) from the Gold files plus the reviewed corrections in `data-source/12-samasa/` and `data-source/13-sandhi/`. `--list` prints every sandhi example with the index used in the corrections file.

## build_krt_lex.py
`python tools/build_krt_lex.py` → `app/src/data/krtlex.json`. One table per language in `data-source/14-krt-meanings/` (126 roots: the few verb forms that language needs). `app/src/i18n/krtForms.ts` builds the nine kinds of kṛdanta meaning from them (पीकर, తాగి, nachdem er getrunken hat, 飲んで…).
