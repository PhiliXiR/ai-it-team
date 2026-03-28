# Request Inspector Layout Spec

## Purpose

This document defines a cleaner information hierarchy for the Request Inspector so the dashboard becomes more understandable and more presentable without losing inspectability.

The design goal is to make the Request Inspector readable at multiple depths:

- 3-second understanding
- 10-second workflow understanding
- deeper raw-object inspection when needed

## Design principle

The Request Inspector should prioritize:

1. human understanding first
2. workflow clarity second
3. trust and execution clarity third
4. raw object visibility fourth

Raw system data should still be available, but it should not visually compete with the most important workflow information by default.

## Information hierarchy

### Layer 1 — Immediate request understanding

This is what a human should understand almost instantly.

The Request Inspector should clearly show:

- request summary
- current status
- current owner
- request classification
- whether approval is pending
- whether the request is blocked or waiting on something
- whether the current moment is workflow, human, or execution work

This should be the visually dominant section.

### Layer 2 — Workflow understanding

Once a human understands the request at a glance, the next most important thing is understanding movement through the workflow.

This layer should show:

- timeline of key events
- current blocker
- next expected step
- approval section
- artifact section

The goal is to answer:

- what happened so far?
- why is the request in this state?
- what happens next?

### Layer 3 — Trust and execution understanding

After the workflow is clear, the human should be able to understand:

- where human approval or clarification is needed
- whether a human took over
- whether a human executed a risky step
- what backend or system work was performed
- whether the result was verified

This is the layer that helps the system feel controlled instead of magical.

### Layer 4 — Raw system data

Raw system data is valuable for auditability and experimentation, but should be subordinate to the earlier layers.

This layer should include:

- request object JSON
- approval object JSON
- artifact object JSON
- trace payload JSON

These should be shown in collapsible sections or tabs rather than always expanded.

## Recommended section layout

### Section A — Request Summary

Required fields:

- request title or summary
- request id
- source
- classification
- current owner
- current status
- created / updated timestamps

This should be the first thing visible in Inspection Mode.

### Section B — Workflow State

Required fields:

- current state
- current owner
- pending approval indicator if applicable
- blocker if applicable
- next expected step
- current step meaning in plain language

This should explain the operational meaning of the request’s current state in plain language.

### Section C — Timeline

The trace should be shown as a readable event timeline.

Timeline emphasis should go to events like:

- request created
- request classified
- owner changed
- approval created
- approval approved
- approval rejected
- requester clarification requested
- requester clarification received
- human takeover started
- human decision recorded
- execution change applied
- verification passed
- request resumed
- request blocked
- artifact created

This should feel like a lifecycle record, not a raw log dump.

### Section D — Human Involvement and Execution

The Request Inspector should show:

- approval cards or rows
- clarification / takeover / override markers
- execution steps or execution trace rows
- system-touch summaries

These should be compact and visually grouped.

### Section E — Raw Data

This section should be present but visually de-emphasized.

The simplest v1 implementation is:

- collapsible details blocks for each object
- pretty-printed JSON

This keeps the raw data available without overwhelming the inspector.

## Visual mode relationship

Visual Mode should remain presentation-first.

It should not try to become a full Request Inspector.
Instead it should emphasize:

- topology
- current focus
- movement
- phase-by-phase playback
- human checkpoints
- execution work at a glance

This preserves a useful distinction:

- Visual Mode = show the system moving
- Inspection Mode = understand the system deeply

## What to reduce

To improve presentability, the Request Inspector should reduce:

- excessive metadata tags
- multiple panels with equal visual weight
- always-visible raw JSON
- repeated information shown in multiple places
- labels that assume the user already understands the model
- descriptions of the playback engine itself instead of the operational meaning of the step

## Guiding question

Every Request Inspector UI decision should be checked against this question:

**Does this help a human understand what is happening, who matters, and what work occurred, or is it just exposing data because the data exists?**

That distinction is the key to making the inspector feel presentable rather than cluttered.
