# Progress log (append-only, newest last)

## 2026-07-10 - Session 1: Plan-build init + discovery kickoff

- Happened: Created `docs/_handoff/` (own-project). Captured product vision: programmable organic recursive generative art across multiple styles (vector, watercolor-like, tonal, 50s modern, etc.), inspired by modernists / Japanese ink / cubism / Bauhaus; explicitly avoid cheesy 90s fractal aesthetics. Researched reference landscape (canvas-sketch, p5.js, Paper.js, Hobbs-style flow fields & layered washes, fxhash-style seeded params as pattern not product).
- Verified: Repo is effectively empty (README stub only).
- Learned: Strongest adjacent tools separate “sketch runtime + export” (canvas-sketch) from “organic composition techniques” (flow fields, recursive deformation, L-systems, subdivision). A useful product split is composition vs style/material rendering.
- Overwrote: N/A (initial create).

## 2026-07-10 - Session 1b: Workflow + delivery constraints

- Happened: Locked audience (solo), authoring model (agent writes all code), UI-required playground-first workflow, no build system, modern-browser-only.
- Verified: none (decision lock only).
- Learned: User’s “B maybe C” resolves cleanly: playground UI for the human; “programmability” means agent-authored systems/modules behind the UI, not a user code editor.
- Overwrote: product-brief.md (goal/workflow/non-goals), tech-brief.md (no-build constraints), HANDOFF.md (next action + open decisions).

## 2026-07-10 - Session 1c: Export + checkpoint/schema

- Happened: Locked stills-only; export PNG (display), print PNG (size+DPI), SVG. Locked iteration as first-class (save/fork/checkpoint/load WIP). Agreed direction: versioned schema/config documents with per-system param schemas for dynamic UI.
- Verified: none (decision lock only).
- Learned: “Programmability” for this user is largely **document + module registry** — not a code editor. Fork lineage (`parentId`) matters for exploration.
- Overwrote: product-brief.md, tech-brief.md (draft ArtworkDocument), HANDOFF.md, lessons.md.

## 2026-07-10 - Session 1d: Persistence = both

- Happened: Locked persistence C — in-browser WIP library + JSON import/export (JSON as portable source of truth).
- Verified: none (decision lock only).
- Learned: none new.
- Overwrote: product-brief.md, tech-brief.md, HANDOFF.md (next action → render target / styles / v1 scope).

## 2026-07-10 - Session 1e: Hybrid render

- Happened: Locked render target C — hybrid (geometry IR → Canvas and/or SVG per style; PNG always; SVG when style is vector-true).
- Verified: none (decision lock only).
- Learned: Reinforces composition vs style split already in lessons.md.
- Overwrote: product-brief.md, tech-brief.md, HANDOFF.md (next action → style–system relationship + v1 scope).

## 2026-07-10 - Session 1f: System×style = C→A

- Happened: Locked end-state free mix (A) with ship path C→A (presets first, IR aimed at universal pairing; transitional fallbacks OK).
- Verified: none (decision lock only).
- Learned: Presets must be data (documents), not a separate architecture — otherwise C→A becomes a rewrite.
- Overwrote: product-brief.md, tech-brief.md, HANDOFF.md, lessons.md.

## 2026-07-10 - Session 1g: v1 modules locked

- Happened: Locked v1 systems flow-field + ink-growth; styles clean-vector + ink-tonal. Recorded expansion backlog (subdivision; watercolor-layers; midcentury-bold) as confirmed future direction.
- Verified: none (decision lock only).
- Learned: User likes the full menu — expansion list is intentional roadmap, not discarded ideas.
- Overwrote: product-brief.md, tech-brief.md, phases.md, HANDOFF.md (next: starter preset, then Planning).

## 2026-07-10 - Session 1h: Discovery closed; dual workflow + Planning draft

- Happened: Locked starter preset **Flow · ink wash**. Locked dual usage: solo UI explore (no agent) AND agent-guided extension interviews (cold-start understands system/state/how to extend → implement → user plays with new controls). Moved phase to Planning; drafted architecture + vertical-slice plan in tech-brief.md.
- Verified: Discovery open questions cleared.
- Learned: “Programmable” means agent-extensible module registry + schema UI, not a user IDE. Handoff + registry are part of the product surface for future agents.
- Overwrote: product-brief.md, process.md, tech-brief.md, phases.md, HANDOFF.md, lessons.md.

## 2026-07-10 - Session 1i: Handoff readiness corrections

- Happened: Reviewed all seven handoff files for accuracy, completeness, feasibility, precision, and cold-start resumability. User approved every finding. Restored the pre-plan readiness gate; locked localhost serving, exact versioned checkpoint reproduction, and pixel-plus-metadata print DPI. Defined immutable work/revision semantics, import/migration safety, module/schema/IR/render contracts, true-SVG capability behavior, framing-size export constraints, extension documentation, browser-native automated checks, and incremental delivery phases.
- Verified: Product/tech/phases reference checks pass; all handoff files exist; stale “Planning in progress,” optional `file://`, single `parentId`, and “ignore unknown fields” wording removed. Canvas and ES-module feasibility claims were checked against MDN. Repository `.DS_Store` is ignored and removed.
- Learned: A schema version and seed do not preserve visual identity when algorithms evolve; exact checkpoints require independently versioned runtime components and immutable revisions. Browser PNG export also needs explicit DPI metadata rewriting.
- Overwrote: HANDOFF.md, product-brief.md, tech-brief.md, process.md, phases.md, lessons.md. Added `.gitignore`; progress-log.md remains append-only.

## 2026-07-10 - Session 1j: Readiness re-review passed

- Happened: Re-reviewed the updated handoff set against Accuracy, Completeness, Concision, Precision, Clarity, Resumability, plan-build integration, and execution reliability. Clarified atomic `ArtworkBundle` portability and aligned the extension-guide delivery phase.
- Verified: All internal file links resolve; no stale planning-state or optional-`file://` claims remain; required reading matches the next phase; every delivery phase has automated and observable verification; IDE diagnostics report no errors.
- Learned: The reviewed briefs are now sufficient input for a separate implementation plan without depending on this chat.
- Overwrote: HANDOFF.md (planning-ready next action), product-brief.md (readiness complete), phases.md (Phase 2 complete), tech-brief.md and lessons.md (final consistency corrections).

## 2026-07-10 - Session 2: Implementation plan drafted

- Happened: Drafted `docs/_handoff/implementation-plan.md` covering Phases 4-10: locked one concrete PRNG (`mulberry32` seeded via FNV-1a), coordinate space (`normalized-v1` rectangle sized to `aspectRatio`), geometry IR shape (`{ irVersion, strokes: [{ points, closed, fill, tags, styleHints }] }`), module contract (static-import registry, no dynamic discovery), and a no-framework browser test harness convention (`test/index.html` + `test/*.test.js` + `window.__TEST_RESULTS__`). Broke each phase into exact-file slices with an automated verify and, where applicable, a manual/UAT step.
- Verified: Every `phases.md` automated-verify and UAT line for Phases 4-10 is covered by at least one slice; every contract referenced traces to a named `tech-brief.md` section; phase numbering matches `phases.md` exactly (plan-reference check in the new doc's closing section).
- Learned: none new (execution of already-locked contracts, not a requirements change).
- Overwrote: HANDOFF.md (phase → plan drafted/awaiting approval; required reading/index updated), phases.md (link to implementation-plan.md; Phase 3 marked drafted-awaiting-approval). Added docs/_handoff/implementation-plan.md.

## 2026-07-10 - Session 2b: Standalone plan review findings applied

- Happened: Ran a standalone quality-gate review (Accuracy/Completeness/Concision/Precision/Clarity + Resumability/Reliability lenses) against `implementation-plan.md`. Found and fixed real coverage gaps the plan's own closing self-check had missed: no slice validated `paramsSchema` values before acceptance (added to Slice 4.5/4.8), no slice tested a migration path despite `tech-brief.md` requiring one (added Slice 5.4, plus an optional `migrate(oldParams, fromVersion)` module export), and Phase 8 never checked `ink-growth`'s IR against both styles' declared capabilities. Also named previously-unnamed test files (Slices 4.9, 5.1-5.3, 6.1-6.2), fixed a file/verify mismatch (`png-dpi.test.js` moved from 9.2 to 9.1), named an isolated test-only IndexedDB (`generative-art-canvas-v1-test`), and converted load-bearing `phases.md`/`HANDOFF.md` mentions to markdown links.
- Verified: `check-refs.py` reports all links resolve (4/4 after the link-form fix); corrected the plan's closing self-check claim to no longer overstate coverage.
- Learned: A plan's own "plan-reference check" self-certification is not a substitute for an independent review pass — it missed the two contract gaps (schema validation, migration) that an external gate check caught. Logged as a Reliability recommendation (not yet built): a script diffing `phases.md` bullets against `implementation-plan.md` slices would catch this drift automatically on future edits.
- Overwrote: docs/_handoff/implementation-plan.md (all fixes above); no other handoff file changed.

## 2026-07-10 - Session 2c: Implementation plan approved; handoff to Phase 4

- Happened: User approved `implementation-plan.md` as-reviewed. Phase 4 (first application code) will start in a new session.
- Verified: N/A (approval is a decision, not a check).
- Learned: none new.
- Overwrote: phases.md (Phase 3 marked done/approved), HANDOFF.md (phase → Phase 4 not yet started; next action → Slice 4.1; required reading narrowed to what Phase 4 slices actually need — implementation-plan.md + tech-brief.md + process.md + lessons.md, dropping phases.md now that its per-phase summary is superseded by the plan for execution purposes).

## 2026-07-11 - Session 3: Slice 4.1 + chrome aesthetics gate

- Happened: Implemented Slice 4.1 (static shell: `index.html`, `css/base.css`, empty `js/main.js`). User UAT confirmed. Locked a chrome aesthetics discussion gate after Slice 4.7 / before Slice 4.8 so control chrome inherits the direction with tonal render as visual context; Phase 10 stays final polish.
- Verified: localhost page loads with zero console errors (favicon 404 fixed via data-URI icon).
- Learned: Pause chrome aesthetics after first tonal render, before `controls.css`, to avoid reskinning later panels.
- Overwrote: HANDOFF.md (4.1 done; next → 4.2; gate noted), implementation-plan.md (chrome aesthetics gate note).

## 2026-07-11 - Session 3b: Slices 4.2–4.7 + chrome direction

- Happened: Added the browser harness, versioned FNV-1a/mulberry32 RNG, Geometry IR helpers, module registry/parameter validation, deterministic `flow-field`, and `ink-tonal` Canvas renderer. User accepted the tonal-wash preview. Chrome direction is now a quiet software instrument inspired by monochrome Teenage Engineering hardware: graphite default, token-equivalent pale-aluminum light mode, dockable/collapsible rack, familiar touch-friendly controls, and restrained readout/LED details.
- Verified: 17 browser tests pass with zero console errors; flow fixture hash is `906c7571`; user confirmed the Slice 4.7 tonal-wash UAT.
- Learned: Hardware can supply hierarchy and material character without copying hardware interaction; pointer/touch usability wins over rotary-control simulation.
- Overwrote: application/test files through Slice 4.7, HANDOFF.md, lessons.md. Slice 4.8 will establish the reusable control treatment; docking/collapse/theme behavior wires with the live app in Slice 4.9.

## 2026-07-11 - Session 3c: Chrome applied + Slice 4.8

- Happened: Restyled the static shell as the approved graphite instrument with a verified pale-aluminum token theme. Added schema-generated grouped controls for number, boolean, select, color, text, and seed types; number controls pair a touch-friendly fader with direct numeric entry. Invalid edits are rejected before `onChange`; visibility conditions use `{ param, equals }`.
- Verified: 20 browser tests pass with zero console errors/issues and no IDE diagnostics. Both theme token sets and the generated control preview were visually inspected.
- Learned: Keep 44px interaction areas independent of the compact visual density; direct number entry prevents hardware-inspired faders from reducing precision.
- Overwrote: `index.html`, `css/base.css`, `css/controls.css`, `js/ui/schema-form.js`, browser tests, HANDOFF.md.

## 2026-07-11 - Session 3d: Slice 4.9 UAT + canvas centering

- Happened: Wired the Flow / ink wash preset through the registry, live renderer, schema controls, seed controls, and approved light/dark, dock, and edge-peek rack behavior. User accepted the Slice 4.9 UAT. Corrected `.canvas-workspace` so its frame is centered in both axes through page scrolling by centering the grid content as well as its item.
- Verified: 22 browser tests pass with zero console errors/issues and no IDE diagnostics. The canvas frame measured horizontally centered and vertically centered to within 0.004px at desktop and 390px narrow viewports, including after a 520px page scroll.
- Learned: In a grid workspace expanded by a taller sibling rail, `place-items` centers only inside the implicit track; pair it with `place-content: center` to center that track in the full workspace.
- Overwrote: `css/base.css`, HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 3e: Desktop sticky canvas stage

- Happened: Replaced the insufficient full-workspace centering behavior with an accepted desktop sticky stage: the header stays pinned; the canvas workspace fills the remaining viewport and keeps the rendered frame centered while the control rail scrolls. `ResizeObserver` keeps the CSS header offset accurate. Mobile retains ordinary scrolling pending the planned floating-panel work.
- Verified: Desktop stage stayed at `top: 64px` with `1136px` available height on a 1440×1200 viewport and remained centered after an 800px page scroll. Console and IDE diagnostics were clean. User accepted UAT.
- Learned: A viewport-persistent canvas needs sticky positioning and a dynamically measured sibling offset; centering within a tall grid row alone is not sufficient.
- Overwrote: `index.html`, `js/main.js`, `css/base.css`, HANDOFF.md, lessons.md, progress-log.md.

## 2026-07-11 - Session 3f: Slice 4.10 display PNG export

- Happened: Added PNG serialization for the existing live canvas and a compact export control with encoding, success-dimension, and error feedback. The download uses the displayed canvas directly, preserving its device-pixel-ratio-scaled dimensions without regenerating geometry.
- Verified: 23 browser tests pass with zero console errors; the export test validates the PNG signature and IHDR pixel dimensions. Chrome smoke export completed at the live canvas dimensions, and the user confirmed UAT passed.
- Learned: Display export should serialize the current raster surface rather than recreate it, so its visual result and device-pixel dimensions exactly match the live view.
- Overwrote: `js/core/export-png.js`, `js/ui/export-panel.js`, `test/export-png.test.js`, `test/run-tests.js`, `js/main.js`, `index.html`, `css/base.css`, HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 3g: Slice 4.11 extension guide + Phase 4 close

- Happened: Wrote `docs/extension-guide.md` with the seven tech-brief extension-contract sections. Independent review feedback was triaged and applied: clarify Phase 4 vs future SVG/migration boundaries, state that `defaultParams` is an authoring convention not registry-enforced, align minimal examples with validation calls, and expand the verification checklist into phase-scoped checks. User accepted UAT; Slices 4.10–4.11 committed together as `d4a4770`.
- Verified: All seven required headings present; Markdown lint clean; claims spot-checked against `js/core/*`, `js/ui/schema-form.js`, and `tech-brief.md`.
- Learned: Extension docs must distinguish current runtime behavior from later-phase contracts so a cold-start agent does not invent migration or SVG loaders before those phases exist.
- Overwrote: `docs/extension-guide.md`, HANDOFF.md, progress-log.md, lessons.md.

## 2026-07-11 - Session 4a: Targeted UAT gates for Phases 5–6

- Happened: Locked targeted UAT additions without per-slice gates: (1) pre-UI contract smoke after Slice 5.3 before Slice 5.5 checkpoint UI; (2) hard phase UAT after 5.5 and 6.3 with an agent Chrome pass before user acceptance; (3) phase-end UAT for 7–9 and Phase 10 remain hard exits. No new UAT after validation-only slices such as 5.1.
- Verified: Plan and phases wording now name the gates.
- Learned: Mid-gates earn their keep only where UI would otherwise sit on an unproven persistence/lineage contract.
- Overwrote: `implementation-plan.md`, `phases.md`, `lessons.md`, `progress-log.md`.

## 2026-07-11 - Session 4b: Slice 5.1 document model

- Happened: Added `js/core/document.js` to build/validate `ArtworkRevision` v1 (`createArtworkRevision`, `validateArtworkRevision`, `ArtworkDocumentValidationError`). Rejects missing required fields, unsupported `schemaVersion`/`irVersion`, and non-ISO timestamps. Registered `test/document.test.js` in the browser harness.
- Verified: Browser suite 28 passed / 0 failed; console clean.
- Learned: `Date.parse` alone accepts loose date strings; require an ISO-8601 pattern before accepting timestamps.
- Overwrote: `js/core/document.js`, `test/document.test.js`, `test/run-tests.js`, HANDOFF.md, `implementation-plan.md` status line, progress-log.md.

## 2026-07-11 - Session 4c: Slice 5.2 work session

- Happened: Added in-memory work sessions with immutable checkpoint revisions, fork lineage, and revision restoration. A fork immediately checkpoints its first revision against the source; drafts remain editable copies.
- Verified: Browser suite 31 passed / 0 failed; console and IDE diagnostics clean. Tests prove immutable checkpoint history, fork source linkage, and restored geometry identity.
- Learned: Session reads must return clones or frozen revisions so editing a current draft cannot rewrite checkpoint history.
- Overwrote: `js/core/work-session.js`, `test/work-session.test.js`, `test/run-tests.js`, `docs/extension-guide.md`, HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 4d: Slice 5.3 bundle I/O

- Happened: Added portable `ArtworkBundle` construction, JSON serialization/parsing, required-version resolution, optional-extension preservation, and non-mutating collision detection. Added revision resolution to bootstrap so bundle validation checks registered RNG/module/IR compatibility.
- Verified: Browser suite 36 passed / 0 failed; console and IDE diagnostics clean. Fixtures cover structural round-trip, unknown optional fields, unsupported module/schema versions, and collision choices without mutating existing IDs.
- Learned: Keep bundle parsing and collision detection pure so invalid imports cannot partially mutate in-memory or future persistent state.
- Overwrote: `js/core/bundle-io.js`, `js/core/bootstrap.js`, `test/bundle-io.test.js`, `test/run-tests.js`, `docs/extension-guide.md`, HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 4e: Slice 5.4 migration fixture

- Happened: Added synthetic `flow-field` v0→v1 migration from `lineAmount` to `lineCount`. Revision resolution now upgrades only explicitly supported old module versions and returns the validated current revision; unsupported versions fail visibly.
- Verified: Browser suite 38 passed / 0 failed; console and IDE diagnostics clean. The migration fixture produces the same geometry hash as the equivalent v1 revision.
- Learned: Historical document references may need a legacy version value that is not a registered module version; isolate that exception to the migration resolver and fixture.
- Overwrote: `js/core/document.js`, `js/core/bootstrap.js`, `js/systems/flow-field.js`, `test/migration.test.js`, `test/run-tests.js`, `docs/extension-guide.md`, HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 4f: Phase 5 pre-UI contract gate

- Happened: Ran the required bundle I/O smoke before checkpoint UI.
- Verified: In the browser, export→import was structurally equal; an optional extension field was preserved; a duplicate work ID surfaced exactly `new-work` and `replace` choices.
- Learned: The pure bundle API makes this gate executable without touching live application state.
- Overwrote: HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 4g: Slice 5.5 checkpoint UI

- Happened: Added the checkpoint panel and wired it to the live preset state. It saves immutable revisions, forks the active revision, restores history entries, exports validated JSON, and imports it with an explicit replace/new-work choice. New-work imports remap work/revision lineage IDs.
- Verified: Browser component suite reaches 40 passed / 0 failed. Chrome app smoke confirmed the panel loads cleanly, a checkpoint appears in history, and Fork creates a new work with its own first revision.
- Learned: The UI can preserve the small Phase 5 scope by treating a draft as a projection of the existing schema controls and synchronizing it only at a persistence boundary.
- Overwrote: `index.html`, `css/base.css`, `js/main.js`, `js/ui/checkpoint-panel.js`, `test/checkpoint-panel.test.js`, `test/run-tests.js`, `docs/extension-guide.md`, HANDOFF.md, progress-log.md.

## 2026-07-11 - Session 4h: Phase 5 hard UAT accepted

- Happened: User accepted the Phase 5 hard UAT (checkpoint → fork → change fork → export JSON → re-import as new work → return to unchanged source). Advanced handoff to Phase 6.
- Verified: User acceptance of the Phase 5 exit criteria; Slices 5.1–5.5 already committed; browser suite last green at 40 passed / 0 failed.
- Learned: With one in-memory work at a time, proving source immutability during UAT requires exporting the source JSON before importing the changed fork, then re-importing the source.
- Overwrote: HANDOFF.md, phases.md, implementation-plan.md, progress-log.md, lessons.md, `docs/extension-guide.md`.

## 2026-07-11 - Session 5a: Slice 6.1 IndexedDB store

- Happened: Added IndexedDB persistence with separate production (`generative-art-canvas-v1`) and destructive-test (`generative-art-canvas-v1-test`) databases. The core store atomically creates, lists, loads, updates, and deletes work metadata, drafts, and immutable revisions; revision history order is retained with each work.
- Verified: Browser suite 43 passed / 0 failed; console and IDE diagnostics clean. Tests cover create/list/load/update/delete, preserving a second work while deleting the first, and malformed snapshot rejection with byte-for-byte unchanged existing data.
- Learned: Validating the full storage snapshot before opening its write transaction prevents malformed imports from partially persisting.
- Overwrote: `js/core/store-indexeddb.js`, `test/store-indexeddb.test.js`, `test/run-tests.js`, HANDOFF.md, implementation-plan.md, lessons.md, `docs/extension-guide.md`, progress-log.md.

## 2026-07-11 - Session 5b: Slice 6.2 revision thumbnails

- Happened: Added fixed-size Canvas thumbnails that resolve a checkpoint's pinned modules, regenerate its geometry from the recorded seed, and return a cloned revision carrying a PNG data URL thumbnail record for persistence.
- Verified: Browser suite 44 passed / 0 failed; console clean. The thumbnail test validates PNG data URL encoding and its 192 × 128 pixel dimensions for the default 1.5 aspect-ratio fixture.
- Learned: A library preview must render from revision state rather than capture the live canvas, preserving checkpoint identity across viewport changes.
- Overwrote: `js/core/thumbnails.js`, `test/thumbnails.test.js`, `test/run-tests.js`, HANDOFF.md, implementation-plan.md, lessons.md, `docs/extension-guide.md`, progress-log.md.

## 2026-07-11 - Session 5c: Slice 6.3 library UI

- Happened: Added the Library / WIP panel and integrated it with IndexedDB snapshots. The app creates/reopens persisted works, saves drafts independently of checkpoint history, supports open/rename/delete with a confirmation modal, and reports actionable JSON import errors without accepting malformed data.
- Verified: Browser suite 46 passed / 0 failed, with a clean console and IDE diagnostics. Component tests cover work listing, draft-vs-saved state, open/rename actions, and delete confirmation.
- Learned: A persisted WIP needs a saved draft as well as immutable revisions; show the saved state only after the IndexedDB write returns.
- Overwrote: `index.html`, `css/base.css`, `js/core/store-indexeddb.js`, `js/main.js`, `js/ui/library-panel.js`, `test/store-indexeddb.test.js`, `test/library-panel.test.js`, `test/run-tests.js`, HANDOFF.md, implementation-plan.md, lessons.md, `docs/extension-guide.md`, progress-log.md.

## 2026-07-11 - Session 5d: Phase 6 hard UAT accepted

- Happened: User accepted the Phase 6 hard UAT (multiple WIPs across reload without JSON; delete confirmation; malformed JSON import leaves library unchanged). Advanced handoff to Phase 7.
- Verified: User acceptance of the Phase 6 exit criteria; Slices 6.1–6.3 already committed; browser suite last green at 46 passed / 0 failed. Malformed import surfaced: `Could not import JSON: ArtworkBundle JSON is invalid: Expected property name or '}' in JSON at position 1 (line 1 column 2)`.
- Learned: Prefixing the parser/validation message with `Could not import JSON:` keeps the failure actionable without inventing a separate error taxonomy.
- Overwrote: HANDOFF.md, phases.md, implementation-plan.md, progress-log.md, lessons.md, `docs/extension-guide.md`.

## 2026-07-11 - Session 6a: Slice 7.1 clean-vector style

- Happened: Added and registered `clean-vector@1`, a crisp vector-capable style with Canvas and SVG render paths for weighted paths and translucent closed fills.
- Verified: Browser suite 48 passed / 0 failed with a clean console. The SVG fixture is byte-stable after whitespace normalization, parses without XML errors, and contains path elements; Canvas rendering returns the requested 600 × 400 surface.
- Learned: Keeping Canvas and SVG on the same normalized-coordinate conversion gives the export path the same composition without re-running generation.
- Overwrote: `js/styles/clean-vector.js`, `js/core/bootstrap.js`, `test/clean-vector.test.js`, `test/run-tests.js`, HANDOFF.md, implementation-plan.md, progress-log.md, `docs/extension-guide.md`.
