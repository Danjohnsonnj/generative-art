# Generative Art Canvas - Handoff

**Goal:** Build a programmable generative art canvas for organic, recursive, style-rich abstract art — modernist/ink/Bauhaus-inspired, not cheesy fractal kitsch.

**Current phase:** Phase 4 - First playable study (Slices 4.1–4.9 done)
**Next action:** Start Slice 4.10 (Display PNG export) from `docs/_handoff/implementation-plan.md`. Add export logic and UI using the existing live canvas, then verify PNG signature and DPR-scaled dimensions before UAT.

**Hard invariants:** Preserve exact checkpoint rendering across engine evolution. The shipped tool has no build step and supports both solo exploration and agent-guided extension.

**Required reading (this phase):**

- docs/_handoff/lessons.md - reusable toolkit; reuse before re-deriving
- docs/_handoff/implementation-plan.md - approved plan; Phase 4 section names exact files/verify per slice
- docs/_handoff/tech-brief.md - technical contracts each slice must satisfy
- docs/_handoff/process.md - cold-start, extension, and commit discipline

**Index (load on demand):**

- product-brief.md - background, goals, rationale, non-goals, boundaries
- tech-brief.md - technical contracts, feasibility limits, and material risks
- phases.md - phases + per-phase verify steps
- implementation-plan.md - exact files, sequencing, and verification per Phase 4-10 slice
- process.md - how we work (read before committing)
- progress-log.md - dated history of decisions/learnings/overwrites
- lessons.md - curated, accreted toolkit (carried in Required reading)

**Open decisions:** None blocking. Chrome direction is approved and recorded in `lessons.md`.
**Last updated:** 2026-07-11 after Slice 4.9 UAT and accepted desktop sticky-stage correction
