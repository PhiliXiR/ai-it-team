# Example: Access Request Flow

## Scenario

A team lead requests elevated access for a staff member to an internal admin tool.

## Example flow

1. **helpdesk-lead** routes the request to **iam-lead**
2. **iam-lead** checks whether the target system and access type are clearly identified
3. missing approval context is requested if necessary
4. **iam-specialist** prepares the implementation recommendation
5. **security-director** is consulted if the access level is sensitive
6. the result is documented

## Why this example matters

It highlights the separation between:

- intake
- approval
- implementation
- security oversight
