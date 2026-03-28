# Workflows

## Purpose

Workflows are where the organizational model becomes concrete.
The project should focus on repeatable, inspectable, cross-role workflows rather than isolated one-off prompts.

## Core workflow set

### 1. Support triage

Flow:

1. intake
2. classify issue
3. collect missing context
4. route to owning domain
5. document resolution

Primary owners:

- helpdesk-lead
- appropriate domain lead
- documentation-lead

### 2. Access / IAM changes

Flow:

1. request review
2. validate scope and intent
3. identify required approvals
4. generate safe implementation plan
5. record change and outcome

Primary owners:

- iam-lead
- iam-specialist
- security-director when needed

### 3. Incident response

Flow:

1. detect / receive report
2. assess severity
3. identify probable fault domain
4. assign lead
5. coordinate investigation
6. capture timeline and outcome

Primary owners:

- incident-lead
- incident-triage-specialist
- relevant domain leads

### 4. Infrastructure changes

Flow:

1. understand desired change
2. identify blast radius
3. review safety constraints
4. produce plan / rollback notes
5. require human approval where necessary
6. document result

Primary owners:

- systems-lead or cloud-lead
- relevant specialists
- infrastructure-director for broader impact

### 5. Documentation maintenance

Flow:

1. identify missing or stale docs
2. synthesize current workflow
3. produce structured documentation
4. flag assumptions and unknowns

Primary owners:

- documentation-lead
- runbook-writer
- change-log-specialist

## Related workflow docs

These workflows are further broken out in `docs/workflows/` for more concrete scenario-level detail, including:

- support triage
- access requests
- incident response
- change management
- documentation maintenance

## Current implementation note

The repository currently models these workflows through:

- role definitions
- workflow docs
- request examples
- prototype routing behavior
- scenario tests
- visualization in the local dashboard
