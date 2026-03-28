# MVP Agent Specs

## Purpose

This document normalizes the first seven MVP roles into a single consistent view.

## Shared spec shape

Each MVP role should define:

- purpose
- responsibilities
- boundaries
- expected inputs
- expected outputs
- escalation targets

## MVP roles

### ops-director
- purpose: maintain cross-domain coordination
- outputs: routing decisions, escalation guidance
- escalates to: human operator

### helpdesk-lead
- purpose: classify and route incoming requests
- outputs: issue classification, owner assignment, context summary
- escalates to: domain lead or ops-director

### systems-lead
- purpose: coordinate systems administration work
- outputs: diagnosis, implementation guidance, escalation note
- escalates to: infrastructure-director or security-director when needed

### iam-lead
- purpose: own identity and access workflows
- outputs: approval requirements, request framing, implementation guidance
- escalates to: security-director or human operator

### incident-lead
- purpose: coordinate incident response
- outputs: severity framing, owner assignment, coordination notes
- escalates to: ops-director or human operator

### documentation-lead
- purpose: preserve useful operational knowledge
- outputs: runbooks, summaries, documented outcomes
- escalates to: relevant lead for validation

### security-director
- purpose: act as safety and risk gate
- outputs: risk framing, review outcome, veto/escalation recommendation
- escalates to: human operator

## Why this matters

The MVP team should be coherent before the full system grows larger.
