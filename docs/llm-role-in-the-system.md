# LLM Role in the System

## Purpose

This document explains where LLMs fit inside `ai-it-team`, how individually spawned agents would work, and how they should interact with routing, workflow state, approvals, escalation, and artifacts.

The goal is to place LLMs inside a bounded operational architecture, not to treat them as the entire system.

## Core principle

In `ai-it-team`, the LLM is not the system of record.
The LLM is a reasoning and drafting component inside a broader stateful runtime.

That means:

- the API layer owns persistent state
- the workflow layer owns lifecycle transitions
- the approval layer owns human checkpoints
- the dashboard owns visualization
- the LLM helps interpret, recommend, summarize, and draft

## What an individual spawned agent is

An individual spawned agent should be understood as a **role-scoped reasoning worker**.

Examples:

- `helpdesk-lead`
- `network-lead`
- `vpn-specialist`
- `iam-lead`
- `incident-lead`
- `documentation-lead`

A spawned agent is not a fully independent authority. It is a temporary or scoped worker process that receives:

- a role
- a bounded task
- current request context
- relevant trace history
- relevant policies or workflow rules
- explicit output expectations

It returns structured outputs back into the system.

## How spawned agents fit into the flow

A typical runtime path would look like this:

1. a request enters through the intake layer
2. routing identifies likely owner and possible escalation path
3. the workflow layer creates or updates request state
4. the system spawns the current owning role as an agent task
5. that role-scoped agent receives bounded context
6. the agent produces a structured output
7. the workflow layer stores the result, updates trace history, and decides whether to continue, escalate, pause, or request approval

This keeps the agent inside the workflow rather than letting it become the workflow.

## What data a spawned agent should ingest

A spawned role should not receive unlimited context.
It should receive the minimum context needed to do its job well.

### Typical agent input bundle

- request id
- request type
- request summary
- raw request text
- current owner
- prior routing decision
- trace history relevant to the current stage
- known affected systems
- missing context list
- approval requirements known so far
- role spec / prompt
- expected output schema

### Why bounded ingestion matters

If every agent receives the full universe, role boundaries collapse.
The system becomes harder to reason about and easier to overclaim.

Bounded inputs make it easier to preserve:

- role separation
- traceability
- reproducibility
- safer behavior

## What individual agents should do

Spawned agents should perform role-appropriate reasoning tasks.

### Good tasks for a spawned agent

- summarize the problem from its domain perspective
- identify likely causes or risk factors
- suggest the next owner or escalation target
- request missing context
- draft a handoff note
- produce a domain-specific artifact
- flag uncertainty
- identify when human review is required

### Bad tasks for a spawned agent

- silently approve sensitive work
- rewrite workflow state without API involvement
- invent authority it was not given
- execute risky actions outside approval policy
- operate without trace generation

## How decisions should be made

A spawned agent can make **recommendations** and produce **structured findings**.
Final operational state changes should happen through the workflow/API layer.

That means the runtime should separate:

### Agent output

Examples:

- likely classification
- likely owner
- likely escalation
- recommended next action
- missing context questions
- suggested artifact content
- confidence / uncertainty note

### System decision

Examples:

- update request owner
- change workflow status
- create approval record
- create artifact record
- mark request blocked
- resolve request

This separation keeps the system inspectable.

## How escalation should work

Escalation should not be a vague conversational gesture.
It should be an explicit transition.

### Agent-side escalation behavior

A spawned agent may return:

- `escalationRecommended: true`
- `escalationTarget: vpn-specialist`
- `escalationReason: identity policy ambiguity`

### System-side escalation behavior

The workflow layer should then:

- validate the target
- record the escalation event in the trace
- update the request state
- assign or spawn the next role
- preserve the prior handoff context

This is how escalation becomes a real part of the runtime instead of just text in a transcript.

## How handoffs should work

A handoff is a structured transfer between roles.

A good handoff should include:

- what was reviewed
- what is known
- what is uncertain
- why ownership is moving
- what the next role should inspect
- whether approval or human review may be needed

The agent may draft the handoff, but the workflow layer should store it as a structured artifact or trace event.

## How approval-aware behavior should work

Spawned agents should be able to identify when approval is needed.
They should not claim that approval already exists unless the system state says so.

### Example

An `iam-lead` agent may conclude:

- request involves privileged access
- manager approval is missing
- security review is required

The system should then:

- create an approval record
- set request status to `awaiting-approval`
- block sensitive next actions
- notify the appropriate human or role

This is much safer than allowing the agent to improvise authority.

## How artifact generation fits in

Agents are especially useful for generating artifacts.

Possible artifacts:

- triage summary
- access review note
- incident summary
- change plan draft
- handoff note
- runbook update draft

The artifact should be stored as a first-class object linked to:

- request id
- producing role
- creation time
- trace events

That gives the system useful outputs beyond routing decisions.

## Recommended agent output shape

Each spawned role should ideally return something structured.

Example shape:

```json
{
  "summary": "Likely VPN connectivity issue affecting a single user.",
  "recommendedNextAction": "Escalate to vpn-specialist for client/policy review.",
  "recommendedOwner": "vpn-specialist",
  "escalationRecommended": true,
  "escalationReason": "Likely network or policy fault domain.",
  "missingContext": [
    "Exact VPN error message",
    "Whether other users are affected"
  ],
  "approvalNeeded": false,
  "artifactDraft": {
    "type": "triage-summary",
    "content": {
      "scope": "single user",
      "domain": "network",
      "nextStep": "specialist review"
    }
  }
}
```

The workflow layer can then validate and persist what it needs.

## How different roles would behave

### helpdesk-lead

Focus:

- intake understanding
- request classification
- missing context gathering
- first owner assignment recommendation

Typical outputs:

- classification suggestion
- missing info questions
- owner recommendation
- triage artifact draft

### network-lead / vpn-specialist

Focus:

- domain-specific fault framing
- narrowing likely causes
- escalation to IAM or systems if needed
- producing support or incident handoff notes

Typical outputs:

- likely fault domain
- next diagnostic step
- escalation recommendation
- resolution or handoff note draft

### iam-lead / iam-specialist

Focus:

- access scope clarity
- approval requirements
- privilege sensitivity
- implementation recommendation

Typical outputs:

- approval-needed signal
- security-review recommendation
- access review artifact draft

### incident-lead / incident-triage-specialist

Focus:

- scope and severity framing
- multi-owner coordination
- keeping the response trace coherent

Typical outputs:

- severity suggestion
- owner coordination note
- incident summary draft

### documentation-lead / runbook-writer

Focus:

- preserving reusable knowledge
- translating operational outcomes into durable docs

Typical outputs:

- runbook update draft
- resolution summary
- change log draft

## How the LLM should be called

The LLM should sit behind role-specific services.

Examples:

- routing-service
- handoff-service
- artifact-service
- summarization-service

Those services should:

1. assemble bounded context
2. call the model
3. parse structured output
4. validate required fields
5. store approved data in system state
6. append trace events

This is better than letting agents operate as invisible free-form conversations.

## What the LLM should not own

The LLM should not own:

- request persistence
- approval records
- final workflow state transitions
- audit history
- authorization policy
- hidden long-term memory of the system

Those belong to the API/storage/runtime layers.

## Failure mode to avoid

The main failure mode is letting individually spawned agents become unbounded mini-systems.

That happens when:

- they ingest too much context
- they mutate state informally
- they decide approvals implicitly
- they produce output without schemas
- their reasoning is not reflected in trace state

The fix is to keep them role-scoped, bounded, and state-coupled.

## Practical principle

In `ai-it-team`, spawned agents should behave like specialized workers in a controlled runtime.

They ingest bounded task context.
They produce structured outputs.
They recommend, summarize, escalate, and draft.
The system records what happened.
Humans remain authoritative where risk or policy is involved.

That is how LLMs make the system more capable without making it less trustworthy.
