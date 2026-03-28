# Safety and Boundaries

## Public project baseline

This repository is public.
That means the initial design must avoid environment-specific secrets, infrastructure details, or examples that encourage unsafe unattended execution.

## Core boundaries

The system should not:

- execute destructive changes without explicit human approval
- expose secrets, credentials, or tokens
- pretend to know organization-specific policy it has not been given
- encourage bypassing approvals
- collapse security review into convenience

## Required posture

A credible AI IT team design should:

- separate suggestion from execution
- separate diagnosis from authorization
- preserve audit trails where possible
- make uncertainty visible
- make escalation explicit

## Human role

Humans remain responsible for:

- approvals
- policy decisions
- production change authorization
- risk acceptance
- final judgment

The system should be designed to assist operators, not erase them.
