# Golden Path: VPN Support Request

## Scenario

A user reports that they cannot connect to the company VPN from their laptop.

## Step 1 — Intake

**Owner:** helpdesk-lead

Expected actions:
- classify as a support issue
- request missing context if needed
- identify likely fault domains

Expected output:
- support classification
- concise context summary
- route to network-lead

## Step 2 — Domain review

**Owner:** network-lead

Expected actions:
- review likely causes
- decide whether the issue looks like VPN, DNS, routing, endpoint, or identity policy
- hand off to vpn-specialist

Expected output:
- narrowed hypothesis set
- specialist assignment

## Step 3 — Specialist analysis

**Owner:** vpn-specialist

Expected actions:
- frame likely technical cause
- identify whether identity or policy overlap exists
- recommend next diagnostic or remediation step

Expected output:
- technical hypothesis
- remediation guidance
- escalation recommendation if IAM overlap is suspected

## Step 4 — Possible identity escalation

**Owner:** iam-lead (if needed)

Expected actions:
- review whether the issue is tied to access or identity policy
- identify whether approvals or access state are relevant

Expected output:
- identity-related clarification
- next-step recommendation

## Step 5 — Documentation

**Owner:** documentation-lead

Expected actions:
- capture the resolution path
- note recurring patterns worth preserving

Expected output:
- resolution note or runbook improvement

## Why this is a good golden path

It demonstrates:

- intake
- routing
- specialist handoff
- optional escalation
- artifact creation

This is exactly the kind of workflow the system should do well.
