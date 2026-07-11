# Generative Art Canvas - Handoff

**Goal:** Build a programmable generative art canvas for organic, recursive, style-rich abstract art — modernist/ink/Bauhaus-inspired, not cheesy fractal kitsch.

**Current phase:** Phase 6 - Browser library (Slices 6.1–6.2 complete)
**Next action:** Start Slice 6.3 (library UI) from `docs/_handoff/implementation-plan.md`: add `js/ui/library-panel.js`, wire list/open/rename/delete and draft-vs-saved state into `js/main.js`, include delete confirmation and actionable import errors. Run the hard Phase 6 UAT after this slice and stop for user acceptance.

**Hard invariants:** Preserve exact checkpoint rendering across engine evolution. The shipped tool has no build step and supports both solo exploration and agent-guided extension.

**Required reading (this phase):**

- docs/_handoff/lessons.md - reusable toolkit; reuse before re-deriving
- docs/_handoff/implementation-plan.md - approved plan; Phase 6 section names exact files/verify per slice
- docs/_handoff/tech-brief.md - ArtworkRevision/ArtworkBundle, IndexedDB library, import isolation, and collision contracts
- docs/extension-guide.md - agent extension entry; update when Phase 6 adds library persistence paths
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

**Open decisions:** None blocking. Chrome direction is approved and recorded in `lessons.md`. Phase 5 hard UAT accepted 2026-07-11. Phase 6 hard UAT remains after Slice 6.3.
**Last updated:** 2026-07-11 after Slice 6.2: checkpoint thumbnails are green at 44 browser tests; next is Slice 6.3 and the Phase 6 hard UAT.
