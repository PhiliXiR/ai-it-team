# ai-it-team

A public prototype for modeling how an AI-assisted IT organization could route, escalate, document, and visualize operational work.

## What this is

`ai-it-team` is a public exploration of an **AI-assisted IT operating model**.

Instead of treating IT work as a single general-purpose assistant problem, this project breaks common operations work into explicit roles, workflows, approvals, escalation paths, and outputs. The goal is to make the operating model visible and testable instead of leaving it as vague agent hype.

This repo currently combines:

- org and workflow design
- role-based agent specs
- request routing prototypes
- scenario tests
- a local dashboard
- an early API/runtime spine for request, trace, artifact, and approval state

## Why this project exists

A lot of AI agent demos skip the hard parts of operational work:

- ownership
- escalation
- approval boundaries
- auditability
- domain separation
- artifact generation
- observability

`ai-it-team` focuses on those constraints first.

It asks: **what would it take to model an IT team as a structured, inspectable, multi-agent operating system?**

## What it demonstrates

This repository demonstrates how to translate real-world IT / operations concepts into a public-safe prototype:

- support triage
- access request routing
- incident handling
- infrastructure change ownership
- escalation modeling
- approval-aware operating boundaries
- workflow artifacts and outputs
- observable request flow via a local dashboard

## Current implementation

Implemented now:

- public-safe IT org model and team structure
- documented workflows for support, incidents, access, change, and documentation
- role definitions and workflow-role mapping
- escalation, handoff, and approval model docs
- MVP and next-wave agent specs
- normalized runtime prompts
- a prototype request router
- router test corpus and test harness
- a local dashboard with visual and inspection modes
- an early API/runtime spine for request state, traces, artifacts, approvals, and live updates
- a controlled access-request workflow slice

## What is simulated vs real

### Simulated right now

- routing is still prototype-grade and intentionally simple
- backend systems are represented visually, not integrated
- runtime data is still seeded from local scenarios for demoability
- the dashboard is still a local prototype surface, not a production operations console

### Real right now

- the operating model and boundaries are explicit
- workflows and role definitions are concrete
- routing behavior is testable
- request, trace, artifact, and approval state exist in runtime form
- request status changes can be visualized and inspected
- the prototype can be run locally and demonstrated visually

## What this is not

This repository is **not** claiming:

- autonomous production IT management
- live control over real infrastructure
- production-ready service desk automation
- replacement for human operators

The goal is not to oversell autonomy.
The goal is to prototype a more realistic, observable, and bounded approach to AI-assisted operations.

## Run the prototype

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

## Project structure

- `docs/` — vision, workflows, boundaries, evaluation, system design notes, and phase summaries
- `api/` — early runtime spine for request state, traces, artifacts, approvals, and workflow endpoints
- `agents/` — agent role specs
- `runtime/` — prompt and router prototype layer
- `tests/` — request corpus and router tests
- `dashboard/` — local visualization layer

## Design principles

- structure beats prompt soup
- agents need role boundaries
- ops work needs approvals and auditability
- public examples should stay environment-neutral
- practical workflows matter more than abstract hype
- visible execution is more useful than invisible magic

## Who this may be useful for

- IT operations and support professionals
- platform and internal tooling teams
- people exploring agent orchestration for operational work
- anyone interested in modeling operational workflows in a more structured and observable way

## Status

Current phase complete as a strong prototype iteration.
See `docs/current-state.md` for a cleaner phase summary and recommended next directions.
