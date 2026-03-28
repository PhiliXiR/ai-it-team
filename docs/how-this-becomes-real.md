# How This Becomes Real

## Purpose

This document explains how `ai-it-team` could evolve from a public prototype into a more realistic, bounded, human-in-the-loop operational system.

The goal is not to jump from a dashboard demo to autonomous IT control. The goal is to describe the layers required to make the system useful, inspectable, and safe.

## Current state

Today, the repository provides:

- a documented IT operating model
- role and workflow definitions
- a prototype request router
- scenario tests
- a local visualization dashboard

This means the project can currently model and demonstrate request flow.
It does **not** yet function as a live operational runtime.

## What a real system needs

To become a real system, `ai-it-team` would need to connect five major layers.

### 1. Intake layer

A real system needs actual request sources.

Examples:

- ticketing system events
- service desk forms
- chat-based support intake
- email requests
- monitoring alerts
- change requests

This layer turns outside events into normalized internal request objects.

### 2. Classification and routing layer

Once a request enters the system, it must be classified and assigned.

This layer should determine:

- request type
- likely owner
- likely escalation path
- whether approval is required
- whether the request is ambiguous or missing context

The current router prototype is the beginning of this layer, but a real version would need stronger logic, confidence handling, and better ambiguity management.

### 3. Workflow orchestration layer

A real system needs more than classification. It needs state.

This layer would:

- track current owner
- record handoffs
- store workflow trace data
- pause for missing information
- stop for required approval
- resume after human input
- mark requests resolved, redirected, or blocked

This is the layer that turns routing into an operational process.

### 4. Human control layer

Humans must remain authoritative for risk, policy, and final judgment.

A real system needs explicit ways for humans to:

- approve
- reject
- redirect
- request clarification
- override routing
- halt risky actions

Without this layer, the system becomes untrustworthy.

### 5. Integration layer

If the system is ever to do real work, it needs bounded integrations.

Examples:

- ticketing APIs
- identity provider APIs
- monitoring tools
- documentation systems
- change management systems
- communication tools

The safest first version should focus on read access, summarization, and draft generation before attempting sensitive write actions.

## Recommended activation path

The most credible way to make this real is to activate it in stages.

### Stage 1 — Demonstration mode

Current repo behavior:

- documented workflows
- prototype routing
- test scenarios
- visual playback dashboard

This stage proves the operating model can be expressed and demonstrated.

### Stage 2 — Interactive local mode

Next realistic step:

- accept local request objects
- generate structured traces
- produce artifact outputs in a standard format
- preserve state for each request

This stage proves the system can process requests as tracked units of work.

### Stage 3 — Sandbox-connected mode

Next safe operational step:

- connect to fake or test-only ticket queues
- ingest sandbox requests
- classify and route them
- require human approval where needed
- log all actions and outcomes

This stage proves the model can work against live-like input without touching real production systems.

### Stage 4 — Assisted operational mode

First practical real-world use:

- summarize incoming requests
- recommend routing
- draft implementation or response artifacts
- surface approvals and escalation needs
- update traces and documentation
- keep humans in charge of execution and risky decisions

This stage is the first one that should be considered a real deployment shape.

## What the first real version should do

A credible first real version should focus on assistance, not autonomy.

Good first-use capabilities:

- support triage assistance
- access request review assistance
- incident coordination support
- change planning support
- runbook and documentation drafting

Bad first-use ambitions:

- unattended production changes
- automatic privileged access grants
- unsupervised infrastructure remediation
- policy decisions without human review

## Core runtime objects that would be needed

To move toward reality, the project needs explicit internal objects.

### Request object
A normalized unit of incoming work.

Suggested fields:

- id
- source
- request type
- summary
- full input
- severity
- requested action
- affected system
- requester
- approval context
- status

### Trace object
A record of what the system did and why.

Suggested fields:

- request id
- current owner
- prior owners
- decisions made
- escalation points
- missing context
- human interventions
- final outcome

### Artifact object
A structured output representing useful work.

Examples:

- triage summary
- access review note
- incident summary
- change plan
- runbook update
- handoff note

## Human-in-the-loop checkpoints

Any credible system needs hard stops.

Examples of required human checkpoints:

- production-impacting changes
- access requests involving privileged roles
- policy interpretation
- risk acceptance
- exception handling
- destructive actions

These checkpoints should be explicit in workflow design, not implied.

## Suggested near-term implementation steps

1. define a normalized request schema
2. define a trace schema
3. define artifact output formats
4. create a queue processor for local scenarios
5. model approval checkpoints in runtime state
6. build a sandbox ingestion path
7. expand tests for ambiguity and edge cases

## Design principle

`ai-it-team` becomes real by becoming more observable, more stateful, more approval-aware, and more grounded in bounded integrations.

It does **not** become real by pretending to be an autonomous IT department before the control, safety, and trace layers exist.
