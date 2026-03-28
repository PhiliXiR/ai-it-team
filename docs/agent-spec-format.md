# Agent Spec Format

## Purpose

This document describes a possible public-safe format for defining future agent roles.

## Suggested fields

Each agent spec should eventually define:

- `name`
- `tier`
- `domain`
- `purpose`
- `responsibilities`
- `boundaries`
- `expected_inputs`
- `expected_outputs`
- `escalation_targets`
- `approval_notes`

## Example shape

```yaml
name: helpdesk-lead
tier: lead
domain: support
purpose: Owns intake classification and routing.
responsibilities:
  - classify incoming issues
  - gather missing context
  - route to the correct domain
boundaries:
  - does not authorize risky production change
  - does not silently assume security authority
expected_inputs:
  - user report
  - available context
expected_outputs:
  - issue classification
  - routing recommendation
escalation_targets:
  - ops-director
  - systems-lead
approval_notes:
  - human approval required for production-impacting actions
```

## Notes

This format is meant to encourage consistency and auditability.
It should stay simple enough to read, diff, and review in a public repo.
