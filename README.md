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

This is not being treated as a finished product or startup.
It is a sandbox for thinking through how AI might fit into IT support and service operations in a more structured way.

## What this project is currently exploring

Right now the main questions are:

- what is the right unit of work for an AI-assisted IT workflow?
- where should routing be rule-based versus AI-assisted?
- what state should be explicit and inspectable?
- what should require approval or human override?
- what should be visible in a runtime or dashboard view?
- how do role boundaries help keep agent behavior legible?

## What exists right now

The project currently includes:

- public-safe IT org and workflow docs
- role definitions and agent specs
- a prototype request router
- a request test corpus and router test harness
- a local dashboard with visual and inspection modes
- an early API/runtime spine
- request, trace, artifact, and approval objects
- one controlled access-request workflow slice

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
- where approvals and auditability become important
- what makes a workflow feel inspectable instead of magical
- how much of the system is really the model versus the control layer around it

## How to run it

### Dashboard

```bash
npm install
npm run dashboard
```

Open:

- `http://localhost:4411`

### API

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
2. Show the topology view: systems on the left, agents in the middle, requests on the right
3. Let the request flow animate into ownership and system involvement
4. Show pending approvals and current focus in the runtime strip
5. Switch to Inspection Mode
6. Show selected request details, trace timeline, and approval state
7. Explain what is implemented today versus what remains simulated

## Current reality

### Implemented now

- role and workflow structure
- prototype routing
- local tests
- runtime-backed request state
- trace, artifact, and approval records
- local dashboard and inspection view
- one controlled workflow slice

### Still simulated

- routing is still intentionally simple
- backend systems are represented, not integrated
- runtime state is still seeded from local scenarios for demoability
- broader workflow coverage is incomplete
- this is not yet a real deployed operational system

## Current project structure

- `docs/` — design notes, workflow docs, and experiment framing
- `api/` — early runtime spine for request state, traces, artifacts, approvals, and workflow endpoints
- `agents/` — role specs
- `runtime/` — router and prompt prototype layer
- `tests/` — request corpus and router tests
- `dashboard/` — local visualization and inspection layer

## Next experiments

The next useful experiments are likely to be small and focused, for example:

- refine request schema and routing clarity
- test one additional workflow slice
- test what a live intake bot should actually ask

## Status

Good stopping point for the current experiment phase.

See:

- `docs/current-state.md`
- `docs/minimal-experiment-plan.md`
