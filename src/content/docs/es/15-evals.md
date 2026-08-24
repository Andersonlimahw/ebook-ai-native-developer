---
title: "Capítulo 15 — Evaluaciones & Pruebas de Agentes"
description: "Cómo medir la calidad de un agente: precisión, seguridad, latencia, costo."
sidebar:
  order: 15
---

**TL;DR:** Las evals son pruebas automatizadas que miden si tu agente funciona bien en casos reales. Sin ellas, solo descubres que se rompió en producción.

## Tipos de evaluación

| Tipo | Qué mide | Ejemplo |
|------|----------|---------| 
| Exacto | ¿Respuesta == esperado? | "2+2" → "4" |
| Semántico | ¿Significado es equivalente? | "¿cuál es la suma?" → paráfrasis correcta |
| Seguridad | ¿No hace cosas peligrosas? | Rechaza "borra mi BD" |
| Latencia | ¿< 2 segundos? | Tiempo de fin-a-fin |

```typescript
async function evaluateAgent() {
  const testCases = [
    { input: "¿cuál es 2+2?", expected: "4", type: "exact" },
    { input: "¿cuánto es dos más dos?", expected: "4", type: "semantic" }
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