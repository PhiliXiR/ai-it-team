# ai-it-team

An exploration of how AI agents might assist parts of IT support and service workflows.

## What this is

`ai-it-team` is an educational experiment.

The point of the project is to explore how agentic or AI-assisted systems might help with things like:

- request routing
- ownership and handoffs
- approval-aware workflows
- traceability
- artifacts and summaries
- visible operational state
- human checkpoints and trust boundaries
- human-readable playback of workflow state over time

This is not being treated as a finished product or startup.
It is a sandbox for thinking through how AI might fit into IT support and service operations in a more structured way.

## What this project is currently exploring

Right now the main questions are:

- what is the right unit of work for an AI-assisted IT workflow?
- where should routing be rule-based versus AI-assisted?
- what state should be explicit and inspectable?
- what should require approval, clarification, human takeover, or human execution?
- what should be visible in a runtime or dashboard view?
- how do role boundaries help keep agent behavior legible?
- how should actual backend execution work be represented?

## What exists right now

The project currently includes:

- public-safe IT org and workflow docs
- role definitions and agent specs
- a prototype request router
- a request test corpus and router test harness
- a local dashboard with visual and inspection modes
- an early API/runtime spine
- request, trace, artifact, and approval objects
- the beginnings of a human-facing Request Inspector view in dashboard inspection mode
- one controlled access-request workflow slice
- timeline-style playback of workflow, human, and execution steps
- seeded demo scenarios that emphasize trust checkpoints and action traces

## What this is not

This repository is **not** claiming:

- production-ready IT automation
- autonomous IT operations
- live control over real infrastructure
- a fully fledged product

It is better understood as a lab project / public prototype / learning vehicle.

## Current learning value

This project is helping explore:

- how agent systems differ from one-off model calls
- how routing, ownership, and handoffs might work
- where approvals, clarification loops, and human takeovers become important
- what makes a workflow feel inspectable instead of magical
- how much of the system is really the model versus the control layer around it
- how to make trust boundaries and concrete execution work legible in a runtime UI

## How to run it

### Recommended dashboard flow

Start the Python backend first:

```bash
npm install
npm run api:python
```

Then in a second terminal:

```bash
npm run dashboard
```

Open:

- `http://localhost:4411`

Python API health:

- `http://127.0.0.1:4413/api/health`

### Node API (older parallel runtime path)

```bash
npm run api
```

Open:

- `http://localhost:4412/api/health`

### Router tests

```bash
npm run test:router
```

## Suggested demo flow

1. Start in Visual Mode
2. Select a request and use **Step / Back / Pause / Resume** to walk through the request timeline
3. Show how **Current Focus** updates every timeline step
4. Show **Current Workflow** as the high-level path
5. Show **Phase Timeline** as the detailed playback spine
6. Show **Human Involvement** for approvals, clarification, takeover, or human execution
7. Show **Execution Trace** for concrete backend work inside the target system
8. Switch to Inspection Mode
9. Show selected request details, trace timeline, approval state, artifacts, and raw objects
10. Explain what is implemented today versus what remains seeded or simulated

## Current reality

### Implemented now

- role and workflow structure
- prototype routing
- local tests
- runtime-backed request state
- trace, artifact, and approval records
- local dashboard and inspection view
- one controlled workflow slice
- reversible seeded playback across workflow, human, and execution steps

### Still simulated

- routing is still intentionally simple
- backend systems are represented, not integrated
- runtime state is still seeded from local scenarios for demoability
- trace/event playback is partly synthetic to support explanation and inspection
- broader workflow coverage is incomplete
- this is not yet a real deployed operational system

## Current project structure

- `docs/` — design notes, workflow docs, experiment framing, and migration ideas
- `api/` — early runtime spine for request state, traces, artifacts, approvals, and workflow endpoints
- `backend/` — FastAPI runtime prototype used by the current dashboard flow
- `agents/` — role specs
- `runtime/` — router and prompt prototype layer
- `tests/` — request corpus and router tests
- `dashboard/` — local visualization and inspection layer

## Next experiments

The next useful experiments are likely to be small and focused, for example:

- tighten the playback model so traces, execution work, and human checkpoints line up even more cleanly
- refine request schema and routing clarity around missing context and ambiguity
- test one additional workflow slice with clearer human checkpoints
- test what a live intake bot should actually ask before routing

## Status

Good experimental progress.

The dashboard is now most useful as a way to inspect:

- workflow motion
- trust boundaries
- human involvement
- execution work
- explainability of the control layer

See:

- `docs/current-state.md`
- `docs/minimal-experiment-plan.md`
- `docs/request-inspector.md`
