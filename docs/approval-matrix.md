# Approval Matrix

## Goal

This matrix defines which kinds of work should be:

- suggested only
- reviewed by a lead
- reviewed by a director
- approved by a human

## Baseline categories

### Low-risk

Examples:

- documentation cleanup
- request classification
- runbook drafting
- non-sensitive troubleshooting guidance

Default:
- agent can suggest
- no elevated approval needed for documentation-only output

### Moderate-risk

Examples:

- change planning
- IAM recommendations
- infrastructure diagnosis
- patching recommendations
- remediation plans

Default:
- lead review recommended
- human approval required before real execution in production

### High-risk

Examples:

- firewall changes
- broad IAM modifications
- destructive system actions
- major infra reconfiguration
- security-sensitive remediations

Default:
- director review
- human approval mandatory
- no autonomous execution

### Critical-risk

Examples:

- actions affecting many users or systems
- irreversible destructive operations
- emergency incident actions with uncertain blast radius
- anything involving secrets, keys, or privileged trust anchors

Default:
- human-led only
- agents may assist with planning, impact framing, and documentation
- no autonomous execution path

## Principle

The public design should make it easy to see that this system is assistance-first, not blind-automation-first.
