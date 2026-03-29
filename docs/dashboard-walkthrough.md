# Dashboard Walkthrough

## Purpose

This document explains how the current `ai-it-team` dashboard is meant to be read and demoed.

It is intentionally lightweight so future work can be compared against the current behavior without re-discovering the UI from scratch.

## Current mode split

The dashboard now has two distinct modes:

### Visual Mode

Visual Mode is presentation-first.

It is designed to help a human understand:

- which request is active
- where it is in the workflow
- what human checkpoints exist
- what execution work is happening
- what happens next

### Inspection Mode

Inspection Mode is detail-first.

It is designed to help a human inspect:

- request summary
- workflow state
- trace timeline
- approvals
- artifacts
- raw objects

The intended split is:

- Visual Mode = show the system moving
- Inspection Mode = understand the system deeply

## Current playback model

The dashboard now plays requests through a reversible timeline.

That timeline can include:

- workflow stages
- human checkpoints
- execution steps

The key playback controls are:

- **Back** — move one timeline step backward
- **Pause** — stop automatic playback
- **Resume** — continue automatic playback
- **Step** — move one timeline step forward
- **Refresh** — reset from seeded scenarios

## Main Visual Mode sections

### 1. Current Focus

This is the hero area.

It should answer:

- what request is active
- what step is active right now
- what kind of step it is
- what happens next

It updates every step.

### 2. Current Workflow

This is the high-level path through the workflow.

It shows the broader request path such as:

- queue
- triage / owner
- approval gate
- system
- artifact

This is the high-level structure, not the entire detailed timeline.

### 3. Current Ticket State

This section is the plain-language state block.

It should explain:

- current status
- current owner
- current step
- next step

### 4. Workflow Activity

This section summarizes the active timeline moment and nearby trace context.

It is intended to feel like a live narration surface.

### 5. Phase Timeline

This is the more detailed playback spine.

It should show the reversible timeline across workflow, human, and execution moments.

### 6. Human Involvement

This section highlights where trust and authority live, including things like:

- approval checkpoints
- requester clarification
- human decision points
- takeover moments
- human-executed risky steps

### 7. Execution Trace

This section is meant to show the operational work itself, such as:

- reading state
- comparing desired vs actual state
- applying change
- verifying outcome
- writing artifact

It is the clearest place where the dashboard distinguishes workflow control from actual execution work.

### 8. Topology Panel

The topology area remains useful as an orientation surface.

It is no longer the entire point of the UI.

Its current role is to show where active work is touching:

- systems
- agents
- request queue

## What is real vs seeded right now

The current dashboard is still largely a seeded/runtime-backed prototype.

That means:

### Implemented

- request objects
- approvals
- artifacts
- traces
- step playback logic
- request selection
- reversible timeline stepping
- Python-backed runtime flow

### Seeded / simulated

- many demo scenarios
- part of the human involvement vocabulary
- part of the execution trace vocabulary
- some derived trace events for playback clarity
- target systems are represented, not actually integrated

## Recommended demo flow

1. Open Visual Mode
2. Select a request with visible human involvement
3. Use **Step** to move through the timeline slowly
4. Show how **Current Focus** updates on every step
5. Show how the workflow path differs from the detailed timeline
6. Show **Human Involvement** and **Execution Trace** as separate concepts
7. Use **Back** to demonstrate reversible playback
8. Switch to Inspection Mode
9. Show approvals, artifacts, and trace payloads
10. Explain which parts are seeded versus runtime-native

## Current rough edges

The current dashboard still has some important rough edges:

- the backend must be running first for the dashboard to work well
- many scenarios are still seeded for explanation rather than generated live
- some traces are partly synthetic to support playback clarity
- execution is represented, not connected to real systems

## Current value

The dashboard is currently most useful as a way to think about:

- workflow movement
- human checkpoints
- trust boundaries
- execution visibility
- gradual delegation of work to AI systems
