# Role / Context

Você é um senior frontend engineer trabalhando no repo `ebook-ai-native-developer`.

O projeto é um ebook/site estático em **Astro + Starlight + TypeScript + Bun**, com conteúdo em pt-BR. MermaidJS já existe no codebase:

- `astro.config.mjs` registra `remarkMermaid`.
- `src/plugins/remark-mermaid.ts` transforma blocos ```` ```mermaid ```` em HTML.
- `src/components/Head.astro` carrega `mermaid` via dynamic import no client e renderiza `.mermaid`.
- `src/styles/starlight.css` contém estilos Starlight customizados e estilos atuais de Mermaid.
- `package.json` usa Bun scripts: `bun run check`, `bun run build`, `bun run dev`.

# Task

Evolua a experiência de diagramas Mermaid do ebook para suportar:

- renderização client-side confiável;
- toolbar do bloco com label, copiar código e abrir em tela cheia;
- modal fullscreen acessível;
- pan/zoom estilo canvas viewport no fullscreen;
- compatibilidade com Astro page transitions e build/PDF estático.

Faça a implementação de forma adequada ao codebase atual. Não converta o projeto para React/Next.js.

# Inputs / Files

- `src/plugins/remark-mermaid.ts` — gera o HTML dos blocos Mermaid a partir do Markdown.
- `src/components/Head.astro` — script client-side que importa Mermaid, renderiza diagramas e pode inicializar interações DOM.
- `src/styles/starlight.css` — estilos globais Starlight, Mermaid, fullscreen, toolbar e estados interativos.
- `astro.config.mjs` — confirmação de integração do plugin Remark.
- `package.json` — scripts e dependências disponíveis.
- `src/content/docs/**/*.mdx` ou `src/content/docs/**/*.md` — conteúdo real onde blocos Mermaid aparecem.

# Constraints

- Use Bun. Comandos: `bun run check`, `bun run build`, `bun run dev`. Não use `npm`, `pnpm`, `yarn`, `npx`, Jest ou Vitest.
- Mantenha Astro/Starlight. Não adicione React, Next.js, Tailwind, lucide-react ou UI libraries novas.
- Edite somente arquivos necessários para Mermaid. Não mexa em conteúdo do ebook, PDF builder, sidebar, tema geral ou arquivos em `dist/`.
- Preserve pt-BR em textos visíveis: `mermaid`, `Copiar`, `Copiado`, `Tela cheia`, `Fechar`, `Aumentar zoom`, `Diminuir zoom`, `Código do diagrama`.
- Preserve acessibilidade: botões com `type="button"` e `aria-label`; modal com `role="dialog"` e `aria-modal="true"`; ESC fecha; foco deve ir para o modal ao abrir e voltar ao botão que abriu ao fechar.
- Mermaid deve continuar sendo carregado só no client via `await import("mermaid")`, apenas quando houver diagramas.
- O source original Mermaid deve ser escapado com segurança pelo Remark plugin. Não injete código Mermaid cru em atributos HTML sem encoding/escaping adequado.
- `dangerouslySetInnerHTML` não se aplica aqui. Em Astro/DOM, use `innerHTML` somente para o SVG retornado por `mermaid.render()`.
- A UX deve funcionar em navegação inicial e em `astro:page-load`, sem duplicar listeners, toolbars ou modais.
- Fullscreen/toolbar não devem quebrar impressão/PDF; controles interativos devem ser ocultados em `@media print`, mas diagramas renderizados devem continuar visíveis.

# Functional Requirements

## 1. Remark markup

Adapte `src/plugins/remark-mermaid.ts` para gerar uma estrutura semanticamente estável para cada diagrama:

- wrapper `<figure class="mermaid-diagram">`;
- header/toolbar sempre visível;
- label `mermaid`;
- botão copiar source;
- botão fullscreen;
- bloco de código original preservado em `<details>`;
- render target em `<pre class="mermaid">`;
- source Mermaid lido do DOM via `textContent`, não de string global.

Evite inline event handlers. A interatividade deve ser inicializada em `Head.astro`.

## 2. Mermaid render

Em `src/components/Head.astro`:

- detectar `.mermaid-diagram` ainda não inicializados;
- importar `mermaid` dinamicamente só quando houver diagramas;
- inicializar Mermaid com:

```ts
mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
});
```

- renderizar cada `<pre class="mermaid">` com id único;
- usar `code.trim()` como input;
- ao sucesso, inserir somente o SVG retornado pelo Mermaid no render target;
- marcar diagramas renderizados/inicializados com atributos `data-*` para idempotência;
- em erro, mostrar estado visível em pt-BR com mensagem curta e manter o código original acessível em `<details>`.

## 3. Copy

- Botão copy deve copiar o source Mermaid original.
- Não copie SVG renderizado.
- Use `navigator.clipboard.writeText(code)` quando disponível.
- Após sucesso, mostre estado temporário `Copiado` por cerca de 1500ms.
- Em falha, mostre estado temporário de erro discreto e mantenha o botão usável.

## 4. Fullscreen modal

Crie modal fullscreen via DOM em `document.body`, preferencialmente um único modal reutilizável.

Requisitos:

- overlay cobrindo viewport;
- `role="dialog"`;
- `aria-modal="true"`;
- header com título `Diagrama Mermaid`, zoom out, zoom in, copiar e fechar;
- conteúdo `overflow-hidden`;
- ESC fecha;
- click no botão fechar fecha;
- foco inicial no botão fechar ou no modal;
- foco retorna ao botão fullscreen de origem ao fechar;
- body scroll deve ser bloqueado enquanto o modal estiver aberto e restaurado ao fechar.

## 5. Pan / zoom fullscreen

Use estado equivalente a:

```ts
type FullscreenView = {
  zoom: number;
  pan: { x: number; y: number };
};
```

Regras:

- ao abrir fullscreen, resetar para `{ zoom: 1, pan: { x: 0, y: 0 } }`;
- `zoom = 1` é o baseline fit-to-view;
- não permitir zoom menor que `1`;
- zoom máximo `3.5`;
- botões usam step `0.25`;
- wheel usa fator `0.15`;
- zoom por botão ancora no centro do viewport;
- zoom por wheel ancora no ponteiro;
- ao voltar para zoom mínimo, resetar pan para `{ x: 0, y: 0 }`;
- drag move o canvas com pointer events: `pointerdown`, `pointermove`, `pointerup`, `pointercancel`;
- usar `setPointerCapture` e `releasePointerCapture`;
- permitir mouse esquerdo, touch e pen;
- aplicar classes/estilos equivalentes a `touch-none`, `select-none`, `cursor: grab/grabbing`.

Estrutura visual esperada:

```html
<div class="mermaid-fullscreen-viewport">
  <div class="mermaid-fullscreen-stage">
    <div class="mermaid-fullscreen-content">
      <!-- SVG renderizado/clonado -->
    </div>
  </div>
</div>
```

Transform esperado:

```ts
stage.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
content.style.transform = `translate(-50%, -50%) scale(${zoom})`;
content.style.transformOrigin = "center";
```

O SVG em fullscreen deve ocupar a área disponível sem distorcer: largura/altura máximas de 100%, `display: block`, `height: auto` quando necessário.

## 6. Visual / Starlight

Em `src/styles/starlight.css`:

- mantenha visual alinhado ao tema Starlight e variáveis `--sl-*`;
- toolbar compacta, sempre visível, sem depender de hover;
- botões com raio <= 8px;
- estados hover/focus claros;
- diagrama inline com scroll horizontal quando necessário;
- fullscreen com fundo compatível com light/dark;
- `@media print` deve ocultar toolbar, details e modal fullscreen, mas manter SVG renderizado.

# Plan

1. Inspecione estrutura atual de Mermaid e scripts Bun.
   → verify: identificar como `remarkMermaid`, `Head.astro` e `starlight.css` se conectam.

2. Atualize markup do plugin Remark para incluir toolbar, botões e source preservado.
   → verify: blocos ```` ```mermaid ```` geram HTML escapado, sem inline handlers, com classes estáveis.

3. Atualize `Head.astro` para renderizar Mermaid e inicializar interações DOM de forma idempotente.
   → verify: navegação inicial e evento `astro:page-load` não duplicam listeners nem re-renderizam SVG já processado.

4. Implemente modal fullscreen reutilizável com copy, close, foco e ESC.
   → verify: abrir/fechar funciona via botão e teclado; foco retorna ao botão de origem.

5. Implemente pan/zoom com baseline fit-to-view, zoom clamp e drag via pointer events.
   → verify: zoom in altera escala de `1` para `1.25`; zoom out fica disabled no mínimo; wheel aumenta para `1.15`; drag muda pan, por exemplo `translate(30px, 15px)`.

6. Atualize CSS para toolbar, estados, viewport fullscreen, SVG e print/PDF.
   → verify: não há controles impressos no PDF, e o SVG continua visível.

7. Rode validação do projeto.
   → verify: `bun run check` passa; `bun run build` passa e gera site/PDF sem erro Mermaid.

# Output Contract

- Entregável: implementação completa no codebase.
- Formato: alterações de código nos arquivos necessários.
- Local esperado: principalmente `src/plugins/remark-mermaid.ts`, `src/components/Head.astro`, `src/styles/starlight.css`.
- Definição de pronto:
  - diagramas Mermaid existentes renderizam;
  - copy copia source original;
  - fullscreen abre/fecha;
  - pan/zoom funciona por botões, wheel e drag;
  - `bun run check` e `bun run build` passam ou falhas preexistentes são reportadas com evidência.

# Feedback — DO

- Use APIs DOM simples, event delegation e atributos `data-*` para idempotência.
- Preserve o plugin Remark como fonte da estrutura HTML.
- Reutilize o modal fullscreen em vez de criar um modal por diagrama.
- Mantenha o script tolerante a páginas sem Mermaid.
- Preserve acessibilidade e keyboard UX.
- Reporte arquivos alterados e comandos executados ao final.

# Feedback — DO NOT

- Não implemente componente React/Next.js.
- Não instale Tailwind, lucide-react, Jest, Vitest ou UI library.
- Não edite `dist/` ou conteúdo do ebook para forçar teste manual.
- Não renderize Mermaid no server.
- Não copie SVG no botão copy.
- Não use listeners duplicados em cada `astro:page-load`.
- Não deixe botões visíveis só em hover ou com `opacity: 0`.
- Não permita zoom abaixo de `1`.
- Não substitua pan/zoom por CSS scale estático sem lógica de viewport.
- Não quebre PDF/print ocultando o SVG renderizado.

# EXEC-MAP v1

```text
EXEC-MAP v1
intent:   build-code
executor: codex
effort:   medium
time:     ~25-45 min
tokens:   ~18k-35k
skills:   [skills-selector, smart-dispatch]
models:   {plan: quality-tier, impl: balanced-tier, mechanical: budget-tier}
agents:   inline
mcp:      []
notes:    Repo Astro/Starlight/Bun; no React/Next/Jest; verify with bun run check/build.
```

# Changelog do Prompt

- Stack alvo corrigida: React/Next/Jest → Astro/Starlight/Bun.
- Arquivos reais adicionados: `remark-mermaid.ts`, `Head.astro`, `starlight.css`, `astro.config.mjs`, `package.json`.
- Testes irreais removidos; validação agora usa `bun run check` e `bun run build`.
- Requisitos de UX mantidos, mas adaptados para DOM client-side, build estático e PDF.
