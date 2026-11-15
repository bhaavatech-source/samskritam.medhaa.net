# rupa_engine — makes the tables of रूपनिर्माणम्

`lib.rs` and `batch.rs` are a small Rust program around vidyut-prakriya (github.com/ambuda-org/vidyut, MIT),
the same Pāṇinian engine used for all verb tables of the site. It is run once, on the build machine;
the site itself only reads the prepared files in `app/public/rupa/`.

To rebuild (only needed when roots or upasarga combinations are added):
1. Add `lib.rs` (as `src/lib.rs`) and `batch.rs` (as a `[[bin]]` named `rupa-batch`) to a crate that depends on `vidyut-prakriya`.
2. `cargo build --release`
3. `python tools/build_rupa_tables.py <path to rupa-batch> <path to vidyut-prakriya/data/dhatupatha.tsv>`
