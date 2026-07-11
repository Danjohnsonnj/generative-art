# Generative Art Canvas - Handoff

**Goal:** Build a programmable generative art canvas for organic, recursive, style-rich abstract art — modernist/ink/Bauhaus-inspired, not cheesy fractal kitsch.

**Current phase:** Phase 7 - Vector path
**Next action:** Start Slice 7.1 (`clean-vector` style) from `docs/_handoff/implementation-plan.md`: add `js/styles/clean-vector.js` and `test/clean-vector.test.js` with Canvas + SVG render paths and a deterministic SVG fixture. Honor the hard Phase 7 UAT after Slice 7.3.

**Hard invariants:** Preserve exact checkpoint rendering across engine evolution. The shipped tool has no build step and supports both solo exploration and agent-guided extension.

**Required reading (this phase):**

- docs/_handoff/lessons.md - reusable toolkit; reuse before re-deriving
- docs/_handoff/implementation-plan.md - approved plan; Phase 7 section names exact files/verify per slice
- docs/_handoff/tech-brief.md - style capabilities, true SVG vs raster-only, Geometry IR compatibility
- docs/extension-guide.md - agent extension entry; update when Phase 7 adds SVG export paths
- docs/_handoff/process.md - cold-start, extension, and commit discipline

**Index (load on demand):**

- product-brief.md - background, goals, rationale, non-goals, boundaries
- tech-brief.md - technical contracts, feasibility limits, and material risks
- phases.md - phases + per-phase verify steps
- implementation-plan.md - exact files, sequencing, and verification per Phase 4-10 slice
- process.md - how we work (read before committing)
- progress-log.md - dated history of decisions/learnings/overwrites
- lessons.md - curated, accreted toolkit (carried in Required reading)
- docs/extension-guide.md - extension mechanics (carried in Required reading for this phase)

**Open decisions:** None blocking. Chrome direction is approved and recorded in `lessons.md`. Phase 5 and Phase 6 hard UATs accepted 2026-07-11.
**Last updated:** 2026-07-11 after Phase 6 complete (Slices 6.1–6.3 + hard UAT accepted); next is Slice 7.1.
