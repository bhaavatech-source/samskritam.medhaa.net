import React, { useEffect, useState } from "react";
import {
  checkVakHealth,
  generateVakSpeech,
  getVakAudioUrl,
  type SpeechResult
} from "./vakApi";
import "./vak.css";

const EXAMPLE_TEXT = "विद्या ददाति विनयम्।";

export const SamskritaVak: React.FC = () => {
  const [text, setText] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SpeechResult | null>(null);

  useEffect(() => {
    let active = true;

    checkVakHealth()
      .then(status => {
        if (active) setOnline(status);
      })
      .catch(() => {
        if (active) setOnline(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const generate = async () => {
    const input = text.trim();

    if (!input) {
      setError("कृपया संस्कृतपाठं लिखन्तु। Please enter Sanskrit text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await generateVakSpeech(input);
      setResult(response);
      setOnline(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Audio generation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const audioUrl = result ? getVakAudioUrl(result.audio_url) : "";

  return (
    <main className="vak-page">
      <section className="vak-hero">
        <div className="vak-icon" aria-hidden="true">🔊</div>
        <p className="vak-eyebrow">SANSKRIT TEXT TO SPEECH</p>
        <h2>संस्कृतवाक्</h2>
        <p className="vak-subtitle">Samskrita-vāk</p>
        <p className="vak-tagline">Listen to Your Text / Śloka</p>

        <div className={`vak-status ${online === true ? "is-online" : online === false ? "is-offline" : ""}`}>
          <span className="vak-status-dot" />
          {online === null
            ? "Checking speech engine…"
            : online
              ? "Speech engine connected"
              : "Speech engine unavailable"}
        </div>
      </section>

      <section className="vak-card">
        <div className="vak-card-heading">
          <div>
            <h3>Enter Your Sanskrit Text</h3>
            <p>लिखन्तु अथवा स्थापयन्तु</p>
          </div>
          
        </div>

        <label className="vak-label" htmlFor="vak-text">
          Sanskrit text / Śloka
        </label>

        <textarea
          id="vak-text"
          className="vak-textarea"
          value={text}
          onChange={event => {
            setText(event.target.value);
            setError("");
          }}
          placeholder="अत्र संस्कृतपाठं लिखन्तु..."
          rows={7}
          maxLength={5000}
          spellCheck={false}
          lang="sa"
        />

        <div className="vak-input-footer">
          <button
            type="button"
            className="vak-example"
            onClick={() => {
              setText(EXAMPLE_TEXT);
              setError("");
              setResult(null);
            }}
          >
            Insert sample text
          </button>
          <span>{text.length} / 5000 characters</span>
        </div>

        <button
          type="button"
          className="vak-generate"
          onClick={generate}
          disabled={loading || !text.trim() || online === false}
        >
          {loading ? (
            <><span className="vak-spinner" /> Generating audio…</>
          ) : (
            <>🔊 Generate Audio</>
          )}
        </button>

        {error && (
          <div className="vak-error" role="alert">{error}</div>
        )}
      </section>

      {result && (
        <section className="vak-result" aria-live="polite">
          <div className="vak-result-heading">
            <span className="vak-result-icon">🎵</span>
            <div>
              <h3>Audio Generated Successfully</h3>
              <p>संस्कृतवाचः शृण्वन्तु</p>
            </div>
          </div>

          <audio
            className="vak-audio"
            controls
            preload="metadata"
            src={audioUrl}
          >
            Your browser does not support audio playback.
          </audio>

          <div className="vak-audio-details">
            <span>{result.voice_name || "Male Voice 1"}</span>
            {typeof result.duration_seconds === "number" && (
              <span>{result.duration_seconds.toFixed(1)} seconds</span>
            )}
            {typeof result.sample_rate === "number" && (
              <span>{result.sample_rate.toLocaleString()} Hz</span>
            )}
          </div>

          <a
            className="vak-download"
            href={audioUrl}
            download={result.filename || "samskrita-vak.wav"}
          >
            <span>⬇</span> Download WAV
          </a>
        </section>
      )}

      <footer className="vak-footer">
        <p>Powered by Samskrita-vāk · Bhāva Tech</p>
      </footer>
    </main>
  );
};

export default SamskritaVak;
