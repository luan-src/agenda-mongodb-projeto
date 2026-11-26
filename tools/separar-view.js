const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "public");
const htmlPath = path.join(root, "index.html");
const appPath = path.join(root, "app.js");
const html = fs.readFileSync(htmlPath, "utf8");
if (html.includes("/js/api.js")) {
  console.log("View já separada.");
  process.exit(0);
}
const app = fs.readFileSync(appPath, "utf8");
const start = app.indexOf("async function request(url, options = {})");
const end = app.indexOf("function localeDate(iso)", start);
if (
  start < 0 ||
  end <= start ||
  !html.includes('<script src="/app.js" defer></script>') ||
  !html.includes('href="/style.css"')
)
  throw new Error(
    "View diferente da versão analisada; nenhum arquivo alterado.",
  );
const css = fs.readFileSync(path.join(root, "style.css"));
fs.mkdirSync(path.join(root, "js"), { recursive: true });
fs.mkdirSync(path.join(root, "css"), { recursive: true });
fs.writeFileSync(
  path.join(root, "js", "api.js"),
  "'use strict';\n" + app.slice(start, end),
);
fs.writeFileSync(
  path.join(root, "js", "app.js"),
  app.slice(0, start) + app.slice(end),
);
fs.writeFileSync(path.join(root, "css", "style.css"), css);
fs.writeFileSync(
  htmlPath,
  html
    .replace('href="/style.css"', 'href="/css/style.css"')
    .replace(
      '<script src="/app.js" defer></script>',
      '<script src="/js/api.js" defer></script>\n  <script src="/js/app.js" defer></script>',
    ),
);
// Os arquivos antigos permanecem como backup; podem ser removidos após a validação.
console.log(
  "View separada; arquivos originais app.js e style.css preservados.",
);
