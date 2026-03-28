# Next Runtime Steps

## Purpose

This document captures the next practical build steps after the current dashboard, API spine, approval controls, and live update pass.

## What now exists

The project now has:

- documented workflows and role structure
- a prototype router and test corpus
- a dashboard with live topology playback
- a runtime spine with stored requests, traces, artifacts, and approvals
- a controlled access-request slice
- approval controls visible in the UI
- SSE-based live dashboard updates

## Best next engineering moves

### 1. Live request creation

Allow new requests to enter the runtime while the dashboard is running.

This would let the live stream show real request creation instead of only seeded playback state.

### 2. Role activity and worker state

Make role activity more explicit.

Examples:

- current owner is active
- approval owner is waiting
- specialist has resumed work after approval
- request is blocked or paused

### 3. Richer workflow slices

Expand beyond access-request control flow into:

- VPN support workflow
- incident triage workflow
- infrastructure change review workflow

### 4. Approve/reject trace enrichment

Make approval traces richer by capturing:

- approver identity or role
- reason for rejection
- time-to-approval
- resumed owner and next step

### 5. LLM-backed role worker outputs

Replace or augment placeholder role-review logic with bounded LLM-based structured outputs.

### 6. Live intake mode

Introduce a user-facing intake path that can create requests in real time and feed the dashboard/event stream.

## Product direction note

At this stage, the biggest wins come from making the runtime feel more alive and more controlled at the same time.

That means:

- more visible state transitions
- more realistic request creation
- clearer role activity
- richer controlled workflows

Those steps are more valuable right now than additional broad design docs.
