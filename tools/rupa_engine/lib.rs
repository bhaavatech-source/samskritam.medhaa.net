//! rupa-wasm — the form generator behind “रूपनिर्माणम्” (धातुकोशः).
//!
//! Wraps vidyut-prakriya (Pāṇinian derivation engine, ambuda-org/vidyut) for the browser.
//! Given a Dhātupāṭha code and 0–3 upasargas it returns, as JSON:
//!   tinantas(): every lakāra in कर्तरि (परस्मैपदम् / आत्मनेपदम्), कर्मणि and भावे
//!   krdantas(): the common kṛt forms (क्त्वा/ल्यप्, तुमुन्, क्त, क्तवतु, शतृ, शानच्, तव्यत् …)
//! Forms are in SLP1; the page converts them to the reader's script.
//! The `*_with` variants take a sanādi suffix as well: "Ric" (णिच्, causative), "san" (सन्, desiderative),
//! "yaN" (यङ्, intensive) or "" for the plain root.
//! Built for the web by .github/workflows/rupa-wasm.yml (wasm-pack, target web).

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;
use vidyut_prakriya::args::*;
use vidyut_prakriya::{Dhatupatha, Vyakarana};

const LAKARAS: [(&str, Lakara); 10] = [("lat", Lakara::Lat), ("lan", Lakara::Lan), ("lot", Lakara::Lot), ("vidhilin", Lakara::VidhiLin),
    ("lrt", Lakara::Lrt), ("lut", Lakara::Lut), ("lit", Lakara::Lit), ("lun", Lakara::Lun), ("asirlin", Lakara::AshirLin), ("lrn", Lakara::Lrn)];
const PURUSHAS: [Purusha; 3] = [Purusha::Prathama, Purusha::Madhyama, Purusha::Uttama];
const VACANAS: [Vacana; 3] = [Vacana::Eka, Vacana::Dvi, Vacana::Bahu];
/// kṛt suffix (Debug name in vidyut) and how to show it: avyaya, or the nominative singular in a gender
const KRTS: [(&str, &str); 19] = [("ktvA", "avyaya"), ("tumun", "avyaya"), ("Ramul", "avyaya"), ("kta", "m"), ("ktavatu", "m"), ("Satf", "m"),
    ("SAnac", "m"), ("tavyat", "m"), ("anIyar", "m"), ("yat", "m"), ("Ryat", "m"), ("kyap", "m"), ("tfc", "m"), ("Rvul", "m"),
    ("lyuw", "n"), ("ktin", "f"), ("GaY", "m"), ("ac", "m"), ("ap", "m")];

fn esc(s: &str) -> String { s.replace('\\', "\\\\").replace('"', "\\\"") }
fn join(mut v: Vec<String>) -> String { v.sort(); v.dedup(); esc(&v.join("|")) }

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct Engine { dp: Dhatupatha, v: Vyakarana }

impl Engine {
    fn dhatu(&self, code: &str, prefixes: &str, sanadi: &str) -> Option<Dhatu> {
        let mut d = self.dp.get(code)?.clone();
        match sanadi {
            "" => {}
            "Ric" => d = d.with_sanadi(&[Sanadi::Ric]),
            "san" => d = d.with_sanadi(&[Sanadi::san]),
            "yaN" => d = d.with_sanadi(&[Sanadi::yaN]),
            _ => return None,
        }
        let p: Vec<&str> = prefixes.split(',').map(|x| x.trim()).filter(|x| !x.is_empty()).collect();
        Some(if p.is_empty() { d } else { d.with_prefixes(&p) })
    }
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl Engine {
    /// `tsv`: vidyut-prakriya's dhatupatha.tsv (code, dhatu, artha).
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(tsv: &str) -> Engine {
        Engine { dp: Dhatupatha::from_text(tsv).expect("dhatupatha"), v: Vyakarana::new() }
    }

    /// JSON: {"kartari_P": {"lat": ["a|b", … 9 cells], …}, "kartari_A": …, "karmani": …, "bhave": …}
    /// Cells run प्रथम एक, द्वि, बहु, मध्यम …, उत्तम …; empty string = no form. Modes without forms are left out.
    pub fn tinantas(&self, code: &str, prefixes: &str) -> String { self.tinantas_with(code, prefixes, "") }
    /// as `tinantas`, for the root with a sanādi suffix
    pub fn tinantas_with(&self, code: &str, prefixes: &str, sanadi: &str) -> String {
        let d = match self.dhatu(code, prefixes, sanadi) { Some(d) => d, None => return "{}".into() };
        let modes = [("kartari_P", Prayoga::Kartari, DhatuPada::Parasmaipada), ("kartari_A", Prayoga::Kartari, DhatuPada::Atmanepada),
                     ("karmani", Prayoga::Karmani, DhatuPada::Atmanepada), ("bhave", Prayoga::Bhave, DhatuPada::Atmanepada)];
        let mut out = Vec::new();
        for (name, prayoga, pada) in modes {
            let mut lks = Vec::new();
            for (ln, l) in LAKARAS {
                let mut cells = Vec::new(); let mut any = false;
                for pu in PURUSHAS { for va in VACANAS {
                    let only_first = prayoga == Prayoga::Bhave && !(pu == Purusha::Prathama && va == Vacana::Eka);
                    let forms: Vec<String> = if only_first { vec![] } else {
                        match Tinanta::builder().dhatu(d.clone()).lakara(l).prayoga(prayoga).purusha(pu).vacana(va).pada(pada).build() {
                            Ok(t) => self.v.derive_tinantas(&t).iter().map(|p| p.text()).collect(),
                            Err(_) => vec![],
                        }
                    };
                    if !forms.is_empty() { any = true; }
                    cells.push(format!("\"{}\"", join(forms)));
                }}
                if any { lks.push(format!("\"{}\":[{}]", ln, cells.join(","))); }
            }
            if !lks.is_empty() { out.push(format!("\"{}\":{{{}}}", name, lks.join(","))); }
        }
        format!("{{{}}}", out.join(","))
    }

    /// JSON: {"ktvA": "forms|…", "tumun": …, …}; suffixes without a form are left out.
    pub fn krdantas(&self, code: &str, prefixes: &str) -> String { self.krdantas_with(code, prefixes, "") }
    /// as `krdantas`, for the root with a sanādi suffix
    pub fn krdantas_with(&self, code: &str, prefixes: &str, sanadi: &str) -> String {
        let d = match self.dhatu(code, prefixes, sanadi) { Some(d) => d, None => return "{}".into() };
        let mut out = Vec::new();
        for (name, mode) in KRTS {
            let krt = match BaseKrt::iter().find(|k| format!("{:?}", k) == name) { Some(k) => k, None => continue };
            let k = match Krdanta::builder().dhatu(d.clone()).krt(krt).build() { Ok(k) => k, Err(_) => continue };
            let forms: Vec<String> = if mode == "avyaya" {
                self.v.derive_krdantas(&k).iter().map(|p| p.text()).collect()
            } else {
                let l = match mode { "m" => Linga::Pum, "f" => Linga::Stri, _ => Linga::Napumsaka };
                self.v.derive_subantas(&Subanta::new(k, l, Vibhakti::Prathama, Vacana::Eka)).iter().map(|p| p.text()).collect()
            };
            if !forms.is_empty() { out.push(format!("\"{}\":\"{}\"", name, join(forms))); }
        }
        format!("{{{}}}", out.join(","))
    }
}
