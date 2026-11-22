import React, { useEffect, useMemo, useState } from "react";
import { FormFinder } from "./search/FormFinder";
import {
  AVYAYA, AVYAYA_CATS, COMPOSITION, CURRICULUM, ERRORS, GRAMMAR, KRT, LAKARA_INFO, LANGS, PADACCHEDA, PADYA, PRAKRIYA, SAMANVAYA, SENTENCES, VERBS, WORDS,
  loadDhatu400Data, loadUnadi, loadUpasargaForms, loadAlankara, loadChandas,
} from "./data";
import playDhatu from "./data/play_dhatu.json";
import krtLexicon from "./data/krtlex.json";
import sambhashanam from "./data/sambhashanam.json";
import { TOPICS } from "./play/topics";
import "./search.css";

type SearchSection = "learn" | "play" | "speak" | "words" | "verbs" | "sentences" | "grammar" | "sahitya";
type SearchHit = { id: string; section: SearchSection; sectionName: string; title: string; path: string; text: string; normalized: string };
type SearchSource = { data: unknown; section: SearchSection; name: string };

const SOURCES: SearchSource[] = [
  { data: WORDS, section: "words", name: "Noun book" },
  { data: VERBS, section: "verbs", name: "Verb book" },
  { data: KRT, section: "verbs", name: "Participles" },
  { data: SENTENCES, section: "sentences", name: "Sentences" },
  { data: AVYAYA, section: "sentences", name: "Indeclinables" },
  { data: AVYAYA_CATS, section: "sentences", name: "Indeclinable categories" },
  { data: ERRORS, section: "sentences", name: "Corrections" },
  { data: PADACCHEDA, section: "sahitya", name: "Ślokas" },
  { data: PADYA, section: "sahitya", name: "Verse analysis" },
  { data: GRAMMAR, section: "grammar", name: "Grammar" },
  { data: LAKARA_INFO, section: "grammar", name: "Tense and mood meanings" },
  { data: PRAKRIYA, section: "learn", name: "Word derivations" },
  { data: SAMANVAYA, section: "learn", name: "Sentence analysis" },
  { data: CURRICULUM, section: "learn", name: "Learner curricula" },
  { data: COMPOSITION, section: "learn", name: "Sanskrit composition" },
  { data: playDhatu, section: "play", name: "Root games" },
  { data: TOPICS, section: "play", name: "Learning path topics" },
  { data: krtLexicon, section: "verbs", name: "Kṛt lexicon" },
  { data: sambhashanam, section: "speak", name: "Conversation lessons" },
];

const NORMALIZE = (text: string) => text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase();
const TITLE_KEYS = ["w", "lemma", "sa", "verse", "name", "title", "sutra", "p", "word", "root", "id"];
const PATH_NAMES: Record<string, string> = { m: "meaning", d: "forms", iast: "transliteration", ex: "examples" };
const displayPath = (path: string[]) => path.slice(1)
  .filter(part => !/^\d+$/.test(part))
  .map(part => LANGS[part] ?? PATH_NAMES[part] ?? part)
  .slice(-3)
  .join(" › ");

function makeSearchIndex(sources: SearchSource[], extended: unknown[]): SearchHit[] {
  const hits: SearchHit[] = [];
  const seen = new Set<string>();

  const add = (section: SearchSection, sectionName: string, path: string[], title: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const id = `${section}|${path.join(".")}|${title}|${clean}`;
    if (seen.has(id)) return;
    seen.add(id);
    hits.push({ id, section, sectionName, title, path: displayPath(path), text: clean, normalized: NORMALIZE(`${title} ${clean}`) });
  };

  const visit = (value: unknown, section: SearchSection, sectionName: string, path: string[], inheritedTitle = ""): void => {
    if (Array.isArray(value)) {
      if (value.every(item => typeof item === "string" || typeof item === "number")) {
        add(section, sectionName, path, inheritedTitle || path[path.length - 1] || sectionName, value.map(String).join(" · "));
        return;
      }
      const tupleTitle = typeof value[0] === "string" && value[0].trim() ? value[0] : inheritedTitle;
      value.forEach((item, index) => visit(item, section, sectionName, [...path, tupleTitle || String(index + 1)], tupleTitle));
      return;
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      const strings = entries.filter((entry): entry is [string, string | number] => typeof entry[1] === "string" || typeof entry[1] === "number");
      const preferred = TITLE_KEYS.map(key => strings.find(([name]) => name === key)?.[1]).find(item => typeof item === "string" && item.trim());
      const title = preferred ? String(preferred) : inheritedTitle || path[path.length - 1] || sectionName;
      if (strings.length) add(section, sectionName, path, title, strings.map(([key, text]) => `${key}: ${text}`).join(" · "));
      for (const [key, child] of entries) {
        if (child && typeof child === "object") visit(child, section, sectionName, [...path, key], title);
      }
      return;
    }
    if (typeof value === "string" || typeof value === "number") {
      add(section, sectionName, path, inheritedTitle || path[path.length - 1] || sectionName, String(value));
    }
  };

  for (const source of sources) visit(source.data, source.section, source.name, [source.name]);
  const EXT: [SearchSection, string][] = [["verbs", "Expanded verb forms"], ["verbs", "Uṇādi dictionary"], ["verbs", "Prefixed verb forms"], ["sahitya", "Alaṅkāras"], ["sahitya", "Metres"]];
  extended.forEach((data, index) => visit(data, EXT[index][0], EXT[index][1], [EXT[index][1]]));
  return hits;
}

let searchIndexPromise: Promise<SearchHit[]> | null = null;
function loadSearchIndex(): Promise<SearchHit[]> {
  searchIndexPromise ??= Promise.all([loadDhatu400Data(), loadUnadi(), loadUpasargaForms(), loadAlankara(), loadChandas()])
    .then(([dhatus, unadi, upasarga, alankara, chandas]) => makeSearchIndex(SOURCES, [dhatus, unadi, upasarga, alankara.alankaras, chandas.vrittas]))
    .catch(error => { searchIndexPromise = null; throw error; });
  return searchIndexPromise;
}

const MAX_RESULTS = 40;

export const SearchAnything: React.FC<{ onNavigate: (section: SearchSection) => void }> = ({ onNavigate }) => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(MAX_RESULTS);
  const terms = useMemo(() => NORMALIZE(query.trim()).split(/\s+/).filter(Boolean), [query]);

  useEffect(() => {
    if (!terms.length) {
      setLoading(false);
      setError("");
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      loadSearchIndex().then(items => {
        if (!active) return;
        setIndex(items);
        setLoading(false);
      }).catch(reason => {
        if (!active) return;
        setLoading(false);
        setError(reason instanceof Error ? reason.message : String(reason));
      });
    }, 150);
    return () => { active = false; window.clearTimeout(timer); };
  }, [terms]);

  const results = useMemo(() => {
    if (!index || !terms.length) return [];
    return index.filter(hit => terms.every(term => hit.normalized.includes(term)));
  }, [index, terms]);

  return (
    <main className="sa-page">
      <header className="sa-heading">
        <h2>🔎 Search Anything <span>· अन्विष्यताम्</span></h2>
        <p>Search words, forms, meanings, conversations, verses and grammar in any supported language.</p>
      </header>
      <label className="sa-input-wrap">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={event => { setQuery(event.target.value); setVisible(MAX_RESULTS); }}
          placeholder="Search in any script or language, or type any form: अवाप, रामेण…"
          aria-label="Search all site content in any language"
          autoFocus
        />
      </label>
      <p className="sa-hint">Try Sanskrit, IAST, English, हिन्दी, తెలుగు, العربية, 中文, 日本語, or any other supported language.</p>
      <FormFinder q={query} />

      {loading && <p className="sa-status" role="status">Searching all site content…</p>}
      {error && <p className="sa-error" role="alert">Search could not load all site content: {error}</p>}
      {!loading && !error && terms.length > 0 && (
        <>
          <p className="sa-count" role="status">{results.length ? `${results.length} results` : "No results"} for “{query.trim()}”</p>
          <div className="sa-results">
            {results.slice(0, visible).map(hit => (
              <article className="sa-hit" key={hit.id}>
                <div className="sa-hit-top">
                  <span className="sa-category">{hit.sectionName}</span>
                  <button type="button" onClick={() => onNavigate(hit.section)}>Open section →</button>
                </div>
                <h3 dir="auto">{hit.title}</h3>
                {hit.path && <p className="sa-path">{hit.path}</p>}
                <p className="sa-text" dir="auto">{hit.text}</p>
              </article>
            ))}
          </div>
          {results.length > visible && <button className="sa-more" type="button" onClick={() => setVisible(count => count + MAX_RESULTS)}>Show more results</button>}
        </>
      )}
      {!terms.length && <p className="sa-empty">Enter a word or phrase to search the whole site.</p>}
    </main>
  );
};
