---
title: "Chapter 13 — Agent Memory"
description: "How agents maintain context across conversations: short-term, long-term, and episodic."
sidebar:
  order: 13
---

**TL;DR:** Memory allows an agent to remember who you are, what you said before, and your patterns — without storing everything in the context window.

## Three layers of memory

1. **Short-term** — current conversation. In the prompt each turn.
2. **Long-term** — structured data about the user (preferences, history).
3. **Episodic** — summary of past conversations, indexed by embedding.

```typescript
interface AgentMemory {
  shortTerm: Message[];      // current conversation
  longTerm: UserProfile;     // structured data
  episodic: EpisodeVectors[]; // summaries from past
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