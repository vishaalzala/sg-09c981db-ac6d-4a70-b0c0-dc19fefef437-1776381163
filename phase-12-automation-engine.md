# Phase 12 — Automation Engine

## Goal
Scalable operational workflows.

## Rules examples
- trial ends in 3 days => send reminder
- payment failed => create alert + send email
- lead unassigned for 24h => assign sales queue
- company inactive for 14 days => create success task

## Suggested DB
- `automation_rules`
- `automation_runs`
- `automation_actions`
- `automation_failures`

## Safety
- dry-run mode
- per-rule enable toggle
- logs and retries
