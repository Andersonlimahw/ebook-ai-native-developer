---
title: "Chapter 11 — Embeddings & Semantic Search"
description: "How models transform text into semantic vectors and how agents search by meaning, not by keyword."
sidebar:
  order: 11
---

> An embedding is the translation of text into a point in space. Texts with nearby meanings become nearby points — and "nearby" becomes a geometry calculation, not an exact-word search.

**TL;DR:** Embeddings convert text into vectors; searching by similarity between vectors is searching by meaning. It's the technical foundation of RAG, memory, and nearly all retrieval that feeds an agent.

## What is an embedding

An **embedding** is a vector of numbers (typically 256 to 3072 dimensions) that represents the meaning of text.

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

## When embeddings work well

Embeddings shine in **fuzzy meaning**:

| Works well | Fails |
|---|---|
| Synonyms and paraphrases | Exact identifiers |
| Natural language questions | Negation |
| Related concepts | Precise numbers and dates |

The lesson: **semantic search and keyword search are complementary.**