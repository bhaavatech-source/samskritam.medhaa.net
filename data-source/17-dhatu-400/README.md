# Dhātu-rūpas for the 400 recitation dhātus — 2026-11-13

## Files

| File | What it holds |
|---|---|
| `dhatu_400_tinanta.json` | One record per entry of your list (398 of 400; same schema as the 25-dhātu file). Each record has all 10 lakāras × 3 puruṣas × 3 vacanas: kartari parasmaipada and/or ātmanepada, karmaṇi (transitive roots) or bhāve (intransitive roots), an English gloss for every form, and the checks for each form. |
| `dhatu_400_krt.json` | The same 398 entries with 20 kṛt affixes each (क्त्वा, ल्यप्, तुमुन्, णमुल्, शतृ, शानच्, क्त, क्तवतु, तव्यत्, अनीयर्, यत्, ण्यत्, क्यप्, ण्वुल्, तृच्, ल्युट्, क्तिन्, घञ्, अच्, अप्). Schema is the same as the 126-root kṛt file. |
| `dhatu_400_review.csv` | One row per entry: your upadeśa, the Dhātupāṭha entry it was matched to, its status (ok / corrected / duplicate / not in the Dhātupāṭha), and the reason. Opens in Excel. |

## Numbers

- 400 entries → **353 different roots**, plus 45 entries that repeat a root already in the list. Duplicates point to the first entry through `same_root_as`. 2 entries are not in the Dhātupāṭha.
- 7 entries listed under the 10th class (मोहयति, तोषयति, दीपयति, भासयति, लोभयति, कूर्दयति, धारयति) are **causatives** of other roots, so they are given as णिजन्त forms.
- 62,524 tiṅanta forms and 5,641 kṛt forms (one form per cell, plus its optional variants).

## How the forms were made and checked

1. Every form was derived with **vidyut-prakriya**, an open implementation of Pāṇini's rules (github.com/ambuda-org/vidyut). It was run on the exact Dhātupāṭha entry: gaṇa number, anubandhas and artha.
2. The kartari forms were compared cell by cell with **SanskritVerb** (github.com/drdhaval2785/SanskritVerb), an independent generator written by Dr. Dhaval Patel. 30,566 cells give the same forms and 1,710 share a form. In the 268 cells that differ, I checked each group against the sūtras:
   - Vidyut was right in almost every case. Examples: वर्तिष्यते in ātmanepada, शासति (6.1.6), अस्तावीत् (7.2.72), उन्द्यात्, जायेते and अधेक्. SanskritVerb also has a bug in the lṛṭ ātmanepada 3rd-person plural.
   - **Vidyut was wrong twice, and both are corrected in the file:**
     - लुङ् of ऋ (ऋच्छति) is **आरत्** (3.1.56). Vidyut gave आर्षीत्.
     - लुङ् of तृष् is **अतृषत्** (3.1.55, पुषादि). Vidyut gave अतर्षीत्.
3. Every form was also looked up in two independent lists of verb forms: **Samsaadhanii** (Amba Kulkarni, University of Hyderabad) and **Sanskrit Heritage** (Gérard Huet). 96% of the kartari forms (38,610 of 40,194) appear in at least one of them.
4. The kṛt forms were compared with **ashtadhyayi.com**'s kṛdanta table (github.com/ashtadhyayi-com/data): 2,632 agree and 102 differ. I checked the differences. These are corrected in the file:
   - चक्ष् takes ख्या/क्शा before ārdhadhātuka affixes (2.4.54): ख्यातुम्, ख्यातः …
   - क्रामन् (7.3.76)
   - कृशः (8.2.55)
   - रीणः and प्लीनः (8.2.44, the ल्वादि group)
   - ṇatva in the passive शानच्: क्षीयमाणः, कृष्यमाणः …

   The rest are ashtadhyayi.com's slips, for example तृषितः for तृष्टः (7.2.16), खुर्दित्वा for खूर्दित्वा, and जीनन् for जिनन् (7.3.80).
5. The 126 roots in the reviewed kṛt set keep their reviewed cells.

Each form carries its evidence: `source`, then `checks.SanskritVerb` (same / overlaps / differs: …) and `checks.attested_in`.

## Corrections to the list itself

The list's metadata often does not match the Dhātupāṭha:
- **70** gaṇa numbers are wrong. Many roots of other classes are filed under gaṇa 1.
- **34** padas are wrong.
- **68** given लट् 3rd-person singular forms do not exist or belong to another root (क्लेशति, कुजति, गिर्यति, दधर्ति, तवोत् …).

Each record lists what was changed in `corrections_to_given_data`. Your original values are kept under `given`.

## Open points for you

- **Not in the Dhātupāṭha:**
  - MDH-134 बदि बन्धने — did you mean वदिँ (वन्दते) or बन्धँ (बध्नाति)?
  - MDH-289 प्लुकि गतौ — did you mean प्लुङ् (प्लवते)?
- **Sautra roots** that are not in the Dhātupāṭha. The nearest entry is shown, so please confirm:
  - MDH-287 तु
  - MDH-371 स्कम्भु
  - MDH-372 स्तृभु
- **Left as vidyut gives them, but uncertain:**
  - 3rd-class जन् (MDH-224): क्त ज्ञितः (vidyut, by 6.4.98) against जातः (ashtadhyayi.com)
  - 3rd-class ऋ: शतृ इयृच्छत् against इय्रत्
  - ईर्क्ष्य्: ईर्क्ष्यित्वा against ईर्क्षित्वा
  - ईश्: ईशिध्वे against ईड्ढ्वे
- **Meanings:**
  - Every form has an English gloss.
  - Te/Hi meanings are given for the root only, as in your list. Per-form Te/Hi glosses would have to be written; the old ones were one template copied everywhere.
  - The other 14 languages are not done yet for these roots.
