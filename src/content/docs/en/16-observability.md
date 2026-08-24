---
title: "Chapter 16 — Agent Observability"
description: "How to monitor, debug, and understand what an agent is doing in production."
sidebar:
  order: 16
---

**TL;DR:** Observability is the agent's mirror in production. Without structured logs, traces, and metrics, you only see the symptom, not the cause.

## Pillars of observability

1. **Structured logs** — each agent decision is an event
2. **Distributed traces** — track tool calls, embeddings, LLM calls
3. **Metrics** — time per turn, cumulative cost, error rate

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