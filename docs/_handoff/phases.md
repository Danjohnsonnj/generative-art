# Phases

See [implementation-plan.md](implementation-plan.md) for the exact files, slice sequencing, and per-slice verification behind Phases 4-10 below.

## Phase 1 - Discovery

- Lock product requirements: user workflow, delivery, export, persistence, render, system×style path, v1 scope, dual solo/agent workflow, non-goals.
- Verify: critical open decisions closed; HANDOFF moves to readiness review. **Done 2026-07-10.**

## Phase 2 - Requirements readiness review

- Apply the approved completeness/feasibility findings to the handoff set; resolve localhost launch, exact revision identity, versioned algorithms, normalized rendering, SVG capability, print metadata/limits, tests, and extension contracts.
- Verify: all handoff links resolve; no current-truth contradictions; standalone quality-gate review has no blockers; HANDOFF moves to implementation planning. **Done 2026-07-10.**

## Phase 3 - Implementation planning

- Create a separate cold-start executable plan that names exact files, one implementation path, prerequisites, out-of-scope work, and deterministic verification for every increment below.
- Verify: plan-reference check passes; each increment leaves a runnable tool; user approves the plan before application code. **Done 2026-07-10: plan drafted, reviewed, and approved (implementation-plan.md).**

## Phase 4 - First playable study

- Add localhost-served shell, browser test page, versioned document/RNG/registry/normalized geometry contracts, `flow-field`, `ink-tonal`, schema-generated controls, starter preset **Flow · ink wash**, display PNG, and the initial `docs/extension-guide.md`.
- Automated verify: fixed revision produces a stable geometry fixture; registry/schema validation and display PNG dimensions pass.
- UAT: open the preset, distinguish regenerate from new seed, change controls, reset, and save a display PNG.

## Phase 5 - Portable checkpoint and fork loop

- Add work/draft/immutable-revision semantics, exact version resolution, fork lineage, JSON import/export, collision handling, and the corresponding extension-guide updates.
- Automated verify: checkpoint immutability, exact reload, fork lineage, migration fixtures, and JSON round-trip pass.
- Pre-UI gate: after bundle I/O (Slice 5.3) automated verify, smoke export→import/collision before building the checkpoint panel (Slice 5.5).
- Hard UAT (after checkpoint UI): checkpoint the preset, fork it, change the fork, export JSON, re-import as a new work, and return to the unchanged source. Agent runs once in Chrome; user must accept before Phase 6. **Done 2026-07-11: Slices 5.1–5.5 committed; hard UAT accepted.**

## Phase 6 - Browser library

- Add IndexedDB work/revision storage, previews, draft recovery, load/delete flows, confirmation, and actionable errors.
- Automated verify: create/load/revise/delete and failed-import isolation pass against a clean test database.
- Hard UAT (after library UI): maintain and reopen multiple WIPs without JSON files; destructive actions never occur silently. Agent runs once in Chrome; user must accept before Phase 7. **Done 2026-07-11: Slices 6.1–6.3 committed; hard UAT accepted.**

## Phase 7 - Vector path

- Add `clean-vector`, true SVG serialization, renderer capability UI, and system/style switching.
- Automated verify: deterministic SVG fixture is valid XML and contains vector geometry; SVG stays unavailable for a raster-only style.
- Hard UAT: switch the flow system to clean vector, export SVG, reopen it in a browser, and confirm the same composition.

## Phase 8 - Second composition system

- Add `ink-growth`, its parameter schema, intentional anti-fractal defaults, and rendering through both v1 styles.
- Automated verify: fixed seeds produce stable, finite geometry with no unsupported required IR types.
- Hard UAT: create and fork ink-growth works in both styles; confirm asymmetry, negative space, and non-binary-tree defaults.

## Phase 9 - Framing-quality print export

- Add offscreen high-resolution rendering, requested pixel dimensions, PNG `pHYs` metadata, sRGB/opaque paper behavior, memory guard, progress, and cleanup.
- Automated verify: 12 × 18 inches at 300 DPI exports 3600 × 5400 pixels with 300-DPI metadata.
- Hard UAT: export the baseline print from both v1 styles in all target browsers and inspect it in a metadata-aware image application.

## Phase 10 - v1 polish and cross-browser release

- Refine library/control/export UX, documentation, performance, and extension examples without changing locked behavior.
- Verify: all browser tests pass in current Safari, Chrome, and Firefox on macOS; complete solo-explore and agent-extension smoke flows from a cold start. This is the final hard v1 release gate.

## Post-v1 expansion direction

- Add subdivision system, watercolor-layer and midcentury-bold styles, and broader free-mix coverage through agent-guided extension sessions.
- Verify: new modules follow `docs/extension-guide.md`; old revisions remain exact; new controls require no bespoke UI.
