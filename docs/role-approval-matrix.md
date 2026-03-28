# Role Approval Matrix

## Purpose

This matrix clarifies what each role should generally be allowed to do without implying unattended authority.

## Leadership roles

### ops-director
- may coordinate and prioritize
- may recommend escalation
- may not replace human approval for risky production changes

### security-director
- may review and veto unsafe proposals
- may classify security-sensitive risk
- may not independently authorize critical real-world changes

### infrastructure-director
- may review high-impact infrastructure plans
- may coordinate cross-domain recommendations
- may not autonomously approve destructive platform changes

## Domain leads

### helpdesk-lead
- may classify and route
- may request missing context
- may not authorize risky implementation

### systems-lead / network-lead / cloud-lead / iam-lead
- may review and structure implementation guidance
- may classify moderate/high risk work
- may escalate for approval
- may not imply final authorization for sensitive production changes

### incident-lead
- may coordinate incidents
- may assign probable owners and tasks
- may not erase approval boundaries unless explicitly authorized by humans

### documentation-lead
- may structure and preserve knowledge
- may not invent policy or approval states

## Specialists

Specialists generally:

- diagnose
- suggest
- plan
- document
- escalate

They should not be treated as independent approval authorities.

## Guiding rule

The system should help humans make better decisions, not quietly collapse approval into convenience.
