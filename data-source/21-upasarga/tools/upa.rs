// Usage: upa <dhatupatha.tsv> <id>=<code>=<pre1,pre2> ...  -> TSV: id lakara prayoga pada purusha vacana forms(|-joined)
use vidyut_prakriya::args::*;
use vidyut_prakriya::{Dhatupatha, Vyakarana};
fn main() {
    let a: Vec<String> = std::env::args().collect();
    let dp = Dhatupatha::from_path(&a[1]).expect("dhatupatha");
    let v = Vyakarana::new();
    let lakaras = [("lat", Lakara::Lat), ("lan", Lakara::Lan), ("lot", Lakara::Lot), ("vidhilin", Lakara::VidhiLin),
        ("lrt", Lakara::Lrt), ("lut", Lakara::Lut), ("lit", Lakara::Lit), ("lun", Lakara::Lun), ("asirlin", Lakara::AshirLin), ("lrn", Lakara::Lrn)];
    let prayogas = [("kartari", Prayoga::Kartari), ("karmani", Prayoga::Karmani)];
    let padas = [("P", DhatuPada::Parasmaipada), ("A", DhatuPada::Atmanepada)];
    let purushas = [("prathama", Purusha::Prathama), ("madhyama", Purusha::Madhyama), ("uttama", Purusha::Uttama)];
    let vacanas = [("eka", Vacana::Eka), ("dvi", Vacana::Dvi), ("bahu", Vacana::Bahu)];
    for arg in &a[2..] {
        let parts: Vec<&str> = arg.split('=').collect();
        let (id, code, pre) = (parts[0], parts[1], parts[2]);
        let pres: Vec<&str> = pre.split(',').collect();
        let d = dp.get(code).expect("code").clone().with_prefixes(&pres);
        for (ln, l) in lakaras { for (prn, pr) in prayogas { for (pn, p) in padas { for (pun, pu) in purushas { for (vn, va) in vacanas {
            let t = Tinanta::builder().dhatu(d.clone()).lakara(l).prayoga(pr).purusha(pu).vacana(va).pada(p).build().unwrap();
            let mut forms: Vec<String> = v.derive_tinantas(&t).iter().map(|x| x.text()).collect();
            forms.sort(); forms.dedup();
            if !forms.is_empty() { println!("{id}\t{ln}\t{prn}\t{pn}\t{pun}\t{vn}\t{}", forms.join("|")); }
        }}}}}
    }
}
