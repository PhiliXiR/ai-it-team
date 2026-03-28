# ai-it-team

A public prototype for modeling how an AI-assisted IT organization could route, escalate, document, and visualize operational work.

## What this is

`ai-it-team` is a public exploration of an **AI-assisted IT operating model**.

Instead of treating IT work as a single general-purpose assistant problem, this project breaks common operations work into explicit roles, workflows, approvals, escalation paths, and outputs. The goal is to make the operating model visible and testable instead of leaving it as vague agent hype.

This repo currently combines:

- org and workflow design
- role-based agent specs
- request routing prototypes
- test scenarios
- a local dashboard for visualizing request flow across requests, agents, and systems

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

The project has moved beyond docs-only planning into an active prototype layer.

Implemented now:

- public-safe IT org model and team structure
- documented workflows for support, incidents, access, change, and documentation
- role definitions and workflow-role mapping
- escalation, handoff, and approval model docs
- MVP and next-wave agent specs
- normalized runtime prompts
- a prototype request router
- router test corpus and test harness
- a local dashboard that visualizes scenario routing, ownership, queue flow, affected systems, and generated artifacts

## Demo experience

The dashboard is intended to make the model understandable in seconds.

Current dashboard behavior includes:

- scenario playback from the request corpus
- animated request routing across the topology
- request queue and scenario history
- ownership and escalation visibility
- system involvement visibility
- generated artifact panel
- pass/fail comparison against expected outcomes

## What is simulated vs real

### Simulated right now

- routing is still prototype-grade and intentionally simple
- backend systems are represented visually, not integrated
- queue/history/artifact behavior is demo-state, not production telemetry
- the dashboard is a local visualization layer, not a live enterprise console

### Real right now

- the operating model and boundaries are explicit
- workflows and role definitions are concrete
- routing behavior is testable
- request outcomes are inspectable
- the prototype can be run locally and demonstrated visually

## What this is not

This repository is **not** claiming:

- autonomous production IT management
- live control over real infrastructure
- production-ready service desk automation
- replacement for human operators

The goal is not to oversell autonomy.
The goal is to prototype a more realistic, observable, and bounded approach to AI-assisted operations.

## Repository goals

This repository is intended to become:

- a public reference for AI-assisted IT operating models
- a proof-oriented prototype for routing and orchestration ideas
- a clear showcase of systems thinking and workflow design
- a base for future runtime, evaluation, and visualization work

## Run the dashboard

```bash
npm install
npm run dashboard
```

Then open:

- `http://localhost:4411`

## Suggested demo flow

A simple walkthrough:

1. Show the topology view: systems on the left, agents in the middle, requests on the right
2. Let the scenario queue animate into the routing flow
3. Show how ownership changes based on request type
4. Show affected systems lighting up
5. Show generated artifacts and pass/fail expectations
6. Explain what is implemented today vs what remains simulated

## Project structure

- `docs/` — vision, org structure, workflows, boundaries, evaluation, templates, and runtime/system design notes
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

Active prototype phase.
