# Live Intake Bot Role

## Purpose

This document describes the role of a live customer-service or support-facing bot in `ai-it-team`.

The live bot should be treated as the **intake and communication layer**, not as the entire operational system.

## Core principle

The bot is the front door.
It is not the hidden owner of routing, approvals, or operational state.

Its job is to:

- receive requests
- gather missing information
- provide safe first-response guidance
- create or update request objects
- communicate status back to the requester

## Why this matters

Many AI support demos collapse everything into a single chat assistant.
That makes it hard to separate:

- intake
- routing
- policy
- execution
- status communication
- approval control

A better architecture gives the bot a clear role and keeps it connected to the stateful workflow system.

## What the live bot should do

### 1. Receive requests

The bot should accept requests from a user-facing channel such as:

- web chat
- Slack / Teams / Discord
- service desk messenger
- support portal chat

It should collect the initial problem statement and pass it into the intake API.

### 2. Ask clarifying questions

The bot is a strong fit for collecting missing context.

Examples:

- what exact system are you trying to access?
- what error message are you seeing?
- is this affecting only you or multiple people?
- what access level do you need?
- is this temporary or permanent?
- who approved this request?

This improves routing and reduces low-quality tickets.

### 3. Offer safe first-line help

For known low-risk situations, the bot may provide:

- links to documentation
- status page references
- standard troubleshooting steps
- request submission guidance
- explanation of approval requirements

This should remain bounded to safe and well-understood support guidance.

### 4. Create or update request state

The bot should call the system APIs to:

- create requests
- append clarifying context
- surface missing info responses
- update requester-provided details

The bot should not maintain hidden request state outside the system of record.

### 5. Communicate status

The bot can be a useful status surface.

Examples:

- your request has been routed to IAM
- this request is awaiting approval
- incident triage is in progress
- additional information is needed from you
- a response artifact is available

This improves transparency without bypassing workflow controls.

## What the live bot should not do

The bot should not:

- silently grant access
- approve risky actions
- bypass workflow state
- invent policy
- claim work is complete when it is only recommended
- perform sensitive external actions without approval and traceability

It is the front desk, not the final authority.

## How the live bot fits into the system

A healthy architecture looks like this:

### User-facing layer

The live bot:

- receives messages
- asks clarifying questions
- gives safe responses
- surfaces status updates

### Operational core

The API and workflow layers:

- store requests
- route work
- track state
- create approvals
- persist artifacts
- maintain traces

### Role-scoped workers

Spawned role agents:

- review requests
- recommend next actions
- escalate when needed
- draft artifacts

This separation keeps the user experience clean while preserving operational control.

## Example access-request flow

1. user says: "I need access to the finance admin console tonight"
2. bot asks:
   - what exact role do you need?
   - is this temporary?
   - who approved this?
   - what is the business reason?
3. bot creates a structured request object
4. routing sends the request to IAM
5. IAM review determines approval is required
6. system creates an approval record
7. bot reports back: "Your request is awaiting approval"

This is a realistic and trustworthy behavior pattern.

## Example support flow

1. user says: "VPN is broken again"
2. bot asks:
   - what exact error do you see?
   - are other users affected?
   - when did this start?
3. bot creates or enriches the request
4. system routes it to helpdesk or network ownership
5. bot surfaces status or missing context requests

## Why the bot is valuable

A live intake bot improves:

- user experience
- request quality
- speed of clarification
- routing quality
- visibility into workflow state

But it only works well if it remains connected to a durable request and trace system.

## Practical principle

In `ai-it-team`, the live bot should act as the intake and communication surface for the operational system.

It should help users express problems clearly and understand status updates.
It should not replace the controlled workflow, approval, and audit layers behind the scenes.
