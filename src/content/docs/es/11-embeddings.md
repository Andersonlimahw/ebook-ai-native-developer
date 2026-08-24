---
title: "Capítulo 11 — Embeddings & Búsqueda Semántica"
description: "Cómo los modelos transforman texto en vectores semánticos y cómo el agente busca por significado, no por palabra."
sidebar:
  order: 11
---

> Un embedding es la traducción de un texto en un punto en el espacio. Textos con significados cercanos se convierten en puntos cercanos — y "cercano" pasa a ser un cálculo de geometría, no una búsqueda por palabra exacta.

**TL;DR:** Los embeddings convierten texto en vectores; buscar por similitud entre estos vectores es buscar por significado. Es la base técnica de RAG, memoria y casi toda recuperación que alimenta un agente.

## Qué es un embedding

Un **embedding** es un vector de números (típicamente 256 a 3072 dimensiones) que representa el significado de un texto.

```typescript
async function semanticSearch(tenantId: string, query: string, k = 5) {
  const [vector] = await embed([query]);
  
  return sql`
    SELECT source, content, 1 - (embedding <=> ${vector}::vector) AS score
    FROM doc_chunks
    WHERE tenant_id = ${tenantId}
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${k}
  `;
}
```

## Cuándo funcionan bien los embeddings

Los embeddings brillan en **significado difuso**:

| Funciona bien | Falla |
|---|---|
| Sinónimos y paráfrasis | Identificadores exactos |
| Preguntas en lenguaje natural | Negación |
| Conceptos relacionados | Números y fechas precisas |

La lección: **búsqueda semántica y búsqueda por palabra clave son complementarias.**