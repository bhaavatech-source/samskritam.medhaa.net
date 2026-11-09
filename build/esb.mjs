// local check build (the real build on your PC is `npm run build`)
import { build } from "/opt/npm-tools/node_modules/esbuild/lib/main.js";
import fs from "fs";
const out = "/home/claude/smg/build/dist";
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out + "/assets", { recursive: true });
await build({
  entryPoints: ["/home/claude/smg/app/src/main.tsx"], bundle: true, minify: true, format: "esm", target: "es2020",
  outfile: out + "/assets/index.js", jsx: "automatic", loader: { ".json": "json" },
  nodePaths: ["/opt/npm-tools/node_modules"], define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
});
let html = fs.readFileSync("/home/claude/smg/app/index.html", "utf8")
  .replace('<script type="module" src="/src/main.tsx"></script>', '<script type="module" src="./assets/index.js"></script>')
  .replace("</head>", '    <link rel="stylesheet" href="./assets/index.css" />\n  </head>');
fs.writeFileSync(out + "/index.html", html);
fs.copyFileSync("/home/claude/smg/app/public/favicon.svg", out + "/favicon.svg");
console.log("ok", fs.statSync(out + "/assets/index.js").size, fs.statSync(out + "/assets/index.css").size);
