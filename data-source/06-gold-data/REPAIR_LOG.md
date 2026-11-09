# Gold Data: JSON repair log
Of the 11 JSON files, only 4 were valid JSON. The 7 broken files are repaired here. No content was changed except where noted.

| File | Problem | Fix |
|---|---|---|
| Example_Simple_sentences | 6 JSON documents placed one after another | wrapped them into one list |
| Padyavishleshanam_G | 3 documents back to back; missing commas; one stray `}`; `"kāraka_analysis",:`; the `vritti_analysis` object repeated the key `samasta_pada` 3 times, so only the last value survived; file cut off at the end | made one list; restored the commas; turned `vritti_analysis` into a list of 3 compounds (also fixed "पूर्वे चे ते" → "पूर्वे च ते"); closed the brackets |
| Prakriti_Pratyaya_Svaroopam_P1 | a misplaced `},` closed the कृदन्तप्रातिपदिकम् entry before its "subantas" list; one missing `}` at the end | moved the brace; closed the file |
| Sandhi_Gold_Data_UPDATED_COMPLETE_P1 | unquoted `"आ,` and `ई` in the vowel list; 3 missing commas | quoted both; added the commas |
| Samasa_Gold_Data_G | raw tab and line-break characters inside strings | now parsed leniently and saved clean |
| upasarga_gold_data | trailing commas | removed |
