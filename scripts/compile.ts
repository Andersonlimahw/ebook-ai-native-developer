import { marked } from "marked";
import fs from "fs";
import path from "path";
import { loadLocale, getSupportedLanguages, type I18nLocale } from "./i18n";

const LINK_MAP: Record<string, string> = {
  "index.md": "index",
  "01-llm.md": "capitulo-01-o-llm",
  "02-harness.md": "capitulo-02-o-harness",
  "03-agent.md": "capitulo-03-o-agent",
  "04-subagent.md": "capitulo-04-o-subagent",
  "05-context.md": "capitulo-05-o-context",
  "06-skill.md": "capitulo-06-o-skill",
  "07-plugin.md": "capitulo-07-plugin",
  "08-mcp.md": "capitulo-08-mcp",
  "09-cli.md": "capitulo-09-cli",
  "10-sintese.md": "capitulo-10-sintese",
};

const CSS = `
:root {
  --bg: #faf9f6;
  --text: #1c1917;
  --text-muted: #57534e;
  --sidebar-bg: #f5f4f0;
  --sidebar-border: #e7e5e4;
  --accent: #059669;
  --code-bg: #f2f0ea;
  --code-text: #059669;
}
[data-theme="dark"] {
  --bg: #090d16;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --sidebar-bg: #0c1322;
  --sidebar-border: #1e293b;
  --accent: #10b981;
  --code-bg: #0f172a;
  --code-text: #34d399;
}
* { transition: background-color 0.2s, color 0.2s; }
body {
  font-family: sans-serif;
  padding: 20px;
  background-color: var(--bg);
  color: var(--text);
}
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border: 1px solid var(--sidebar-border);
  background-color: var(--sidebar-bg);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  z-index: 1000;
}
.theme-toggle:hover {
  background-color: var(--accent);
  color: var(--bg);
}
`;

function compileChapter(inPath: string): string {
  const mdText = fs.readFileSync(inPath, "utf-8");
  return marked.parse(mdText) as string;
}

function buildHtml(
  content: string,
  lang: string,
  locale: I18nLocale,
): string {
  const langCode = lang === "pt-BR" ? "pt-BR" : lang;
  return `<!DOCTYPE html>
<html lang="${langCode}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${locale.metadata.subtitle}">
  <title>${locale.metadata.title}</title>
  <style>${CSS}</style>
</head>
<body>
  <button class="theme-toggle" id="themeToggle">🌙</button>
  <main class="main-content">
    <header class="ebook-header">
      <h1>${locale.metadata.title}</h1>
      <p class="subtitle">${locale.metadata.subtitle}</p>
    </header>
    <article class="content">${content}</article>
  </main>
  <script>
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    html.setAttribute('data-theme', savedTheme);
    toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  </script>
</body>
</html>`;
}

function parseArgs(): { lang: string } {
  const args = process.argv.slice(2);
  let lang = "pt-BR";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--lang" && args[i + 1]) {
      lang = args[i + 1] || "pt-BR";
      i++;
    }
  }

  return { lang };
}

function main() {
  const { lang } = parseArgs();
  const supportedLangs = getSupportedLanguages();

  if (!supportedLangs.includes(lang)) {
    console.error(
      `Idioma '${lang}' não suportado. Use: ${supportedLangs.join(", ")}`,
    );
    process.exit(1);
  }

  const baseDir = process.cwd();
  const langDir = lang === "pt-BR" ? "pt-BR" : lang;
  const coreDir = path.join(baseDir, "core", langDir);
  const outputRoot = path.join(baseDir, "output");

  const order = [
    ["index.md", "index"],
    ["01-llm.md", "capitulo-01-o-llm"],
    ["02-harness.md", "capitulo-02-o-harness"],
    ["03-agent.md", "capitulo-03-o-agent"],
    ["04-subagent.md", "capitulo-04-o-subagent"],
    ["05-context.md", "capitulo-05-o-context"],
    ["06-skill.md", "capitulo-06-o-skill"],
    ["07-plugin.md", "capitulo-07-plugin"],
    ["08-mcp.md", "capitulo-08-mcp"],
    ["09-cli.md", "capitulo-09-cli"],
    ["10-sintese.md", "capitulo-10-sintese"],
  ];

  let compiledSections: string[] = [];

  console.log(`[i18n] Compilando para idioma: ${lang}`);

  for (const [filename, sectionId] of order) {
    const filePath = path.join(coreDir, filename!);
    if (!fs.existsSync(filePath)) {
      console.error(`Erro: Arquivo ${filePath} não encontrado!`);
      process.exit(1);
    }

    console.log(`  • ${filename}`);
    const fragment = compileChapter(filePath);
    compiledSections.push(
      `<section id="${sectionId}" class="ebook-section">${fragment}</section>`,
    );
  }

  const sectionsJoined = compiledSections.join("\n\n");
  const locale = loadLocale(lang);

  const outputLangDir = lang === "pt-BR" ? "pt-br" : lang;
  const destDir = path.join(outputRoot, outputLangDir);
  fs.mkdirSync(destDir, { recursive: true });

  const htmlContent = buildHtml(sectionsJoined, lang, locale);
  const destPath = path.join(destDir, "index.html");
  fs.writeFileSync(destPath, htmlContent);

  console.log(`✓ HTML gerado: ${destPath}`);
  console.log(`\n✓ Compilação concluída para [${lang}]`);
}

try {
  main();
} catch (err: any) {
  console.error("Erro fatal:", err.message);
  process.exit(1);
}
