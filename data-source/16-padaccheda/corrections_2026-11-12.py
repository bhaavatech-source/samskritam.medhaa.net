# Padaccheda corrections, reviewed 2026-11-12.
#
# Base: Updated_Padaccheda_2025-11-21.json (the author's later file, 98 entries).
# The 29 entries that file dropped (Gold no. 22 and 99-127, except 101) are taken
# back from the Gold Padaccheda.json, in their Gold order, and get the same fixes.
#
# Convention (as in the author's hand analysis of Rāmāyaṇa 1.1.1-4):
#   * external sandhi undone; compounds kept whole, with their internal sandhi;
#   * avyayas (च, एव, इव, अपि, इति, हि, नु ...) separate;
#   * a repeated word (पुनः पुनः, ततः ततः) is two padas;
#   * visarga is ः, never the ASCII colon.
# Long entries are split into one item per śloka (two half-lines). If an entry has
# an odd number of half-lines, the last one stays with the śloka before it.
#
# Each fix applies to whichever entry contains the text; the build checks that
# every fix is used at least once.

# (wrong, right, why) in the śloka line
INPUT_FIX = [
    ("चैतत्ित्रलोकज्ञो", "चैतत्त्रिलोकज्ञो", "broken characters, copied from a PDF"),
    ("चामन्त्त्र्य", "चामन्त्र्य", "broken characters, copied from a PDF"),
    ("निवेदयित्वाऽऽभिज्ञानं", "निवेदयित्वाभिज्ञानं", "stray double avagraha"),
    ("वितीयमिव", "द्वितीयमिव", "typo"),
    ("प्रभयादेवीं", "प्रभया देवीं", "missing space"),
    ("स्मृतीमिव", "स्मृतिमिव", "स्मृति has a short i"),
    ("समीक्षय", "समीक्ष्य", "typo"),
    ("तान्यैवेतानि", "तान्येवैतानि", "तानि + एव + एतानि"),
    ("उत्तरीयम् नगासक्तं", "उत्तरीयं नगासक्तं", "anusvāra before a consonant"),
]

# (wrong pada, right pada or list of padas, why) in the padaccheda
OUTPUT_FIX = [
    ("तपःस्वाध्यायनिरतम्", "तपस्स्वाध्यायनिरतम्", "compound written as in the text and the hand analysis"),
    ("पुनःपुनः", ["पुनः", "पुनः"], "a repeated word is two padas"),
    ("सर्वरक्षसान्", "सर्वराक्षसान्", "the text has सर्वराक्षसान्"),
    ("शोकसंतप्तः", "शोकसन्तप्तः", "spelt as in the text"),
    ("रसातम्", "रसातलम्", "letter missing"),
    ("उपासितवा", "उपासित्वा", "typo"),
    ("चम्पकउद्दालकाः", "चम्पकोद्दालकाः", "a compound keeps its internal sandhi"),
    ("भुजगेन्द्रवधूमिव", ["भुजगेन्द्रवधूम्", "इव"], "इव not split off"),
    ("स्मृतीम्", "स्मृतिम्", "स्मृति has a short i"),
    ("मलपङ्कधरां", "मलपङ्कधराम्", "final म् written as anusvāra"),
    ("तथापि", ["तथा", "अपि"], "the text writes तथाऽपि"),
    ("मुहूर्तमपि", ["मुहूर्तम्", "अपि"], "अपि not split off"),
]
