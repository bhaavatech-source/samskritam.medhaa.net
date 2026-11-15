# 22-vibhakti-samanvaya — विभक्तिसमन्वयः (agreement of case and verb)

Author: Dr. B. Rajeswara Rao, Bhaavajaalam Research Center.

| file | what it is |
|---|---|
| `Gold_Data_for_विभक्तिसमन्वयः.docx` | the gold document, **not edited** |
| `Gold_Data_for_विभक्तिसमन्वयः_corrected_2026-11-15.docx` | corrected copy (table below) |
| `vibhakti_samanvaya_original.json` | the structured JSON as supplied |
| `vibhakti_samanvaya_2026-11-15.json` | corrected JSON; its `_audit` block (at the end) lists every change |
| `build_samanvaya.py` | writes `app/src/data/samanvaya.json` (no audit block) |

Shown inside the existing chapters (no separate chapter): बोधः → धातुरूपाणि (“Which word the ending names”: कर्तरि, कर्मणि, भावे; “The verb that is not said”) and बोधः → शब्दरूपाणि (“When a noun is in the first case”). Questions are mixed into the stations लट्-लकारः (agreement) and कर्मणि भावे च (cases for each voice).

**Please check ¶62:** the word “तत्समाराकारत्वेन” was unclear; it was replaced by “परिशेषात् (शेषे प्रथमः 1.4.108)”.

## Changes to the corrected .docx (internal)

| para | old | new | reason |
|---|---|---|---|
| ¶5 | वक्येषु | वाक्येषु | typing error |
| ¶7 | संञ्ज्ञा | सञ्ज्ञा | typing error |
| ¶7 | अष्टाध्यायीसुत्रम् | अष्टाध्यायीसूत्रम् | typing error |
| ¶9 | सुप्तिङप्रत्याहारयोः | सुप्तिङ्प्रत्याहारयोः | typing error |
| ¶17 | अनभिहितपादानम् | अनभिहितापादानम् | typing error |
| ¶19 | अनभिहितधिकरणम् | अनभिहिताधिकरणम् | typing error |
| ¶21 | हेत्वादुपु | हेत्वादिषु | typing error |
| ¶21 | उपपानि | उपपदानि | typing error |
| ¶21 | पृथग्विना इत्यादीनि | पृथक् इत्यादीनि | पृथग्विना ran two words together and repeated विना |
| ¶21 | कर्तृकर्मकरणसम्प्रदानापादाधिकरणानि | कर्तृकर्मकरणसम्प्रदानापादानाधिकरणानि | typing error (अपादान) |
| ¶23 | सुप्-्प्रत्ययान्तपदैः | सुप्-प्रत्ययान्तपदैः | stray halant |
| ¶34 | वहिङ् | वहि | the ending is वहि; ङ् belongs only to महिङ्, where it closes the pratyāhāra तिङ् (3.4.78) |
| ¶36 | प्रथमत्रिकस्य परस्मैपदम् इति, द्वितीयत्रिकस्य आत्मनेपदम् इति… | प्रथमत्रिकत्रयस्य (तिप्–मस्) परस्मैपदम् इति (लः परस्मैपदम् 1… | the first nine endings (three trikas) are parasmaipada, the last nine ātmanepada |
| ¶37 | आत्मेनपदप्रत्ययाः | आत्मनेपदप्रत्ययाः | typing error |
| ¶40 | तर्ह  | तर्हि  | typing error |
| ¶41 | अत्र मता | अत्र माता | typing error |
| ¶41 | परस्मैपदप्र्त्ययाः | परस्मैपदप्रत्ययाः | typing error |
| ¶43 | इत्दादिधातुषु | इत्यादिधातुषु | typing error |
| ¶46 | विभक्योः | विभक्त्योः | typing error |
| ¶47 | मध्यमपुरषप्रत्ययाः | मध्यमपुरुषप्रत्ययाः | typing error |
| ¶50 | तेन युवां दृश्येसे | तेन युवां दृश्येथे | 2nd person dual passive is दृश्येथे |
| ¶53 | बहुवचनप्रत्यत्यः | बहुवचनप्रत्ययः | typing error |
| ¶57 | उत्तमपुरषप्रत्ययाः | उत्तमपुरुषप्रत्ययाः | typing error |
| ¶60 | दृश-धातोः मध्यमपुरुषप्रत्ययाः | दृश-धातोः उत्तमपुरुषप्रत्ययाः | अस्मद् → उत्तमपुरुषः (1.4.107), not मध्यमः |
| ¶62 | तत्समाराकारत्वेन | परिशेषात् (शेषे प्रथमः 1.4.108) | unclear word; replaced by the reasoning of 1.4.108 — PLEASE CHECK this is what was meant |
| ¶62 | प्रथमपुरषप्रत्ययाः | प्रथमपुरुषप्रत्ययाः | typing error |
| ¶63 | तिङ्प्रत्ययस्यार्थः यः (कर्ता वा कर्म) स एव अस्मदर्थः भवति त… |  | this line repeats the first-person (उत्तम) rule inside the third-person section; removed |
| ¶64 | तिङर्थः  यः कर्ता स एव अस्मदर्थः भवतु | तिङर्थः यः कर्ता स एव युष्मदर्थ-अस्मदर्थाभ्यामन्यः भवतु | third person: the meaning is other than युष्मद्/अस्मद् |
| ¶64 | पच-धातोः उत्तमपुरुषप्रत्ययाः | पच-धातोः प्रथमपुरुषप्रत्ययाः | माता पचति is प्रथमपुरुषः |
| ¶68 | परस्पराश्रत्वं | परस्पराश्रितत्वं | typing error |
| ¶68 | अन्योयन्याश्रः | अन्योन्याश्रयः | typing error |
| ¶68 | चिन्तीयम् | चिन्तनीयम् | typing error |
| ¶70 | इदं च सर्वं कर्तुः विवक्षया भवति। कर्तुः विवक्षा | इदं च सर्वं वक्तुः विवक्षया भवति। वक्तुः विवक्षा | कर्तुः could be read as the grammatical कर्ता; the speaker (वक्ता) is meant |
| ¶73 | विभक्तीनांं | विभक्तीनां | typing error |
| ¶76 | लिट्-्प्रत्ययेन | लिट्-प्रत्ययेन | stray halant |
| ¶84 | एकस्मिन् वाक्ये विशेषणं विहाय पदद्वयम् प्रथमाविभक्तौ नैव भवे… | एकस्मिन् वाक्ये समानाधिकरणं पदं (विशेषणं, विधेयं, सम्बोधनम्,… | as written, the rule would reject रामः राजा अभवत्; predicate nouns, apposition, vocative and quoted words are exceptions; च or वा |
| ¶87 | भधातोः | भूधातोः | typing error |
| ¶88 | ततीयायाः | तृतीयायाः | typing error |
| ¶91 | अस्तिः भवन्तीपरः अप्रयुज्यमानोऽपि अस्ति इति नियमात्। | अस्तिर्भवन्तीपरः प्रथमपुरुषोऽप्रयुज्यमानोऽप्यस्ति इति नियमात… | the maxim lacks प्रथमपुरुषः; with त्वम्/अहम् the supplied verb is असि/अस्मि |
| ¶92 | तव्यतव्यानीयर्-ण्यत्-यदादिभिः | तव्यत्-तव्य-अनीयर्-ण्यत्-यदादिभिः | three kṛtya suffixes (3.1.96 तव्यत्तव्यानीयरः) |
| ¶92 | क्तक्तवतुप्रभृतिभिः | क्त-क्तवतुप्रभृतिभिः | readability |
