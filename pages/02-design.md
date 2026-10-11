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
Bridge in: To build this, I turned each objective into concrete requirements.

Script draft (from reference/act2-design-spec.md, ~110 words):
Each of the problems from the start became one or more requirements.
[click] Because demand is seasonal and hit by shocks, the system must build on years of history, combine several forecasting methods instead of trusting one, and keep a safety margin sized to how volatile each item is.
[click] Because real factory data is incomplete, it must check data quality before forecasting.
[click] Because the planner knows things the data doesn't, they must be able to override it.
[click] Then the planning side: turn product demand into raw materials through the recipe, use the stock that expires first, and simulate disruptions.
[click] And finally, different people in the factory need different views of the result.

If asked (what vs how): the requirements were rewritten to describe capabilities; the methods (inverse error weighting, walk-forward, and so on) belong to the implementation chapter.

Target time: 0:50

Bridge out: Requirements say what. Next is who uses it.
-->

---
clicks: 3
---

# Three stations, one shared plan

<FactoryFloor :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: Requirements say what. Next is who uses it.

Script draft (TODO(João): no script came with the redesign request; this is Claude's draft, adapted from reference/act2-design-spec.md to the new clicks):
Who uses it? I designed the system around three places in a factory, and each one asks a different question. The Office Room asks what we should make and buy. The DockStation asks what arrives and leaves, and when. The WorkStation asks what we produce today, and with what. A system timer also sits in the office and triggers retraining automatically.
[click] In the office, the manager reviews the forecast, overrides the weights and runs scenarios. At the dock: inbound and outbound schedules, stock, and how a disruption shifts deliveries. On the floor: recipes, ingredient stock and expiry alerts.
[click] They all read one shared plan in the central database. If the manager raises a forecast, the inbound order at the dock grows and the schedule on the floor updates.
[click] To be clear about scope: the prototype is one interface with Manager and Operator roles, and it already holds these views. Dedicated screens per station are future work.

If asked (DockStation roles): only the Manager edits stock; that split was a prototype assumption and was not validated with the partner (thesis section 3.3).

Target time: 0:45

Bridge out: Three stations, one system behind them.
-->

---
clicks: 2
---

# Three tiers behind the stations

<ArchitectureTiers :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: Three stations, one system behind them.

Script draft (TODO(João): adapted by Claude from reference/act2-design-spec.md to the vertical layout; replace with your own):
Behind the three stations is a three-tier architecture. At the top, the Angular screens. Their only job is to show results and send actions. In the middle, two separate services. The Central Webservice, in Java with Quarkus, is the single entry point: it handles requests, access control and business logic. The Analytical Engine, in Python with FastAPI, does the heavy work: preparing data, running six models, combining them and building the plan. They talk over an internal REST interface. At the bottom, one central database is the single source of truth.
[click] Follow one request. The manager asks for a training run. Quarkus checks the role, loads the sales history from the database and hands the job to the engine. While the engine is busy, the dock asks for its schedule and gets an answer straight away. When training ends, the results are written to the database and the office screen shows them.
[click] Quarkus was the partner's choice, to build internal knowledge with it. Python was the natural choice for the ML side.

If asked (live progress): progress, warnings and results are written to the database and the interface reads them from there. There is no websocket streaming yet. That was a deliberate trade-off (thesis section 4.1.3) and it is listed as future work. Backups: b14 Tech stack, b5 Conceptual architecture.

If asked (who reads the sales history, Quarkus or FastAPI?): TODO(João): check repo and write the answer here. The animation follows the thesis text (section 4.1.2: the core service queries the history and passes it to the engine).

Target time: 1:00

Bridge out: Inside the analytical engine, everything follows one pipeline.
-->

---
clicks: 2
---

# The pipeline

<PipelineFlow :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: Inside the analytical engine, everything follows one pipeline.

Script draft (TODO(João): from reference/act2-design-spec.md, split by Claude across the new clicks; replace with your own):
Everything the system does follows four stages.
[click] Training takes the sales history and produces six forecasts, plus a measure of how wrong each model has been. It is started by the manager or by the timer. Refinement runs automatically after training and turns those six into one forecast with a 90% prediction interval. This is also where the manager can step in and change the weights. Planning turns that forecast into raw-material needs, uses expiry dates, and raises alerts. And on request, a scenario can be applied on top to see how a crisis would change the plan.
[click] These four stages stay in the corner for the rest of the talk, to show where we are.

Honesty (Plan inputs): recipes are reconstructed from production records, stock lots are synthetic and lead times are simulated. Say so if the inputs come up.

If asked (how the stages call each other): full sequence diagrams → backup b3 (thesis Figs 4.2–4.6).

Target time: 0:45

Bridge out: Let's follow one product through it.
-->
