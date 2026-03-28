# API Layer Design

## Purpose

This document describes how the API layer for `ai-it-team` could be built so the project can evolve from a demo-oriented prototype into a more realistic operational platform.

The API layer should act as the stable spine between:

- request sources
- routing and workflow logic
- human approvals
- artifact generation
- visualization and observability

## Design goal

The goal is not to build a magical agent API.
The goal is to build a clear, stateful, inspectable service layer that can:

- accept work
- classify and route it
- track lifecycle state
- pause for approval
- generate structured outputs
- expose traces and dashboard data

## Recommended architecture shape

The best first implementation is a **modular monolith**.

That means one service process, but internally split into clear modules.

Recommended module areas:

- intake
- routing
- workflow
- approvals
- artifacts
- dashboard
- storage
- events

This is a better first step than microservices because it is easier to build, run, debug, and demonstrate.

## Core API concerns

### 1. Intake API

This layer accepts new work from external or simulated sources.

Example inputs:

- ticketing system events
- chat requests
- email-derived requests
- monitoring alerts
- change requests
- local demo/scenario input

Suggested endpoints:

- `POST /api/requests`
- `GET /api/requests`
- `GET /api/requests/:id`

Responsibilities:

- validate incoming data
- normalize into internal request schema
- assign internal ids
- persist request objects
- emit request-created events

### 2. Routing API

This layer classifies requests and determines likely ownership.

Suggested endpoints:

- `POST /api/requests/:id/classify`
- `POST /api/requests/:id/route`
- `GET /api/requests/:id/routing`

Responsibilities:

- classify request type
- assign likely owner
- suggest escalation path
- detect ambiguity or missing context
- determine whether approval is required
- append routing decisions to trace history

## Important note

Routing decisions should be stored as explicit records.
They should not exist only as temporary runtime outputs.

That makes the system easier to inspect, debug, and evaluate.

### 3. Workflow API

This layer manages lifecycle state.

Suggested endpoints:

- `POST /api/requests/:id/start`
- `POST /api/requests/:id/handoff`
- `POST /api/requests/:id/pause`
- `POST /api/requests/:id/resume`
- `POST /api/requests/:id/resolve`
- `GET /api/requests/:id/state`
- `GET /api/requests/:id/trace`

Responsibilities:

- track current owner
- record handoffs
- preserve workflow state
- pause for missing information
- block on approval
- resume after intervention
- mark completion outcomes

Example lifecycle states:

- `new`
- `classified`
- `queued`
- `assigned`
- `awaiting-context`
- `awaiting-approval`
- `in-progress`
- `escalated`
- `resolved`
- `closed`
- `blocked`

### 4. Approval API

This layer handles human checkpoints explicitly.

Suggested endpoints:

- `POST /api/approvals`
- `GET /api/approvals/:id`
- `POST /api/approvals/:id/approve`
- `POST /api/approvals/:id/reject`

Responsibilities:

- create approval records
- store required approver role or human owner
- capture approval status
- link approvals to requests and trace events
- prevent sensitive workflow continuation until approval is granted

Approval logic should be independent and visible, not hidden inside agent behavior.

### 5. Artifact API

This layer stores useful workflow outputs.

Suggested endpoints:

- `POST /api/requests/:id/artifacts`
- `GET /api/requests/:id/artifacts`
- `GET /api/artifacts/:id`

Artifact examples:

- triage summary
- access review note
- incident summary
- change plan
- handoff note
- runbook update

Responsibilities:

- generate or store structured outputs
- associate artifacts with requests and owners
- preserve output history for inspection

### 6. Dashboard API

This layer exists to support the visualization surface.

Suggested endpoints:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/queue`
- `GET /api/dashboard/requests/active`
- `GET /api/dashboard/history`
- `GET /api/dashboard/topology`
- `GET /api/dashboard/traces/:id`

Responsibilities:

- expose aggregate system state
- expose active requests and queue state
- expose route paths and ownership
- expose artifact summaries
- expose trace history for drill-down views

The dashboard should consume API state, not invent its own operational state in the frontend.

## Suggested internal folder structure

```text
api/
  server.js
  routes/
    requests.js
    routing.js
    workflow.js
    approvals.js
    artifacts.js
    dashboard.js
    events.js
  services/
    request-service.js
    routing-service.js
    workflow-service.js
    approval-service.js
    artifact-service.js
    dashboard-service.js
  models/
    request.js
    trace.js
    approval.js
    artifact.js
  storage/
    sqlite.js
  lib/
    events.js
    validation.js
    ids.js
```

## Suggested core data objects

### Request object

A normalized unit of incoming work.

Suggested fields:

- `id`
- `source`
- `externalId`
- `type`
- `summary`
- `body`
- `requester`
- `affectedSystems`
- `severityHint`
- `classification`
- `owner`
- `escalation`
- `status`
- `createdAt`
- `updatedAt`

### Trace event

A structured record of what happened and why.

Suggested fields:

- `id`
- `requestId`
- `timestamp`
- `type`
- `actor`
- `data`

### Approval object

A human checkpoint linked to a request.

Suggested fields:

- `id`
- `requestId`
- `type`
- `requestedBy`
- `requiredApproverRole`
- `reason`
- `status`
- `createdAt`
- `resolvedAt`

### Artifact object

A structured output produced by the workflow.

Suggested fields:

- `id`
- `requestId`
- `type`
- `owner`
- `content`
- `createdAt`

## Storage recommendation

### First version

Use SQLite.

Why:

- simple local setup
- persistent state
- easy inspection
- good enough for a prototype with multiple request objects and traces

### Earlier-than-that version

If needed, start even simpler with JSON-backed local storage, but expect to outgrow it quickly once queue state and trace history matter.

### Later version

If the project grows into multi-user or concurrent environments, move to PostgreSQL.

## Event model

Internally, the API should be event-driven even if it remains a single service process.

Useful internal events:

- `request.created`
- `request.classified`
- `request.assigned`
- `request.escalated`
- `request.awaiting_approval`
- `approval.granted`
- `approval.rejected`
- `artifact.created`
- `request.resolved`

This helps with:

- trace generation
- dashboard updates
- state synchronization
- future real-time streaming

## Real-time update model

For the dashboard, the simplest useful real-time mechanism is **Server-Sent Events (SSE)**.

Suggested endpoint:

- `GET /api/events/stream`

This would allow the dashboard to subscribe to events like:

- request created
- request assigned
- request escalated
- approval pending
- artifact created
- request resolved

SSE is a better first choice than WebSockets for this project because it is simpler and fits one-way operational updates well.

## Safety and control model

The API layer should clearly separate low-risk read behavior from sensitive write behavior.

### Lower-risk actions

- classify
- summarize
- route
- inspect
- generate draft artifacts

### Higher-risk actions

- grant access
- open or approve production changes
- trigger infrastructure modifications
- send externally visible operational updates without review

Sensitive actions should require:

- explicit approval records
- trace events
- linked justification
- human signoff where applicable

## Recommended implementation order

### Step 1
Create `api/` with:

- basic server
- request routes
- normalized request schema
- SQLite storage

### Step 2
Move current routing logic behind the request API.

### Step 3
Add trace recording and lifecycle state transitions.

### Step 4
Refactor the dashboard to consume API endpoints instead of generating all state directly from test execution.

### Step 5
Add approval objects and artifact records.

### Step 6
Add SSE-based live updates for the dashboard.

## Practical principle

The API layer should be boring in the best way.
It should make the system:

- explicit
- stateful
- inspectable
- approval-aware
- easier to evolve

That is what will make `ai-it-team` feel like a real platform rather than only a visualization demo.
