---
clicks: 3
---

# Pressure on food manufacturing

<div class="tile-row">
  <StatTile icon="waste" :value="1.3" :decimals="1" prefix="~" suffix=" B" label="tons of food lost or wasted per year" source="Roy et al., 2023" :active="$clicks >= 1" />
  <StatTile icon="workers" :value="70" prefix="~" suffix="%" label="of food-processing firms report labour shortages" source="Sharma, 2025" :active="$clicks >= 2" />
  <StatTile icon="shock" label="Ukraine war · Strait of Hormuz disruption" source="FAO, 2026" :active="$clicks >= 3">2022 · 2026</StatTile>
</div>

<!-- TODO(João): review wording -->

<!--
[0:45]
Indústria alimentar sob pressão.
[click] 1,3 mil milhões de toneladas desperdiçadas por ano.
[click] 70 % das empresas: falta de mão de obra.
[click] Crises: Ucrânia, Ormuz.
Procura e abastecimento mudam de um dia para o outro.
O MRP não está preparado para isto.
-->

---
clicks: 2
---

# Why classic MRP falls short here

<div class="stage-chart">
  <DemandGapChart :stage="$clicks" />
</div>

<div class="stage-side">

**MRP assumes**

<ul class="plain-list">
  <li>Static demand</li>
  <li>Fixed lead times</li>
  <li>No shelf life</li>
  <li>Slow reaction to shocks</li>
</ul>

<p v-click="2" class="warn">Result: waste, stock-outs, overproduction.</p>

</div>

<!-- TODO(João): review wording -->

<!--
[0:50]
MRP clássico assume quatro coisas:
procura estável · prazos fixos · sem validade · plano só muda à força.
[click] Produto real: abril ~4 000 kg → agosto ~8 900 kg.
Mais do dobro no mesmo ano.
[click] Linha plana erra duas vezes:
excesso → desperdício · falta → rotura.
Pergunta: como reagir a isto?
-->

---
clicks: 4
---

# Goal and objectives

<p class="lead">A decision-support tool that works <strong>alongside</strong> the existing MRP.</p>

<ObjectivesCard :revealed="$clicks" />

<!-- TODO(João): review wording -->

<!--
[0:40]
Apoio à decisão AO LADO do MRP — não o substitui.
[click] Prever procura e matérias-primas.
[click] Stock: evitar excesso e rotura.
[click] Desperdício: FEFO.
[click] Resiliência: reagir a um choque.
Volto a estes quatro no fim.
-->
