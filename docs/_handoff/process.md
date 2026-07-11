# Process - how we work on this effort

Durable methodology. Read once per session before committing. Reached from HANDOFF.md.

**Adoption mode:** own-project

## Cold-start protocol

1. Start from HANDOFF.md — the explicit entry point you are pointed at directly; read it always (phase, next action, required reading).
2. Load ONLY the leaves under HANDOFF.md "Required reading (this phase)".
3. Pull any other leaf from the Index on demand.

## Two usage modes (product + agent)

### Solo explore (no agent)

User opens the static app, loads preset/WIP, tweaks schema-driven controls, forks/saves, exports. Must work fully without an agent session.

### Agent-guided extension (interview → implement → play)

Target development loop from the outset:

1. Cold-start agent reads HANDOFF + required leaves. After the first implementation increment, it then reads `docs/extension-guide.md` for registry, schema, geometry, and verification mechanics.
2. Interview-style discovery (like product Discovery): what to add or change (system, style, params, preset, export behavior).
3. Agent records the intended module IDs/versions, parameter controls, compatibility, migration impact, and acceptance checks before implementation.
4. Agent implements incrementally against the documented contracts (no build step), running browser tests and a UI smoke check after each slice.
5. User returns to the UI to experiment with the new controls; may fork from existing WIPs.
6. Session wrap-up updates handoff briefs/lessons when the user asks to hand off.

Do not assume every session is an extension — user may only want play advice or a bugfix.

## Update discipline

- HANDOFF.md alone owns current phase and next action.
- product-brief.md alone owns current product requirements and acceptance targets.
- tech-brief.md alone owns current technical decisions, contracts, and feasibility limits.
- phases.md alone owns delivery slicing and phase verification.
- progress-log.md holds HISTORY: append-only dated entries; never rewritten.
- lessons.md holds the CURATED TOOLKIT: reusable gotchas and script/verify outcomes; add when useful, prune when obsolete.
- Prefer links over restating current truth in multiple leaves.

## Readiness-to-plan gate

An implementation plan may be drafted only when:

1. product requirements and non-goals are testable
2. technical feasibility risks have one chosen path
3. state/version/migration and export contracts are explicit
4. delivery can be split into independently verifiable increments
5. cold-start required reading and future extension entry points are named
6. a standalone review finds no blocking Accuracy, Completeness, Precision, or Resumability issue

## Session-handoff ritual (user-initiated wrap-up)

1. Overwrite affected brief(s) in place.
2. Refresh HANDOFF.md (phase, next action, next-phase required reading, open decisions, last-updated).
3. Append a dated progress-log.md entry (happened / verified / learned / overwrote).
4. Fold any reusable gotcha or script/verify outcome into lessons.md (prune obsolete ones).
5. Commit per the active adoption mode below, only when the user asks.

## Adoption mode: own-project (default)

- Artifacts are tracked and committed normally alongside code.
- Do not commit `.DS_Store`; add repository ignore hygiene before the first requested commit.
