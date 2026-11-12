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
---

# Use of generative AI

<div class="ai-stage">
  <p class="ai-note">Generative AI tools (ChatGPT, Gemini, Claude, DeepL, Paperpal) were used as support, declared in full in the thesis, pp. viii–ix.</p>
  <div class="ai-cols">
    <section class="ai-card">
      <h3>AI supported</h3>
      <ul>
        <li>Text editing and translation</li>
        <li>Code generation and debugging</li>
        <li>Building these slides</li>
      </ul>
    </section>
    <section class="ai-card">
      <h3>My responsibility</h3>
      <ul>
        <li>Design decisions and system architecture</li>
        <li>Integration with the partner's system and data</li>
        <li>Running and validating the prototype on real data</li>
        <li>Every result and figure checked by me</li>
      </ul>
    </section>
  </div>
</div>

<!-- TODO(João): review wording -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.ai-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 112px;
  width: 868px;
}
.ai-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch; /* both cards as tall as the taller one */
}
.ai-card {
  background: var(--c-surface);
  border: 1.5px solid var(--c-line);
  border-radius: 12px;
  padding: 10px 18px 12px;
}
.ai-card h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
}
.ai-note {
  margin: 0 0 8px;
  color: var(--c-muted);
  font-size: 16px;
  line-height: 1.3;
}
.ai-tools,
.ai-lead {
  margin: 0 0 4px;
  font-size: 18px;
  line-height: 1.35;
}
.ai-lead {
  color: var(--c-muted);
}
.ai-tools,
.ai-lead {
  font-size: 17px;
}
.ai-card ul {
  margin: 0;
  padding-left: 14px;
  font-size: 17px;
}
.ai-card ul li {
  margin: 0 0 6px;
  padding: 0;
  line-height: 1.35;
}
.ai-card ul li:last-child {
  margin-bottom: 0;
}
.ai-bar {
  margin: 14px 0 0;
  padding: 8px 18px;
  background: var(--c-line);
  border-radius: 10px;
  color: var(--c-text);
  font-size: 18px;
  line-height: 1.35;
}
</style>

<!--
[0:15]
Nota de transparência: usei IA generativa.
Tese: declarada no documento.
Apresentação: slides e preparação.
Tudo revisto e verificado por mim — a responsabilidade é minha.
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
