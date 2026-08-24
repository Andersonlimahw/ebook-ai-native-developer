---
title: "Chapter 17 — Cost Engineering"
description: "How to optimize agent cost in production: tokens, cache, quantization."
sidebar:
  order: 17
---

**TL;DR:** An agent running 1 million times a month is not cheap by default. Cost engineering is about making every token count.

## Optimization axes

1. **Reduce tokens per turn** — prompt caching, summaries, context pruning
2. **Model cheaper** — Haiku vs Sonnet vs Opus
3. **Batch + defer** — group requests offline when possible

```typescript
// Before: cache disabled
async function agentExpensive(query: string) {
  return await llm.generate({prompt: systemPrompt + query});
}

// After: cache enabled, context pruned
async function agentOptimized(userId: string, query: string) {
  const cached = {
    type: "text",
    text: systemPrompt,
    cache_control: { type: "ephemeral" }
  };
  
  const profile = await pruneProfile(userId); // summary, not full
  
  return await llm.generate({
    messages: [
      {role: "user", content: [cached, {type: "text", text: profile + query}]}
    ]
  });
}
```