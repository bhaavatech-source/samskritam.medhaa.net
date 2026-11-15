# 04-taddhita — तद्धितप्रत्ययाः

| file | what it is |
|---|---|
| `taddhita_pratyaya_corrected.json` | the earlier reviewed file (40 suffixes, 87 examples), **not edited** |
| `taddhita_pratyaya_2026-11-15.json` | corrected and extended: 55 suffixes, 213 examples; `_audit` at the end lists every change (internal) |
| `taddhita_2026-11-15.py` | the script that makes it (all corrections and additions, with reasons) |
| `check_vidyut.py`, `tad2.rs`, `translit.py` | checks every example with vidyut-prakriya (`tad2.rs` is built as a bin in the vidyut-prakriya workspace) |

**Checks of the examples:** 168 derived identically by vidyut-prakriya; the other 45 were checked by the sūtras because the engine does not
derive them, or derives them wrongly (ordinals with डट्/थुक्, इदम् + तसिल्/थमु/ह/दानीम्, मदीयः/त्वदीयः, भवदीयः (छस्), नैयायिकः (7.3.3)).
Each example carries `check` with the method.

**Corrections:** sūtra texts of 5.3.55, 5.3.57, 5.1.122, 5.3.67; आलुच् is a vārttika under 5.2.122 (taddhita, not kṛt);
जनता removed from तल् (samūha, 4.2.43); स्वर्णमयः under 4.3.143; तेजस्वी under 5.2.121; ठक् examples given their own sūtras;
क्रमशः removed, अक्षरशः moved to 5.4.43.

**Added suffixes:** ष्यञ्, डट्, तमट्, तीय, डट् + थुक्, कन्, ख, ठञ्, इतच्, चरट्, अण् (शैषिकः), त्यप्, ट्युल्, दानीम्, ह.

**Meanings:** Sanskrit, English, Telugu and Hindi. The other 13 languages are still to be added.

Shown in: व्याकरणकोशः → तद्धिताः (next to कृत्प्रत्ययाः). Quiz: अध्येता → प्रत्ययभेदाः (“which taddhita suffix made this word?”).
