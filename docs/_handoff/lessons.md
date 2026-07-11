# Lessons (reusable toolkit; accreted across sessions)

## Composition vs style split

- Context: Designing generative systems with multiple visual languages.
- Lesson: Keep structure/growth (recursion, flow, subdivision) separate from material rendering (ink stroke, wash layers, flat Bauhaus fills). Same composition can drive many styles.
- Evidence: Research synthesis from Hobbs watercolor essays + canvas-sketch / Paper.js roles; FormFlow mixes both and is harder to restyle.

## Determinism includes algorithm versions

- Context: Returning to a checkpoint after systems/styles evolve.
- Lesson: A seed and document schema version are insufficient. Route all randomness through a versioned PRNG and resolve exact system, style, and IR versions; never depend on viewport, clock, locale, or `Math.random()`.
- Evidence: Readiness review found that `schemaVersion` alone could not preserve an old rendered image; user requires exact reproduction.

## Normalize geometry before rendering

- Context: Matching screen, SVG, and print exports.
- Lesson: Generate normalized geometry once from revision state, then render it at the requested resolution without consuming additional randomness.
- Evidence: Readiness review identified viewport-dependent generation as a checkpoint/export divergence risk.

## No build does not mean file protocol

- Context: Personal tool, modern browsers only.
- Lesson: Native ES modules require HTTP(S) in current browsers. Serve the static files through Live Server or a one-command localhost server; do not promise double-click `file://` launch.
- Evidence: MDN module guidance and browser CORS behavior verified during readiness review.

## Checkpoints are immutable revisions

- Context: Branching iteration (checkpoint/fork/load) across evolving systems/styles.
- Lesson: Separate stable work identity, editable draft, immutable revision identity, revision parent, and fork source. Saving a checkpoint creates history; it does not overwrite history.
- Evidence: A lone `parentId` could not represent save/fork/return semantics.

## Dual persistence: browser library + JSON files

- Context: Personal tool, no backend, branching WIP workflow.
- Lesson: Keep an IndexedDB library for fast fork/load and JSON as the portable source of truth. Validate imports, preserve unknown optional fields, reject unsupported required versions visibly, and never overwrite an ID collision silently.
- Evidence: User decision 2026-07-10 (option C).

## Hybrid render for PNG + SVG

- Context: Need watercolor/tonal (raster-friendly) and true SVG export (vector-friendly).
- Lesson: Systems emit geometry; styles declare Canvas/SVG capabilities. Disable SVG with an explanation for raster-only styles; do not wrap pixels in SVG and call the result vector.
- Evidence: User decision 2026-07-10 (option C).

## Browser PNG DPI requires metadata rewriting

- Context: Framing-quality PNG export with requested physical dimensions.
- Lesson: Render the correct pixel dimensions, then patch/write the PNG `pHYs` chunk and CRC because Canvas `toBlob()` uses 96-DPI metadata. Estimate memory before allocating and test a declared print baseline.
- Evidence: MDN documents 96-DPI Canvas serialization; user requires pixels plus embedded DPI metadata.

## Presets as documents, free mix as destination (C→A)

- Context: User wants any system×style eventually, but curated starts now.
- Lesson: Ship presets as ordinary versioned artwork data. Design geometry IR for free mix from the start. Use temporary compatibility/fallbacks while styles expand — do not hardcode “looks” as the only composition model.
- Evidence: User decision 2026-07-10 (A end state; C→A path OK).

## Playground for human, modules for agent

- Context: Solo daily use and agent-guided growth.
- Lesson: Optimize UX for explore/checkpoint/fork/export. Keep systems/styles as schema-registered modules the agent adds; do not ship a user code editor. Everyday play must never require an agent.
- Evidence: User 2026-07-10 — guided agent-assisted extension vs explore existing combos without agent.

## A plan's self-check is not a substitute for independent review

- Context: `implementation-plan.md` shipped with its own "Plan-reference check" section asserting full `phases.md` coverage.
- Lesson: An author-written self-check tends to confirm what the author already believes is covered. Run an independent standalone review (fresh read against the source-of-truth bullets) before trusting a plan's own closing claim — it caught two real contract gaps (schema-value validation, migration fixtures) the self-check had missed.
- Evidence: `/review-plan` standalone pass on 2026-07-10 found the coverage gaps; a Reliability finding recommended (not yet built) a script diffing `phases.md` bullets against plan slices to catch this automatically on future edits.

## App chrome as a quiet instrument

- Context: Locking the interface direction after the first tonal renderer and before schema-driven controls.
- Lesson: Treat monochrome Teenage Engineering hardware as a visual metaphor, not an interaction model. Use a graphite chassis around a pale artwork stage, with a token-equivalent pale-aluminum light mode; neutral sans UI type; monospace only for readouts; flat panels, hairlines, tiny radii, and scarce semantic LED color. Keep familiar software controls with 44px targets. The control rack docks left/right and collapses to an edge peek in Phase 4; evaluate true free-floating panels in Phase 10.
- Evidence: User-approved chrome aesthetics gate, 2026-07-11.

## Desktop canvas is a sticky stage

- Context: The desktop control rail grows taller than the viewport, while the artwork must remain visible during page scroll.
- Lesson: At desktop widths only, make the header sticky and measure its rendered height with `ResizeObserver` into `--app-header-height`. Make the canvas workspace sticky below that offset, with height `calc(100dvh - var(--app-header-height))`, then center the frame via `place-content` and `place-items`. Do not apply this behavior on mobile before the floating-panel design work.
- Evidence: User UAT accepted 2026-07-11.

## Extension docs must phase-scope future contracts

- Context: Slice 4.11 extension guide initially described migration hooks, SVG capability, and full tech-brief verification as if they were live.
- Lesson: Keep the full contract in the guide, but label what Phase 4 actually enforces today versus what later phases introduce. Authoring conventions that are not runtime-enforced (for example `defaultParams` completeness) must say so, or agents invent loaders and checks that do not exist yet.
- Evidence: Independent review of `docs/extension-guide.md`, 2026-07-11; applied before Slice 4.11 UAT.

## UAT gates at contract and phase exits

- Context: Phases 5–10 already had phase-end UAT; Phase 4 also used mid-slice visual gates.
- Lesson: Keep phase-end UAT hard for Phases 5–9 and the Phase 10 release gate. Add only targeted mid-gates where UI would otherwise sit on an unproven contract (Phase 5: after bundle I/O before checkpoint UI). After checkpoint UI (5.5) and library UI (6.3), the agent runs the phase UAT script once in Chrome before asking the user to accept. Do not add a UAT after every validation-only slice.
- Evidence: User decision 2026-07-11; Phase 5 hard UAT accepted 2026-07-11.

## One-work Phase 5 UAT needs an exported source copy

- Context: Phase 5 keeps exactly one work in memory; IndexedDB arrives in Phase 6.
- Lesson: To prove the source revision is unchanged after forking/changing/exporting, export the source JSON before importing the changed fork, then re-import the source. Do not expect simultaneous open works until Phase 6.
- Evidence: Phase 5 hard UAT, 2026-07-11.

## Test-only IndexedDB must never touch the library

- Context: Browser persistence tests need destructive setup and teardown.
- Lesson: Keep the production and test databases separately named. Delete only `generative-art-canvas-v1-test` before and after tests; production uses `generative-art-canvas-v1`. Validate a complete snapshot before its write transaction, so a malformed import cannot partially alter persisted data.
- Evidence: Phase 6 Slice 6.1, 2026-07-11.
