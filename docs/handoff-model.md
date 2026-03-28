# Handoff Model

## Purpose

A multi-agent IT team only works if work can move cleanly between roles.

That requires handoffs to include enough context to avoid forcing each new role to rediscover the problem from scratch.

## Minimum handoff contents

A good handoff should include:

- request summary
- current known facts
- missing facts
- current hypothesis or classification
- risk notes
- recommended next owner

## Example handoff shapes

### Helpdesk -> Systems

- user cannot access device
- basic checks completed
- likely endpoint or policy issue
- no sign of broader incident yet

### Helpdesk -> IAM

- access request or permission issue
- identity of requester known
- requested target system identified
- approval state unclear or pending

### Systems -> Security

- request may require elevated access
- current action may conflict with policy
- security review needed before change plan proceeds

### Incident triage -> Incident lead

- outage symptoms collected
- likely affected scope identified
- confidence still low
- coordination needed across domains

## Design principle

Handoffs should preserve clarity and reduce duplicated reasoning.
The system should reward concise, structured transfer of work.
