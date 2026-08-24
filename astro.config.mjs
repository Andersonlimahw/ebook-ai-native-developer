import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { remarkMermaid } from "./src/plugins/remark-mermaid.ts";

const base = "/ebook-ai-native-developer";
const withBase = (path) => `${base}${path}`;

export default defineConfig({
  site: "https://andersonlimahw.github.io",
  base,
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  integrations: [
    starlight({
      title: "AI Native Developer",
      description: "Um guia prático para developers no mundo nativo de IA",
      favicon: "/favicon.ico",
      logo: {
        src: "./src/assets/logo-header.png",
        alt: "Lemon.dev",
      },
      defaultLocale: "root",
      locales: {
        root: {
          label: "Português",
          lang: "pt-BR",
        },
        es: {
          label: "Español",
          lang: "es-AR",
        },
        en: {
          label: "English",
          lang: "en-US",
        },
      },
      components: {
        Head: "./src/components/Head.astro",
        Footer: "./src/components/Footer.astro",
      },
      customCss: ["./src/styles/starlight.css"],
      social: [
        {
          icon: "download",
          label: "Baixar PDF",
          href: withBase("/ai-native-developer.pdf"),
        },
        {
          icon: "external",
          label: "Lemon",
          href: "https://lemon.dev.br",
        },
      ],
      sidebar: [
        {
          label: "Parte I — O Stack Agêntico",
          translations: {
            es: "Parte I — El Stack Agéntico",
            en: "Part I — The Agentic Stack",
          },
          items: [
            { label: "Índice", link: "/", translations: { es: "Índice", en: "Index" } },
            { slug: "01-llm", label: "Capítulo 01 — O LLM", translations: { es: "Capítulo 01 — El LLM", en: "Chapter 01 — The LLM" } },
            { slug: "02-harness", label: "Capítulo 02 — O Harness", translations: { es: "Capítulo 02 — El Harness", en: "Chapter 02 — The Harness" } },
            { slug: "03-agent", label: "Capítulo 03 — O Agent", translations: { es: "Capítulo 03 — El Agent", en: "Chapter 03 — The Agent" } },
            { slug: "04-subagent", label: "Capítulo 04 — O Subagent", translations: { es: "Capítulo 04 — El Subagent", en: "Chapter 04 — The Subagent" } },
            { slug: "05-context", label: "Capítulo 05 — O Context", translations: { es: "Capítulo 05 — El Context", en: "Chapter 05 — The Context" } },
            { slug: "06-skill", label: "Capítulo 06 — A Skill", translations: { es: "Capítulo 06 — La Skill", en: "Chapter 06 — The Skill" } },
            { slug: "07-plugin", label: "Capítulo 07 — O Plugin", translations: { es: "Capítulo 07 — El Plugin", en: "Chapter 07 — The Plugin" } },
            { slug: "08-mcp", label: "Capítulo 08 — O MCP", translations: { es: "Capítulo 08 — El MCP", en: "Chapter 08 — The MCP" } },
            { slug: "09-cli", label: "Capítulo 09 — O CLI", translations: { es: "Capítulo 09 — El CLI", en: "Chapter 09 — The CLI" } },
            { slug: "10-sintese", label: "Capítulo 10 — Síntese", translations: { es: "Capítulo 10 — Síntesis", en: "Chapter 10 — Synthesis" } },
          ],
        },
        {
          label: "Parte II — AI Native em Produção",
          translations: {
            es: "Parte II — AI Native en Producción",
            en: "Part II — AI Native in Production",
          },
          items: [
            { slug: "11-embeddings", label: "Capítulo 11 — Embeddings", translations: { es: "Capítulo 11 — Embeddings", en: "Chapter 11 — Embeddings" } },
            { slug: "12-rag", label: "Capítulo 12 — RAG", translations: { es: "Capítulo 12 — RAG", en: "Chapter 12 — RAG" } },
            { slug: "13-memory", label: "Capítulo 13 — Memory", translations: { es: "Capítulo 13 — Memory", en: "Chapter 13 — Memory" } },
            { slug: "14-tool-calling", label: "Capítulo 14 — Tool Calling", translations: { es: "Capítulo 14 — Tool Calling", en: "Chapter 14 — Tool Calling" } },
            { slug: "15-evals", label: "Capítulo 15 — Evals", translations: { es: "Capítulo 15 — Evals", en: "Chapter 15 — Evals" } },
            { slug: "16-observability", label: "Capítulo 16 — Observability", translations: { es: "Capítulo 16 — Observability", en: "Chapter 16 — Observability" } },
            { slug: "17-cost-engineering", label: "Capítulo 17 — Cost Engineering", translations: { es: "Capítulo 17 — Cost Engineering", en: "Chapter 17 — Cost Engineering" } },
          ],
        },
        {
          label: "Parte III — Engenharia de Loop",
          translations: {
            es: "Parte III — Ingeniería de Loop",
            en: "Part III — Loop Engineering",
          },
          items: [
            { slug: "18-loop-engineer", label: "Capítulo 18 — Engenharia de Loop", translations: { es: "Capítulo 18 — Ingeniería de Loop", en: "Chapter 18 — Loop Engineering" } },
            { slug: "19-graph-engineering", label: "Capítulo 19 — Graph Engineering", translations: { es: "Capítulo 19 — Graph Engineering", en: "Chapter 19 — Graph Engineering" } },
            { slug: "20-workflows", label: "Capítulo 20 — Workflows com Subagents", translations: { es: "Capítulo 20 — Workflows con Subagentes", en: "Chapter 20 — Workflows with Subagents" } },
          ],
        },
      ],
    }),
  ],
});
