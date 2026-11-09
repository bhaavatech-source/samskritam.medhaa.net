# संस्कृतमेधा · Saṃskṛtamedhā — the Sanskrit learning game

This folder is the **whole game**: the playable copy, the source code, all the reviewed data, and the
tools that turn the data into the game. It is separate from the old `samskrita-medhaa` project
(client + server) and does not need it.

## Where to keep it

Unzip so that this README sits at:

```
D:\SamskritaMedhaa-Game\README.md
```

Any other folder name also works. Nothing inside depends on the drive letter.

## What is inside

```
D:\SamskritaMedhaa-Game\
│
├─ play\                     ← OPEN THIS: double-click play\index.html (no install)
│
├─ app\                      the game's source code (React + TypeScript + Vite)
│   ├─ index.html
│   ├─ package.json          npm install / npm run dev / npm run build
│   ├─ public\               favicon
│   └─ src\
│       ├─ App.tsx           page frame + the four tabs
│       ├─ game\             यात्रा (journey): stations.ts, Journey.tsx, GameShell.tsx
│       │   └─ games\        Quiz.tsx, MemoryMatch.tsx, SentenceBuilder.tsx
│       ├─ kosha\            शब्दकोशः, धातुकोशः, वाक्यकोशः, दोषसूचनाः (books + flags)
│       ├─ data\             ← the game data (generated — do not edit by hand)
│       │   ├─ words.json        210 words: declensions + meanings in 19 languages
│       │   ├─ verbs.json        25 roots: 10 lakāras, active/passive/impersonal
│       │   ├─ krt.json          126 roots: kṛdantas
│       │   ├─ sentences.json    220 everyday sentences
│       │   └─ avyaya.json       85 school-level avyayas
│       ├─ flags.ts          ⚑ report-a-mistake storage + export
│       └─ theme.css, App.css   same look as Akṣarābhyāsaḥ
│
├─ data-source\              the MASTER copies of every reviewed data file
│   ├─ 01-shabda-words\      shabda_meanings.json, shabda_with_declensions.json, review CSV
│   ├─ 02-dhatu-verbs\       dhatu_25_corrected.json (checked against Dhāturūpa Mañjarī), comparison CSV
│   ├─ 03-krt-participles\   dhatu_krt_corrected.json, comparison CSV
│   ├─ 04-taddhita\          taddhita_pratyaya_corrected.json   (for Adhyetā/Nipuṇa later)
│   ├─ 05-avyaya\            avyaya_school_85.csv
│   ├─ 06-gold-data\         your Gold Data (repaired JSON) + REPAIR_LOG.md
│   └─ 07-old-game-data\     put the old samskrita-medhaa\data folder here (see its README)
│
├─ tools\                    Python scripts that build app\src\data from data-source
│   ├─ build_game_data.py    python tools\build_game_data.py
│   └─ build_grammar.py      python tools\build_grammar.py   (sandhi, samāsa, suffixes)
│
└─ docs\
    ├─ HOW-TO-REVIEW.md      playing, flagging errors, sending flags to Claude
    └─ DEPLOY.md             putting the game on medhaa.net
```

## How the files connect

```
data-source\  ──(tools\build_game_data.py)──►  app\src\data\*.json  ──(npm run build)──►  app\dist\  ──► medhaa.net
                                                      ▲
     your ⚑ flags (CSV/JSON) ──► Claude fixes data-source\ ──┘
```

1. **data-source** holds the reviewed master files. These are the only data files that get corrected.
2. **tools\build_game_data.py** and **tools\build_grammar.py** read them and write the small files in `app\src\data\`.
3. **app** is the game. `npm run build` makes `app\dist\`, the folder you upload.
4. **play** is a ready-made copy of the current build, so you can play and review without installing anything.

## Everyday use

| I want to…                         | Do this |
|------------------------------------|---------|
| Play / review the data             | Double-click `play\index.html` |
| Report a wrong form or meaning     | Tap ⚑ next to it (in a game or in a book) |
| Send my flags to Claude            | Footer → ⚑ दोषसूचनाः → **⬇ JSON (for Claude)**, attach the file in chat |
| Change the code and see it live    | `cd app` → `npm install` (once) → `npm run dev` |
| Rebuild after Claude fixes data    | `python tools\build_game_data.py` → `cd app` → `npm run build` |

Needs: Node.js 20+ (for `app`), Python 3.10+ (for `tools`). Playing `play\` needs only a browser.
