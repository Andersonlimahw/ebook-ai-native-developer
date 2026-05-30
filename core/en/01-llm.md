# Capítulo 01 — O LLM

> Um LLM é um previsor do próximo token. Poderosíssimo no que sabe; cego para o que não está na frente dele.

**TL;DR:** O LLM prevê o próximo token e raciocina sobre o mundo, mas não tem memória, olhos nem mãos — todas as outras camadas deste e-book existem para dar isso a ele.

Antes de falar de agentes, harness e MCP, precisamos do tijolo de baixo. Todas as camadas deste e-book existem para compensar o que o LLM **não** faz sozinho. Então vamos começar vendo exatamente onde ele brilha e onde ele para.

## Primeiro, o LLM em ação (e sua limitação)

Cole isto num chat de LLM puro, sem nenhuma ferramenta:

```text
> Como eu crio uma API de CRUD de Pedidos (Orders) no meu sistema?
```

A resposta vem confiante e útil em geral:

```text
Para criar um CRUD de Pedidos, você normalmente:
1. Expõe um endpoint POST `/orders` para criar o pedido com status inicial `created`.
2. Expõe um endpoint GET `/orders/:id` para recuperar os detalhes.
3. Expõe um endpoint PUT `/orders/:id` para atualizar dados ou transicionar o estado (ex.: `created` -> `paid`).
4. Expõe um endpoint DELETE `/orders/:id` para efetuar o cancelamento ou exclusão lógica.
```

Correto, genérico, e **inútil para o seu caso específico**. Por quê? Porque o modelo:

- não sabe se o seu serviço está em `orderController.ts` ou `OrderService.java`;
- não sabe que o seu banco é o PostgreSQL e que você utiliza o Prisma ORM;
- não pode abrir o seu repositório, rodar um teste, nem lembrar do que disse ontem;
- vai inventar nomes de função plausíveis se você pedir o código — e errar os seus.

O modelo é um excelente raciocinador sobre *conhecimento geral do mundo*. Mas ele não tem olhos para o seu projeto, mãos para agir, nem memória entre conversas. Guarde essa frase: **o LLM é o cérebro; ele ainda não tem corpo.**

## O que é um LLM

> Um **LLM** (*Large Language Model*, modelo de linguagem de grande escala) é uma rede neural treinada para prever o próximo *token* de uma sequência, a partir de um enorme corpus de texto e código.

"Token" é um pedaço de texto — pode ser uma palavra, parte de uma palavra ou um sinal de pontuação. O modelo recebe uma sequência de tokens (o seu prompt) e produz uma distribuição de probabilidade sobre qual token vem em seguida. Escolhe um, anexa, e repete. Texto inteiro sai um token de cada vez.

Parece simples demais para explicar o que vemos. A intuição que falta é a escala: quando você treina um previsor de próximo token bom o suficiente, em dados suficientes, prever a continuação exige *modelar* gramática, fatos, estilos de código, raciocínio passo a passo — porque tudo isso aparece nos dados. A capacidade emerge da tarefa simples levada ao extremo.

### Como funciona, em três níveis de zoom

**Zoom 1 — a tarefa.** Dado "o céu é", o modelo atribui alta probabilidade a "azul". Dado "def soma(a, b): return", ele atribui alta probabilidade a "a + b". A mesma máquina, domínios diferentes.

**Zoom 2 — a arquitetura.** Praticamente todo LLM moderno é um *Transformer*, a arquitetura introduzida no paper "Attention Is All You Need" (Vaswani et al., 2017). A peça central é a **atenção**: para prever o próximo token, o modelo pondera quais tokens anteriores importam mais. É isso que permite manter coerência ao longo de um texto longo.

**Zoom 3 — o que você controla.** Dois botões importam no dia a dia:

- **Temperatura**: o quão "ousado" é o sorteio do próximo token. Temperatura baixa → respostas mais determinísticas e repetíveis; alta → mais variadas e criativas. Para tarefas de engenharia, baixa costuma ser melhor.
- **Janela de contexto**: quantos tokens o modelo consegue "ver" de uma vez (prompt + resposta). Tudo que não cabe na janela, o modelo não enxerga. Esse limite é tão central que merece um capítulo só: [Capítulo 05 — O Context](05-context.md).

## O que o LLM **não** faz sozinho

Esta lista é o motivo de existirem todas as outras camadas:

| Limitação | Consequência prática | Quem resolve |
|-----------|----------------------|--------------|
| Não tem memória entre chamadas | Esquece tudo a cada nova conversa | Context + memory (Cap. 05) |
| Não acessa seus arquivos | Não conhece o seu código | Harness + tools (Cap. 02) |
| Não executa ações | Não roda testes, não edita arquivos | Harness (Cap. 02) |
| Não acessa sistemas externos | Não consulta o Stripe nem o banco | MCP (Cap. 08) |
| Pode alucinar | Inventa APIs e fatos plausíveis | Ferramentas + verificação (Cap. 02, 05) |
| Conhecimento congelado no treino | Não sabe do release de ontem | Tools de busca / contexto fresco |

Nenhuma dessas é um "bug" do modelo. São consequências diretas do que ele é: um previsor de tokens, não um sistema com estado e acesso ao mundo. As camadas seguintes são, literalmente, o trabalho de dar estado e acesso a esse cérebro.

## Model routing: nem todo cérebro para toda tarefa

LLMs vêm em tamanhos. Na família Claude 4.X usada como referência neste e-book:

- **Opus 4.8** (`claude-opus-4-8`): o mais capaz. Raciocínio profundo, trade-offs ambíguos, arquitetura. Mais caro e mais lento.
- **Sonnet 4.6** (`claude-sonnet-4-6`): equilíbrio. Ótimo para execução de padrões já definidos, volume de código.
- **Haiku 4.5** (`claude-haiku-4-5`): o mais rápido e barato. Ideal para passes mecânicos — lint, normalização, classificação simples.

Escolher o modelo certo para cada tarefa chama-se **model routing**. Não é detalhe de custo: é casar a *dificuldade* da tarefa com a *capacidade* do modelo. É também por isso que o frontmatter do agent (Capítulo 03) tem um campo `model` — você decide, por papel, qual cérebro roda.

## Como isso se conecta ao `agent`

O agent do Capítulo 03 **não é** o LLM — ele *configura* o LLM. Quando você escreve no frontmatter:

```yaml
model: opus
```

você está dizendo "este especialista usa o cérebro mais potente, porque o trabalho dele (decisões de arquitetura) é ambíguo". Trocar para `model: haiku` mantém o mesmo prompt, o mesmo papel, as mesmas ferramentas — mas com um cérebro mais rápido e mais barato, adequado a tarefas mecânicas. O agent é a configuração; o LLM é a peça configurável mais importante dela.

E todo o resto do e-book — harness, context, tools, MCP — existe para entregar a esse cérebro o que ele não tem: olhos, mãos e memória.

## Trade-offs e armadilhas

- **Confiança ≠ correção.** O modelo soa igualmente seguro quando acerta e quando alucina. Para fatos e APIs específicas, verifique — não confie na fluência.
- **Maior nem sempre é melhor.** Usar o modelo mais caro para tudo é desperdício e mais lento. Roteie por dificuldade.
- **Conhecimento tem data.** O treino tem um corte temporal. Para "o que mudou ontem", o modelo precisa de contexto fresco vindo de fora (tools), não da memória dele.
- **A janela é finita.** Encher o contexto de coisa irrelevante degrada a resposta tanto quanto faltar informação. Mais sobre isso no Capítulo 05.

### Como saber se você entendeu

Você dominou este capítulo se consegue:

- explicar por que o modelo fala sobre CRUD de Pedidos mas não consegue mexer no seu código;
- dizer o que o *model routing* decide e quando usar opus, sonnet ou haiku;
- citar três coisas que o LLM não faz sozinho e qual camada resolve cada uma.

## Fontes

- Andrej Karpathy — nanoGPT, implementação mínima de um GPT treinável (boa intuição para previsão de próximo token): https://github.com/karpathy/nanoGPT
- Vaswani et al., "Attention Is All You Need" (2017) — o paper do Transformer: https://arxiv.org/abs/1706.03762
- Anthropic — modelos Claude (capacidades, tamanhos, IDs): https://docs.anthropic.com/en/docs/about-claude/models
- Anthropic — pesquisa: https://www.anthropic.com/research

## Síntese

O LLM é um previsor de próximo token treinado em escala suficiente para raciocinar sobre o mundo. É o cérebro do stack. Mas é um cérebro num pote: sem memória, sem olhos, sem mãos. Tudo que vem a seguir neste e-book é o trabalho de dar corpo a ele.

O primeiro passo é o corpo mais básico: o programa que roda o modelo num loop e o conecta a ferramentas. É o harness.

Próximo: [Capítulo 02 — O Harness](02-harness.md).
