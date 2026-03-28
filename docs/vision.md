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

A future implementation of this project would let a human operator work with an AI-powered IT team that feels more like a real operations org:

- helpdesk handles first-contact issues
- infra handles systems and cloud
- security handles risk and access questions
- incident leads handle outages
- documentation keeps decisions and runbooks coherent

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
