---
layout: section
act: 5
title: Close
question: What did it achieve, and what comes next?
covers: [Scorecard, Lessons, Future work]
loopMode: live
labeled: true
labelOpacity: 0.4
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: What did it achieve, and what comes next?
-->

---
clicks: 2
---

# What I'm proud of · what I'd do differently

<div class="close-stage">
  <CloseColumns :step="$clicks" />
</div>

<!-- TODO(João): the four items are drafts (data/close.json): choose and rewrite. Review the title and the column titles (CloseColumns.vue) too. -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.close-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 132px;
}
</style>

<!--
[0:40]
Orgulho:
[click] Aguentou 3 modelos em falha e gerou plano.
Ponta a ponta: base de dados real → encomenda, sem tabela de receitas.
[click] Faria diferente:
Medir a previsão combinada desde o início.
Separar configuração de teste e de produção.
-->

---
clicks: 2
---

# Future work, prioritized

<div class="fw-stage">
  <FutureWorkList :step="$clicks" />
</div>

<!-- TODO(João): review wording (title; rows are in data/future-work.json). Check against thesis Ch. 6. -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.fw-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 118px;
}
</style>

<!--
[0:40]
[click] Provar: medir a combinada no catálogo · ligar artigos recodificados · planeado vs consumido.
[click] Estender: semanal · modelos para vendas irregulares · progresso em tempo real · capacidade e custos.
-->

---
layout: cover
variant: closing
---

# AI-Enhanced MRP for Food Manufacturing

<p class="thanks">Thank you</p>

<p class="questions">Questions?</p>

<Link to="b0" class="to-backups">backups</Link>

<style>
/* Hidden way into the backup index: bottom-right, low contrast. */
.to-backups {
  position: absolute;
  right: 20px;
  bottom: 14px;
  font-size: 16px;
  opacity: 0.18;
}
</style>

<!-- TODO(João): review wording -->

<!--
[0:05]
Obrigado. Estou disponível para as vossas questões.
-->
