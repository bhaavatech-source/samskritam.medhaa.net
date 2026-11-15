// scan: for every Uṇādi pratyaya × every dhātu, print the Uṇādi sūtras applied and the stem.
// usage: un <dhatupatha.tsv> scan            → sutra \t dhatu_code \t unadi \t stem
//        un <dhatupatha.tsv> detail < lines  (dhatu_code \t unadi \t linga(m|f|n|-) \t want_stem)
//                                            → JSON per line: stem history + nominative history
use std::io::BufRead;
use vidyut_prakriya::args::*;
use vidyut_prakriya::{Dhatupatha, Vyakarana, Rule, Prakriya};
fn rule_str(r: Rule) -> String {
    match r {
        Rule::Ashtadhyayi(s) => format!("A:{}", s), Rule::Varttika(s) => format!("V:{}", s),
        Rule::Dhatupatha(s) => format!("D:{}", s), Rule::Unadipatha(s) => format!("U:{}", s),
        Rule::Linganushasana(s) => format!("L:{}", s), Rule::Phit(s) => format!("P:{}", s),
        other => format!("X:{:?}", other).replace('"', ""),
    }
}
fn hist(p: &Prakriya) -> String {
    let steps: Vec<String> = p.history().iter().map(|s| {
        let terms: Vec<String> = s.result().iter().map(|t| if t.was_changed() { format!("*{}", t.text()) } else { t.text().to_string() }).collect();
        format!("[\"{}\",\"{}\"]", rule_str(s.rule()), terms.join(" ").replace('"', "'").replace('\\', "").replace('^', ""))
    }).collect();
    format!("[{}]", steps.join(","))
}
fn main() {
    let a: Vec<String> = std::env::args().collect();
    let dp = Dhatupatha::from_path(&a[1]).unwrap();
    let v = Vyakarana::builder().log_steps(true).is_chandasi(true).build();
    std::panic::set_hook(Box::new(|_| {}));
    if a[2] == "scan" {
        for un in Unadi::iter() {
            for e in dp.iter() {
                let d = e.dhatu().clone();
                let k = match Krdanta::builder().dhatu(d).krt(un).build() { Ok(k) => k, Err(_) => continue };
                let r = std::panic::catch_unwind(|| v.derive_krdantas(&k));
                let ps = match r { Ok(ps) => ps, Err(_) => continue };
                for p in ps {
                    let us: Vec<String> = p.history().iter().filter_map(|s| match s.rule() { Rule::Unadipatha(c) => Some(c.to_string()), _ => None }).collect();
                    println!("{}\t{}\t{:?}\t{}", us.join(","), e.code(), un, p.text());
                }
            }
        }
        return;
    }
    let vl = Vyakarana::builder().log_steps(true).is_chandasi(true).build();
    for line in std::io::stdin().lock().lines() {
        let line = line.unwrap(); let f: Vec<&str> = line.split('\t').collect();
        let d = match dp.get(f[0]) { Some(d) => d.clone(), None => { println!("{}\tERR", line); continue } };
        let un = Unadi::iter().find(|x| format!("{:?}", x) == f[1]).unwrap();
        let k = Krdanta::builder().dhatu(d).krt(un).build().unwrap();
        let ps = std::panic::catch_unwind(|| vl.derive_krdantas(&k)).unwrap_or_default();
        let p = match ps.iter().find(|p| p.text() == f[3]) { Some(p) => p, None => { println!("{}\tNOSTEM", line); continue } };
        let mut out = format!("{}\t{}", line, hist(p));
        if f[2] != "-" {
            let l = match f[2] { "m" => Linga::Pum, "f" => Linga::Stri, _ => Linga::Napumsaka };
            let s = Subanta::new(Pratipadika::basic(Slp1String::from(f[3]).unwrap()), l, Vibhakti::Prathama, Vacana::Eka);
            let sp = std::panic::catch_unwind(|| vl.derive_subantas(&s)).unwrap_or_default();
            if let Some(q) = sp.first() { out = format!("{}\t{}\t{}", out, q.text(), hist(q)); }
        }
        println!("{}", out);
    }
}
