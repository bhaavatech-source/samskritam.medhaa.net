"""data-source/22-vibhakti-samanvaya → app/src/data/samanvaya.json (the parts shown in बोधः → विभक्तिसमन्वयः
and used by the game station विभक्तिसमन्वयः). The _audit block is not copied."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
d = json.load(open(os.path.join(HERE, "vibhakti_samanvaya_2026-11-15.json"), encoding="utf-8"))
ef, sg, sv, ad = d["epistemological_foundation"], d["samanvaya_governance_rules"], d["sentence_validity_analysis"], d["adhyahara_system"]
out = {
  "definition": ef["definition"], "definition_en": ef["english_translation"],
  "principle": ef["fundamental_principle"], "principle_en": ef["principle_english"],
  "circ": ef["no_circularity"], "circ_en": ef["no_circularity_en"],
  "persons": [{"name": p["purusha"], "rule": p["rule"], "kartari": [x["sanskrit"] for x in p["kartari_examples"]],
               "karmani": [x["sanskrit"] for x in p["karmani_examples"]]} for p in sg["purusha_vyavastha"]],
  "vacana": sg["vacana_vyavastha"]["principle"],
  "single": sg["single_prathama_constraint"],
  "prayoga": [{"name": v["name"], "def": v["voice_definition"], "rules": v["rules"], "ok": v["valid_sentence"]["text"],
               "ok_why": v["valid_sentence"]["analysis"],
               "bad": [{"text": b["text"], "why": b["analysis"]} for b in (v.get("invalid_sentences") or [v["invalid_sentence"]])]}
              for v in (sv["kartari_prayoga"], sv["karmani_prayoga"], sv["bhave_prayoga"])],
  "adhyahara": [{"sa": r.get("explanation_sa", ""), "en": r["explanation_en"], "maxim": r.get("maxim", "")} for r in ad["rules"]],
}
json.dump(out, open(os.path.join(ROOT, "app/src/data/samanvaya.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("samanvaya.json written")
