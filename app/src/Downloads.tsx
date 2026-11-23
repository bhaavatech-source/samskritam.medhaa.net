import React, { useState } from "react";
import {
  WORDS, VERBS, SENTENCES, AVYAYA, GRAMMAR, CURRICULUM, PADYA, SAMANVAYA,
  loadUnadi, loadUpasargaForms, loadAlankara, loadChandas, loadDhatu400Data,
} from "./data";
import "./downloads.css";

// ── generic client-side file export (no server needed) ──────────
function saveBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function downloadJSON(filename: string, data: unknown) {
  saveBlob(filename, new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
}
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadCSV(filename: string, headers: string[], rows: unknown[][]) {
  const lines = [headers.map(csvCell).join(","), ...rows.map(r => r.map(csvCell).join(","))];
  // leading BOM so Excel opens Devanagari correctly
  saveBlob(filename, new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
}

type Item = {
  id: string; sa: string; en: string; note: string;
  count: () => number | null;
  json: () => unknown | Promise<unknown>;
  csv?: { headers: string[]; rows: () => unknown[][] };
};

const ITEMS: Item[] = [
  {
    id: "words", sa: "शब्दकोशः", en: "Nouns & declensions", note: "every noun, with full declension tables",
    count: () => WORDS.length, json: () => WORDS,
    csv: {
      headers: ["word", "iast", "gender", "category", "meaning_en"],
      rows: () => WORDS.map(w => [w.w, w.iast, w.g, w.cat, w.m?.en?.[0] || ""]),
    },
  },
  {
    id: "verbs", sa: "धातुकोशः", en: "Verb roots", note: "verb roots with gaṇa, pada and meanings",
    count: () => VERBS.length, json: () => VERBS,
    csv: {
      headers: ["root", "iast", "gana", "pada", "transitivity", "meaning_en"],
      rows: () => VERBS.map(v => [v.w, v.iast, v.gana, v.pada, v.trans, v.m.en || ""]),
    },
  },
  {
    id: "sentences", sa: "वाक्यकोशः", en: "Sentences", note: "graded example sentences with translations",
    count: () => SENTENCES.length, json: () => SENTENCES,
    csv: {
      headers: ["sanskrit", "english", "category"],
      rows: () => SENTENCES.map(s => [s.sa, s.en, s.cat]),
    },
  },
  {
    id: "avyaya", sa: "अव्ययानि", en: "Indeclinables", note: "particles and indeclinable words",
    count: () => AVYAYA.length, json: () => AVYAYA,
    csv: {
      headers: ["sanskrit", "category", "english", "hindi", "telugu"],
      rows: () => AVYAYA.map(a => [a.sa, a.cat, a.en, a.hi, a.te]),
    },
  },
  {
    id: "padya", sa: "पद्यानि", en: "Verses", note: "verses with padaccheda, anvaya and meaning",
    count: () => PADYA.verses.length, json: () => PADYA,
    csv: {
      headers: ["source", "verse", "anvaya", "meaning_en"],
      rows: () => PADYA.verses.map(v => [v.source, v.verse, v.anvaya, v.m.en || ""]),
    },
  },
  {
    id: "grammar", sa: "व्याकरणम्", en: "Grammar reference", note: "sandhi, samāsa, kṛt & taddhita pratyayas, upasargas",
    count: () => null, json: () => GRAMMAR,
  },
  {
    id: "samanvaya", sa: "विभक्तिसमन्वयः", en: "Case agreement", note: "agreement of case (vibhakti) and verb",
    count: () => null, json: () => SAMANVAYA,
  },
  {
    id: "curriculum", sa: "पाठ्यक्रमः", en: "Curriculum", note: "the full school / college / university course outline",
    count: () => null, json: () => CURRICULUM,
  },
  {
    id: "unadi", sa: "उणादयः", en: "Uṇādi-sūtras", note: "all 748 Uṇādi sūtras with derivations — larger file",
    count: () => null, json: () => loadUnadi(),
  },
  {
    id: "upasarga", sa: "उपसर्गरूपाणि", en: "Prefixed verb forms", note: "full tables of prefix + root verb forms — larger file",
    count: () => null, json: () => loadUpasargaForms(),
  },
  {
    id: "alankara", sa: "अलङ्काराः", en: "Alaṅkāras", note: "figures of speech, with lakṣaṇa and examples",
    count: () => null, json: () => loadAlankara(),
  },
  {
    id: "chandas", sa: "छन्दांसि", en: "Metres (chandas)", note: "Sanskrit metres, gaṇas and scansion rules",
    count: () => null, json: () => loadChandas(),
  },
  {
    id: "dhatu400", sa: "धातुरूपाणि ४००", en: "400-root full conjugations", note: "400 verb roots, every lakāra, kartari/karmaṇi/bhāve — large file",
    count: () => null, json: async () => { const d = await loadDhatu400Data(); return d; },
  },
];

type Status = "idle" | "loading" | "done" | "error";

const Row: React.FC<{ item: Item }> = ({ item }) => {
  const [status, setStatus] = useState<Status>("idle");
  const n = item.count();

  const go = async (kind: "json" | "csv") => {
    setStatus("loading");
    try {
      if (kind === "csv" && item.csv) {
        downloadCSV(`samskritam-${item.id}.csv`, item.csv.headers, item.csv.rows());
      } else {
        const data = await item.json();
        downloadJSON(`samskritam-${item.id}.json`, data);
      }
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2400);
    }
  };

  return (
    <div className="dl-row">
      <div className="dl-row-text">
        <h3>{item.sa} <small>{item.en}</small></h3>
        <p>{item.note}{n ? ` · ${n.toLocaleString("en-IN")} entries` : ""}</p>
      </div>
      <div className="dl-row-actions">
        {item.csv && (
          <button type="button" className="dl-btn dl-btn-csv" onClick={() => go("csv")} disabled={status === "loading"}>
            ⬇ CSV
          </button>
        )}
        <button type="button" className="dl-btn dl-btn-json" onClick={() => go("json")} disabled={status === "loading"}>
          ⬇ JSON
        </button>
        {status === "loading" && <span className="dl-status">preparing…</span>}
        {status === "done" && <span className="dl-status dl-status-ok">saved ✓</span>}
        {status === "error" && <span className="dl-status dl-status-err">couldn't load — try again</span>}
      </div>
    </div>
  );
};

export const Downloads: React.FC = () => {
  const downloadAllJSON = async () => {
    const all: Record<string, unknown> = {};
    for (const item of ITEMS) all[item.id] = await item.json();
    downloadJSON("samskritam-all-data.json", all);
  };

  return (
    <main className="dl-wrap">
      <header className="dl-head">
        <p className="dl-eyebrow">डाउनलोड् कुर्वन्तु · Downloads</p>
        <h2>सर्वं निःशुल्कम्, सर्वं लभ्यम् <small>Everything free. Everything yours to keep.</small></h2>
        <p className="dl-copy">
          Every word list, verb table, sentence set and grammar reference on this site is open for you to
          download and use offline — for your own study, for teaching, or to build something new. Pick a dataset below.
        </p>
        <button type="button" className="dl-btn dl-btn-all" onClick={downloadAllJSON}>
          ⬇ Download everything as one JSON file
        </button>
      </header>
      <div className="dl-list">
        {ITEMS.map(item => <Row key={item.id} item={item} />)}
      </div>
      <p className="dl-license">
        Free to use for learning and teaching. If you reuse this data publicly, a credit to
        संस्कृतम् · Saṃskṛtam (samskritam.medhaa.net) is appreciated.
      </p>
    </main>
  );
};

export default Downloads;
