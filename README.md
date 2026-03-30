# ai-it-team

ai-it-team is the lab where I explored AI-assisted IT workflows, request routing, approvals, traces, and human-readable control surfaces.

TrustPlane is the clearer control-plane direction that emerged from this work.

## What works today

- Prototype request router with a request corpus and router tests
- Local dashboard with visual mode, inspection mode, reversible timeline playback, and workflow/human/execution views
- Runtime-backed request state with trace, artifact, and approval objects plus one controlled workflow slice

## What is simulated today

- Backend systems are represented rather than integrated with real infrastructure
- Many timeline/traces are seeded to make the system legible and demoable
- Workflow coverage is still selective rather than broad or production-realistic

## What I am building next

- Small focused workflow slices that answer sharper learning questions
- Cleaner bridges between this lab work and the more operator-facing TrustPlane direction
- Better visual proof and demoability for the implemented runtime/control concepts

## Why this matters

ai-it-team is useful because it makes the control problem in AI-assisted IT work visible.
The interesting part is not just whether a model can classify a request. It is whether routing, ownership, approvals, traces, human checkpoints, and execution work can be represented in a way that feels inspectable instead of magical.

## Demo surface

### Screenshots / demo assets

_Add screenshots or GIFs here._

Recommended captures:

1. **Visual mode** — request flow and current focus
2. **Timeline playback** — workflow phase progression with back/step/pause controls
3. **Inspection mode** — request inspector, human involvement, and execution trace

## 5-minute demo path

1. Install deps and start the Python backend:
   ```bash
   npm install
   npm run api:python
   ```
2. In a second terminal, start the dashboard:
   ```bash
   npm run dashboard
   ```
3. Open `http://localhost:4411`
4. Start in **Visual Mode**
5. Select a seeded request and use **Step / Back / Pause / Resume** to walk through the timeline
6. Show **Current Focus**, **Current Workflow**, and the **Phase Timeline**
7. Open **Human Involvement** and **Execution Trace**
8. Switch to **Inspection Mode** and inspect request details, approvals, artifacts, and raw objects
9. Compare what is implemented now versus what remains seeded/simulated

## What this is

`ai-it-team` is an educational experiment and public prototype.

It explores how AI-assisted systems might help with things like:

- request routing
- ownership and handoffs
- approval-aware workflows
- traceability
- artifacts and summaries
- visible operational state
- human checkpoints and trust boundaries
- human-readable playback of workflow state over time

It is **not**:

- production-ready IT automation
- autonomous IT operations
- live control over real infrastructure
- a fully fledged product

## What exists right now

The project currently includes:

- public-safe IT org and workflow docs
- role definitions and agent specs
- a prototype request router
- a request test corpus and router test harness
- a local dashboard with visual and inspection modes
- an early API/runtime spine
- request, trace, artifact, and approval objects
- the beginnings of a human-facing Request Inspector view
- one controlled access-request workflow slice
- timeline-style playback of workflow, human, and execution steps
- seeded demo scenarios that emphasize trust checkpoints and action traces

## How to run it

### Recommended backend + dashboard flow

```bash
npm install
npm run api:python
```

Then in a second terminal:

```bash
npm run dashboard
```

Open:
- `http://localhost:4411`

Python API health:
- `http://127.0.0.1:4413/api/health`

### Node API (older parallel runtime path)

```bash
npm run api
```

Node API health:
- `http://localhost:4412/api/health`

### Router tests

```bash
npm run test:router
```

## Current project structure

- `docs/` - design notes, workflow docs, experiment framing, and migration ideas
- `api/` - early runtime spine for request state, traces, artifacts, approvals, and workflow endpoints
- `backend/` - FastAPI runtime prototype used by the current dashboard flow
- `agents/` - role specs
- `runtime/` - router and prompt prototype layer
- `tests/` - request corpus and router tests
- `dashboard/` - local visualization and inspection layer

## Relationship to TrustPlane

`ai-it-team` is the earlier lab/exploration.

It is where the structure around:
- routing
- approvals
- traces
- workflow playback
- human involvement
- inspectable operational state

became concrete enough to suggest a sharper follow-on direction.

That sharper direction is:
- **TrustPlane** — an operator-facing control layer for governed agent work

## Related reading

- AgentJournal article: **The control layer in AI-assisted IT operations**
- AgentJournal article: **Trust is the real adoption curve in AI-assisted IT operations**
- AgentJournal article: **The control plane starts at intake**

## Why this exists

The point of ai-it-team is not to claim that AI can run IT on its own.
The point is to explore what kinds of state, workflow structure, human checkpoints, and visibility have to exist before AI-assisted IT work becomes believable.
