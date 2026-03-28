# Hybrid Routing Model

## Purpose

This document describes how routing in `ai-it-team` should combine deterministic logic and AI-assisted interpretation.

The goal is to avoid two bad extremes:

- rigid routing that breaks on messy real-world language
- fully unconstrained AI routing that is difficult to trust, audit, or govern

## Core principle

Routing should be **hybrid**.

That means:

- rules handle clear, high-confidence, policy-sensitive cases
- AI helps interpret ambiguity, messy language, and cross-domain context
- policy validation constrains the final routing decision
- humans remain available as a fallback for low-confidence or risky cases

## Why hybrid routing is needed

Operational requests are often written in vague or incomplete language.

Examples:

- "my stuff is broken"
- "finance needs access to the admin thing tonight"
- "VPN seems weird again"
- "users are saying the app is down"
- "we need this changed urgently"

A rules-only system struggles with ambiguity.
An AI-only system may overfit, overreach, or route inconsistently.

A hybrid model gets the benefits of both approaches.

## Recommended routing layers

### Layer 1 — hard rules

Use deterministic rules for:

- obvious request categories
- known keywords with strong operational meaning
- explicit system-to-owner mappings
- policy-sensitive triggers
- mandatory approval cases

Examples:

- firewall rule change -> infrastructure change / systems or network path
- admin access -> access request / IAM path
- multiple users affected -> incident path
- privileged access + contractor -> approval-required path

This layer provides predictability and policy enforcement.

### Layer 2 — AI interpretation

Use AI when the request is:

- vague
- noisy
- underspecified
- conversational
- cross-domain
- contradictory

The AI can help produce:

- likely classification
- likely owner
- likely escalation path
- likely affected systems
- missing context questions
- a short rationale
- a confidence estimate

This layer improves understanding of messy real-world inputs.

### Layer 3 — policy validation

After AI makes a recommendation, the system should validate it against known rules.

Examples:

- privileged access requests must route through IAM even if AI is uncertain
- production-impacting change requests may require approval flags automatically
- sensitive requests may require security review regardless of AI confidence

This keeps policy in system logic rather than in model intuition.

### Layer 4 — human fallback

If the route is low-confidence, ambiguous, or high-risk, the system should not pretend certainty.

Fallback options:

- route to helpdesk or intake triage for clarification
- request missing information from the user
- escalate to a human operator
- mark the request as awaiting review

This keeps the system honest.

## What AI routing should and should not do

### Good AI routing behavior

- infer intent from messy language
- detect likely operational domain
- suggest escalation targets
- identify uncertainty
- recommend clarifying questions

### Bad AI routing behavior

- silently override hard policy
- invent approvals
- imply certainty when confidence is low
- bypass auditability
- route sensitive work without constraints

## What the routing output should look like

A useful routing result should be structured.

Example fields:

- classification
- owner
- escalation
- affected systems
- approvalNeeded
- confidence
- rationale
- missingContext

This allows the workflow layer to inspect and validate the output before changing state.

## Why this matters

Hybrid routing supports a more realistic product shape.

It allows the system to:

- handle natural human language
- preserve policy enforcement
- remain auditable
- stay robust when request quality is poor
- improve over time without handing complete control to the model

## Practical principle

In `ai-it-team`, routing should use AI where language is messy and rules where boundaries matter.

That is the most credible path toward a trustworthy operational system.
