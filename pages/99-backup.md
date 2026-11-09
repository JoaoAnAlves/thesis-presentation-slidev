---
routeAlias: b0
---

# Backup index

<div class="bk-index">
<Link to="b1"><span class="num">B1</span><b>Measured / not measured</b><i>What I verified</i></Link>
<Link to="b2"><span class="num">B2</span><b>Prediction interval</b><i>±1.65 × RMSE</i></Link>
<Link to="b3"><span class="num">B3</span><b>Why the band is wide</b><i>Pooled catalog error</i></Link>
<Link to="b4"><span class="num">B4</span><b>Model configuration</b><i>Six models, settings</i></Link>
<Link to="b5"><span class="num">B5</span><b>Why RMSE</b><i>MAPE, R², RMSE</i></Link>
<Link to="b6"><span class="num">B6</span><b>Inverse-error weights</b><i>Versus stacking</i></Link>
<Link to="b7"><span class="num">B7</span><b>Recipe reconstruction</b><i>Mined, not validated</i></Link>
<Link to="b8"><span class="num">B8</span><b>Simulated inputs</b><i>Lots, FEFO, lead times</i></Link>
<Link to="b9"><span class="num">B9</span><b>Scenario logic</b><i>Monthly multiplier rule</i></Link>
<Link to="b10"><span class="num">B10</span><b>Scenario 3: 3 failed</b><i>Weights, unknown cause</i></Link>
<Link to="b11"><span class="num">B11</span><b>Partner questions</b><i>Ten open questions</i></Link>
<Link to="b12"><span class="num">B12</span><b>Technology choices</b><i>Who chose what</i></Link>
<Link to="b13"><span class="num">B13</span><b>Cut-off: March 2026</b><i>Partial month artefact</i></Link>
<Link to="b14"><span class="num">B14</span><b>Scenario 3 + war</b><i>Stress test, 2026</i></Link>
<Link to="b15"><span class="num">B15</span><b>Production capacity</b><i>Not modelled</i></Link>
</div>

<!--
Índice dos backups. Clicar num título salta para o slide.
-->

---
routeAlias: b1
---

# Measured vs not measured

<div class="bk-cols">
<div class="bk-card">
<h3><span class="bk-ok">✓</span> Measured</h3>
<ul>
<li>Error of each model: walk-forward, 12 folds (cut-offs Jan–Dec 2024)</li>
<li>Scenario 1 visual check, 1 SKU: 12/12 months inside the band</li>
</ul>
</div>
<div class="bk-card">
<h3><span class="bk-no">✗</span> Not measured</h3>
<ul>
<li>Combined forecast error across the catalog</li>
<li>Band coverage across the catalog</li>
<li>Recipe accuracy</li>
<li>Real stock and waste effect</li>
</ul>
</div>
</div>

<p class="bk-note">Model settings were adjusted while looking at 2025 → 2025 is not a clean test set. Next step: a hold-out year never used for tuning.</p>

<!-- TODO(João): review wording -->

<!--
Medi o erro de cada modelo. Não medi a previsão combinada no catálogo. E 2025
foi usado para afinar parâmetros, por isso não é um teste limpo — o próximo
passo é um ano reservado.
-->

---
routeAlias: b2
---

# Prediction interval

$$
\hat{y}_t \pm 1.65 \cdot \mathrm{RMSE}_t ,\qquad \mathrm{RMSE}_t = \sum_i w_i \cdot \mathrm{RMSE}_{i,t}
$$

<ul class="bk-list">
<li><em>t</em> = same calendar month in the walk-forward folds</li>
<li>1.65 → two-sided 90 % if errors are roughly normal</li>
<li>Worked example, item 101703, July 2025: <strong>8 041 ± 5 804 kg</strong></li>
</ul>

<p class="bk-note">Normality not tested. Coverage across the catalog not measured.</p>

<!-- TODO(João): review wording -->

<!--
1,65 é o quantil da normal para 90 % bilateral. Assumi erros aproximadamente
normais; não testei. Neste produto os 12 meses ficaram dentro.
-->

---
routeAlias: b3
---

# Why the band is wide

<svg class="bk-svg" viewBox="0 0 868 190" width="868" height="190" role="img" aria-label="Items of different sizes feed one pooled error, which is applied to each item as the same band">
  <text x="0" y="22" class="t">Items of very different sizes</text>
  <g class="bars">
    <rect x="10" y="100" width="34" height="70" rx="3" /><rect x="58" y="60" width="34" height="110" rx="3" /><rect x="106" y="140" width="34" height="30" rx="3" /><rect x="154" y="55" width="34" height="115" rx="3" /><rect x="202" y="125" width="34" height="45" rx="3" />
  </g>
  <path d="M250 105 H 300" class="arrow" /><path d="M300 105 l-9 -6 v12 z" class="head" />
  <rect x="310" y="70" width="200" height="70" rx="10" class="box" />
  <text x="410" y="101" text-anchor="middle" class="t b">One pooled error</text>
  <text x="410" y="124" text-anchor="middle" class="t m">whole catalog</text>
  <path d="M520 105 H 570" class="arrow" /><path d="M570 105 l-9 -6 v12 z" class="head" />
  <text x="590" y="22" class="t">Same band on every item</text>
  <g class="bars">
    <rect x="600" y="100" width="34" height="70" rx="3" /><rect x="648" y="60" width="34" height="110" rx="3" /><rect x="696" y="140" width="34" height="30" rx="3" /><rect x="744" y="55" width="34" height="115" rx="3" /><rect x="792" y="125" width="34" height="45" rx="3" />
  </g>
  <g class="band">
    <rect x="594" y="76" width="46" height="48" /><rect x="642" y="36" width="46" height="48" /><rect x="690" y="116" width="46" height="48" /><rect x="738" y="31" width="46" height="48" /><rect x="786" y="101" width="46" height="48" />
  </g>
</svg>

<ul class="bk-list">
<li>Error pooled across the catalog, not per item.</li>
<li>Fix: <strong>per-item or scaled error</strong> (e.g. RMSSE).</li>
</ul>

<!-- TODO(João): review wording; schematic, not data -->

<!--
O erro foi calculado sobre o catálogo todo; artigos grandes alargam a banda
dos pequenos. A correção é erro por artigo ou escalado.
-->

---
routeAlias: b4
---

# Model configuration

<table class="bk-table bk-tight">
<thead><tr><th>Model</th><th>Family</th><th>Trained on data</th><th>Input</th><th>Key settings</th></tr></thead>
<tbody>
<tr><td>Random Forest</td><td>Tree</td><td>Yes</td><td>Recent months + calendar</td><td>see thesis Table 4.2</td></tr>
<tr><td>XGBoost</td><td>Tree</td><td>Yes</td><td>Recent months + calendar</td><td>see thesis Table 4.2</td></tr>
<tr><td>LightGBM</td><td>Tree</td><td>Yes</td><td>Recent months + calendar</td><td>see thesis Table 4.2</td></tr>
<tr><td>Prophet</td><td>Statistical</td><td>Yes, one per item</td><td>Trend + yearly seasonality</td><td>Multiplicative seasonality</td></tr>
<tr><td>Chronos t5-small</td><td>Foundation</td><td>No (zero-shot)</td><td>Item history</td><td>P70 validation · P50 prediction</td></tr>
<tr><td>Granite TTM</td><td>Foundation</td><td>No (zero-shot)</td><td>Item history</td><td>Context 512</td></tr>
</tbody>
</table>

<p class="bk-note">P70 vs P50 mismatch: to align in the next version. Tree models: one global model.</p>

<!-- TODO(João): tree and Prophet settings come from the thesis; the repo has no fixed values in the services -->

<!--
Árvores e Prophet treinados nos dados; Chronos e Granite usados sem treino.
Há uma inconsistência: P70 na validação e P50 na previsão — a corrigir.
-->

---
routeAlias: b5
---

# Why RMSE

<div class="bk-cards3">
<div class="bk-card"><h3>MAPE</h3><p>Breaks with zero-sales months.</p></div>
<div class="bk-card"><h3>Pooled R²</h3><p>Mostly measures differences between items.</p></div>
<div class="bk-card bk-pick"><h3>RMSE</h3><p>Same unit as stock (kg).</p></div>
</div>

<!-- TODO(João): review wording -->

<!--
MAPE divide por zero nos meses sem vendas. R² no catálogo mede sobretudo a
diferença entre artigos. RMSE está em quilos, a unidade do stock.
-->

---
routeAlias: b6
---

# Why inverse-error weighting

<table class="bk-table">
<thead><tr><th></th><th>Best single model</th><th>Stacking</th><th>Inverse-error weights</th></tr></thead>
<tbody>
<tr><td>Extra training?</td><td>No</td><td>Yes, meta-model</td><td>No</td></tr>
<tr><td>Data needed</td><td>Error per item</td><td>More history</td><td>Walk-forward errors</td></tr>
<tr><td>Explainable to the manager</td><td>Yes</td><td>Hard</td><td>Yes</td></tr>
<tr><td>Editable</td><td>Swap model only</td><td>No</td><td>Yes, weights</td></tr>
</tbody>
</table>

<!-- TODO(João): review wording; cell contents drafted from the speaker note -->

<!--
O melhor modelo muda de artigo para artigo. Stacking precisa de mais dados e de
outro treino. Pesos pelo inverso do erro são simples, explicáveis e o gestor
pode alterá-los.
-->

---
routeAlias: b7
---

# Recipe reconstruction

<div class="bk-flow">
<div class="bk-step">Production events</div><span>→</span>
<div class="bk-step">Component per unit produced (average)</div><span>→</span>
<div class="bk-step">Keyword guard (fish / meat)</div><span>→</span>
<div class="bk-step">+ 2 % scrap</div><span>→</span>
<div class="bk-step bk-pick">Recipe</div>
</div>

<p class="muted">Illustrative example — not company data</p>

<p class="bk-note">Not validated against real recipes.</p>

<!-- TODO(João): review wording -->

<!--
Não havia tabela de receitas. Reconstruí a partir dos eventos de produção.
Não foi validada com receitas reais.
-->

---
routeAlias: b8
---

# Simulated inputs

<div class="bk-cards3">
<div class="bk-card"><h3>Lots</h3><p>2 per item: one expires in 2 days, one after the median shelf life from real inventory records (default 7 days). Reference date 15 Feb 2025.</p></div>
<div class="bk-card"><h3>FEFO</h3><p>Always consume the lot that expires first.</p></div>
<div class="bk-card"><h3>Lead times</h3><p>Random 2–7 days per supplier item; 14 days if missing.</p></div>
</div>

<p class="bk-note">These show the logic. They are not the factory's real stock.</p>

<!-- TODO(João): review wording -->

<!--
Lotes, prazos e desperdício são simulados. A validade dos lotes vem da mediana
real. Mostra a lógica, não o stock real.
-->

---
routeAlias: b9
---

# Scenario logic

$$
m_{item,month} = \frac{\text{sales during event (anchor year)}}{\text{sales same month, year before}}
$$

<ul class="bk-list">
<li>No data → ×0,00 + Information warning</li>
<li>Lead time ×3 for war, ×2 other events</li>
<li>Other modes in the code: supplier delay, manual demand override, vendor loss</li>
</ul>

<!-- TODO(João): review wording -->

<!--
Multiplicador por artigo e por mês: ano da crise a dividir pelo ano anterior.
Sem dados, fica a zero e gera aviso. É uma hipótese, não uma previsão.
-->

---
routeAlias: b10
---

# Scenario 3: 3 models failed

<div class="bk-cols">
<div>
<div class="bk-chips">
<span class="bk-chip off">RF</span><span class="bk-chip off">LightGBM</span><span class="bk-chip off">Prophet</span>
<span class="bk-chip on">XGBoost</span><span class="bk-chip on">Chronos</span><span class="bk-chip on">Granite</span>
</div>
</div>
<div>
<p>Weights renormalised over survivors (Chronos / Granite / XGBoost): <strong>0,21 / 0,22 / 0,57</strong> → plan still generated.</p>
<div class="bk-todo">Cause: ______ <span>TODO(João)</span></div>
</div>
</div>

<!-- TODO(João): fill in the cause of the three failures -->

<!--
TODO — causa da falha.
-->

---
routeAlias: b11
# B11 is split over two slides: this one reads B11a, the next B11b (see slide-bottom.vue).
backupSuffix: a
---

# Partner questionnaire · Q1–Q5

<PartnerQuestionnaire :part="1" />

<p class="pq-foot">Open questions, meeting of Aug 2026 · answers summarized from my notes · <Link to="partner">← back to slide 20</Link> · <Link to="b11b">Q6–Q10 →</Link></p>

<!-- TODO(João): check wording against the thesis (§5.5, Appendix A), don't strengthen it. Text is in data/questionnaire.json. -->

<style>
.pq-foot {
  position: absolute;
  left: var(--slide-pad-x);
  bottom: 44px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
}
</style>

<!--
Questions shortened from thesis Appendix A; answers summarized from §5.5.
Respondents: Tecnicamente's two managers (my superiors, not planners at the client). Partner's view, not an independent evaluation.
-->

---
routeAlias: b11b
backupSuffix: b
backupContinues: true
---

# Partner questionnaire · Q6–Q10

<PartnerQuestionnaire :part="2" />

<p class="pq-foot">Open questions, meeting of Aug 2026 · answers summarized from my notes · <Link to="partner">← back to slide 20</Link> · <Link to="b11">← Q1–Q5</Link></p>

<!-- TODO(João): check wording against the thesis (§5.5, Appendix A), don't strengthen it. Text is in data/questionnaire.json. -->

<style>
.pq-foot {
  position: absolute;
  left: var(--slide-pad-x);
  bottom: 44px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
}
</style>

<!--
Questions shortened from thesis Appendix A; answers summarized from §5.5.
Q8 and Q10 are not on slide 20; Q9 (ownership: purchasing and planning) is in its Q&A notes.
-->

---
routeAlias: b12
---

# Technology choices

<table class="bk-table">
<thead><tr><th>Component</th><th>Technology</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Client</td><td>Angular</td><td>Partner's choice</td></tr>
<tr><td>Central webservice</td><td>Quarkus / Java</td><td>Partner's choice</td></tr>
<tr><td>Analytical engine</td><td>Python 3.12 + FastAPI</td><td>ML ecosystem</td></tr>
<tr><td>Database</td><td>SQL Server</td><td>Partner's database</td></tr>
<tr><td>Between components</td><td>JSON</td><td>Internal REST</td></tr>
<tr><td>Long jobs</td><td>Asynchronous</td><td>UI never blocks during training</td></tr>
</tbody>
</table>

<!-- TODO(João): review wording -->

<!--
Angular e Java foram escolhas do parceiro. Python pelas bibliotecas de ML.
-->

---
routeAlias: b13
---

# Data cut-off: March 2026

<svg class="bk-svg" viewBox="0 0 868 120" width="868" height="120" role="img" aria-label="Timeline from 2024 to 2026 with March 2026 as a hollow point">
  <line x1="10" y1="60" x2="858" y2="60" class="axis" />
  <g class="tick"><line x1="10" y1="52" x2="10" y2="68" /><line x1="334" y1="52" x2="334" y2="68" /><line x1="658" y1="52" x2="658" y2="68" /></g>
  <text x="10" y="92" class="t m">2024</text>
  <text x="334" y="92" class="t m">2025</text>
  <text x="658" y="92" class="t m">2026</text>
  <line x1="658" y1="60" x2="760" y2="60" class="solid" />
  <circle cx="760" cy="60" r="9" class="hollow" />
  <text x="760" y="30" text-anchor="end" class="t b">Mar 2026 — partial</text>
  <text x="858" y="112" text-anchor="end" class="t m">database copied mid-March</text>
</svg>

<p class="bk-note">The downward trend in §5.4 comes from this partial month. Correction: no trend can be concluded for 2026.</p>

<!-- TODO(João): review wording -->

<!--
A base de dados foi copiada a meio de março. A queda em §5.4 é um artefacto
desse mês parcial — corrijo essa conclusão.
-->

---
routeAlias: b14
---

# Scenario 3 + war what-if

<div class="stage-chart">
  <ForecastChart series="scenario3" scenario />
</div>

<div class="stage-side">

Same 2022 monthly pattern as in 2025.

<p class="warn">A stress test: it is not compared with sales.</p>

<p class="muted">Thesis Fig. 5.25 · reference: Ukraine war, 2022</p>

</div>

<!-- TODO(João): review wording -->

<!--
Real data, item 101703 (data/sku.json → scenario3 and scenario3.whatIf). Blue + band = the live 2026 forecast; dotted = the war what-if on that run; orange = actual sales for January and February 2026; the hollow point is March, a partial month (database copied mid-March).

The dotted line applies the same 2022 month-by-month multipliers as Scenario 2 did on 2025. It falls in spring because 2022 sales fell in spring. March 2026 is a partial month, so there is no sales decline to compare it with: a what-if is never scored against sales. TODO(João): your caption said "closeness to the real drop is not accuracy"; I replaced it because there is no confirmed drop.
-->

---
routeAlias: b15
---

# Production capacity

<p class="bk-statement">Not modelled — like classic MRP, the plan assumes unlimited capacity.</p>

<p class="muted">Future work: capacity and costs in the plan.</p>

<!-- TODO(João): review wording -->

<!--
Não modelei capacidade nem tempo de produção. Está no trabalho futuro.
-->
