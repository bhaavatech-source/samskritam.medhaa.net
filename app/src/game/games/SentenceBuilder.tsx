// ═══════════════════════════════════════════════════════════════
//  SentenceBuilder — वाक्यरचना / पदच्छेदः: tap the pieces in order.
//  Sentences: the meaning is the clue. Ślokas: the śloka is shown, its words are the tiles.
// ═══════════════════════════════════════════════════════════════
import { Rom } from "../../kosha/Kosha";
import React, { useEffect, useRef, useState } from "react";
import type { GameApi } from "../GameShell";
import type { BuildStation, BuildItem } from "../stations";
import { shuffle } from "../../data";
import { speak } from "../../speech";
import { FlagButton } from "../../FlagUI";
import { useLang } from "../../settings";
import { useSa } from "../../i18n/script";

type Tile = { id: number; text: string };

const SentenceBuilder: React.FC<{ station: BuildStation; api: GameApi }> = ({ station, api }) => {
  const apiRef = useRef(api); apiRef.current = api;
  const lang = useLang();
  const S = useSa();
  const [items] = useState<BuildItem[]>(() => station.items(lang));
  const [i, setI] = useState(0);
  const [tray, setTray] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [state, setState] = useState<"play" | "right" | "wrong">("play");
  const [hinted, setHinted] = useState(false);
  const total = items.length;
  const it = items[i];

  useEffect(() => {
    if (!it) return;
    let t = shuffle(it.toks.map((text, id) => ({ id, text })));
    for (let g = 0; g < 8 && t.map(x => x.text).join(" ") === it.toks.join(" "); g++) t = shuffle(t);
    setTray(t); setPlaced([]); setState("play"); setHinted(false);
    apiRef.current.progress(i, total);
  }, [i, it, total]);

  if (!it) return <p className="qz-empty">Nothing to build here yet.</p>;

  const check = (p: Tile[]) => {
    const ok = p.map(x => x.text).join(" ") === it.toks.join(" ");
    setState(ok ? "right" : "wrong");
    if (ok) { apiRef.current.correct(hinted ? 5 : 10); speak(it.speak); window.setTimeout(next, 1500); }
    else apiRef.current.wrong();
  };
  const put = (t: Tile) => {
    if (state !== "play") return;
    const p = [...placed, t]; setPlaced(p); setTray(tray.filter(x => x.id !== t.id));
    if (p.length === it.toks.length) check(p);
  };
  const back = (t: Tile) => {
    if (state !== "play") return;
    setPlaced(placed.filter(x => x.id !== t.id)); setTray([...tray, t]);
  };
  const hint = () => {
    if (state !== "play") return;
    let k = 0; while (k < placed.length && placed[k].text === it.toks[k]) k++;
    const keep = placed.slice(0, k);
    const rest = [...placed.slice(k), ...tray];
    const nextTile = rest.find(x => x.text === it.toks[k]);
    if (!nextTile) return;
    const p = [...keep, nextTile];
    setPlaced(p); setTray(rest.filter(x => x.id !== nextTile.id));
    setHinted(true); apiRef.current.hint();
    if (p.length === it.toks.length) check(p);
  };
  const next = () => {
    if (apiRef.current.isOver()) return;
    if (i + 1 >= total) { apiRef.current.progress(total, total); apiRef.current.finish(); return; }
    setI(i + 1);
  };
  const retry = () => { setTray(shuffle([...placed, ...tray])); setPlaced([]); setState("play"); };

  return (
    <div className="sb">
      <div className={`qz-card ${state === "right" ? "qz-right" : state === "wrong" ? "qz-wrong" : ""}`}>
        <span className="ab-round">{i + 1} / {total}</span>
        {it.show
          ? <div className="sb-sloka"><button className="ab-speak" onClick={() => speak(it.speak)} aria-label="Listen">🔊</button> {S(it.show)}</div>
          : null}
        {it.clue && <div className="sb-en" dir="auto">“{it.clue}”</div>}
        {it.clueR && <Rom t={it.clueR} />}
        <div className="qz-tags">{it.tags.map(t => <span key={t}>{S(t)}</span>)}</div>
        <div className="qz-ask"><span>{it.ask}</span></div>
      </div>

      <div className={`sb-line ${state === "wrong" ? "ab-slot-wrong" : ""} ${state === "right" ? "sb-ok" : ""}`} aria-label="your answer">
        {placed.length === 0 && <span className="sb-placeholder">…</span>}
        {placed.map(t => <button key={t.id} className="sb-tile sb-in" onClick={() => back(t)}>{S(t.text)}</button>)}
      </div>
      <div className="sb-tray">
        {tray.map(t => <button key={t.id} className="sb-tile" onClick={() => put(t)}>{S(t.text)}</button>)}
      </div>

      <div className="qz-foot">
        {state === "play" ? (
          station.hints ? <button className="qz-hint" onClick={hint}>💡 next word <small>(−5)</small></button> : <span />
        ) : (
          <div className={`qz-feedback ${state === "right" ? "ok" : "no"}`} aria-live="polite">
            {state === "right" ? "✓ साधु!" : <>✗ सम्यक्: <b className="sb-answer">{S(it.answer)}</b></>}
          </div>
        )}
        <div className="qz-foot-r">
          <FlagButton t={it.flag} label="दोषः? Report" />
          {state === "wrong" && <button onClick={retry}>↻ पुनः</button>}
          {state === "wrong" && <button className="gs-primary qz-next" onClick={next} autoFocus>अग्रिमम् · Next →</button>}
        </div>
      </div>
    </div>
  );
};

export default SentenceBuilder;
