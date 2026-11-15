# 23 · उणादिसूत्राणि (Uṇādi-sūtras)

Teaching data for the Uṇādi-sūtras, rebuilt on 2026-11-15 from three sources:

1. **The teacher's slide notes**: four .pptx decks with a prakriyā for each sūtra (1.42–5.70).
2. **The Siddhānta Kaumudī** Uṇādi section, Bālamanoramā–Tattvabodhinī edition (169 pp.). It was used to check every sūtra's text and order and the example forms, and to supply the examples for 1.1–1.41, which the decks do not cover.
3. **The earlier JSON files** (`unadi_pada1–5_complete.json`). Their meanings were kept wherever the word was confirmed under the right sūtra.

The original files are not changed.

## Files

| File | Contents |
|---|---|
| `unadi_pada1_2026-11-15.json` … `unadi_pada5_2026-11-15.json` | All 748 sūtras (157 / 123 / 160 / 238 / 70) in the pāda-wise numbering. Each record has the sūtra text, the pratyaya, the prakriyā from the slides and the rūpas. An `_audit` block at the end of each file holds book pages and evidence; it is internal only. |
| `unadi_review_2026-11-15.json` | Items to review: sūtra-text corrections, renumbered records, words kept but unverified, words set aside, sūtras still without rūpas, and forms that still need meanings. |
| `unadi_pariksha_levels_2026-11-15.json` | The 34 exam questions with eight sūtra references corrected (listed in its `_audit`). |
| `unadi_prakriya_steps_2026-11-15.json` | Step-by-step derivations (rule by rule, with the sūtra for each step) for 623 words. This is our own data and can be edited by hand; the site needs nothing else. |
| `tools/` | The scripts that rebuild these files (see below). |

## Abbreviation

**वि.सु.का.कृ.** stands for तादृशप्रकृतिप्रत्यय-विशिष्टात् सुबादिषु कार्येषु कृतेषु: once the case ending and its operations have been applied to that root-plus-suffix, the final form (इन्दुः etc.) results. It is kept exactly as written in the prakriyā.

## Record fields

- `sutra_id`: `UN-<pāda>.<number>`
- `sutra_number`: Devanāgarī pāda-wise number
- `sutra_text`, `sutra_iast`
- `pratyaya`
- `prakriya`: the slide text
- `rupas[]`, each with `word`, `iast`, `dhatu`, `gender`, `meanings`, `notes`

`meanings` is empty for forms that are new in this edition; these are listed in the review file.

## Prakriyā on the site

Each word in धातुकोशः → रूपनिर्माणम् → उणादयः has its own prakriyā, drawn from three sources in order:

1. **Class notes.** The part of the slide prakriyā that derives that word. Technical words in the notes (गुणे, रपरत्वे, सम्प्रसारणे, वि सु का कृ …) can be tapped for an explanation.
2. **Step by step.** For 623 words every step is shown: the form after it, the sūtra applied (number and text), the technique it uses, and optionally the naming rules (saṃjñā) that set it up. The derivation runs from root and suffix to the stem, then through वि.सु.का.कृ. to the finished word.
3. **Written prakriyā.** 175 words of pāda 1 that had neither now have a prakriyā written in the same style (`tools/prakriya_written_2026-11-15.tsv`); the rest still show a short outline until they are written.

`tools/glossary.py` holds the पारिभाषिकशब्दाः (40 terms: sūtras, explanation, example) and maps every Aṣṭādhyāyī rule to its technique.

47 words were moved to the sūtra whose text names their root (`tools/moves_2026-11-15.json`).

## Rebuilding

The site is built from these JSON files with `python tools/build_unadi_app.py` alone. The steps below were used once, offline, to draft the step-by-step file (with the open-source vidyut-prakriya engine); they are kept only for reference.


1. `cargo build --release --bin un` in a vidyut workspace (`tools/un.rs`), then:
   - `un dhatupatha.tsv scan > scan.tsv`
   - `un dhatupatha.tsv detail < detail_in.tsv > detail_out.tsv`
2. `python tools/select.py` (uses `tools/match.py`), then `python tools/compact_vidyut.py selected.json unadi_prakriya_vidyut_2026-11-15.json`.
3. `python tools/build_unadi_app.py` writes `app/src/data/unadi.json`.
