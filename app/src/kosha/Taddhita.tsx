// ═══════════════════════════════════════════════════════════════
//  kosha/Taddhita.tsx — तद्धिताः: suffixes added to a noun stem
//  (the व्याकरणकोशः tab next to कृत्प्रत्ययाः). Data: GRAMMAR.taddhita
//  (tools/build_grammar.py, from data-source/04-taddhita, 2026-11-15).
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { GRAMMAR, type TaddhitaPratyaya } from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import { ListDetail } from "./Kosha";
import "./kosha.css";

const T = GRAMMAR.taddhita;
const Say: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;
const mean = (m: Record<string, string>, lang: string) => m[lang] || m.en;

export const TaddhitaTab: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const [g, setG] = useState("all");
  const items = T.list.filter(x => g === "all" || x.g === g);
  return (
    <>
      <details className="ks-method">
        <summary>तद्धिताः · Suffixes added to a noun stem</summary>
        <ul>{T.intro.map((x, i) => <li key={i}>{S(x)}</li>)}</ul>
      </details>
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
            <h4>उदाहरणानि · Examples ({x.ex.length})</h4>
            <div className="ks-table-wrap"><table className="ks-table ks-krt"><tbody>{x.ex.map(e => (
              <tr key={e.w}><th className="ks-l-sa">{S(e.b)}</th><td>→</td>
                <td className="ks-form">{S(e.w)} <Say t={e.w} /></td>
                <td dir="auto">{mean(e.m, lang)}{e.note && <span className="up-note">{S(e.note)}</span>}<span className="up-note rv-only">checked: {e.chk}</span></td>
                <td><FlagButton t={{ kind: "grammar", id: x.id, field: `example:${e.b}`, value: `${e.b} + ${x.p} → ${e.w}`, where: `${x.p}: ${e.b} → ${e.w}` }} /></td>
              </tr>))}</tbody></table></div>
            {x.rules.length > 0 && <><h4>नियमाः · How the word is formed</h4><ul>{x.rules.map((r, i) => <li key={i}>{S(r)}</li>)}</ul></>}
            <p className="ks-id">{x.id}</p>
          </div>)} />
    </>
  );
};
