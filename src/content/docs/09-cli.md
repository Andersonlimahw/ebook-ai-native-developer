---
title: "Capítulo 09 — O CLI"
description: "CLI como cabine de comando para workflows agênticos no host local."
sidebar:
  order: 9
---

> O CLI é onde você opera todas as camadas anteriores: o terminal como cabine de comando do harness. É onde o agente encontra o seu ambiente real — arquivos, git, shell, testes.

**TL;DR:** O CLI é a cabine onde você opera todas as camadas — aciona agents, troca de modelo, instala plugins, conecta MCP — e, em modo headless, vira etapa de pipeline.

Falamos de LLM, harness, agent, subagent, context, skill, plugin e MCP como conceitos. Mas em que lugar concreto você *roda* tudo isso? Para a maioria dos desenvolvedores, a resposta é a linha de comando. O Claude Code é, na sua forma pri## Primeiro, o CLI em ação

Você abre o terminal no repositório do e-commerce e digita:

```bash
$ claude
```

A sessão começa, e tudo dos capítulos anteriores acontece aqui:

```text
> Criar sistema robusto de CRUD de Pedidos. Quero a arquitetura antes do código.

• Acionando agent-order-architect (model: opus)        ← agent + LLM
• Read(src/orders/OrderService.ts)                       ← harness + tools
• mcp__postgres__describe_table() → [orders, events]     ← MCP
• Carregando skill improve-codebase-architecture         ← skill
• [hook PreToolUse: validar-concorrencia.sh] ok          ← plugin/hook

Decisões de arquitetura: [...]
```

Cada linha dessa sessão é uma camada deste e-book em operação — e o CLI é o lugar onde elas se encontram. O terminal não é um detalhe de interface: é onde o agente toca o seu ambiente de desenvolvimento de verdade.

## O que é o CLI

> Um **CLI** (*Command-Line Interface*, interface de linha de comando) é um programa operado por texto no terminal. No nosso contexto, o Claude Code é um CLI: o ponto de entrada pelo qual você inicia uma sessão, conversa com o agente e o deixa agir sobre o seu projeto.

O Claude Code também existe em outras formas — extensão de IDE (VS Code, JetBrains), app de desktop e web. Mas o CLI é a forma canônica, e por um bom motivo: é onde o desenvolvimento de verdade já acontece. O agente que vive no terminal está a um `Bash` de distância dos seus testes, do seu `git`, do seu build.

### Por que o terminal importa

O CLI dá ao harness acesso direto ao ambiente onde você trabalha:

- **Sistema de arquivos**: ler e editar o código no lugar, sem upload.
- **Shell**: rodar testes, build, linters, `git` — as ferramentas `Bash` do Capítulo 02 operam no seu shell real.
- **Composição Unix**: a saída do agente pode ser canalizada (`|`) para outras ferramentas, e ele pode consumir a saída delas.
- **Versionamento**: como agents, skills e plugins são arquivos, eles entram no `git` junto com o código — revisados em pull request como qualquer mudança.

### Comandos Customizados (Slash Commands)

O CLI permite a você interagir de forma imediata via **Slash Commands** (como `/goal`, `/schedule`, `/grill-me`). Mais do que usar os comandos padrão, você pode **customizar e estender** a cabine de comando criando novos atalhos no repositório.
Esses comandos são definidos salvando arquivos Markdown em `.claude/commands/<nome-do-comando>.md`. Quando digitados, eles forçam uma instrução específica ou script determinístico diretamente na sessão, pulando o loop cognitivo do assistente geral.

### Git Worktrees: Isolamento Total para Operações Agênticas

Uma das melhores práticas avançadas ao operar agentes no terminal é o uso de **Git Worktrees**.
Muitas vezes, uma tarefa agêntica longa (como um `/goal` para reescrever um CRUD inteiro) pode durar minutos e travar o seu repositório local, impedindo você de trabalhar em outros arquivos ou ramos paralelos.
- **Como funciona:** O Git Worktree permite que você crie um diretório físico totalmente separado no disco, mas conectado ao mesmo repositório git (`git worktree add ../orders-refactor feat/orders-refactor`).
- **Vantagem para Agentes:** Você pode inicializar a sessão do CLI do agente apontando para esse worktree isolado. O agente pode fazer alterações profundas, rodar scripts agressivos de compilação, quebrar códigos intermediários e testar em background, enquanto o seu diretório de trabalho principal (`main` ou `develop`) continua limpo e disponível para seu fluxo de trabalho pessoal.

## O CLI como cabine das camadas anteriores

O que você aprendeu nos capítulos anteriores aparece, no CLI, como controles concretos:

| Camada | Como aparece no CLI |
|--------|---------------------|
| **LLM** (Cap. 01) | `/model` troca o cérebro da sessão (opus/sonnet/haiku) — model routing na prática. |
| **Harness** (Cap. 02) | É o próprio Claude Code rodando o loop; modos de permissão controlam o que ele executa. |
| **Agent** (Cap. 03) | Acionado automaticamente pelo `description`, ou invocado quando você descreve a tarefa. |
| **Subagent** (Cap. 04) | O orquestrador delega dentro da mesma sessão; você vê cada subagent reportar. |
| **Context** (Cap. 05) | `CLAUDE.md` é carregado a cada sessão; a compactação acontece quando a conversa cresce. |
| **Skill** (Cap. 06) | Carregada sob demanda; comandos `/` vêm de skills e plugins. |
| **Plugin** (Cap. 07) | `/plugin install` adiciona agents, skills, hooks e comandos à sua sessão. |
| **MCP** (Cap. 08) | Servidores do `.mcp.json` sobem com a sessão; suas ferramentas viram `mcp__…`. |

O CLI é o denominador comum: o lugar onde todas essas peças, definidas em arquivos, ganham vida em uma conversa.

### Modo headless: o CLI sem você na frente

Há um recurso do CLI que destrava automação séria — o **modo headless** (não interativo). Em vez de uma conversa, você passa o pedido como argumento e captura a saída:

```bash
$ claude -p "Rode os testes de orders e resuma as falhas" > relatorio.txt
```

Isso transforma o agente em um passo de pipeline. Você pode chamá-lo de um script, de um hook de `git`, de um job de CI — o mesmo agente que você usa interativamente, agora dentro de uma automação. É a ponte entre "assistente que eu converso" e "etapa programável do meu fluxo".

## Como isso se conecta ao `agent`

O fechamento do arco:

> **O CLI é a cabine onde você invoca e opera o agent. Se o agent é o especialista e o harness é o motor, o CLI é o painel de controle.**

1. **É onde o agent é acionado.** Você descreve a tarefa no terminal; o harness casa com o `description` e aciona o `agent-order-architect`. O ciclo inteiro dos capítulos anteriores começa com você digitando no CLI.
2. **É onde você ajusta a configuração ao vivo.** `/model opus` antes de uma decisão difícil; `/plugin install order-squad` para trazer a squad; conectar um servidor MCP. O CLI é onde as decisões dos capítulos 01–08 viram comandos.
3. **É onde o agent vira automação.** Em modo headless, o mesmo `agent-order-architect` pode rodar num CI a cada PR, revisando a arquitetura automaticamente. O agente sai do terminal interativo e entra no pipeline.

Em uma frase: **o CLI é onde o e-book inteiro deixa de ser teoria e vira o seu fluxo de trabalho.**

## Trade-offs e armadilhas

- **Poder no terminal exige permissões sérias.** Um agente com `Bash` no seu shell pode fazer estrago. Use os modos de permissão; não rode tudo em "aceitar tudo" por preguiça.
- **Headless remove o humano do loop.** Automação é ótima até o agente fazer a coisa errada sem ninguém olhando. Em CI, restrinja ferramentas e dê escopo apertado — o menor privilégio do Capítulo 03 vale dobrado sem supervisão.
- **CLI tem curva.** Para quem vive em GUI, o terminal assusta no começo. Mas é justamente a integração com shell/git/arquivos que dá ao agente o acesso que o torna útil.
- **Saída para pipeline precisa ser estável.** Em scripts, prefira formatos previsíveis e trate o agente como um comando que pode falhar — com timeout e verificação do resultado.

### Como saber se você entendeu

Você dominou este capítulo se consegue:

- mapear pelo menos quatro camadas anteriores aos controles do CLI;
- explicar o que o modo headless habilita e quais riscos ele traz;
- descrever como os Git Worktrees auxiliam no isolamento de sessões agênticas longas.

## Fontes

- Anthropic — anthropic-sdk-typescript, o SDK oficial para automações e integrações TypeScript/JS: https://github.com/anthropics/anthropic-sdk-typescript
- Claude Code — referência do CLI (comandos, flags, modo headless): https://code.claude.com/docs/en/cli-reference
- Claude Code — visão geral (formas: CLI, IDE, desktop, web): https://code.claude.com/docs/pt/overview
- Claude Code — Git Worktrees: https://code.claude.com/docs/pt/worktrees

## Síntese

O CLI é onde tudo se encontra: o terminal como cabine de comando do harness, com acesso direto aos arquivos, ao shell, ao git e aos testes do seu projeto. É lá que você aciona agents, troca de modelo, instala plugins, conecta MCP — e, em modo headless, transforma o agente em uma etapa do seu pipeline. As camadas anteriores são definições em arquivos; o CLI é onde elas viram trabalho feito.

Temos o stack inteiro. No último capítulo, montamos tudo de uma vez e seguimos a tarefa de CRUD de Pedidos da primeira à última camada, sem cortes.

Próximo: [Capítulo 10 — Síntese](/10-sintese/).
