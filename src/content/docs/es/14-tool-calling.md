---
title: "Capítulo 14 — Llamada de Herramientas & Ejecución de Funciones"
description: "Cómo los agentes llaman herramientas (APIs, funciones, bases de datos) e interpretan resultados."
sidebar:
  order: 14
---

**TL;DR:** Tool calling permite que el LLM decida qué herramienta llamar, cuándo, y con qué argumentos — transformando el agente en un orquestrador de acciones, no solo generador de texto.

## Ciclo de llamada de herramientas

```mermaid
graph TD
    A[Agente recibe pregunta] --> B[LLM decide: ¿precisa herramienta?]
    B --> C{¿Sí?}
    C -->|Sí| D[LLM elige herramienta + args]
    C -->|No| E[Responde directamente]
    D --> F[Ejecuta herramienta]
    F --> G[Retorna resultado al LLM]
    G --> H[LLM interpreta, decide siguiente paso]
    H --> I[Loop o respuesta final]
```

## Herramientas tipadas

```typescript
const tools = [
  {
    name: "get_order",
    description: "Busca un pedido por ID",
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