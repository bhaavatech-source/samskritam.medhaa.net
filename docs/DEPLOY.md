# Putting संस्कृतमेधा on medhaa.net

Same steps as Akṣarābhyāsaḥ (devanagari-game), with a new slug.

## 1. Build (on your computer)
```powershell
cd D:\SamskritaMedhaa-Game\app
npm install        # first time only
npm run build      # type-check + bundle → app\dist\
```

## 2. Copy into medhaa
Folder: `apps/web/public/games-static/samskrita-medhaa-game/`

1. Copy everything from `app\dist\` into that folder: `index.html`, `favicon.svg` and `assets\`.
2. Add the medhaa page shell to `index.html` as in the other games:
   `bhava-responsive.css`, `bhava-responsive.js`, `bhava-game-nav.js` and the Medhā navigation `<script>`.
   Keep `data-bhava-mobile="off"`, because the game is designed for upright phones.
3. The game already calls `BhavaSession.start("samskrita-medhaa")` and `BhavaSession.end(...)` when they exist.

## 3. Catalogue entry — `apps/web/src/data/gamesCatalog.ts`
```ts
  'samskrita-medhaa-game': {
    slug: 'samskrita-medhaa-game', title: 'Saṃskṛtamedhā · Sanskrit',
    tagline: 'Learn Saṃskṛtam by playing',
    description: "A journey through Sanskrit in three levels — Bāla, Adhyetā and Nipuṇa. Match words and meanings, pick the right noun and verb forms, build sentences, and explore full declension and conjugation tables with meanings in 19 languages.",
    secondary: 'Sanskrit Grammar', skillsBuilt: ['Vocabulary', 'Noun & Verb Forms', 'Sentence Building'],
    ageMin: 8, ageMax: 17, color: '#8b5cf6', domain: 'language-sanskrit', emoji: '🪷',
  },
```
Change `domain` to whatever your Sanskrit filter uses.

## 4. Before announcing it
- Finish one review pass of Bāla data (words 1–70, the present tense, the 85 avyayas) and fix the flags.
- Get a native speaker to check the Hindi and Telugu avyaya meanings. They are marked *draft*.
- Try it on one iPhone and one Android phone.
