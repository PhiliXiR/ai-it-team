# Team Structure

## Overview

The proposed structure mirrors a real IT / operations organization.

The point is not to create as many roles as possible.
The point is to create enough separation that work can be routed intelligently without collapsing into a single generalist blob.

## Tier 1 — Leadership / Control

### ops-director
Owns overall operational coherence.

### security-director
Owns security posture review, risk elevation, and policy-sensitive oversight.

### infrastructure-director
Owns broad systems / platform direction across cloud, systems, and core infrastructure work.

These roles:

- maintain cross-domain priorities
- resolve conflicts
- enforce quality and safety gates
- determine when a task should stop and wait for human approval

## Tier 2 — Domain Leads

- **helpdesk-lead**
- **systems-lead**
- **network-lead**
- **cloud-lead**
- **iam-lead**
- **incident-lead**
- **documentation-lead**

These roles:

- own a functional area
- interpret requests within domain context
- coordinate specialists
- escalate when work exceeds authority or risk tolerance

## Tier 3 — Specialists

Potential specialists include:

- endpoint-tech
- windows-admin
- linux-admin
- m365-specialist
- google-workspace-specialist
- vpn-specialist
- firewall-specialist
- backup-specialist
- monitoring-specialist
- patching-specialist
- iam-specialist
- onboarding-offboarding-specialist
- incident-triage-specialist
- runbook-writer
- change-log-specialist

## Structural rules

- specialists do not silently assume lead authority
- leads do not silently assume director approval authority
- security-sensitive work should be reviewable by security leadership
- documentation should be a first-class function, not an afterthought

## Why this structure

This separates:

- intake from implementation
- implementation from approval
- execution from documentation
- operations from security oversight

That is essential if this project is going to feel credible.
