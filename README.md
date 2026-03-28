# ai-it-team

A public framework for turning one agent session into a structured AI-powered IT operations team.

## What this is

`ai-it-team` is an attempt to model a real-world IT department as a coordinated multi-agent system.

Instead of one general-purpose assistant handling everything from password resets to firewall rules to incident triage, the idea is to give the system the structure of an actual IT / ops organization:

- clear roles
- escalation paths
- domain boundaries
- coordination rules
- quality gates
- documentation expectations

The goal is not to remove humans from IT work.
The goal is to make agent-assisted IT work more organized, more auditable, and less chaotic.

## Core idea

This project explores what happens when you apply the same multi-agent / org-chart approach people are using for software teams to:

- helpdesk
- systems administration
- network operations
- cloud / infrastructure
- security
- identity and access management
- incident response
- documentation and change control

## Repository goals

This repository is intended to become:

- a public design for an AI-powered IT team structure
- a documentation set for roles, workflows, and quality gates
- a starting point for a future implementation
- a reference point for people exploring agent-assisted operations work

## Current state

Right now this repo is focused on documentation and system design.

That means:

- defining the team structure
- defining agent roles
- defining escalation and approval flows
- defining the kinds of IT work the system should and should not handle
- identifying what a public-safe initial implementation would look like

## Initial docs

- `docs/vision.md`
- `docs/team-structure.md`
- `docs/roles.md`
- `docs/workflows.md`
- `docs/safety-and-boundaries.md`
- `docs/public-repo-scope.md`
- `docs/roadmap.md`

## Design principles

- structure beats prompt soup
- agents need role boundaries
- ops work needs approvals and auditability
- public examples should stay environment-neutral
- practical workflows matter more than abstract hype

## Status

Early design phase.
