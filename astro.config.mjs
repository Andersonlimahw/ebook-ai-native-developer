import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://lemon.dev.br",
  integrations: [
    starlight({
      title: "AI Native Developer",
      description: "Um guia prático para developers no mundo nativo de IA",
      favicon: "/favicon.svg",
      locales: {
        root: {
          label: "Português",
          lang: "pt-BR",
        },
      },
      customCss: ["./src/styles/starlight.css"],
      social: [
        {
          icon: "download",
          label: "Baixar PDF",
          href: "/ai-native-developer.pdf",
        },
        {
          icon: "external",
          label: "Lemon",
          href: "https://lemon.dev.br",
        },
      ],
      sidebar: [
        {
          label: "Conteúdo",
          items: [
            { label: "Índice", link: "/" },
            { slug: "01-llm", label: "Capítulo 01 — O LLM" },
            { slug: "02-harness", label: "Capítulo 02 — O Harness" },
            { slug: "03-agent", label: "Capítulo 03 — O Agent" },
            { slug: "04-subagent", label: "Capítulo 04 — O Subagent" },
            { slug: "05-context", label: "Capítulo 05 — O Context" },
            { slug: "06-skill", label: "Capítulo 06 — A Skill" },
            { slug: "07-plugin", label: "Capítulo 07 — O Plugin" },
            { slug: "08-mcp", label: "Capítulo 08 — O MCP" },
            { slug: "09-cli", label: "Capítulo 09 — O CLI" },
            { slug: "10-sintese", label: "Capítulo 10 — Síntese" },
          ],
        },
      ],
    }),
  ],
});
