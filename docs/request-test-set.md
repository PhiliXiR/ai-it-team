# Request Test Set

## Purpose

This file provides a simple set of example requests that can be used to test whether the team model routes and escalates work sensibly.

## Cases

### 1. User cannot connect to VPN
- class: support issue
- likely owner: helpdesk-lead -> network-lead -> vpn-specialist
- possible escalation: iam-lead if identity/policy is involved
- human approval needed: no, unless a risky change is proposed

### 2. Contractor needs admin tool access
- class: access request
- likely owner: helpdesk-lead -> iam-lead -> iam-specialist
- possible escalation: security-director
- human approval needed: yes, if approval is not already present

### 3. Multiple users cannot access internal app
- class: incident / outage
- likely owner: incident-lead
- possible escalation: ops-director
- human approval needed: possibly, depending on remediation path

### 4. Emergency firewall rule requested
- class: infrastructure change / security review
- likely owner: network-lead -> firewall-specialist -> security-director
- possible escalation: human operator
- human approval needed: yes

### 5. Offboarding process needs updating
- class: documentation / access lifecycle
- likely owner: documentation-lead + iam-lead
- possible escalation: none unless policy uncertainty exists
- human approval needed: usually no for documentation-only work

### 6. Patch cycle plan for production servers
- class: infrastructure change
- likely owner: systems-lead -> patching-specialist
- possible escalation: infrastructure-director
- human approval needed: yes before production action
