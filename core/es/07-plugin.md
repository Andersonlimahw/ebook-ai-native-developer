# Capítulo 07 — O Plugin

> Um plugin empacota agents, skills, comandos, hooks e configuração de MCP em uma unidade instalável. É como você distribui uma squad inteira entre times com um comando.

**TL;DR:** Plugin empacota agents, skills, comandos, hooks e MCP numa unidade versionada e instalável — é a unidade de *entrega* do que o agent precisa para funcionar em outro lugar.

Você construiu a squad `order`: nove agents, suas skills, suas convenções. Funciona no seu repositório. Agora o time de outro produto quer a mesma coisa. Como você entrega? Copiando dezenas de arquivos à mão? Há uma camada para isso.

## Primeiro, o plugin em ação

Sem plugin, "compartilhar a squad" significa copiar `.claude/agents/*.md` (nove arquivos), `.claude/skills/*` (as skills referenciadas), os hooks, a configuração de MCP — e torcer para não esquecer nada nem versão. Com plugin, é um comando:

```text
> /plugin marketplace add minhaempresa/order-squad
> /plugin install order-squad

Instalado order-squad v1.2.0:
  • 9 agents (orchestrator + 8 subagents)
  • 4 skills (concorrência, auditoria, ...)
  • 2 hooks (valida concorrência antes de commit; bloqueia segredo em log)
  • 1 servidor MCP (database inspector)
  • 1 comando: /order-new-field
```

Em uma linha, o outro time ganhou a squad completa, versionada, com tudo que ela precisa para funcionar. Atualizou? `/plugin update order-squad` e todos recebem a v1.3.0. Isso é distribuição de verdade, não copia-e-cola.

## O que é um plugin

> Um **plugin** é um pacote distribuível que agrupa um ou mais componentes do Claude Code — agents, skills, comandos (*slash commands*), hooks e configuração de servidores MCP — sob um manifesto versionado, instalável a partir de um *marketplace*.

O plugin não é uma camada nova de capacidade. É uma camada de **empacotamento e distribuição** das camadas que você já conhece. Ele responde à pergunta "como eu levo isto para outro lugar de forma confiável?".

### Anatomia de um plugin

```text
order-squad/
├── .claude-plugin/
│   └── plugin.json          # manifesto: nome, versão, descrição, autor
├── agents/                  # os 9 agents da squad
│   ├── agent-order-orchestrator.md
│   ├── agent-order-architect.md
│   └── ...
├── skills/                  # skills que a squad usa
│   └── improve-codebase-architecture/SKILL.md
├── commands/                # slash commands
│   └── order-new-field.md
├── hooks/                   # automações por evento
│   └── hooks.json
└── .mcp.json                # servidores MCP que a squad conecta (Cap. 08)
```

E o manifesto, `plugin.json`:

```json
{
  "name": "order-squad",
  "version": "1.2.0",
  "description": "Squad completa do domínio order: orquestrador, 8 subagents, skills de concorrência e máquina de estados.",
  "author": "minhaempresa"
}
```

O **marketplace** é só um repositório (git, por exemplo) com um catálogo desses plugins. `/plugin marketplace add <repo>` registra a fonte; `/plugin install <nome>` instala dali. É o mesmo modelo mental de um gerenciador de pacotes — `npm`/`cargo` para extensões do seu agente.

## Hooks: a peça que o plugin frequentemente carrega

Mencionamos hooks de passagem nos capítulos 02 e 05. Aqui eles ganham forma, porque plugins são o jeito comum de distribuí-los.

> Um **hook** é um comando de shell que o harness dispara automaticamente em um evento do ciclo de vida — antes de uma ferramenta rodar (`PreToolUse`), depois (`PostToolUse`), quando a sessão tenta encerrar (`Stop`), entre outros.

Exemplo concreto, no `hooks.json` do plugin:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "scripts/bloqueia-segredo-em-log.sh" }
        ]
      }
    ]
  }
}
```

Esse hook roda antes de qualquer `Bash` e pode barrar um comando que vaze segredo em log. O ponto: hooks impõem política **deterministicamente**, fora do modelo. O LLM pode "querer" rodar algo perigoso; o hook decide se acontece — exatamente a fronteira de permissões do Capítulo 02, agora programável e distribuível dentro do plugin.

## Como isso se conecta ao `agent`

A relação fecha a pergunta de distribuição:

> **O agent é o arquivo. O plugin é o formato de distribuição que leva esse arquivo — e tudo de que ele depende — para outro lugar, versionado.**

1. **O plugin empacota agents.** A squad `order` inteira (Capítulo 04) cabe num plugin. Quem instala recebe o orquestrador e os oito subagents prontos.
2. **E empacota o que os agents precisam.** Um agent sozinho não basta: ele referencia skills (Capítulo 06), conecta servidores MCP (Capítulo 08) e depende de hooks de política. O plugin junta tudo isso, então o agent funciona igual no destino.
3. **Versiona o conjunto.** `agent-order-architect` v1.2.0 vem com as skills e a configuração de MCP daquela versão. Atualizar o plugin atualiza o conjunto coerente, não peças soltas que podem divergir.

Em uma frase: **se o agent é a unidade de trabalho, o plugin é a unidade de entrega.**

## Trade-offs e armadilhas

- **Instalar plugin é confiar.** Um plugin pode trazer hooks (comandos de shell) e servidores MCP (acesso a sistemas). Instalar um plugin de terceiro é rodar o código dele na sua máquina. Trate marketplaces como você trata dependências: audite a fonte.
- **Versão acopla componentes.** A vantagem (conjunto coerente) é também o risco: um bug numa skill do plugin afeta todos os agents que a usam. Versione com cuidado e teste antes de subir.
- **Marketplace exige curadoria.** Um catálogo cheio de plugins redundantes ou mal descritos vira ruído. Mantenha o seu enxuto e bem documentado.
- **Nem tudo precisa ser plugin.** Para um agent usado só no seu repo, o arquivo em `.claude/agents/` basta. Plugin é para o que você *distribui*.

### Como saber se você entendeu

Você dominou este capítulo se consegue:

- listar o que um plugin pode empacotar;
- explicar o papel de um hook `PreToolUse` na fronteira de permissões;
- justificar por que instalar um plugin de terceiros é uma decisão de confiança.

## Fontes

- Anthropic — anthropic-cookbook, exemplos de extensão e automação com Claude: https://github.com/anthropics/anthropics-cookbook
- Claude Code — Plugins (estrutura, `plugin.json`, instalação): https://code.claude.com/docs/en/plugins
- Claude Code — Plugin marketplaces (publicar e instalar): https://code.claude.com/docs/en/plugin-marketplaces
- Claude Code — Hooks (eventos, `PreToolUse`/`PostToolUse`/`Stop`): https://code.claude.com/docs/en/hooks

## Síntese

Plugin é a camada de empacotamento: ele pega agents, skills, comandos, hooks e configuração de MCP e os transforma em uma unidade versionada e instalável, distribuída por um marketplace. É o que faz a sua squad `order` deixar de ser "um monte de arquivos no meu repo" e virar "um pacote que qualquer time instala em um comando".

Sobrou uma dependência que o plugin empacota mas ainda não explicamos: como o agent fala com o mundo externo — o Postgres, o banco de dados de produção de verdade. Esse é o protocolo da próxima camada.

Próximo: [Capítulo 08 — O MCP](08-mcp.md).
