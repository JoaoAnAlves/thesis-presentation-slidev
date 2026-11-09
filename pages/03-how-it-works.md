---
layout: section
act: 3
title: How it works
question: How does one product's history become a purchase plan?
covers: [Data, Models, Weighting, Planning]
loopMode: live
focus: [data, models, forecast, plan]
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: How does one product's history become a purchase plan?
-->

---
clicks: 2
---

# Real data, real gaps

<PipelineTracker stage="train" />

<DataProvenance :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
[0:55]
Cópia de uma base de dados real do parceiro.
Vendas 2014 → meados de março de 2026 · inventário · produção.
[click] Reconstruído: séries mensais com zeros · receitas a partir da produção · validade = mediana real.
Simulado: prazos de entrega · lotes · 2 % de desperdício.
[click] Previsão: 100 % dados reais.
Plano: mostra a lógica, não o stock real.
-->

---
clicks: 2
---

# Six models, three families

<PipelineTracker stage="train" />

<ModelFamilies :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
[0:55]
Um só modelo falhava em sítios diferentes.
[click] Árvores: RF, XGBoost, LightGBM — um modelo para todos os produtos.
Estatístico: Prophet — um por produto, tendência + sazonalidade.
Fundação: Chronos, Granite — pré-treinados, sem treino nos nossos dados.
[click] Combinar dilui a fraqueza de cada família.
-->

---
clicks: 2
---

# How wrong is each model?

<PipelineTracker stage="train" />

<WalkForward :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
[0:45]
Antes de combinar: quanto erra cada um?
Walk-forward: corte → treino → testa meses que nunca viu.
[click] Avança um mês. Doze vezes.
[click] Um erro por mês + um erro médio.
Como na prática: nunca vê o futuro.
-->

---
clicks: 3
---

# From errors to weights

<PipelineTracker stage="refine" />

<WeightBlend :step="$clicks">

$$
w_{i,t} = \dfrac{1/\mathrm{RMSE}_i}{\sum_{j\in M_t} 1/\mathrm{RMSE}_j}
\qquad
\hat y_t = \sum_{i\in M_t} w_{i,t}\,\hat y_{i,t}
$$

</WeightBlend>

<!-- TODO(João): review wording -->

<!--
[0:50]
Erro médio deste produto, em kg.
[click] Árvores: cerca de 2 200 a 2 400.
[click] Peso = 1 / erro, a dividir pela soma.
Menor erro → maior peso.
[click] Árvores ~¾ do peso. Prophet: 6 %.
Previsão final = soma ponderada das seis.
O gestor pode mudar os pesos.
-->

---
clicks: 3
---

# How wrong could it be?

<p class="slide-sub">From error to safety stock</p>

<PipelineTracker stage="refine" :pulse="$clicks >= 3 ? 'plan' : undefined" />

<!-- The chart starts on slide 12's box, then moves into the shared frame
     (styles/index.css, "Chart frame"). The move only plays when arriving forwards. -->
<div class="chart-frame" :class="{ 'enter-from-12': $nav.navDirection > 0 }">
  <ForecastChart
    series="scenario1" compact
    :show-band="$clicks >= 1"
    :highlight-month="$clicks >= 2 ? '2025-07' : null"
    :show-safety-bracket="$clicks >= 3"
  />
</div>

<div class="chart-frame-side">
<div v-click="1" class="band-formula">

$$
\hat y_t \pm 1.65\,\mathrm{RMSE}_t
$$

<p class="band-label">90% prediction interval</p>
</div>

<p v-click="2">Each month uses the error from the same calendar month in walk-forward.</p>

<ToPlanningBox month="2025-07" :show="$clicks >= 3" />
</div>

<!-- TODO(João): review wording (title, subtitle, formula label, caption; chart labels are in ForecastChart.vue, the box in ToPlanningBox.vue) -->

<style>
.band-formula {
  font-size: 30px;
}
.band-formula .katex-display {
  margin: 0 0 4px;
  text-align: left;
}
.band-formula .katex-display > .katex {
  text-align: left;
}
.band-formula .band-label {
  color: var(--chart-forecast);
  font-size: 18px;
  font-weight: 600;
}
</style>

<!--
[1:05]
Uma linha não chega — preciso de um intervalo.
[click] Banda de 90 %: ± 1,65 × erro combinado do mesmo mês do walk-forward.
[click] Por isso a largura muda de mês para mês.
[click] Julho 2025: 8 041 + 5 804 ≈ 13 800 kg.
O de cima = stock de segurança.
É larga: erro medido no catálogo inteiro.
Melhoria número um.
-->

---
clicks: 4
---

# Human-in-the-loop

<p class="slide-sub">The manager can re-weight the models</p>

<PipelineTracker stage="refine" />

<WeightOverride :step="$clicks" />

<!-- TODO(João): review wording (title, subtitle; the rest is in WeightOverride.vue) -->

<!--
[1:00]
Os pesos automáticos não são a última palavra.
[click] Gestor sabe coisas que os dados não têm.
[click] Sobe o Chronos → linha azul aproxima-se do Chronos.
[click] Banda alarga: Chronos erra mais.
[click] Plano muda com ela.
Tudo isto é o protótipo real — vídeo.
-->

---
clicks: 3
---

# Planning

<p class="slide-sub">From product demand to raw-material orders</p>

<PipelineTracker stage="plan" />

<div class="plan-stage">
  <BomTree :expanded="$clicks >= 1" :focus="$clicks >= 2" :dim-others="$clicks === 2" :show-routes="$clicks >= 3" />
  <FefoLots class="plan-lots" :show="$clicks >= 2" />
  <OrderTimeline class="plan-order" :show="$clicks >= 3" />
  <p v-click="1" class="plan-foot">Recipes reconstructed from production records · lead times simulated · stock lots synthetic</p>
</div>

<!-- TODO(João): review wording (title, subtitle, footnote; the rest is in BomTree.vue, FefoLots.vue, OrderTimeline.vue) -->

<style>
/* Positions are in slide pixels (the slide is 980 × 552). Every block has its
   place from the start and only fades in, so nothing moves between clicks. */
.plan-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 116px;
  width: 868px;
}
.plan-lots {
  position: absolute;
  left: 0;
  top: 196px;
  width: 100%;
}
.plan-order {
  position: absolute !important;
  left: 0;
  top: 300px; /* the lot cards end at 281 */
  width: 100%;
}
.plan-foot {
  position: absolute;
  left: 0;
  top: 370px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
  white-space: nowrap;
}
</style>

<!--
[1:00]
Planeamento: previsão → o que comprar e usar.
Exemplo ilustrativo — não são dados da empresa.
[click] Receita: reconstruída dos eventos de produção + 2 % de desperdício.
[click] Stock: lotes simulados, sai primeiro o que expira primeiro (FEFO).
[click] Data de encomenda = data de necessidade − (prazo + 3 dias de margem).
Data já passou → alerta crítico.
E se acontecer uma crise?
-->

---
clicks: 3
---

# Scenarios

<p class="slide-sub">What if a past crisis happened again?</p>

<PipelineTracker stage="scenario" />

<ScenarioFlow class="scn-flow" :step="$clicks" />

<!-- TODO(João): review wording (title, subtitle; the rest is in ScenarioFlow.vue) -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.scn-flow {
  position: absolute;
  left: var(--slide-pad-x);
  top: 124px;
  width: 868px;
}
</style>

<!--
[1:05]
Etapa opcional, a pedido do gestor.
Crise passada como referência: Ucrânia, 2022.
[click] Abril 2021 = 100 · abril 2022 = 68 → ×0,68.
[click] Aplicado a abril 2025: 8 035 → 5 469 kg.
Guerra: prazos ×3 → encomendar mais cedo.
[click] Mês a mês, produto a produto. Sem dados → ×0,00 + aviso.
Hipótese, não previsão.
-->
