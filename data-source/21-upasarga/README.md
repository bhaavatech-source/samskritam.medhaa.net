# 21-upasarga — उपसर्गाः and the verbs made with them

| file | what it is |
|---|---|
| `upasarga_dhatu_mappings_2026-11-15.json` | 22 upasargas and 155 upasarga + root combinations: form, meanings (sa, en, hi, te), example, notes, kind (बाधते / विशिनष्टि / अनुवर्तते) |
| `upasarga_extraction_report_2026-11-15.json` | counts and quality figures for the mapping file |
| `upasarga_review_required_2026-11-15.json` | sūtras that govern these verbs, and what still needs a check in the book |
| `corrections_2026-11-15.py` | corrections to the उपसर्गाः tab (the Gold file `06-gold-data/upasarga_gold_data.json` is not edited) |

Each JSON file ends with an `_audit` block: every change made on 2026-11-15, its reason and its reference.
It is for review only; `tools/build_grammar.py` does not copy it into the app.

Source book: Cārudeva Śāstrī, *Upasargārthacandrikā*, Part 2 (Bhāratīya Vidyā Prakāśana). The scan supplied
covers book pp. ~161–368 (सम् from सम्-वह्, अनु, अव, निस्/निर्, दुस्/दुर्, वि to वि-छिद्). Entries outside
that range were checked against Pāṇini and the Dhātupāṭha only.

Build: `python tools\build_grammar.py` → `app\src\data\grammar.json` (`upasarga.list`, `upasarga.combos`).
Shown in: व्याकरणकोशः → उपसर्गाः, and under each root in the धातुकोशः (“With prefixes”).

## Verb tables (tools/)

`tools/build_upasarga_forms.py` → `app\src\data\upasarga_forms.json` (loaded only when a prefixed verb is opened).
All ten lakāras, kartari (both padas where they occur) and karmaṇi, for 150 verbs, from vidyut-prakriya with the
prefixes given to the engine (`tools/upa.rs`; output kept in `tools/upa_forms_vidyut.tsv`). Its present 3rd singular
agrees with the headword of every entry except अनुतप्यते (the engine gives अनुतपति; अनुतप्यते is in the karmaṇi table).
No table: the four दुस्/दुर् nominal entries and आज्ञापयति (a causative).
