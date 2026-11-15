// stdin: code \t prefixes(csv or empty) ; stdout: code \t prefixes \t tinantas-json \t krdantas-json
use std::io::BufRead;
use rupa_test::Engine;
fn main() {
    let a: Vec<String> = std::env::args().collect();
    let e = Engine::new(&std::fs::read_to_string(&a[1]).unwrap());
    for line in std::io::stdin().lock().lines() {
        let line = line.unwrap(); let mut f = line.split('\t');
        let code = f.next().unwrap(); let pre = f.next().unwrap_or("");
        println!("{}\t{}\t{}\t{}", code, pre, e.tinantas(code, pre), e.krdantas(code, pre));
    }
}
