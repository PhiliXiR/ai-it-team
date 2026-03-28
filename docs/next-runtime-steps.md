# Next Runtime Steps

## Purpose

This document captures the next practical build steps after the current dashboard, API spine, approval controls, live update pass, and timeline-playback redesign.

## What now exists

The project now has:

- documented workflows and role structure
- a prototype router and test corpus
- a dashboard with visual and inspection modes
- reversible request playback across workflow, human, and execution steps
- a runtime spine with stored requests, traces, artifacts, and approvals
- a controlled access-request slice
- approval controls visible in the UI
- SSE-based live dashboard updates
- seeded scenarios that better highlight trust boundaries and execution work

## Best next engineering moves

### 1. Friendly startup dependency handling

The dashboard still expects the Python backend to be up first.

The next move should be a friendlier dependency check so the dashboard does not hard-fail when the backend is unavailable.

### 2. Live request creation

Allow new requests to enter the runtime while the dashboard is running.

This would let the live stream show real request creation instead of only seeded playback state.

### 3. Richer request schema and trace generation

Make request creation and runtime traces richer by capturing things like:

- missing context
- justification
- requester clarification loops
- execution intent
- verification result
- human decision points

### 4. Better separation of simulated versus real runtime state

The project is still using seeded and partly synthetic runtime data for explainability.

The next move should make it clearer which events are:

- runtime-native
- seeded
- derived
- simulated

### 5. Additional workflow slices

Expand beyond access-request control flow into:

- VPN support workflow
- incident triage workflow
- infrastructure change review workflow

The dashboard now has enough structure that these slices can teach useful things.

### 6. Bound execution model

The execution layer is still representational.

The next step should define a more explicit model for:

- execution started
- execution completed
- verification passed / failed
- human-executed risky step
- artifact written

This will help the line between control flow and actual work become more precise.

### 7. Live intake mode

Introduce a user-facing intake path that can create requests in real time and feed the dashboard/event stream.

## Product direction note

At this stage, the biggest wins come from making the runtime feel more alive and more controlled at the same time.

That means:

- more visible state transitions
- more realistic request creation
- clearer role activity
- clearer trust boundaries
- clearer execution work
- honest labeling of what is simulated versus implemented

Those steps are more valuable right now than additional broad design docs.
