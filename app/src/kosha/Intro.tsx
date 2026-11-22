// ═══════════════════════════════════════════════════════════════
//  kosha/Intro.tsx — short introductions shown at the top of the
//  पदच्छेदः and पद्यविश्लेषणम् tabs of साहित्यम्.
//  Every example is taken from the verses in these two tabs.
// ═══════════════════════════════════════════════════════════════
import React from "react";
import { useSa } from "../i18n/script";

/** one "joined → split" example row */
const Ex: React.FC<{ a: string; b: string; why: string }> = ({ a, b, why }) => {
  const S = useSa();
  return (
    <tr>
      <td className="ks-intro-sa">{S(a)}</td>
      <td className="ks-intro-arrow" aria-hidden>→</td>
      <td className="ks-intro-sa">{S(b)}</td>
      <td className="ks-intro-why">{why}</td>
    </tr>
  );
};

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <details className="ks-intro" open>
    <summary>{title}</summary>
    {children}
  </details>
);

export const PadacchedaIntro: React.FC = () => {
  const S = useSa();
  return (
    <Box title="परिचयः · What is padaccheda?">
      <h4>पदम् · The word</h4>
      <p>
        Pāṇini defines a word as <b>{S("सुप्तिङन्तं पदम्")}</b> (1.4.14): a form that ends in a noun ending (सुप्)
        or a verb ending (तिङ्). {S("रामः")}, {S("वनम्")} and {S("अब्रवीत्")} are padas; the bare stem {S("राम")} or the
        root {S("ब्रू")} is not. Avyayas such as {S("च")}, {S("हि")} and {S("इति")} are also padas.
      </p>

      <h4>पदच्छेदः · Splitting the words</h4>
      <p>
        In a śloka the words are joined by sandhi, so their endings change and the spaces disappear.
        Padaccheda undoes this: it writes every pada separately, in the form it has when spoken on its own.
      </p>
      <p className="ks-intro-example">
        <span>{S("कोन्वस्मिन्साम्प्रतं लोके")}</span>
        <span aria-hidden>→</span>
        <span>{S("कः, नु, अस्मिन्, साम्प्रतम्, लोके")}</span>
      </p>
      <p>The convention used here: a compound stays one word (<span className="ks-intro-sa-in">{S("इक्ष्वाकुवंशप्रभवः")}</span>), every avyaya is written separately, and each pada ends as it would at a pause, with ः and म्.</p>

      <h4>उपायाः · How to find the words</h4>
      <table className="ks-intro-ex"><tbody>
        <Ex a="नारदं परिपप्रच्छ" b="नारदम्, परिपप्रच्छ" why="ं at the end of a word is म्" />
        <Ex a="श्रूयतान्नरः" b="श्रूयताम्, नरः" why="म् can also become the nasal of the next letter" />
        <Ex a="रामो नाम" b="रामः, नाम" why="-ो before a soft sound is usually -ः" />
        <Ex a="समर्थोऽसि" b="समर्थः, असि" why="ऽ marks a lost अ; the word before ends in -ः" />
        <Ex a="वाल्मीकिर्मुनिपुङ्गवम्" b="वाल्मीकिः, मुनिपुङ्गवम्" why="-इर् / -उर् is -इः / -उः" />
        <Ex a="युक्तस्सर्वभूतेषु" b="युक्तः, सर्वभूतेषु" why="-स्स / -श्श / -श्च hide a visarga" />
        <Ex a="कीर्तिता गुणाः" b="कीर्तिताः, गुणाः" why="-आः loses its ः before a soft sound or a vowel" />
        <Ex a="चैतत्" b="च, एतत्" why="ऐ can be अ + ए; ए can be अ + इ" />
        <Ex a="एतदिच्छाम्यहम्" b="एतत्, इच्छामि, अहम्" why="द् before a vowel can be त्; य् before a vowel can be इ" />
        <Ex a="कोन्वस्मिन्" b="कः, नु, अस्मिन्" why="व् before a vowel can be उ" />
      </tbody></table>

      <h4>परीक्षा · Check your answer</h4>
      <ul>
        <li>Every pada should be a form you can find in a noun or verb table, or an avyaya.</li>
        <li>Joining the padas again with sandhi should give back the śloka exactly.</li>
      </ul>
    </Box>
  );
};

export const PadyaIntro: React.FC = () => {
  const S = useSa();
  return (
    <Box title="परिचयः · What is padya-viśleṣaṇa?">
      <p>
        A <b>{S("पद्यम्")}</b> is a text composed in metre (छन्दः). To fit the metre and the sound, the poet places the
        words freely and joins them by sandhi. Analysing a verse means bringing it back to plain prose, so that each
        word's role and the meaning become clear.
      </p>

      <h4>प्रत्येकं पद्यम् · What each verse page shows</h4>
      <ol>
        <li><b>{S("पदच्छेदः")}</b> — the words, split as on the पदच्छेदः tab.</li>
        <li><b>{S("अन्वयः")}</b> — the same words in prose order. Words in brackets are not in the verse but are understood (अध्याहारः).</li>
        <li><b>{S("अर्थः")}</b> — the meaning, in your chosen language.</li>
        <li><b>{S("कारकाणि")}</b> — what each word does in the sentence: doer, object, instrument and so on.</li>
        <li><b>{S("पदपरिचयः")}</b> — the form of each word: gender, case and number, or person, number and tense.</li>
      </ol>

      <h4>अन्वयस्य उपायाः · How to find the prose order</h4>
      <p className="ks-intro-example">
        <span>{S("वागर्थाविव सम्पृक्तौ वागर्थप्रतिपत्तये। जगतः पितरौ वन्दे पार्वतीपरमेश्वरौ।।")}</span>
      </p>
      <ol>
        <li><b>Find the verb.</b> Here it is {S("वन्दे")} (“I salute”). If a verse has no verb, one is understood, usually {S("अस्ति")}.</li>
        <li><b>Find the doer.</b> {S("वन्दे")} is first person singular, so the doer is {S("अहम्")}, understood though not written.</li>
        <li><b>Join each adjective to its noun.</b> They share gender, case and number: {S("सम्पृक्तौ")} and {S("पितरौ")} go with {S("पार्वतीपरमेश्वरौ")}, all dual and in the second case.</li>
        <li><b>Place each qualifier before its word.</b> A genitive comes before the word it qualifies ({S("जगतः पितरौ")}); {S("इव")} comes right after the word it compares ({S("वागर्थौ इव")}).</li>
        <li><b>Arrange the sentence.</b> Doer first, then the object with its qualifiers, then the other words, and the verb last.</li>
      </ol>
      <p className="ks-intro-example">
        <span>{S("अहं वागर्थाविव सम्पृक्तौ जगतः पितरौ पार्वतीपरमेश्वरौ वागर्थप्रतिपत्तये वन्दे।")}</span>
      </p>
      <p>Read the anvaya aloud. If it sounds like ordinary prose and every word has a place, the order is right.</p>
    </Box>
  );
};
