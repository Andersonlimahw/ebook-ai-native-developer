/**
 * Remark plugin that wraps ```mermaid code blocks in a semantic figure.
 * Rendering and interactions are initialized client-side in Head.astro.
 */

import { visit } from "unist-util-visit";
import type { Root, Code, Html } from "mdast";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function remarkMermaid() {
  return function transformer(tree: Root) {
    const replacements: Array<{ node: Code; index: number; parent: { children: unknown[] } }> = [];

    visit(tree, "code", (node, index, parent) => {
      if (
        node.lang === "mermaid" &&
        typeof index === "number" &&
        parent &&
        "children" in parent &&
        Array.isArray(parent.children)
      ) {
        replacements.push({ node: node as Code, index, parent: parent as { children: unknown[] } });
      }
    });

    for (const { node, index, parent } of replacements) {
      const escapedCode = escapeHtml(node.value);

      const html = `<figure class="mermaid-diagram" data-mermaid-diagram>
  <figcaption class="mermaid-diagram__toolbar">
    <span class="mermaid-diagram__label">mermaid</span>
    <span class="mermaid-diagram__actions">
      <button class="mermaid-diagram__button" type="button" data-mermaid-copy aria-label="Copiar código Mermaid">Copiar</button>
      <button class="mermaid-diagram__button" type="button" data-mermaid-fullscreen aria-label="Abrir diagrama Mermaid em tela cheia">Tela cheia</button>
    </span>
  </figcaption>
  <div class="mermaid-render" data-mermaid-render>
    <pre class="mermaid" data-mermaid-render-target>${escapedCode}</pre>
  </div>
  <details class="mermaid-source">
    <summary>Código do diagrama</summary>
    <pre><code class="language-mermaid">${escapedCode}</code></pre>
  </details>
</figure>`;

      parent.children[index] = {
        type: "html",
        value: html,
      } as Html;
    }
  };
}
