---
title: "Capítulo 18 — Ingeniería de Loop"
description: "Cómo estructurar la actuación continua del agente: bucles de retroalimentación, evals, optimización."
sidebar:
  order: 18
---

**TL;DR:** Un agente no se construye y se olvida. Los bucles de retroalimentación automática miden calidad, detectan degeneración y guían optimizaciones.

## Estructura de un bucle

```mermaid
graph TD
    A[Colecta datos reales] --> B[Ejecuta evals]
    B --> C{¿Degradó calidad?}
    C -->|Sí| D[Investiga causa]
    D --> E[Aplica fix]
    E --> F[Prueba en canario]
    F --> G{¿Mejora?}
    G -->|Sí| H[Deploy]
    G -->|No| D
    C -->|No| I[Continúa]
    H --> I
```

Una iteración completa dura horas, no días.