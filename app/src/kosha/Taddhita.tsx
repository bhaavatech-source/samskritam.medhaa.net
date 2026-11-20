// ═══════════════════════════════════════════════════════════════
//  kosha/Taddhita.tsx — तद्धिताः: suffixes added to a noun stem
//  (the व्याकरणकोशः tab next to कृत्प्रत्ययाः). Data: GRAMMAR.taddhita
//  (tools/build_grammar.py, from data-source/04-taddhita, 2026-11-15; additions 2026-11-19).
//  The map, the derivation films, the per-suffix animation and the quiz are in taddhitaAnim.tsx.
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { GRAMMAR, type TaddhitaPratyaya } from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import { ListDetail } from "./Kosha";
import { TaddhitaMap, TdFilms, TdSuffixScene, TaddhitaQuiz } from "./taddhitaAnim";
import "./kosha.css";
import "./grammar-anim.css";

const T = GRAMMAR.taddhita;
const Say: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;
const mean = (m: Record<string, string>, lang: string) => m[lang] || m.en;

export const TaddhitaTab: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const [g, setG] = useState("all");
  const [quiz, setQuiz] = useState(false);
  if (quiz) return <TaddhitaQuiz onClose={() => setQuiz(false)} />;
  const items = T.list.filter(x => g === "all" || x.g === g);
  return (
    <>
      <details className="ks-method">
        <summary>तद्धिताः · Suffixes added to a noun stem</summary>
        <ul>{T.intro.map((x, i) => <li key={i}>{S(x)}</li>)}</ul>
      </details>
      <details className="ks-method">
        <summary>तद्धिताधिकारः · Where the taddhita sūtras are (4.1.76 – 5.4.160)</summary>
        <p>The sūtras are arranged under headings (अधिकारः): each heading gives a default suffix or a sense, and the sūtras after it, up to the next heading, refine it. Play the map to see each stretch:</p>
        <TaddhitaMap />
      </details>
      <details className="ks-method" open>
        <summary>अनुबन्धाः · What the markers and replacements do to the stem</summary>
        <p>A <b>ञ्</b> or <b>ण्</b> marker — and in a taddhita also a <b>क्</b> — makes the first vowel of the stem take vṛddhi. Some first letters are replaced: <span className="ks-l-sa">{S("ठ → इक, ढ → एय, छ → ईय, ख → ईन, फ → आयन, घ → इय")}</span>. A final अ or इ of the stem drops, a final उ becomes अव्. Watch seven words being made:</p>
        <TdFilms />
      </details>
      <div className="un-links">
        <span><b className="ks-l-sa">{S("तद्धितपरीक्षा")}</b> · A seven-level quiz on these suffixes: every answer is a checked form from the list.</span>
        <span className="ks-chips"><button className="on" onClick={() => setQuiz(true)}>तद्धितपरीक्षा · Take the quiz</button></span>
      </div>
      <div className="ks-chips gr-filter">
        <button className={g === "all" ? "on" : ""} onClick={() => setG("all")}>All ({T.list.length})</button>
        {Object.entries(T.groups).map(([k, [sa, en]]) =>
          <button key={k} className={g === k ? "on" : ""} onClick={() => setG(k)}>{S(sa)} <small>{en} ({T.list.filter(x => x.g === k).length})</small></button>)}
      </div>
      <ListDetail<TaddhitaPratyaya> key={g} items={items} idOf={x => x.id} kind="grammar" placeholder="Search a suffix or a word: इञ्, दाशरथिः, -ness…"
        search={x => [x.p, x.rem, x.sutra, x.num, ...Object.values(x.m), ...x.ex.flatMap(e => [e.b, e.w, e.m.en])].join(" ")}
        label={x => <><span className="ks-l-sa">{S(x.p)}</span><span className="ks-l-en">{x.ex[0] ? `${S(x.ex[0].b)} → ${S(x.ex[0].w)}` : ""} · {mean(x.m, lang)}</span></>}
        detail={x => (
          <div className="ks-card">
            <div className="ks-head"><h3>{S(x.p)}</h3><span className="ks-sub">{S(T.groups[x.g][0])} · {T.groups[x.g][1]}</span></div>
            <p className="ks-main-meaning" dir="auto">{mean(x.m, lang)} <span className="ks-artha">({S(x.m.sa)})</span></p>
            <div className="ks-table-wrap"><table className="ks-karaka"><tbody>
              {x.it && <tr><td>{S("इत्")} <span className="ks-l-en">letters that drop</span></td><td className="ks-l-sa">{S(x.it)}</td></tr>}
              <tr><td>{S("शिष्टः")} <span className="ks-l-en">what is added</span></td><td className="ks-l-sa">{S(x.rem)}</td></tr>
              <tr><td>{S("सूत्रम्")}</td><td className="ks-l-sa">{S(x.sutra)} ({x.num}){x.vidh && <span className="up-note">{S(x.vidh)}</span>}</td></tr>
              {x.eff && x.eff !== "—" && <tr><td>{S("कार्यम्")} <span className="ks-l-en">effect</span></td><td>{S(x.eff)}</td></tr>}
            </tbody></table></div>
            <TdSuffixScene key={x.id} x={x} />
            <h4>उदाहरणानि · Examples ({x.ex.length})</h4>
            <div className="ks-table-wrap"><table className="ks-table ks-krt"><tbody>{x.ex.map(e => (
              <tr key={e.w}><th className="ks-l-sa">{S(e.b)}</th><td>→</td>
                <td className="ks-form">{S(e.w)} <Say t={e.w} /></td>
                <td dir="auto">{mean(e.m, lang)}{e.note && <span className="up-note">{S(e.note)}</span>}</td>
                <td><FlagButton t={{ kind: "grammar", id: x.id, field: `example:${e.b}`, value: `${e.b} + ${x.p} → ${e.w}`, where: `${x.p}: ${e.b} → ${e.w}` }} /></td>
              </tr>))}</tbody></table></div>
            {x.rules.length > 0 && <><h4>नियमाः · How the word is formed</h4><ul>{x.rules.map((r, i) => <li key={i}>{S(r)}</li>)}</ul></>}
            <p className="ks-id">{x.id}</p>
          </div>)} />
    </>
  );
};
