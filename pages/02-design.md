---
layout: section
act: 2
title: Design
question: What must the system do, and for whom?
covers: [Requirements, Roles, Architecture]
loopMode: blueprint
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: What must the system do, and for whom?
-->

---
clicks: 5
---

# From problems to requirements

<RequirementMap :step="$clicks" />

<p v-click="5" class="req-footnote">Requirements describe <em>what</em> the system does, not <em>how</em>.</p>

<!-- TODO(João): review wording -->

<!--
[0:45]
Cada problema → um requisito.
[click] Sazonal e com choques → histórico, vários modelos, margem.
[click] Dados incompletos → verificar antes de prever.
[click] Gestor sabe mais que os dados → pode corrigir.
[click] Planear → receitas, FEFO, cenários.
[click] Cargos diferentes → vistas diferentes.
-->

---
clicks: 3
---

# Three stations, one shared plan

<FactoryFloor :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
[0:50]
Três locais da fábrica.
[click] Escritório: decide, revê previsão, ajusta pesos, corre cenários.
Temporizador volta a treinar — por exemplo, ao fim de semana.
[click] Cais: tudo o que entra e sai.
[click] Chão de fábrica: o que produzir e que lote usar primeiro.
Todos leem o mesmo plano, a mesma base de dados.
Protótipo: 2 perfis, horizonte mensal. Semanal e vistas por posto = trabalho futuro.
-->

---
clicks: 1
---

# Three tiers behind the stations

<!-- One click plays both: the request path (component step 1) and the "why" chips (step 2). -->
<ArchitectureTiers :step="$clicks >= 1 ? 2 : 0" />

<!-- TODO(João): review wording -->

<!--
[1:15]
Três camadas.
Cliente Angular: ver resultados, pedir ações.
Central Webservice (Quarkus): simula o MRP — acessos, regras, dados, ponte.
Analytical Engine (Python): o núcleo — limpa, treina 6 modelos, combina, planeia, alertas.
Base de dados central: fonte única da verdade.
[click] Pedidos assíncronos: a interface não bloqueia durante o treino.
Angular e Java: escolha do parceiro. Python: ecossistema de ML.
-->

---
clicks: 2
---

# The pipeline

<PipelineFlow :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
[0:45]
Quatro etapas.
[click] Treinar: histórico → 6 previsões + erro de cada modelo.
Refinar: 6 → 1, com banda de 90 %. Gestor ajusta pesos.
Planear: previsão → matérias-primas, validades, alertas.
Cenário, a pedido: crise aplicada por cima.
[click] Indicador fica no canto. Um produto do início ao fim.
-->
