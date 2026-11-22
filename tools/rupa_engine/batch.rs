// stdin: code \t prefixes(csv or empty) [\t sanadi: Ric | san | yaN] ; stdout: code \t prefixes \t tinantas-json \t krdantas-json [\t sanadi]
use std::io::BufRead;
use rupa_test::Engine;
fn main() {
    let a: Vec<String> = std::env::args().collect();
    let e = Engine::new(&std::fs::read_to_string(&a[1]).unwrap());
    for line in std::io::stdin().lock().lines() {
        let line = line.unwrap(); let mut f = line.split('\t');
        let code = f.next().unwrap(); let pre = f.next().unwrap_or(""); let san = f.next().unwrap_or("");
        let (t, k) = (e.tinantas_with(code, pre, san), e.krdantas_with(code, pre, san));
        if san.is_empty() { println!("{}\t{}\t{}\t{}", code, pre, t, k); } else { println!("{}\t{}\t{}\t{}\t{}", code, pre, t, k, san); }
    }
}
