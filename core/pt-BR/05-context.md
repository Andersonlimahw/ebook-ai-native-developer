# Capítulo 05 — O Context

> Context é tudo que o modelo enxerga em uma única chamada. É um recurso finito. Engenheirar o que entra nele é metade do resultado.

**TL;DR:** Context é a memória de trabalho finita do modelo; curar o que entra — recuperar, isolar, compactar, persistir — é metade do resultado.

Nos capítulos anteriores, o `agent-order-architect` "leu o seu código" antes de opinar, e cada subagent rodou em "contexto isolado". Agora abrimos essa caixa: o que exatamente o modelo vê, por que isso é limitado, e como você controla.

## Primeiro, o context em ação

Quando o `agent-order-architect` é acionado, o modelo não recebe "o seu projeto". Ele recebe uma montagem específica de texto — a janela de contexto daquela chamada:

```text
┌─ Janela de contexto (uma chamada ao LLM) ────────────────────┐
│ [system prompt]                                              │
│   "Você projeta a arquitetura do domínio order..."           │
│   (o corpo do .md do agent — sempre presente)                │
│                                                              │
│ [memória do projeto]                                         │
│   CLAUDE.md: "Pedidos usam optimistic locking e Postgres."   │
│                                                              │
│ [mensagem do usuário]                                        │
│   "Criar sistema robusto de CRUD de Pedidos — arquitetura"   │
│                                                              │
│ [resultado de ferramenta]                                    │
│   Read(src/orders/OrderService.ts) → 110 linhas              │
│                                                              │
│ [resultado de ferramenta]                                    │
│   Grep("version") → version: number;                         │
└──────────────────────────────────────────────────────────────┘
                         ↓
              o modelo responde com base
              SOMENTE no que está aí dentro
```

Duas conclusões saltam:

1. **Se algo não está na janela, para o modelo não existe.** O `Grep("version")` encontrou a propriedade `version` — então o modelo conclui, corretamente, que há controle de versão ativo. A presença ou ausência são informações chave.
2. **A janela tem um tamanho máximo.** Não cabe o repositório inteiro. Alguém precisa escolher *quais* 110 linhas entram. Esse alguém é o harness, guiado pelo que o agent pede.

## O que é o context

> O **context** (ou *janela de contexto*) é o conjunto total de tokens que o LLM recebe em uma chamada: o system prompt, a memória carregada, o histórico da conversa, os resultados de ferramentas e quaisquer arquivos recuperados. É a única coisa sobre a qual o modelo raciocina — e tem um limite rígido de tamanho.

Pense no context como a **memória de trabalho** (a RAM) do modelo, não o disco. O modelo não "lembra" do seu projeto entre chamadas; a cada chamada, o que importa precisa estar carregado na janela. Quando a chamada termina, some.

### O que vive na janela

| Parte | O que é | No nosso exemplo |
|-------|---------|------------------|
| System prompt | As instruções do agent (o corpo do `.md`) | "Você projeta a arquitetura..." |
| Memória | Fatos persistentes do projeto, carregados sempre | `CLAUDE.md`: optimistic locking, Postgres |
| Mensagens | O histórico da conversa atual | pedido do usuário + respostas |
| Resultados de ferramentas | Saída de `Read`, `Bash`, `Grep`, MCP… | conteúdo dos arquivos, saída de testes |
| Recuperação | Trechos buscados sob demanda | o `OrderService.ts` |

A soma de tudo isso precisa caber no limite da janela. Estourou, algo é cortado ou compactado.

## Context engineering: o trabalho de curar a janela

Como a janela é finita e o modelo raciocina só sobre ela, decidir **o que entra** é uma disciplina de engenharia. A Anthropic chama isso de *context engineering* — a evolução do "prompt engineering" quando o que importa não é só a frase que você escreve, mas todo o estado que o modelo recebe.

O princípio central: **sinal sobre ruído.** Tanto faltar informação quanto sobrar lixo degradam a resposta. Encher a janela com 50 arquivos "por garantia" não ajuda — piora, porque o modelo se distrai e perde o que importa no meio (o fenômeno *lost in the middle*, em que informação no meio de um contexto longo é menos aproveitada que no início ou no fim).

As técnicas que você já viu, agora nomeadas:

- **Recuperação seletiva.** Trazer só os arquivos relevantes (via `Grep`/`Glob` antes de `Read`), não o repositório inteiro. O architect achou `OrderService.ts` com um grep, não lendo tudo.
- **Isolamento por subagent (Capítulo 04).** Delegar mantém o contexto do orquestrador limpo: o backend mergulha em 6 arquivos no *seu* contexto; o pai só recebe o resumo.
- **Compactação.** Quando a conversa fica longa, o harness resume o histórico antigo para liberar espaço, preservando as decisões e descartando o ruído. É como o agente "anota o que importa e esquece o resto".
- **Memória persistente.** O que precisa sobreviver entre sessões não vive na conversa — vive em arquivos de memória. No Claude Code, o `CLAUDE.md` (ou `AGENTS.md`) carrega convenções e fatos do projeto em toda sessão, e há memória de longo prazo em arquivos dedicados. Foi assim que "locking, Postgres" apareceu na janela sem você redigitar.
- **Hooks que injetam contexto.** Eventos do harness podem inserir informação na janela automaticamente (por exemplo, lembrar uma regra antes de uma ferramenta rodar). Voltamos a hooks no Capítulo 07.

## Como isso se conecta ao `agent`

A relação é dupla, e define a qualidade do agent:

> **O system prompt do agent é a parte permanente do contexto; tudo o mais é montado em volta dele a cada chamada.**

1. **O `.md` do agent ocupa contexto sempre.** Por isso um system prompt enxuto e preciso vale mais que um prolixo — cada token de instrução é um token a menos para o trabalho. O contrato em três seções (`o que entrega` / `como trabalha` / `restrições`) do Capítulo 03 é curto de propósito.
2. **As `tools` do agent moldam o que entra depois.** Dar `Grep, Glob` ao architect é o que permite a ele *encontrar* o arquivo certo antes de lê-lo — recuperação seletiva por design. Um agent sem ferramentas de busca tende a pedir arquivos errados e a entupir o contexto.
3. **`model` define o tamanho da janela disponível.** Modelos diferentes têm janelas diferentes; escolher o modelo (Capítulo 01) é também escolher quanto contexto cabe.

Em uma frase: **o agent é, em boa parte, uma decisão de context engineering congelada em um arquivo.** O que he instrui, o que ele pode buscar e qual cérebro ele usa determinam o que cabe na janela quando ele trabalha.

## Trade-offs e armadilhas

- **Mais contexto não é melhor contexto.** Passar tudo "por segurança" dilui o sinal e custa mais tokens. Curar é melhor que despejar.
- **Contexto é dinheiro e latência.** Cada token na janela é cobrado e processado. Janelas enormes são lentas e caras — use o espaço com intenção.
- **O que não entra, não existe.** Bugs de agente frequentemente são bugs de contexto: a informação certa nunca chegou à janela. Antes de culpar o modelo, pergunte "ele viu o que precisava ver?".
- **Compactação perde nuance.** Resumir libera espaço mas pode descartar um detalhe que importava. Decisões críticas merecem virar memória persistente, não ficar à mercê da compactação.
- **Lost in the middle.** Em contextos longos, ponha o mais importante no começo ou no fim, não enterrado no meio.

### Como saber se você entendeu

Você dominou este capítulo se consegue:

- listar o que vive na janela de contexto;
- explicar o fenômeno *lost in the middle* e como mitigá-lo;
- justificar por que "o que não entra no contexto não existe para o modelo".

## Fontes

- Liu et al., "Lost in the Middle: How Language Models Use Long Contexts" (2023) — o estudo por trás do fenômeno citado: https://arxiv.org/abs/2307.03172
- Anthropic — "Effective context engineering for AI agents": https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic — engenharia de prompt (boas práticas que valem para o contexto): https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- Claude Code — memória (`CLAUDE.md`, memória de projeto e de usuário): https://code.claude.com/docs/en/memory

## Síntese

Context é a memória de trabalho do modelo: finita, montada a cada chamada, e a única coisa sobre a qual ele raciocina. Engenheirar o que entra — recuperar o relevante, isolar por subagent, compactar o histórico, persistir o essencial em memória — é o que separa um agente que acerta de um que alucina por falta de informação. O agent, no fundo, é uma curadoria de contexto salva em disco.

Mas há um tipo de conhecimento que você não quer recarregar a cada chamada nem deixar morrer na compactação: o know-how reutilizável. Para isso existe uma camada própria.

Próximo: [Capítulo 06 — A Skill](06-skill.md).
