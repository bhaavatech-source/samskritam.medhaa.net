# रघुवंशम् सर्गः १ — verses 1.11–1.70 (added 2026-11-13)

**Source.** The source is the Vāvilla Press edition of the Raghuvaṃśa: Mallinātha's text with a Telugu commentary (ఆకాంక్ష, శబ్దరూపసమాసములు, వ్యాఖ్య, భావము). We have 108 photos of it in the Drive folder "RaghuvamshaH" (`RaghuvamshaH-20261113T112728Z-1-001.zip`).

The photos cover book pages 1–117, which is verses 1.1–1.76. `vavilla_photo_page_index.json` maps each photo to its book page.
- **Missing pages:** 26, 45–47, 89, 106–107, 113.
- **Verses whose own lines are missing:** 1.16, 1.28, 1.29, 1.58 and 1.69. For these the text follows the standard Mallinātha text, and each entry carries `book.verse_text` to say so.

## Files

| File | What |
|---|---|
| `raghuvamsha_1_11-70_2026-11-13.json` | 60 verses (1.11–1.70) |
| `src/` | The script and tables that produce that file |

Each verse in `raghuvamsha_1_11-70_2026-11-13.json` has:
- verse text and padaccheda
- anvaya, following Mallinātha
- metre and alaṅkāra
- meanings in all 17 game languages, plus romanised ar/zh/ja
- the book page
- a `free` flag

`src/build_rv.py` builds the JSON from the tables. The zh romanisation uses pypinyin from source (set `PYPINYIN_SRC`), with a few hand fixes for 为/地/子/行/着.

Verses 1.1–1.10 were already in the game from the Gold file and are unchanged. `tools/build_game_data.py` adds 1.11–1.70 after them.

## Book readings kept (other editions differ)

| Verse | This edition | Elsewhere |
|---|---|---|
| 1.25 | धर्मायैव | धर्म एव |
| 1.51 | विस्रम्भाय | विश्वासाय |
| 1.57 | पादौ | पादान् |
| 1.61 | प्रशमितारिभिः | संशमितारिभिः |

## Anvaya puzzle

Some verses are strings of epithets whose prose order is free. These are marked `free` and the anvaya game skips them: 1.13–15, 23, 38–45, 49–53, 55.

## Not yet done

- The Telugu commentary itself (ākāṅkṣā, śabdarūpa-samāsa, vyākhyā, bhāva) is not transcribed. The Telugu meaning here is our own wording, following Mallinātha. It has not yet been compared line by line with the book's భావము.
- There is no word-by-word form analysis (`words`) and no kāraka table for 1.11–1.70 yet.
- Verses 1.71–1.95 are still to come.

## Old file not used

`raghuvamsham_sarga1_complete.json` (95 verses) was checked against the book and not used. It has these problems:
- Its numbering drifts from verse 15 on.
- Most verses after 1.30 are not Kālidāsa's text.
- Its padaccheda and samāsa fields are mostly placeholders.
