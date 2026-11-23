import React, { useState } from "react";
import "./support.css";

// ══════════════════════════════════════════════════════════════════
//  ⚠️  Double-check these before this goes live.
//  Taken from the SBI current-account letter for this office account.
// ══════════════════════════════════════════════════════════════════
const ACCOUNT_NAME = "Bhava Tech";
const ACCOUNT_NUMBER = "45096165105";
const IFSC = "SBIN0016490";
const BANK_BRANCH = "State Bank of India, Gurudwara Junction, Visakhapatnam";

type FieldProps = { label: string; value: string };
const Field: React.FC<FieldProps> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable — the value is still visible to select */ }
  };
  return (
    <div className="app-support-field">
      <span className="app-support-field-label">{label}</span>
      <span className="app-support-field-value">{value}</span>
      <button type="button" className="app-support-field-copy" onClick={copy}>
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
};

/** a small link-sized toggle meant to sit next to the Medhaa.net / naada.medhaa.net links */
export const SupportSection: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <span className="app-support-wrap">
      <button
        type="button" className="app-footer-support-btn"
        onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="app-support-panel"
      >
        सहयोगं कुरुत
      </button>

      {open && (
        <div id="app-support-panel" className="app-support-panel">
          <p className="app-support-copy">
            Contributions fund continued development of Saṃskṛtam and its related projects — new content,
            better tools, and wider coverage of the language.
          </p>
          <div className="app-support-bank">
            <Field label="Account name" value={ACCOUNT_NAME} />
            <Field label="Account number" value={ACCOUNT_NUMBER} />
            <Field label="IFSC code" value={IFSC} />
            <Field label="Bank & branch" value={BANK_BRANCH} />
          </div>
          <p className="app-support-hint">
            Transfer via NEFT / IMPS / RTGS using the details above. For other ways to contribute, including
            from outside India, or any questions,{" "}
            <a href="https://wa.me/919573057516" target="_blank" rel="noopener noreferrer">contact us on WhatsApp</a>.
          </p>
        </div>
      )}
    </span>
  );
};

export default SupportSection;
