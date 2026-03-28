# Request Inspector

## Purpose

The **Request Inspector** is a lightweight human-facing case and audit view for `ai-it-team`.

Its purpose is not to become a full ticketing system.
Its purpose is to make request flow understandable to a human as work moves through the runtime.

This is especially important in an AI-assisted workflow because routing, approvals, handoffs, execution work, and artifacts can otherwise become too abstract or too hidden.

## Why this is needed

The current prototype already has the beginnings of a request lifecycle:

- request objects
- ownership
- status transitions
- trace events
- artifacts
- approvals
- human-in-the-loop checkpoints
- execution traces for backend work

But those things still need a human-readable surface.

The Request Inspector exists to answer questions like:

- what is this request?
- where is it right now?
- who owns it?
- what happened so far?
- what is blocking it?
- what needs approval?
- what did a human have to do?
- what backend work was carried out?
- what artifact was produced?
- what happens next?

## Core idea

The Request Inspector should be treated as a **case view** over runtime state.

It is not a separate workflow engine.
It is not a standalone helpdesk product.
It is a clearer lens over:

- request records
- trace records
- approval records
- artifacts
- human involvement
- execution work

## What v1 should show

### 1. Request summary

At minimum:

- request id
- request input / summary
- classification
- current owner
- current status
- created time
- updated time

This gives a human an immediate sense of what they are looking at.

### 2. Current state block

This should answer:

- what state is the request in?
- what does that state mean?
- what is the current focus or next step?

Examples:

- classified and waiting for review
- awaiting approval from security-director
- in progress under iam-specialist
- blocked due to rejected approval
- paused until requester clarification is received

### 3. Timeline / trace view

This is one of the most important parts.

The timeline should show meaningful events such as:

- request created
- request classified
- owner assigned
- policy check started
- policy check completed
- human clarification requested
- human clarification received
- approval created
- approval approved
- approval rejected
- human takeover started
- human decision recorded
- human execution completed
- execution change applied
- verification check passed
- request resumed
- request blocked
- artifact created

The goal is to show the lifecycle as a readable sequence, not as raw machine output.

### 4. Human involvement section

If human checkpoints exist, the inspector should show:

- approval type
- requested by
- required approver role
- current approval status
- clarification-needed states
- takeover / override moments
- human-executed steps

This is critical for understanding controlled workflow behavior and where trust lives.

### 5. Artifact section

If artifacts exist, the inspector should show:

- artifact type
- owner
- creation time
- concise summary of what the artifact represents

This helps connect workflow actions to useful outputs.

### 6. Execution section

If concrete system work exists or is represented, the inspector should show:

- target system or control surface
- high-level operational steps
- verification outcome
- relation to approval or trust boundaries

This helps distinguish:

- routing
- control
- actual work

### 7. Next-step / blocked-by section

A small interpretation layer is useful.

The Request Inspector should ideally show something like:

- next expected step
- current blocker if any
- whether human action is needed
- whether execution is still pending

This keeps the request readable for humans without requiring them to decode the whole trace manually.

## What v1 should not try to become

To keep scope controlled, v1 should avoid becoming:

- a full ticketing product
- a comment thread system
- a notification center
- a queue management suite
- a permissions-heavy service desk app
- a large administrative UI

The learning goal is not to rebuild enterprise helpdesk software.
The learning goal is to understand the minimum human-readable audit surface that makes AI-assisted workflows legible.

## What this experiment is really asking

The Request Inspector is an experiment about this question:

**What is the minimum human-readable case view needed to audit an AI-assisted IT workflow?**

That is a strong and useful learning question.

A more specific version of that question is now also emerging:

**How do humans understand where trust, authority, and real execution work live inside an AI-assisted workflow?**

## Relationship to the dashboard

The Request Inspector can live inside the broader dashboard, especially in inspection-oriented views.

Over time, it may become the clearest way to understand the system because it shifts the emphasis from:

- animated topology

to:

- visible workflow state
- human involvement
- execution work
- reasoning history
- trust boundaries

That makes it especially valuable for:

- debugging
- explaining the system
- evaluating trust and clarity
- understanding what information humans actually need

## Suggested next implementation move

The current practical direction is:

- keep the current dashboard
- treat inspection mode as the Request Inspector surface
- tighten that view around request detail, timeline, approvals, human checkpoints, execution work, and artifacts
- reduce any UI elements that do not directly help human understanding

This lets the Request Inspector continue emerging from the existing prototype rather than forcing a separate application immediately.
