# Python API Migration Plan

## Purpose

This document outlines what it would take to move the current `ai-it-team` runtime/API spine from Node/Express to Python.

The goal is not to force a rewrite immediately.
The goal is to describe a clean migration path if Python becomes a better fit for future experiments.

## Why Python might be a good fit

The current API spine is still small and relatively easy to port.

Python may become the better runtime layer if the project wants to explore more deeply:

- structured workflow logic
- richer request and trace schemas
- LLM-backed routing or role workers
- experimentation with model outputs
- data processing and runtime analysis

## Recommended stack

### Core framework

- **FastAPI**
- **Uvicorn**
- **Pydantic**

### Storage options

- first pass: JSON-backed local storage
- likely better next step: SQLite
- later, if needed: PostgreSQL

### Real-time updates

- Server-Sent Events (SSE)

This keeps parity with the current runtime behavior while moving to a Python-native backend.

## What needs to be ported

The migration is mostly an implementation translation, not a full design restart.

The following concepts already exist and would carry over directly:

- request objects
- trace events
- artifact objects
- approval objects
- request status transitions
- approval-aware workflow behavior
- runtime summary endpoints
- SSE/live event stream behavior

## Recommended directory shape

A likely Python structure would be:

```text
backend/
  main.py
  api/
    routes/
      requests.py
      approvals.py
      dashboard.py
      events.py
  core/
    models.py
    schemas.py
    store.py
    router_logic.py
    workflow.py
  storage/
    db.json
```

Alternative naming is fine, but the key idea is to keep:

- API routes
- data models
- storage
- routing logic
- workflow logic

separate from each other.

## Suggested Pydantic models

At minimum, the Python version should define explicit models for:

### Request

Suggested fields:

- `id`
- `source`
- `input`
- `status`
- `classification`
- `owner`
- `escalation`
- `created_at`
- `updated_at`

### TraceEvent

Suggested fields:

- `id`
- `request_id`
- `type`
- `actor`
- `timestamp`
- `data`

### Artifact

Suggested fields:

- `id`
- `request_id`
- `type`
- `owner`
- `content`
- `created_at`

### Approval

Suggested fields:

- `id`
- `request_id`
- `type`
- `requested_by`
- `required_approver_role`
- `reason`
- `status`
- `created_at`
- `resolved_at`

This would likely improve clarity compared with the current looser JavaScript object handling.

## Endpoint parity plan

The first Python version should aim for functional parity with the current runtime spine.

### Phase 1 parity endpoints

- `GET /api/health`
- `GET /api/requests`
- `GET /api/requests/{id}`
- `POST /api/requests`
- `POST /api/requests/{id}/route`
- `POST /api/requests/{id}/access-review`
- `GET /api/requests/{id}/trace`
- `GET /api/requests/{id}/artifacts`
- `GET /api/requests/{id}/approvals`
- `GET /api/approvals`
- `POST /api/approvals/{id}/approve`
- `POST /api/approvals/{id}/reject`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/history`
- `GET /api/events/stream`

That gives the Python backend feature parity with the most important current runtime pieces.

## Router migration options

There are two practical options.

### Option A — Port the router logic to Python

This is probably the simplest long-term path.

The current router is still intentionally simple, so reimplementing its logic in Python should be straightforward.

### Option B — Keep calling the Node router temporarily

The Python API could shell out to the existing Node router until the router logic is reimplemented.

This is possible, but probably only useful as a short transition step.

## Recommended choice

Prefer **Option A** unless there is a strong reason not to.

The router is simple enough that a Python-native version is cleaner than maintaining cross-runtime coupling.

## SSE parity

The Python backend should preserve the live-update behavior already present in the dashboard.

Suggested endpoint:

- `GET /api/events/stream`

Useful event types:

- `snapshot`
- `runtime.reset`
- `approval.updated`

The Python version does not need more event complexity than the current dashboard uses.

## Suggested migration strategy

### Step 1 — build in parallel

Do not immediately delete the Node runtime.

Instead, create a parallel Python backend that reproduces the current runtime spine.

### Step 2 — implement core parity

Build:

- schemas
- storage
- health endpoint
- request endpoints
- routing endpoint
- access-review flow
- approval endpoints
- runtime summary endpoints
- SSE endpoint

### Step 3 — compare ergonomics

Evaluate whether Python improves:

- clarity
- schema discipline
- experimentation speed
- future LLM integration
- runtime maintainability

### Step 4 — switch dashboard only if worthwhile

If the Python backend feels meaningfully better, then switch the dashboard to consume it.

If not, keep the current runtime and treat the Python backend as a learning branch.

## What would likely improve

A Python migration would most likely improve:

- schema clarity
- workflow logic readability
- future model-integration ergonomics
- analysis and experimentation workflows

## What would become more complex

A Python migration would also introduce:

- mixed-stack repo complexity
- separate Python environment management
- one more runtime to explain if Node dashboard remains in place

That tradeoff is acceptable if Python unlocks better experimentation value.

## Recommendation

If the main goal remains educational experimentation, the right move is:

- document the Python path now
- build it only if the next experiments would benefit from stronger schemas or Python-native AI tooling

There is no urgent need to rewrite immediately.
But if the backend continues to grow, now is still early enough for a Python pivot to be cheap.
