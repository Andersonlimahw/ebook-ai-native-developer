import path from "node:path";
import puppeteer from "puppeteer";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const baseFromEnv = process.env.ASTRO_BASE ?? "/ebook-ai-native-developer";
const basePath = baseFromEnv === "/" ? "" : `/${baseFromEnv.replace(/^\/+|\/+$/g, "")}`;
const baseDir = basePath ? path.join(distDir, basePath.slice(1)) : distDir;
const basePdfPagePath = path.join(baseDir, "pdf", "index.html");
const rootPdfPagePath = path.join(distDir, "pdf", "index.html");
const hasBasePdfPage = await Bun.file(basePdfPagePath).exists();
const hasRootPdfPage = await Bun.file(rootPdfPagePath).exists();

if (!hasBasePdfPage && !hasRootPdfPage) {
  console.error("Página /pdf/ não encontrada em dist. Rode `bun run build:site` antes de gerar o PDF.");
  process.exit(1);
}

const outputDir = hasBasePdfPage ? baseDir : distDir;
const outputPath = path.join(outputDir, "ai-native-developer.pdf");
const pdfPathname = hasBasePdfPage ? `${basePath}/pdf/` : "/pdf/";

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

const safeDistDir = path.resolve(distDir);

const server = Bun.serve({
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    if (pathname.endsWith("/")) pathname += "index.html";

    const filePath = path.resolve(distDir, `.${pathname}`);
    if (!filePath.startsWith(safeDistDir)) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(file, {
      headers: {
        "content-type": mimeTypes[path.extname(filePath)] ?? file.type,
      },
    });
  },
});

const origin = `http://127.0.0.1:${server.port}`;
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;

try {
  browser = await puppeteer.launch({
    headless: true,
    ...(executablePath ? { executablePath } : { channel: "chrome" as const }),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
  await page.goto(`${origin}${pdfPathname}`, { waitUntil: "networkidle0" });
  await page.emulateMediaType("print");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    outline: true,
  });

  const size = (await Bun.file(outputPath).arrayBuffer()).byteLength;
  console.log(`PDF gerado: ${outputPath} (${Math.round(size / 1024)} KB)`);

  // Espelha em public/ para o servidor de dev: `astro dev` serve public/ (com base),
  // mas não serve dist/. Sem isto, /ai-native-developer.pdf dá 404 em desenvolvimento.
  const publicPath = path.join(rootDir, "public", "ai-native-developer.pdf");
  await Bun.write(publicPath, Bun.file(outputPath));
  console.log(`PDF espelhado para dev: ${publicPath}`);
} finally {
  await browser?.close();
  server.stop(true);
}
