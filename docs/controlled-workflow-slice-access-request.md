# Controlled Workflow Slice: Access Request

## Purpose

This document describes the first controlled workflow slice implemented in the runtime spine: an access-request path that moves beyond routing into review, approval creation, traceability, and artifact generation.

## Why this workflow

Access requests are a strong first controlled slice because they naturally require:

- clear request structure
- routing to the right owner
- scoped review behavior
- approval checkpoints
- auditability
- structured artifacts

This makes them a useful proving ground for a more realistic runtime.

## Flow summary

1. request enters the system
2. router classifies it as `access-request`
3. owner is assigned to `iam-lead`
4. the access review step is invoked
5. the review determines whether approval is needed
6. if needed, an approval record is created
7. an access review artifact is created
8. trace events are written for each step

## Runtime behavior

### Request intake
The request is stored as a durable object.

Additional useful fields for this workflow include:

- requester
- target system
- requested access
- justification
- whether manager approval is already provided

### Routing
The router sets the initial workflow direction:

- classification: `access-request`
- likely owner: `iam-lead`

### Access review
The review step acts like a controlled role-scoped worker for the IAM lead.

It evaluates:

- whether the request appears privileged
- whether approval is missing
- whether more context is needed
- whether the request can move toward implementation
- whether it should escalate or block on approval

### Approval creation
If the request is privileged or lacks required approval context, the system creates an explicit approval record and moves the request to `awaiting-approval`.

### Artifact generation
The system creates an `access-review-note` artifact containing the review summary and recommended next steps.

### Traceability
The system records trace events such as:

- request created
- request classified
- agent invoked
- agent completed
- approval created
- artifact created

## What this proves

This slice proves that the project can start moving from:

- request routing only

to:

- controlled workflow execution with durable state and explicit checkpoints

## Why it matters

This is the kind of transition that starts to make the project look like a real operational platform shape rather than only a visualization demo.
