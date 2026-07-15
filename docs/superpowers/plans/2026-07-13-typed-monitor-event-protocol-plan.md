# Typed Monitor Event Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce every current monitoring event's `type`, `subType`, `name`, and `payload` combination at TypeScript compile time without changing runtime behavior.

**Architecture:** A central protocol map in `events.ts` is the source of truth. Mapped and indexed-access types derive the allowed `track()` tuples and the discriminated stored-event union; collectors keep their current positional calls, while queue and sender behavior remain untouched.

**Tech Stack:** Vue 3, TypeScript 6, vue-tsc, Vite

---

### Task 1: Add a failing compile-time contract test

**Files:**
- Create: `frontend/src/sdk/types/events.type-test.ts`

- [ ] **Step 1: Add valid and invalid calls**

Import `track` and `MonitorEventType`. Include one valid `manual_button_click` call, then calls annotated with `@ts-expect-error` for a mismatched category, a missing `label`, and a numeric `label`.

- [ ] **Step 2: Verify the test fails before implementation**

Run: `npm run build` in `frontend`

Expected: FAIL because at least the category and payload assertions report an unused `@ts-expect-error`; the current signature accepts those invalid combinations.

### Task 2: Implement the central protocol and derived event types

**Files:**
- Modify: `frontend/src/sdk/types/events.ts`
- Modify: `frontend/src/sdk/core/monitor.ts`

- [ ] **Step 1: Define the complete protocol**

Add `MonitorEventProtocol` entries for all current custom, behavior, error, and performance event names. Each entry contains literal `type`, literal `subType`, and its exact payload object.

- [ ] **Step 2: Derive valid argument tuples**

Derive `MonitorEventName` and a mapped `TrackArgs` union whose members have this shape:

```ts
[
  type: MonitorEventProtocol[TName]['type'],
  subType: MonitorEventProtocol[TName]['subType'],
  name: TName,
  payload: MonitorEventProtocol[TName]['payload'],
]
```

- [ ] **Step 3: Derive the stored event union**

Keep common fields in a shared interface, then derive `MonitorEvent` as a discriminated union over every protocol key so `name` continues to determine `type`, `subType`, and `payload` after queueing.

- [ ] **Step 4: Apply `TrackArgs` to `track()`**

Change `track()` to destructure a rest parameter typed as `TrackArgs`. Construct the event with the same `id`, timestamp, context, and queue behavior as before.

- [ ] **Step 5: Run the type test**

Run: `npm run build` in `frontend`

Expected: PASS unless an existing collector exposes an inaccurate payload definition; fix only protocol/call-site mismatches, not queue or sender behavior.

### Task 3: Verify all collectors and clean the change

**Files:**
- Verify: `frontend/src/pages/TrackingLabPage.vue`
- Verify: `frontend/src/sdk/collectors/click.ts`
- Verify: `frontend/src/sdk/collectors/route.ts`
- Verify: `frontend/src/sdk/collectors/dwell.ts`
- Verify: `frontend/src/sdk/collectors/error.ts`
- Verify: `frontend/src/sdk/collectors/promise.ts`
- Verify: `frontend/src/sdk/collectors/resource.ts`
- Verify: `frontend/src/sdk/collectors/performance.ts`

- [ ] **Step 1: Confirm every call is represented exactly once**

Run: `rg -n "\\btrack\\(" frontend/src -g '*.ts' -g '*.vue'`

Expected: all production calls use an event combination present in `MonitorEventProtocol`; the only additional calls are compile-time tests.

- [ ] **Step 2: Run final verification**

Run: `npm run build` in `frontend`

Expected: vue-tsc and Vite both complete successfully with no type errors.

- [ ] **Step 3: Review the scoped diff**

Run: `git diff --check` and inspect only the protocol, `track()` signature, type test, and necessary collector type corrections. Preserve all pre-existing user changes.

