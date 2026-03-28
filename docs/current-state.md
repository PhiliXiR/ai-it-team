# Current State

## Purpose

This document is a simple phase-closeout summary for the current `ai-it-team` prototype state.

It exists to answer four questions clearly:

1. what exists now
2. what is real versus simulated
3. how to demo it
4. what future phases would likely look like

## What exists now

`ai-it-team` currently includes:

- public-safe IT org and workflow documentation
- role specs for leads, directors, and specialists
- runtime prompt scaffolding
- a prototype request router
- an expanded request test corpus
- router tests
- a local dashboard
- an early API/runtime spine
- request, trace, artifact, and approval objects
- a controlled access-request workflow slice
- live dashboard updates via SSE
- visual and inspection modes in the dashboard

## What is real right now

The following things are implemented in a meaningful way:

- request objects exist in runtime state
- traces and artifacts exist as stored records
- approvals exist as stored records
- request status changes can be surfaced visually
- access-request flow now includes a controlled approval-aware slice
- the dashboard can show both presentation-oriented and inspection-oriented views
- the test corpus can be run locally and checked against expected routing behavior

## What is still simulated

The following parts are still prototype or demo-oriented:

- request routing logic is still intentionally simple
- runtime data is still seeded from local test scenarios
- backend systems are represented, not integrated
- live updates are local runtime events, not external production telemetry
- role workers are still modeled more than fully operationalized
- broader workflow coverage remains incomplete

## Current demo shape

The current prototype is best understood as:

- a structured public prototype
- a runtime-backed operational simulation
- a control-and-visibility oriented exploration of AI-assisted IT operations

It should not be described as a production-ready IT automation platform.

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

## Recommended demo flow

A clean walkthrough looks like this:

1. start in Visual Mode
2. show the topology and current focus
3. let the request flow animate across agents and systems
4. point out pending approvals and request states
5. switch to Inspection Mode
6. show selected request details and trace timeline
7. explain what is persisted versus what is still simulated

## What a future phase would likely include

If the project continues later, the next most likely directions are:

- live request creation instead of seeded-only runtime state
- richer controlled workflow slices beyond access review
- clearer role-worker execution paths
- stronger LLM-backed structured outputs
- improved approval trace detail
- more realistic intake and communication surfaces

## Phase summary

This phase successfully moved `ai-it-team` from:

- documentation and architecture sketches

into:

- a more concrete runtime-backed prototype with approvals, traces, artifacts, and a live local dashboard

That is a strong stopping point for this iteration.
