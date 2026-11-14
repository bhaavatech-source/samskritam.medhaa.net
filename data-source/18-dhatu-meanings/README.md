# Meanings for the 353 roots of the 400-dhātu list — 2026-11-13

## What is done

- **Sense:** each root has one English sense (`sense_en`), chosen to match its Dhātupāṭha artha. All other languages translate this one sense.
- **en, te, hi:** taken from your list. For Hindi, ashtadhyayi.com's meaning is shown beside yours as a second source.
- **de, fr, es, ru, ar, zh, ja, ko:** one word per root, drafted by Claude. Each draft was then checked against **Open Multilingual Wordnet**, a set of expert wordnets plus Wiktionary translations, all linked to the same English meanings (github.com/omwn/omw-data).
  - **sourced:** the wordnet gives the same word for this English verb. 1,991 of the 2,824 words (70%) are sourced.
  - **draft:** the wordnet gives other words or none. The wordnet's words are listed under `wordnet_candidates`, but they often belong to another sense of the English verb, so read them as hints, not answers.

| | de | fr | es | ru | ar | zh | ja | ko |
|---|---|---|---|---|---|---|---|---|
| sourced | 223 | 296 | 319 | 253 | 267 | 235 | 275 | 123 |

Korean has the fewest confirmations because its wordnet is small. That says little about the drafts themselves, but the Korean sheet should be reviewed first.

## Indian languages (ta, kn, ml, mr, bn, or)

The Dropbox copy of IndoWordNet is gone. The same data is published by IIT Bombay's CFILT lab on GitHub as **IWN-En** (github.com/cfiltnlp/IWN-En). That release links each IndoWordNet synset, in all 18 languages, to an English WordNet synset.

**How a synset was picked for each root.** Several signals were combined:
- the Sanskrit synset contains the root, with or without an upasarga
- the synset is linked to the root's English sense, with the most common senses preferred
- the synset's Hindi or Telugu words match the meaning in your list

The first word of the synset is used in every language, and the next words are kept as synonyms.

**Then I read every pick.** In about 80 roots IndoWordNet's link gave the wrong sense. Examples: गम् came out as "pass (time)", कृ हिंसायाम् as "do", चिन्त् as "king", and खिद् got a Marathi gloss meaning "burning wood". Those rows were replaced with my own words. About 40 single words that were typos, nouns, participles or causatives were corrected in place.

| | ta | kn | ml | mr | bn | or |
|---|---|---|---|---|---|---|
| sourced (IndoWordNet, accepted after reading) | 217 | 204 | 218 | 224 | 213 | 222 |
| draft (Claude, or corrected) | 133 | 146 | 132 | 126 | 137 | 129 |

**IndoWordNet as a cross-check.** For Hindi and Telugu, IndoWordNet's words sit beside your meanings under `indowordnet`, for comparison only.

**Causatives.** IndoWordNet only gives the plain verb, so the 7 causatives (मोहयति …) have drafted causative verbs.

## Review

`review/` has one sheet per language: 14 sheets of 353 rows each. Each row has the root, its artha, the English sense, the proposed word, its status and the wordnet suggestions, then empty columns for ✓, a correction and a note. Send the filled sheets back and the corrections go into the data as **reviewed**.

## Files

- `dhatu_400_meanings.json`: keyed by Dhātupāṭha code. `+nic` marks a causative. Each record lists the MDH entries that use the root.
- `tools/`: the drafts (`draft_foreign_*.tsv`), the wordnet check (`check.py`) and the build script.
