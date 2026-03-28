# Minimal Experiment Plan

## Purpose

This document reframes `ai-it-team` as a lightweight educational experiment rather than a product roadmap.

The goal is to keep momentum high while keeping scope small enough to learn from each step.

## Core framing

This project is an exploration of how AI agents might assist parts of IT support and service workflows.

The main objective is learning, not completeness.

## Current focus areas

The project is currently most useful when it focuses on:

- request routing
- ownership and handoffs
- approval-aware workflows
- traceability and inspection
- the difference between model behavior and system control

## Questions worth answering next

### 1. Routing clarity

What request schema and routing format make workflow decisions easier to understand and inspect?

### 2. Minimal workflow state

What is the minimum set of request, trace, artifact, and approval state needed for one workflow to feel real?

### 3. Intake quality

What should a user-facing intake layer ask before routing becomes meaningfully better?

## Recommended next tiny experiments

### Experiment 1 — Routing clarity pass

Take a small corpus of requests and tighten:

- classification categories
- expected ownership
- missing context questions
- ambiguity handling

Goal:
learn where the current routing model is too fuzzy.

### Experiment 2 — One more workflow slice

Pick one additional narrow workflow such as:

- VPN support
- incident triage

Goal:
learn whether the runtime objects and approval patterns generalize beyond access review.

### Experiment 3 — Intake question design

Take a handful of vague requests and define:

- what the intake bot should ask
- what request object should result
- what can be answered immediately

Goal:
learn how much structure needs to be created before agents become useful.

## Scope guardrails

Avoid turning the project into:

- a broad platform rewrite
- a startup-style product build
- a giant multi-domain simulation
- a large role roster with shallow implementation

Prefer:

- one question at a time
- one workflow at a time
- one clear learning outcome per change

## Practical rule

Before expanding the project, ask:

**What specific thing am I trying to learn from this next step?**

If the answer is unclear, the next step is probably too broad.
