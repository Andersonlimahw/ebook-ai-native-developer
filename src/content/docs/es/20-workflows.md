---
title: "Capítulo 20 — Graph Engineering"
description: "Cómo modelar conocimiento como grafos para que agentes naveguen con precisión."
sidebar:
  order: 20
---

**TL;DR:** Los grafos estructuran el conocimiento para que los agentes puedan navegar por relaciones, no solo por similitud textual. Menos alucinación, más precisión.

## Cuándo usar grafos

- Entidades con relaciones fuertes (persona → empresa → producto)
- Jerarquías (dominio → subdominio → feature)
- Causas y efectos (bug X → causa Y → solución Z)

```typescript
interface KnowledgeGraph {
  nodes: { id: string; type: string; properties: Record<string, any> }[];
  edges: { from: string; to: string; type: string }[];
}

async function queryGraph(query: string, graph: KnowledgeGraph) {
  // 1. Encuentra nós relevantes
  const startNodes = await semanticSearch(query, graph.nodes);
  
  // 2. Expande por aristas (relaciones)
  const neighborhood = expandNeighborhood(startNodes, graph.edges, depth: 2);
  
  // 3. LLM razona sobre la subgraph
  return await llm.generate({
    context: formatGraph(neighborhood),
    query
  });
}
```