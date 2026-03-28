# Operating Model

## Core premise

`ai-it-team` is based on the idea that IT work benefits from structured specialization.

A useful AI-assisted IT system should not behave like one generic assistant that answers every question and executes every task. It should behave more like a coordinated team with:

- defined responsibilities
- explicit handoffs
- escalation paths
- approval boundaries
- audit-minded behavior

## Human role

Humans remain the decision-makers for:

- production changes
- policy interpretation
- approval of risky actions
- risk acceptance
- final operational judgment

The system is intended to support operators, not replace them.

## Work types

The model is best suited to work that falls into repeatable operational categories:

- support triage
- access requests
- endpoint / systems administration
- network troubleshooting
- cloud / infra changes
- incident coordination
- runbook and documentation upkeep

## Core behavioral model

Each unit in the team should be able to:

1. understand its lane
2. identify when a task belongs elsewhere
3. gather missing context
4. produce a recommendation or plan
5. escalate when approval or specialized review is required

## Required qualities

A credible system should be:

- structured
- inspectable
- conservative around risk
- explicit about uncertainty
- resistant to role bleed

## Failure mode to avoid

The main failure mode is role collapse.

That happens when:

- triage becomes implementation
- implementation becomes approval
- security becomes an afterthought
- documentation is never updated
- every agent acts like a generalist with too much authority

This project exists to prevent that failure mode through design.
