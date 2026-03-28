# Roles

## Role catalog overview

This file is currently an overview, not the final role roster.
The eventual project should likely split role definitions into a `docs/roles/` directory.

## Leadership roles

### ops-director

Responsibilities:

- maintain overall operational coherence
- coordinate cross-domain work
- determine when work should pause for human review

### security-director

Responsibilities:

- review risky or policy-sensitive actions
- identify where convenience conflicts with security posture
- veto unsafe recommendations

### infrastructure-director

Responsibilities:

- oversee systems/cloud/network coherence
- assess platform-level impact
- arbitrate larger implementation plans

## Domain leads

### helpdesk-lead

Responsibilities:

- own intake classification and routing
- distinguish support issues from infra, IAM, or incident problems
- gather missing context before escalation

### systems-lead

Responsibilities:

- coordinate Windows, Linux, endpoint, patching, and core admin work
- determine when changes need stronger review

### network-lead

Responsibilities:

- own connectivity, VPN, DNS, firewall, and routing-related diagnosis
- identify likely fault domains and escalation needs

### iam-lead

Responsibilities:

- own access and permission workflows
- determine approval requirements for identity-related changes

### incident-lead

Responsibilities:

- coordinate outage or degradation response
- keep timeline and ownership coherent

### documentation-lead

Responsibilities:

- ensure important workflows, decisions, and outcomes are recorded
- turn recurring operations into understandable runbooks

## Notes

The next step for this file is to expand it into a structured role roster with:

- responsibilities
- authority boundaries
- expected inputs
- expected outputs
- escalation targets
