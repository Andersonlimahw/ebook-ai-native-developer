---
title: "Capítulo 16 — Observabilidad de Agentes"
description: "Cómo monitorear, debuguear y entender qué está haciendo un agente en producción."
sidebar:
  order: 16
---

**TL;DR:** La observabilidad es el espejo del agente en producción. Sin logs estructurados, traces y métricas, solo ves el síntoma, no la causa.

## Pilares de observabilidad

1. **Logs estructurados** — cada decisión del agente es un evento
2. **Traces distribuidos** — rastrea tool calls, embeddings, llamadas LLM
3. **Métricas** — tiempo por turno, costo acumulado, tasa de error

```typescript
async function agentWithObservability(userId: string, query: string) {
  const span = trace.startSpan("agent.process", {userId, query});
  
  try {
    const start = Date.now();
    const result = await agent.ask(query);
    
    span.addEvent("completed", {
      duration_ms: Date.now() - start,
      tool_calls: span.events.filter(e => e.name.startsWith("tool")).length,
      cost_usd: calculateCost(result)
    });
    
    return result;
  } catch (err) {
    span.recordException(err);
    throw err;
  }
}
```