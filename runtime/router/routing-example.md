# Routing Example

## Input request

"A user cannot connect to the company VPN from their laptop."

## Example classification

- request type: support issue
- likely domains: network, endpoint, identity
- likely initial owner: helpdesk-lead

## Example handoff path

1. `helpdesk-lead`
2. `network-lead`
3. `vpn-specialist`
4. `iam-lead` if identity/policy issues are suspected
5. `documentation-lead` after resolution

## Why this example matters

It demonstrates that the system should route based on likely fault domains rather than immediately pretending to know the answer.
