import path from "node:path";
import puppeteer from "puppeteer";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const outputPath = path.join(distDir, "ai-native-developer.pdf");

if (!(await Bun.file(path.join(distDir, "pdf", "index.html")).exists())) {
  console.error("dist/pdf/index.html não encontrado. Rode `bun run build:site` antes de gerar o PDF.");
  process.exit(1);
}

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
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
let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;

try {
  browser = await puppeteer.launch({
    headless: true,
    channel: "chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
  await page.goto(`${origin}/pdf/`, { waitUntil: "networkidle0" });
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
} finally {
  await browser?.close();
  server.stop(true);
}
