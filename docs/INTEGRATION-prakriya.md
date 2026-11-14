# Integration plan — प्रकृतिः प्रत्ययश्च & प्रक्रिया (2026-11-12)

Source: Dr. B. Rajeswara Rao, *Gold Data* — प्रकृतिप्रत्ययस्वरूपम् and प्रक्रियास्वरूपम् (docx, kept in `data-source/15-prakriya/`).

## What goes where

| Part of the Gold text | In the game |
|---|---|
| Why grammar; धातुः · प्रातिपदिकम् · प्रत्ययः; 7 kinds of root; 5 kinds of stem; what a suffix is (the तृच् family) | बोधः → **प्रकृतिः प्रत्ययश्च**, cards 1–5 |
| The 11 kinds of प्रत्यय (what each turns into what) + Pāṇini's 6 groups | बोधः → प्रकृतिः प्रत्ययश्च, card "एकादश प्रत्ययप्रकाराः" · game **a11 प्रत्ययभेदाः** |
| प्रत्ययमाला (भू → भावि → भावयत् → भावयन् → भावयत्त्व → भावयत्त्वम्) + other chains | बोधः → प्रकृतिः प्रत्ययश्च, tap-to-add card |
| अपदं न प्रयुञ्जीत; सुप् (21) and तिङ् (18) tables | बोधः → प्रकृतिः प्रत्ययश्च |
| रामेण, भवति step by step (+ 14 more derivations) | stepper in both chapters · game **n9 प्रक्रियाक्रमः** |
| Levels of रामो रावणञ्जघान, listener ↓ / speaker ↑ | बोधः → **प्रक्रिया**, level-by-level viewer with a direction switch |
| वाक्यावस्थापन्ना / पदावस्थापन्ना प्रक्रिया; अयण्डिम्बो ममापोऽपिबत् | बोधः → प्रक्रिया |
| Kinds of प्रक्रिया by level; kinds of सुबन्त and तिङन्त; तिङन्त is primary | बोधः → प्रक्रिया |
| What a root is (गच्छति… → गम्); how क्तवतु was abstracted | बोधः → प्रक्रिया |
| Suffixes from roots (कृत्, तिङ्, सनादि; by meaning) and from stems; where in the Aṣṭādhyāyī | बोधः → प्रक्रिया |
| Every change made to the Gold wording (12) | बोधः → प्रक्रिया, last card — **Reviewer mode only** |

## Files (put them at the same paths inside D:\SamskritaMedhaa-Game)

New
- `data-source/15-prakriya/prakriya.py` — all the chapter content and the 16 derivations (edit here)
- `data-source/15-prakriya/Gold_Prakriti_Pratyaya_Svaroopam.docx`, `Gold_Prakriya_Svaroopam.docx` — the originals
- `tools/build_prakriya.py` — prakriya.py → `app/src/data/prakriya.json`
- `app/src/data/prakriya.json` — built output (already built)
- `app/src/learn/Prakriya.tsx` — the two chapters + the step-by-step viewer

Changed
- `app/src/learn/Learn.tsx` — two more chapter buttons; source line
- `app/src/learn/learn.css` — styles at the end (`.pk-…`)
- `app/src/data/index.ts` — exports `PRAKRIYA` (added at the end)
- `app/src/game/stations.ts` — stations a11 and n9
- `play/assets/game.js`, `play/assets/game.css` — the double-click version, rebuilt
- `docs/REVIEW-2026-11-08.md` — section "प्रकृतिः प्रत्ययश्च · प्रक्रिया" added

## After copying
```
python tools\build_prakriya.py      (only if you edit prakriya.py)
cd app
npm run dev                          (or: npm run build)
```

## Next (not done yet)
1. पदम् chapter + वाक्यविश्लेषणम् tab (the "ten boys" story) from *Parts of Sentences*.
2. Stations पदविभागः, वाच्यपरिवर्तनम्, सकर्मक/अकर्मक.
3. More derivations for प्रक्रियाक्रमः — add rows to `DERIVATIONS` in prakriya.py; each must have distinct steps.
4. English summaries of these chapters in the other 16 languages, if wanted.
