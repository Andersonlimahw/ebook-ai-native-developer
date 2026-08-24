---
title: "Chapter 19 — Workflows with Subagents"
description: "How to orchestrate multiple specialized agents to solve complex problems."
sidebar:
  order: 19
---

**TL;DR:** A single agent is not always the answer. Workflows orchestrate specialized subagents (one for analysis, another for writing) that work in parallel or sequence.

## Workflow patterns

1. **Sequential** — A does its work → B consumes result → C consumes result
2. **Parallel** — A, B, C run simultaneously, then C synthesizes
3. **Conditional** — If A returned X, call D; if Y, call E

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