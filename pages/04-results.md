---
layout: section
act: 4
title: Results
question: Does it hold up on real data?
covers: [Baseline, Shock, Live 2026, Partner view]
loopMode: stress
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: Does it hold up on real data?
-->

---
clicks: 1
# `layer` (styles/index.css): slide 18 fades in on top; both show the same twelve months, so the blue line and band do not move.
transition: layer
---

# Scenario 1: 2025 baseline

<div class="stage-chart">
  <ForecastChart
    series="scenario1" from="2025-02" to="2026-01" actuals-after-train
    :highlight="$clicks >= 1" :mark-below="0.8"
  />
</div>

<div class="stage-side">

Trained to Jan 2025, then forecasts the next 12 months.

<BaselineCaption v-click="1" />

<p class="muted">Assessed visually, one representative SKU.</p>

</div>

<!-- TODO(João): review wording. The orange caption is written by BaselineCaption.vue from the data (months inside the band; months under 80% of the forecast). Match thesis wording there. -->

<!--
[1:00]
Cenário 1: ano normal, 2025.
Treino até janeiro de 2025, prevê 12 meses.
Azul: combinada + banda. Laranja: real — o sistema não a viu.
Os 12 meses ficam dentro da banda.
[click] Março, agosto, novembro, dezembro: bem abaixo do previsto.
Avaliação visual, um produto. Banda larga.
-->

---
clicks: 4
transition: layer
---

# Scenario 2: war shock

<div class="stage-chart">
  <ForecastChart
    series="scenario1" from="2025-02" to="2026-01" :show-actual="false"
    :scenario="$clicks >= 2"
    :highlight="$clicks >= 3"
    :regions="[{ from: '2025-03', to: '2025-07' }, { from: '2025-09', to: '2025-10' }]"
  />
</div>

<div class="stage-side">

<div v-click="1" class="ref-chip">Reference: Ukraine war, 2022</div>

<p class="muted">What-if stress test, not a prediction.</p>

<div v-click="4" class="scn-plan">
  <ScenarioGrid :months="['2025-04', '2025-09', '2025-10']" />
  <p class="muted">War reference: supplier lead times ×3</p>
</div>

</div>

<!-- TODO(João): review wording (chip, the what-if line). Replace "War reference: supplier lead times ×3" with the real Critical warning text for 101703 when exported. -->

<style>
.scn-plan {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>

<!--
[0:55]
Cenário 2: o mesmo 2025, com uma guerra.
[click] A previsão fica.
[click] O cenário é uma linha nova por cima.
[click] Março a julho: ×0,68 a ×0,78.
Setembro: até +38 %.
[click] Prazos ×3 → alertas mais cedo.
Hipótese, não previsão.
-->

---
clicks: 3
---

# Scenario 3: live 2026, unsupervised

<div class="stage-chart">
  <ForecastChart series="scenario3" draw :show-forecast="$clicks >= 3" :show-band="$clicks >= 3" />
</div>

<div class="stage-side live-side">

<WeightBars :stage="Math.min($clicks, 2)" />

<div v-click="2" class="callout after-bars">Plan still produced.</div>

<p v-click="3" class="muted after-line">Sales data only to mid-March 2026 — too early to judge accuracy.</p>

</div>

<!-- TODO(João): review wording (callout, grey line; labels in WeightBars.vue). No trend wording on this slide: March 2026 is a partial month. -->

<style>
.live-side {
  gap: 12px;
}
/* Two things appear a little after their click, once the animation before
   them has finished: the box after the bars have grown (about 1 s), the
   grey line after the blue line is drawn and the band is in (about 1.3 s).
   Stepping back hides them at once. */
.live-side .after-bars:not(.slidev-vclick-hidden) {
  transition: opacity 0.4s ease 1s;
}
.live-side .after-line:not(.slidev-vclick-hidden) {
  transition: opacity 0.4s ease 1.3s;
}
</style>

<!--
[0:50]
Cenário 3: 2026 — ninguém sabe a resposta.
[click] Só 3 modelos sobreviveram: XGBoost, Chronos, Granite.
[click] Pesos recalculados entre os sobreviventes. Plano gerado na mesma.
[click] Dados só até meados de março → cedo demais para avaliar.
Mostra resiliência, não exatidão.
-->

---
clicks: 3
# Backup b11 links back here (<Link to="partner">).
routeAlias: partner
---

# What the partner said

<p class="slide-sub">Industrial partner's view</p>

<p class="fb-source"><Link to="b11">10 open questions</Link> · meeting, Aug 2026 · Tecnicamente's two managers · not an independent evaluation</p>

<div class="fb-stage">
  <FeedbackColumns :step="$clicks" />
</div>

<!-- TODO(João): review wording (title, subtitle, source line; column text is in data/feedback.json). Verify wording against thesis questionnaire section; don't strengthen it. -->

<style>
/* Positions are in slide pixels (the slide is 980 × 552). */
.fb-source {
  position: absolute;
  left: var(--slide-pad-x);
  top: 114px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
}
/* The link to backup b11 looks like the text around it; underline on hover only. */
.fb-source a {
  color: inherit;
  text-decoration: none;
}
.fb-source a:hover {
  text-decoration: underline;
}
.fb-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 164px;
}
</style>

<!--
[0:55]
É útil?
Dois gestores da Tecnicamente — meus superiores, não planeadores.
[click] Valorizaram: quantidades automáticas · janela de encomenda · menos trabalho manual.
[click] Consideraram: valores credíveis · ajuste de pesos útil · cenários úteis.
[click] Pediram: planeado vs consumido · ligar artigos que mudam de código.
Ambos estão no trabalho futuro.
-->

---
clicks: 4
---

# Objectives scorecard

<p class="slide-sub">Back to the four objectives</p>

<div class="sc-stage">
  <ObjectivesScorecard :step="$clicks" />
</div>

<!-- TODO(João): review wording (title, subtitle; the rest is in data/objectives.json and ObjectivesScorecard.vue). Verify against thesis Ch. 6. -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.sc-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 118px;
}
</style>

<!--
[0:45]
De volta aos quatro objetivos.
[click] Cada um tem um mecanismo a funcionar.
[click] Demonstrados nos 3 cenários. Desperdício: com lotes simulados.
[click] Medido: erro de cada modelo. Não medido: a previsão combinada no catálogo.
[click] Nada medido em operação real. É aqui que começa a próxima fase.
-->
