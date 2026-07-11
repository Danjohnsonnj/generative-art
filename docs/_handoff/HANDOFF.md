# Generative Art Canvas - Handoff

**Goal:** Build a programmable generative art canvas for organic, recursive, style-rich abstract art — modernist/ink/Bauhaus-inspired, not cheesy fractal kitsch.

**Current phase:** Phase 5 - Portable checkpoint and fork loop
**Next action:** Start Slice 5.1 (Document model) from `docs/_handoff/implementation-plan.md`. Add `js/core/document.js` that builds and validates `ArtworkRevision` per the `tech-brief.md` schema, with `test/document.test.js` covering accept/reject paths for required fields and unsupported versions.

**Hard invariants:** Preserve exact checkpoint rendering across engine evolution. The shipped tool has no build step and supports both solo exploration and agent-guided extension.

**Required reading (this phase):**

- docs/_handoff/lessons.md - reusable toolkit; reuse before re-deriving
- docs/_handoff/implementation-plan.md - approved plan; Phase 5 section names exact files/verify per slice
- docs/_handoff/tech-brief.md - ArtworkRevision/ArtworkBundle, exact reproduction, and migration contracts
- docs/extension-guide.md - agent extension entry; update when Phase 5 adds checkpoint/bundle/migration paths
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

**Open decisions:** None blocking. Chrome direction is approved and recorded in `lessons.md`.
**Last updated:** 2026-07-11 after Phase 4 complete (Slices 4.1–4.11 UAT accepted and committed)
