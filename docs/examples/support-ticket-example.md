# Example: Support Ticket Flow

## Scenario

A user reports that they cannot connect to the company VPN from their laptop.

## Example flow

1. **helpdesk-lead** classifies the issue as likely endpoint/network access
2. missing context is requested:
   - exact error
   - whether this is a new issue
   - whether other services work
3. request is handed to **vpn-specialist** under **network-lead**
4. vpn-specialist identifies likely client vs policy vs service-side fault domains
5. if identity policy may be involved, **iam-lead** is looped in
6. resolution or escalation is documented

## Why this example matters

It shows how one user symptom can cross:

- support
- network
- identity

without collapsing into a single vague assistant role.
