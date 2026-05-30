import { marked } from "marked";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
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
body { font-family: sans-serif; padding: 20px; }
`;

function compileChapter(inPath: string): string {
  const mdText = fs.readFileSync(inPath, "utf-8");
  return marked.parse(mdText) as string;
}

function buildHtml(content: string, theme: string, lang: string, locale: I18nLocale): string {
  const langCode = lang === "pt-BR" ? "pt-BR" : lang;
  return `<!DOCTYPE html>
<html lang="${langCode}" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="description" content="${locale.metadata.subtitle}">
  <title>${locale.metadata.title}</title>
  <style>${CSS}</style>
</head>
<body>
  <main class="main-content">
    <header class="ebook-header">
      <h1>${locale.metadata.title}</h1>
      <p class="subtitle">${locale.metadata.subtitle}</p>
    </header>
    <article class="content">${content}</article>
  </main>
</body>
</html>`;
}

function parseArgs(): { lang: string } {
  const args = process.argv.slice(2);
  let lang = "pt-BR";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--lang" && args[i + 1]) {
      lang = args[i + 1];
      i++;
    }
  }

  return { lang };
}

async function main() {
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

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const themes = ["light", "dark"];
  const outputLangDir = lang === "pt-BR" ? "pt-br" : lang;
  const destDir = path.join(outputRoot, outputLangDir);
  fs.mkdirSync(destDir, { recursive: true });

  for (const theme of themes) {
    const destPath = path.join(destDir, `ebook-${theme}.pdf`);
    const htmlContent = buildHtml(sectionsJoined, theme, lang, locale);

    const tempHtmlPath = path.join(destDir, `.tmp-${theme}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent);

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle2" });
    await page.pdf({ path: destPath, format: "A4", printBackground: true });
    await page.close();

    fs.unlinkSync(tempHtmlPath);
    console.log(`✓ PDF gerado: ${destPath}`);
  }

  await browser.close();
  console.log(`\n✓ Compilação concluída para [${lang}]`);
}

main().catch((err) => {
  console.error("Erro fatal:", err.message);
  process.exit(1);
});
