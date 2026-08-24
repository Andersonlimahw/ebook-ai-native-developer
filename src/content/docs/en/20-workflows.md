---
title: "Chapter 20 — Graph Engineering"
description: "How to model knowledge as graphs for agents to navigate with precision."
sidebar:
  order: 20
---

**TL;DR:** Graphs structure knowledge so agents can navigate by relationships, not just text similarity. Less hallucination, more precision.

## When to use graphs

- Entities with strong relationships (person → company → product)
- Hierarchies (domain → subdomain → feature)
- Causes and effects (bug X → cause Y → solution Z)

```typescript
interface KnowledgeGraph {
  nodes: { id: string; type: string; properties: Record<string, any> }[];
  edges: { from: string; to: string; type: string }[];
}

async function queryGraph(query: string, graph: KnowledgeGraph) {
  // 1. Find relevant nodes
  const startNodes = await semanticSearch(query, graph.nodes);
  
  // 2. Expand through edges (relationships)
  const neighborhood = expandNeighborhood(startNodes, graph.edges, depth: 2);
  
  // 3. LLM reasons over the subgraph
  return await llm.generate({
    context: formatGraph(neighborhood),
    query
  });
}
```