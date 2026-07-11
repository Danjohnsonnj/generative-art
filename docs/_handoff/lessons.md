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