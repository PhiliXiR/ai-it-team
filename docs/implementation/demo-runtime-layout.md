# Demo Runtime Layout

## Purpose

This document sketches what a public-safe demo implementation might look like.

## Suggested structure

```text
ai-it-team/
  README.md
  docs/
  agents/
  workflows/
  policies/
  templates/
  examples/
  runtime/
    router/
    prompts/
    logs/
    traces/
```

## Conceptual runtime pieces

### router
Responsible for classifying tasks and routing them to the right role.

### prompts
Holds role prompts/specs in a consistent format.

### traces
Stores structured workflow traces for evaluation.

### logs
Stores human-readable run logs or summaries.

## Principle

A demo runtime should emphasize:

- routing clarity
- traceability
- role separation
- safe public examples

Not maximum autonomy.
