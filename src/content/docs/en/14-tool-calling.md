---
title: "Chapter 14 — Tool Calling & Function Execution"
description: "How agents call tools (APIs, functions, databases) and interpret results."
sidebar:
  order: 14
---

**TL;DR:** Tool calling allows the LLM to decide which tool to call, when, and with which arguments — turning the agent into an action orchestrator, not just a text generator.

## Tool calling loop

```mermaid
graph TD
    A[Agent receives question] --> B[LLM decides: need tool?]
    B --> C{Yes?}
    C -->|Yes| D[LLM chooses tool + args]
    C -->|No| E[Answer directly]
    D --> F[Execute tool]
    F --> G[Return result to LLM]
    G --> H[LLM interprets, decides next step]
    H --> I[Loop or final answer]
```

## Typed tools

```typescript
const tools = [
  {
    name: "get_order",
    description: "Fetch an order by ID",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string" }
      },
      required: ["order_id"]
    },
    handler: async (args) => {
      return await db.orders.findOne({id: args.order_id});
    }
  }
];
```