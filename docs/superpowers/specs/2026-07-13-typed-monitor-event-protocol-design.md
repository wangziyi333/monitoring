# Typed Monitor Event Protocol Design

## Goal

Strengthen the existing monitoring SDK so all four event categories (`custom`, `behavior`, `error`, and `performance`) enforce the relationship between `type`, `subType`, `name`, and `payload` at compile time.

## Design

`frontend/src/sdk/types/events.ts` owns a single `MonitorEventProtocol` mapping. Each event name maps to its allowed category, subtype, and payload shape. TypeScript mapped and indexed-access types derive the valid `track()` argument tuples and the discriminated `MonitorEvent` union.

The public call shape remains positional:

```ts
track(type, subType, name, payload)
```

This preserves the current collector API while rejecting mismatched event names, categories, subtypes, missing payload fields, and incorrect payload field types.

## Scope

- Register all currently emitted events in the protocol.
- Update `monitor.ts` and every collector/page call site to use the derived types.
- Keep queueing, batching, retry, local storage, Beacon, and server payload behavior unchanged.
- Keep runtime validation out of scope; untrusted server input validation belongs to a later governance phase.

## Verification

- Type-level invalid examples must fail during TypeScript checking.
- Existing valid collectors must compile unchanged in behavior.
- Run `npm run build` from `frontend` after migration.

