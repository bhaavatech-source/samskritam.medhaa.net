# Corrections log: chandas_vrittas_complete.json

Method: every verse was scanned syllable by syllable (laghu/guru rules) against its stated gaṇa pattern, and the scansion strings, lakṣaṇa verses, Telugu text and translations were cross-checked. The corrected file is `chandas_vrittas_complete_corrected.json`; the structure and field names are unchanged.

## A. Wrong example verse (metre did not match the entry)
| ID | Problem | Fix |
|---|---|---|
| VRIT-009 Vasantatilakā | "विद्या नाम नरस्य…" has 19 syllables per pāda (it is Śārdūlavikrīḍita) | Replaced with Śākuntala 5.2 "रम्याणि वीक्ष्य…" (14 syllables); new scansion, anvaya, bhāva (sa/hi/te/en) |
| VRIT-011 Śikhariṇī | Verse was not a genuine text (last pāda "न मपति"), attribution contradictory | Replaced with Saundaryalaharī 1 "शिवः शक्त्या युक्तो…" |
| VRIT-014 Sragdharā | Śākuntala 1.7 was garbled (lines 2–3 corrupted, "दत्तदृष्टिः" for "बद्धदृष्टिः") | Restored the genuine verse and its anvaya/scansion |
| VRIT-024 Viyoginī | 2nd pāda "परित्यज्य क्व गतोऽसि मे प्रिय" does not fit Sa-Bha-Ra-La-Ga; source unverifiable | Replaced with Kumārasambhava 4 "अथ सा पुनरेव विह्वला…" |

## B. Verse text corrected
| ID | Fix |
|---|---|
| VRIT-005 | "दूरविलम्बिनो" → "भूरिविलम्बिनो" (Nītiśataka); scansion token "म्पृ" → "मृ" (समृद्धिभिः); "नूम्राः" → "नम्राः" in bhaava_sa |
| VRIT-007 | "कलय" → "कलये" (the Sa-gaṇa needs a guru there); anvaya and bhāva (sa/hi/te/en) updated |
| VRIT-012 | "रामगिर्याश्रमेशु" → "…षु"; Telugu line regenerated (it contained the stray Latin text "guru") |
| VRIT-018 | 4th pāda began with a laghu ("स याति…"), breaking the Ta-gaṇa; emended to "सोऽभ्येति दिव्यं पदमच्युतं सदा" (editorial emendation, see C) |
| VRIT-026 | "पापविनाशिन" → "पापविनाशिन्"; "दयालुतया" → "दयालो" (pādas had 12 and 13 syllables); anvaya/bhāva updated |
| VRIT-010, 023 | anvaya typos: "शैवेलेन" → "शैवलेन"; "तरलबारि…" → "तरलवारि…" |

## C. Lakṣaṇa / framework text
| Where | Fix |
|---|---|
| framework, guru.conditions[2] | Corrupted "सDynamic/सविसर्गः" → "सविसर्गः" |
| framework, definition_rule | "पादान्तोऽपि वा" (7 syllables) → "पादान्तगोऽपि वा" (also in Telugu) |
| VRIT-001 lakṣaṇa | "द्वितीयान्ययोः" → "दीर्घमन्ययोः"; Telugu "యొ" → "యో" |
| VRIT-004 lakṣaṇa | Corrupted "किलाclassन्यास्वपि" → "इत्थं किलान्यास्वपि" (Telugu likewise) |
| VRIT-013 lakṣaṇa | "मसजस्तथाः" → "मसजस्तताः" |
| VRIT-014 lakṣaṇa | "म्रभ्नैर्याणां" → "म्रभ्नैर्यानां" |

## D. Scansion strings
| ID | Fix |
|---|---|
| VRIT-001 | pada_4 showed the 2nd syllable of "पार्वती" as guru; now ऽ । ऽ । । ऽ । ऽ |
| VRIT-002 | corrupted token "षbranch" → "ष्य" |
| VRIT-015 | pada_4 listed 7 weights for 8 syllables (13 mātrās shown, 15 claimed); now 15 |
| VRIT-029 | pāda boundary between quarters 3 and 4 was misplaced (quarter 3 showed 10 mātrās); now 12 + 18 |
| VRIT-012 | Telugu letters inside a Devanagari token ("षు వ స") → "षु व स" |

## E. Script / encoding
- 5 places where the Devanagari avagraha ऽ sat inside Telugu words (e.g. "గోऽబ్ధి", "గలేऽవలమ్బ్య") were changed to the Telugu avagraha ఽ.

## Not resolved (need a source check)
- **VRIT-022 Hariṇī**: none of the four example lines scan as Na-Sa-Ma-Ra-Sa-La-Ga, and the verse looks composed rather than classical. The corrupted source "अम Giovanni" was replaced by "स्रोतः अनिर्दिष्टः". The lakṣaṇa wording also differs from the usual "रसयुगहयैर्न्सौ म्रौ स्लौ गो यदा हरिणी तदा".
- **VRIT-030 Daṇḍaka**: the example has 34 syllables per pāda where 27 are required, and the claimed scansion cuts it off mid-word. The attribution to Kālidāsa's Śyāmalādaṇḍaka does not hold.
- **Attributions that look generic or unverifiable**, though the verses scan correctly: VRIT-016, 017, 019, 020, 023, 025, 026, 027, 028, 029 (e.g. "सुभाषितरत्नभाण्डागारम्", "भक्तिरसामृतम्", "काव्यसङ्ग्रहः", "X / Y" double attributions in 008, 025, 028). VRIT-026 is not from Mukundamālā.
- Verse and śloka numbers in `source_reference` and in the lakṣaṇa citations (Chandomañjarī / Vṛttaratnākara numbers) differ between editions and could not be checked here.
- VRIT-029 Gīti lakṣaṇa and VRIT-024 Viyoginī lakṣaṇa wording differ from the usual textual forms.
