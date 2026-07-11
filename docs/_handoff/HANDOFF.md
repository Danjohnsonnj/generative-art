# Generative Art Canvas - Handoff

**Goal:** Build a programmable generative art canvas for organic, recursive, style-rich abstract art — modernist/ink/Bauhaus-inspired, not cheesy fractal kitsch.

**Current phase:** Phase 8 - Second composition system
**Next action:** Start Slice 8.1 (`ink-growth` system) from `docs/_handoff/implementation-plan.md`: add `js/systems/ink-growth.js` and `test/ink-growth.test.js` with finite in-bounds geometry, measurable branch asymmetry across seeds, and IR shapes both v1 styles can render. Honor the hard Phase 8 UAT after Slice 8.2.

**Hard invariants:** Preserve exact checkpoint rendering across engine evolution. The shipped tool has no build step and supports both solo exploration and agent-guided extension.

**Required reading (this phase):**

- docs/_handoff/lessons.md - reusable toolkit; reuse before re-deriving
- docs/_handoff/implementation-plan.md - approved plan; Phase 8 section names exact files/verify per slice
- docs/_handoff/tech-brief.md - Geometry IR, style compatibility, anti-fractal art direction
- docs/extension-guide.md - agent extension entry; system registration and IR rules
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

**Open decisions:** None blocking. Chrome direction is approved and recorded in `lessons.md`. Phase 5, Phase 6, and Phase 7 hard UATs accepted 2026-07-11.
**Last updated:** 2026-07-11 after Phase 7 complete (Slices 7.1–7.3 + hard UAT accepted); next is Slice 8.1.
