# Generative Art Canvas - Handoff

**Goal:** Build a programmable generative art canvas for organic, recursive, style-rich abstract art — modernist/ink/Bauhaus-inspired, not cheesy fractal kitsch.

**Current phase:** Phase 6 - Browser library (implementation complete; UAT pending)
**Next action:** Run the Phase 6 hard UAT from `docs/_handoff/implementation-plan.md`: maintain and reopen multiple WIPs across a page reload without JSON files; confirm delete requires confirmation; import deliberately malformed JSON and verify the library is unchanged with an actionable error. Stop for user acceptance before Phase 7.

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

**Open decisions:** None blocking. Chrome direction is approved and recorded in `lessons.md`. Phase 5 hard UAT accepted 2026-07-11. Phase 6 hard UAT is ready for user acceptance.
**Last updated:** 2026-07-11 after Slice 6.3: browser library UI is green at 46 browser tests; next is the Phase 6 hard UAT.
