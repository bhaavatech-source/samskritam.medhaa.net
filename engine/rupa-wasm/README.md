# rupa-wasm — the engine behind रूपनिर्माणम्

Wraps [vidyut-prakriya](https://github.com/ambuda-org/vidyut) (MIT) for the browser. For a Dhātupāṭha code and up to
three upasargas it returns every tiṅanta form (कर्तरि both padas, कर्मणि, भावे, all ten lakāras) and the common kṛdantas.

* Source: `src/lib.rs` (two functions: `tinantas`, `krdantas`; output is JSON with SLP1 forms).
* Built on GitHub by `.github/workflows/rupa-wasm.yml`, which commits `app/public/vidyut/rupa_wasm.js` and
  `rupa_wasm_bg.wasm`. Nothing to install locally; after the workflow has run: `git pull`, then `npm run build`.
* The root list (`app/public/vidyut/dhatus.json`) comes from `tools/build_dhatu_index.py`;
  `app/public/vidyut/dhatupatha.tsv` is vidyut-prakriya's Dhātupāṭha (from ashtadhyayi.com, MIT).
* Same engine revision as the verb data on the site (vidyut, commit 2a802d0).
