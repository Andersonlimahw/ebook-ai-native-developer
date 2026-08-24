---
title: "Capítulo 17 — Ingeniería de Costo"
description: "Cómo optimizar el costo de un agente en producción: tokens, cache, cuantización."
sidebar:
  order: 17
---

**TL;DR:** Un agente ejecutándose 1 millón de veces por mes no es barato por defecto. Ingeniería de costo es sobre hacer que cada token cuente.

## Ejes de optimización

1. **Reducir tokens por turno** — cache de prompt, resúmenes, context pruning
2. **Modelar más barato** — Haiku vs Sonnet vs Opus
3. **Batch + defer** — agrupa solicitudes offline cuando sea posible

```typescript
// Antes: cache desactivado
async function agentExpensive(query: string) {
  return await llm.generate({prompt: systemPrompt + query});
}

// Después: cache activado, contexto podado
async function agentOptimized(userId: string, query: string) {
  const cached = {
    type: "text",
    text: systemPrompt,
    cache_control: { type: "ephemeral" }
  };
  
  const profile = await pruneProfile(userId); // resumen, no completo
  
  return await llm.generate({
    messages: [
      {role: "user", content: [cached, {type: "text", text: profile + query}]}
    ]
  });
}
```