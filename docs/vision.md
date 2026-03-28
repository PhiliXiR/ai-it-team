# Vision

## Problem

A single AI assistant can be useful for IT tasks, but it tends to become a role soup.

The same assistant may be asked to:

- triage support issues
- explain a VPN problem
- review firewall intent
- inspect logs
- suggest cloud changes
- draft documentation
- reason about security impact

That quickly collapses into a generalist blob with weak boundaries and inconsistent judgment.

## Proposed direction

`ai-it-team` explores a different model:

Treat IT work as a coordinated team of specialized agents with clear responsibilities.

Instead of one assistant doing everything, create a structured organization that can:

- route requests to the right specialist
- escalate risky work
- separate triage from implementation
- distinguish diagnosis from approval
- maintain clearer operational boundaries

## What success looks like

A stronger implementation of this project would let a human operator work with a structured, role-based AI support model for IT workflows such as:

- helpdesk intake and first-pass routing
- systems and infrastructure coordination
- security review and escalation
- incident handling
- documentation and runbook upkeep

The human remains accountable and authoritative.
The agents provide structure, speed, and domain-specific support.

## Why this matters

IT work is highly procedural, highly cross-functional, and often gated by approvals, risk, and documentation.

That makes it a strong candidate for multi-agent coordination — but only if the system is designed with:

- constraints
- role separation
- escalation rules
- public-safe examples
- human oversight

## Non-goals

This project is not trying to:

- fully automate production IT operations without humans
- encourage blind execution of risky commands
- replace security review
- replace organizational policy
- ship a magical universal sysadmin agent

The aim is to create a credible operational design, not a fantasy of unattended infrastructure control.
