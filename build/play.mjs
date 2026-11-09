// builds play/ : a ready-to-open copy of the game (double-click play/index.html, no install needed)
import { build } from "/opt/npm-tools/node_modules/esbuild/lib/main.js";
import fs from "fs";
const out = "/home/claude/smg/play";
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out + "/assets", { recursive: true });
await build({
  entryPoints: ["/home/claude/smg/app/src/main.tsx"], bundle: true, minify: true, format: "iife", target: "es2020",
  outfile: out + "/assets/game.js", jsx: "automatic", loader: { ".json": "json" }, charset: "utf8",
  nodePaths: ["/opt/npm-tools/node_modules"], define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
});
fs.renameSync(out + "/assets/game.css", out + "/assets/game.css");
let html = fs.readFileSync("/home/claude/smg/app/index.html", "utf8")
  .replace('<script type="module" src="/src/main.tsx"></script>', '<script src="./assets/game.js"></script>')
  .replace("</head>", '    <link rel="stylesheet" href="./assets/game.css" />\n  </head>');
fs.writeFileSync(out + "/index.html", html);
fs.copyFileSync("/home/claude/smg/app/public/favicon.svg", out + "/favicon.svg");
console.log(fs.readdirSync(out + "/assets"));
