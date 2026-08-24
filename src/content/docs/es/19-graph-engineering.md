---
title: "Capítulo 19 — Workflows con Subagentes"
description: "Cómo orquestar múltiples agentes especializados para resolver problemas complejos."
sidebar:
  order: 19
---

**TL;DR:** Un único agente no siempre es la respuesta. Los workflows orquestan subagentes especializados (uno para análisis, otro para redacción) que trabajan en paralelo o secuencia.

## Patrones de workflow

1. **Secuencial** — A hace su trabajo → B consume resultado → C consume resultado
2. **Paralelo** — A, B, C se ejecutan simultáneamente, luego C sintetiza
3. **Condicional** — Si A devolvió X, llama D; si Y, llama E

```typescript
async function analyzeAndWriteWorkflow(topic: string) {
  const research = await researchAgent.run({topic});
  const outline = await outlineAgent.run({research});
  const [section1, section2] = await Promise.all([
    writerAgent.run({outline: outline.part1}),
    writerAgent.run({outline: outline.part2})
  ]);
  return editorAgent.run({sections: [section1, section2]});
}
```