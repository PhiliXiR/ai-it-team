# Roles

## Example role definitions

### helpdesk-lead

Owns initial request classification and routing.

Responsibilities:

- classify incoming issues
- determine whether a request is support, infra, identity, security, or incident-related
- gather missing context
- hand off to the right domain lead

### systems-lead

Owns workstation/server systems questions.

Responsibilities:

- coordinate endpoint, Windows, Linux, and patching work
- decide whether a request is routine or change-controlled
- escalate risky production actions

### network-lead

Owns network-related diagnosis and coordination.

Responsibilities:

- route VPN, firewall, DNS, routing, and connectivity issues
- identify likely fault domain
- separate user symptoms from network root cause hypotheses

### security-director

Acts as a safety and risk gate.

Responsibilities:

- review sensitive or risky changes
- distinguish operational convenience from acceptable security posture
- veto actions that violate constraints or policy

### documentation-lead

Owns knowledge preservation.

Responsibilities:

- turn outcomes into runbooks
- record decisions and changes
- keep recurring workflows understandable

## Notes

These are placeholders, not finalized prompts.
The public repo should define roles clearly before trying to over-specify agent behavior.
