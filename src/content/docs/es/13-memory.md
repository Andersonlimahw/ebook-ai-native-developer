---
title: "Capítulo 13 — Memoria de Agentes"
description: "Cómo los agentes mantienen contexto entre conversaciones: corto plazo, largo plazo y episódica."
sidebar:
  order: 13
---

**TL;DR:** La memoria permite que un agente te recuerde, sepa lo que hablaste antes y entienda tus patrones — sin guardar todo en la ventana de contexto.

## Tres capas de memoria

1. **Corto plazo** — conversación actual. Está en el prompt en cada turno.
2. **Largo plazo** — datos estructurados sobre el usuario (preferencias, historial).
3. **Episódica** — resumen de conversaciones pasadas, indexada por embedding.

```typescript
interface AgentMemory {
  shortTerm: Message[];      // conversación actual
  longTerm: UserProfile;     // datos estructurados
  episodic: EpisodeVectors[]; // resúmenes del pasado
}

async function generateWithMemory(userId: string, newMessage: string) {
  const shortTerm = await getConversation(userId, limit: 5);
  const longTerm = await getUserProfile(userId);
  const relevant = await semanticSearch(
    `user: ${userId} past: ${newMessage}`
  );
  
  return await llm.generate({
    messages: [...shortTerm, {role: "user", content: newMessage}],
    system: `Profile: ${JSON.stringify(longTerm)}\nContext: ${relevant}`
  });
}
```