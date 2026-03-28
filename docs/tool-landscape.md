# Tool Landscape

## Purpose

This document provides a rough map of the current tool landscape around AI-assisted IT support, service desk automation, routing, and operational workflow systems.

The goal is not to produce a definitive market report.
The goal is to understand the surrounding category so `ai-it-team` can be positioned more clearly.

## Major tool categories

### 1. Traditional ITSM / service management platforms with AI added on

These tools usually already own the core system-of-record layer for:

- tickets
- incidents
- changes
- approvals
- service workflows
- SLAs

The AI layer is usually added for:

- summarization
- routing assistance
- agent assist
- self-service
- knowledge suggestions

Examples near this category include:

- ServiceNow
- Jira Service Management
- Freshservice
- Ivanti Neurons
- InvGate
- monday service

## Why this matters

These platforms tend to have strong workflow and record-keeping primitives already.
That means their AI story often rides on top of an existing operational core.

### 2. AI-first internal support and employee service tools

This category focuses more on:

- internal employee support
- request intake through chat or portal flows
- automated triage
- service orchestration across multiple internal systems
- improved employee request experience

Typical capabilities:

- conversational intake
- routing and escalation
- request summarization
- status communication
- self-service and deflection

This category is especially relevant to the intake and communication layer modeled in `ai-it-team`.

### 3. Slack / Teams native support workflow tools

These tools are built around communication surfaces directly.

They often turn chat platforms into:

- intake channels
- lightweight ticketing interfaces
- escalation points
- support coordination surfaces

The AI layer usually helps with:

- converting messages into structured requests
- summarizing threads
- classifying issues
- suggesting responses
- surfacing knowledge

This category matters because it overlaps with the live intake bot role discussed elsewhere in this repo.

### 4. Incident and operational coordination tools with AI layered in

This category is more focused on:

- incidents
- alerts
- response coordination
- postmortems
- status updates

The AI capabilities here usually help with:

- incident summarization
- impact explanation
- draft communications
- signal correlation
- report generation

This is adjacent to support tooling, but not identical to service desk software.

### 5. AI copilots for support teams

These tools focus on helping human operators work faster without necessarily becoming the system of record.

Typical capabilities:

- suggested replies
- case summaries
- routing recommendations
- knowledge retrieval
- next-step suggestions

This is one of the most common low-risk adoption patterns because it improves operator speed without immediately taking over workflow authority.

### 6. Workflow and orchestration-oriented systems

This is the most relevant category for `ai-it-team`.

The important question here is not only whether AI can answer support questions.
It is whether the system can represent and control operational work through things like:

- request state
- ownership transitions
- approvals
- traces
- artifacts
- escalations
- role-scoped reasoning
- human overrides

This is where `ai-it-team` is trying to be more explicit.

## What appears common across the space

Common capability clusters include:

- AI-assisted triage
- summarization
- automated routing
- knowledge suggestions
- self-service
- agent assist
- chat-based intake

These are no longer unusual.

## What still feels more distinctive

Less common and more structurally interesting capabilities include:

- explicit approval-aware workflow control
- durable trace history tied to requests
- visible handoffs between scoped roles
- auditability around AI-generated recommendations
- clear separation between user-facing intake and internal control layers
- inspection-oriented views in addition to presentation-oriented ones

## Why this matters for `ai-it-team`

This project should not pretend the surrounding space is empty.

Instead, it should be clear that the interesting part is not just:

- using AI for IT requests

but more specifically:

- modeling how controlled, inspectable, approval-aware AI-assisted IT operations might work

That is a narrower and more credible framing.

## Practical takeaway

The surrounding market already contains many tools for:

- AI ticketing
- service desk automation
- chat intake
- support copilots
- incident support

The more interesting open area for this project is the control layer around the intelligence:

- state
- approvals
- traces
- artifacts
- handoffs
- bounded worker roles
- human override

That is where `ai-it-team` can remain distinct and useful as a public prototype.
