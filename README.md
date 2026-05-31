# AI Native Developer

Guia de desenvolvimento agêntico com Claude Code, Codex e stacks AI-native.

## Desenvolvimento

Este projeto usa Bun, Astro e Starlight.

```bash
bun install
bun run dev
```

## Build

```bash
bun run check
bun run build
bun run preview
```

O site estático é gerado em `dist/`. O build completo também gera
`dist/ai-native-developer.pdf`, usado pelo botão **Baixar PDF** no site.

## PDF

Para regenerar apenas o PDF depois de um build do site:

```bash
bun run build:site
bun run pdf
```

O PDF é renderizado a partir da rota interna `/pdf/`, com estilos próprios para
A4, capa, sumário, quebras de página, tabelas, blocos de código e cores Lemon.

## Conteúdo

O conteúdo publicado fica em `src/content/docs/`. Os diretórios `core/en` e
`core/es` permanecem como legado não publicado.

---

Projeto desenvolvido por **Anderson Lima**.
Saiba mais em: https://lemon.dev.br
