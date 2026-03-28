# Escalation Model

## Why escalation matters

IT work frequently crosses boundaries of risk, scope, and authority.

A structured agent team must make escalation explicit so that:

- risky work does not get normalized
- uncertainty is surfaced early
- approvals are not silently bypassed
- specialists do not overstep their domain

## Escalation triggers

Typical escalation triggers include:

- destructive change potential
- production impact
- unclear ownership
- security-sensitive requests
- identity / access ambiguity
- missing context that changes risk
- conflicts between operational convenience and policy

## Escalation directions

### Specialist -> Lead

Use when:

- task exceeds specialist scope
- request spans multiple systems
- multiple implementation choices exist
- risk is moderate or unclear

### Lead -> Director

Use when:

- action has production-wide consequences
- request touches security-sensitive areas
- approval is required before proceeding
- domain leads disagree
- policy interpretation is needed

### Any role -> Human operator

Use when:

- approval is required
- credentials or secrets would be involved
- irreversible or high-blast-radius action is proposed
- the system lacks enough context to act safely

## Principle

Escalation should be treated as a sign of system quality, not failure.
A safe system escalates often enough to remain trustworthy.
