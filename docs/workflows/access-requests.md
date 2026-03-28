# Access Request Workflow

## Goal

Handle identity and access requests in a way that keeps approval and implementation clearly separated.

## Trigger

A request to add, change, remove, or validate access.

## Flow

1. **iam-lead** reviews request intent
2. required approvals are identified
3. missing identity or scope context is gathered
4. **iam-specialist** prepares implementation guidance
5. security review occurs where needed
6. outcome is documented

## Required outputs

- request summary
- target system or scope
- approval state
- implementation recommendation
- recorded outcome

## Human checkpoints

- when approval is missing
- when elevated privileges are involved
- when the request conflicts with policy or expected access norms
