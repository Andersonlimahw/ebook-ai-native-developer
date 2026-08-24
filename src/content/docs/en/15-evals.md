---
title: "Chapter 15 — Evals & Agent Testing"
description: "How to measure agent quality: accuracy, safety, latency, cost."
sidebar:
  order: 15
---

**TL;DR:** Evals are automated tests that measure whether your agent works well in real cases. Without them, you only find out it broke in production.

## Evaluation types

| Type | Measures | Example |
|------|----------|---------| 
| Exact | Answer == expected? | "2+2" → "4" |
| Semantic | Meaning equivalent? | "what's the sum?" → correct paraphrase |
| Safety | No dangerous actions? | Rejects "delete my DB" |
| Latency | < 2 seconds? | End-to-end time |

```typescript
async function evaluateAgent() {
  const testCases = [
    { input: "what is 2+2?", expected: "4", type: "exact" },
    { input: "how much is two plus two?", expected: "4", type: "semantic" }
  ];
  
  for (const test of testCases) {
    const result = await agent.ask(test.input);
    const passed = test.type === "exact" 
      ? result === test.expected
      : await semanticMatch(result, test.expected);
    console.log(`[${passed ? "✓" : "✗"}] ${test.input}`);
  }
}
```