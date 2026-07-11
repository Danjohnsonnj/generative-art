# Implementation plan - v1 (Phases 4-10)

Cold-start executable plan for [phases.md](phases.md) Phases 4-10. Names exact files, one implementation path, prerequisites, out-of-scope work, and deterministic verification per increment. This document does not restate product/technical rationale — see [product-brief.md](product-brief.md) and [tech-brief.md](tech-brief.md) for that.

**Status:** Approved and in execution. Phases 4–5 complete; Phase 6 Slices 6.1–6.2 complete, Slice 6.3 next. See [HANDOFF.md](HANDOFF.md) for the current next action.

## Global prerequisites (one-time, before Slice 4.1)

- Serve the repo root over HTTP: `python3 -m http.server 8000` (canonical command for this plan) or the Live Server extension. Native ES modules will not run from `file://`.
- No package manager, bundler, or compile step is introduced at any phase.

## One-time technical decisions this plan locks in

These are concrete choices needed to make later slices executable without re-deciding mid-implementation. They satisfy, but do not restate, the contracts in `tech-brief.md`.

- **PRNG (`rng` id `mulberry32`, version 1):** seed string → 32-bit integer via FNV-1a hash, then the mulberry32 generator. Deterministic, dependency-free, easily fixture-tested.
- **Coordinate space (`coordinateSpace: "normalized-v1"`):** a rectangle `x ∈ [0, aspectRatio]`, `y ∈ [0, 1]`. Systems generate directly in this rectangle; renderers scale it to the requested pixel dimensions. No letterboxing logic is needed because the rectangle already encodes the aspect ratio.
- **Geometry IR (`irVersion` 1):** `{ irVersion: 1, strokes: [ { points: [{x, y, weight}], closed: boolean, fill: boolean, tags: string[], styleHints: object } ] }`. `fill` is only meaningful when `closed` is `true`. This is the "open polylines/curves" and "closed filled regions" contract from `tech-brief.md` expressed as one concrete shape.
- **Module contract shape:** every system/style file's default export is a `meta` object (`id`, `version`, `label`, `description`, `irVersion`, `paramsSchema`, `defaultParams`, and for styles `capabilities: { canvas, svg }`) plus named functions — `generate({ rng, params, aspectRatio })` for systems, `renderCanvas({ ctx, geometry, params, widthPx, heightPx })` and optionally `renderSVG({ geometry, params, widthPx, heightPx })` for styles. Migration is an optional named export `migrate(oldParams, fromVersion)` returning params valid for the module's current `version`; its absence means the module declares no supported prior version and an old params version fails visibly per `tech-brief.md`.
- **Registry:** modules are registered by explicit static import in `js/core/bootstrap.js` (no dynamic filesystem discovery, since there is no build step). Adding a module means adding one import + one `registerSystem`/`registerStyle` call.
- **Test harness (no framework, browser-native):** `test/index.html` loads `test/run-tests.js`, which imports every `test/*.test.js` module. Each test file exports `export const tests = [{ name, fn }]`. The runner calls each `fn(assert)` (a minimal `assert.equal`/`assert.ok`/`assert.throws` from `test/assert.js`), catches throws, renders a PASS/FAIL list in the DOM, and sets `window.__TEST_RESULTS__ = { passed, failed, results }` for inspection. This is the "browser-served test page plus ES-module test files" surface required by `tech-brief.md`.

## Target directory map (end state after Phase 10; built incrementally)

```text
index.html
css/
  base.css
  controls.css
js/
  main.js
  core/
    bootstrap.js
    rng.js
    geometry.js
    registry.js
    document.js
    work-session.js
    bundle-io.js
    store-indexeddb.js
    thumbnails.js
    export-png.js
    export-svg.js
    export-print.js
    png-dpi.js
  systems/
    flow-field.js
    ink-growth.js
  styles/
    clean-vector.js
    ink-tonal.js
  presets/
    flow-ink-wash.js
  ui/
    schema-form.js
    canvas-view.js
    checkpoint-panel.js
    library-panel.js
    export-panel.js
test/
  index.html
  run-tests.js
  assert.js
  *.test.js  (one per core/system/style module, added alongside it)
docs/
  extension-guide.md
```

---

## Phase 4 - First playable study

**Prerequisites:** global prerequisites only; this is the first code in the repo.
**Out of scope:** checkpoint/fork/JSON (Phase 5), IndexedDB library (Phase 6), SVG export (Phase 7), `ink-growth` (Phase 8), print export (Phase 9).

| Slice | Files | Automated verify | Manual/UAT |
| --- | --- | --- | --- |
| 4.1 Static shell | `index.html`, `css/base.css`, `js/main.js` (empty entry) | None (no logic yet) | Page loads via localhost with zero console errors |
| 4.2 Test harness | `test/index.html`, `test/run-tests.js`, `test/assert.js` | Harness itself loads and reports "0 passed / 0 failed" | Open `test/index.html`, confirm clean console |
| 4.3 Seeded PRNG | `js/core/rng.js`, `test/rng.test.js` | Same seed → identical sequence; sequence for seed `"abc"` matches a recorded fixture array | — |
| 4.4 Geometry IR helpers | `js/core/geometry.js`, `test/geometry.test.js` | Validator accepts a hand-built valid IR object and rejects a malformed one (bad `closed`/`fill` combo, non-finite coordinate) | — |
| 4.5 Module registry | `js/core/registry.js` (also exports `validateParams(paramsSchema, params)`), `test/registry.test.js` | Register/get/list round-trip; duplicate `id`+`version` registration throws; `validateParams` accepts an in-range/correctly-typed params object and rejects an out-of-range or wrong-type value with a named error | — |
| 4.6 `flow-field` generation | `js/systems/flow-field.js`, `test/flow-field.test.js` | Fixed seed+params → stroke-count and point-hash match a recorded fixture; all coordinates finite and within the `normalized-v1` rectangle | — |
| 4.7 `ink-tonal` Canvas render | `js/styles/ink-tonal.js`, `test/ink-tonal.test.js` | Rendering the fixture geometry to an offscreen canvas at a requested pixel size throws no errors and returns that exact pixel size | Screenshot the offscreen canvas, confirm a tonal-wash look (not a hard-edged vector look) |
| 4.8 Schema-driven controls | `js/ui/schema-form.js`, `css/controls.css`, `test/schema-form.test.js` | Given a `paramsSchema` fixture, generated DOM has the expected control count/types; changing a control fires `onChange` with a correctly-typed value only after `registry.validateParams` (Slice 4.5) accepts it — an invalid edit is rejected and does not fire `onChange` | — |
| 4.9 Preset wiring | `js/presets/flow-ink-wash.js`, `js/core/bootstrap.js`, `js/ui/canvas-view.js`, `js/main.js` (full wiring), `index.html` updated, `test/preset-wiring.test.js` | Running system→style for the preset's default seed produces a geometry hash matching a recorded fixture | Open app: preset renders on load; "Regenerate" (same seed) reproduces the identical image; "New seed" changes it; changing a control updates the still; "Reset" restores preset defaults |
| 4.10 Display PNG export | `js/core/export-png.js`, `js/ui/export-panel.js`, `test/export-png.test.js` | Exported `Blob` has valid PNG signature bytes; width/height equal the canvas's device-pixel-ratio-scaled dimensions | Click "Export PNG"; file downloads and opens at the expected size in an image viewer |
| 4.11 Extension guide | `docs/extension-guide.md` | N/A (documentation) | Contains all seven required sections from `tech-brief.md`'s Extension contract, using the concrete `rng`/registry/IR/schema decisions above as its examples |

**Chrome aesthetics gate (after 4.7, before 4.8):** Pause for a short discussion to lock app chrome direction (palette, type, shell layout, control chrome) now that tonal render exists as visual context. Record the locked direction in [lessons.md](lessons.md) / [progress-log.md](progress-log.md) before starting Slice 4.8 so `controls.css` and later panels (checkpoint, library, export) inherit it. Phase 10 remains final polish only.

**Phase 4 exit check:** all `test/*.test.js` pass in `test/index.html`; [phases.md](phases.md)'s stated Phase 4 automated verify and UAT both pass.

---

## Phase 5 - Portable checkpoint and fork loop

**Prerequisites:** Phase 4 complete (registry, RNG, preset, UI wiring all work).
**Out of scope:** IndexedDB-backed library UI (Phase 6) — this phase holds exactly one work in memory at a time, with explicit JSON export/import as the only persistence.

| Slice | Files | Automated verify |
| --- | --- | --- |
| 5.1 Document model | `js/core/document.js` (builds/validates `ArtworkRevision` per the `tech-brief.md` schema), `test/document.test.js` | Valid revision object passes validation; missing required field or unsupported `schemaVersion`/`irVersion` is rejected with a named error, not a silent pass |
| 5.2 Work session | `js/core/work-session.js` (`checkpoint()`, `fork()`, `restoreRevision(id)` over the current in-memory work), `test/work-session.test.js` | `checkpoint()` produces a new immutable `revisionId` without mutating the prior revision object; `fork()` creates a new `workId` with `forkedFromRevisionId` set, leaving the source work's revisions unchanged; `restoreRevision()` reproduces the same generated geometry hash as when that revision was checkpointed |
| 5.3 Bundle I/O | `js/core/bundle-io.js` (serialize to `ArtworkBundle`, parse+validate, collision detection), `test/bundle-io.test.js` | Export→import round-trip is structurally equal to the original; a fixture bundle with an unknown *optional* field round-trips that field unchanged; a fixture with an unknown *required* module/schema version is rejected without mutating any existing in-memory state; importing a `workId` that already exists surfaces a collision decision (new-work vs. explicit replace) rather than silently overwriting |
| 5.4 Migration fixture | `js/systems/flow-field.js` gains `migrate(oldParams, fromVersion)` for a synthetic v0→v1 param rename, `test/migration.test.js` | Loading a fixture revision recorded against `flow-field` v0 resolves through `migrate` to valid v1 params and produces the same geometry as an equivalent hand-written v1 revision; a fixture citing an unsupported version (no `migrate` path) is rejected visibly, matching `tech-brief.md`'s "old versions remain loadable until a tested migration produces identical output" |
| 5.5 Checkpoint UI | `js/ui/checkpoint-panel.js` (Save checkpoint / Fork / revision history list / Export JSON / Import JSON), wired into `js/main.js` | — (covered by UAT) |

**Pre-UI contract gate (after 5.3, before 5.5):** Do not start the checkpoint panel until Slice 5.3 automated verify is green. Run a short API-level smoke in the browser test page or console: export→import round-trip structurally equal; unknown optional field preserved; collision surfaces new-work vs replace (no silent overwrite). Slice 5.4 may run after 5.3 and before this gate clears for 5.5.

**Hard phase UAT (after 5.5):** checkpoint the preset, fork it, change the fork, export JSON, re-import as a new work, and return to the unchanged source revision — matching [phases.md](phases.md) Phase 5 exactly. Agent runs this UAT script once in Chrome and records the result before marking Phase 5 done; do not start Phase 6 until the user accepts. **Accepted 2026-07-11.**

---

## Phase 6 - Browser library

**Prerequisites:** Phase 5 document/work-session model.
**Out of scope:** none beyond persistence itself; no new systems/styles.

| Slice | Files | Automated verify |
| --- | --- | --- |
| 6.1 IndexedDB store | `js/core/store-indexeddb.js` — DB `generative-art-canvas-v1` (production) / `generative-art-canvas-v1-test` (tests only, opened and deleted by test setup/teardown so it never touches real library data); object stores `works` (key `workId`) and `revisions` (key `revisionId`, indexed by `workId`) | `test/store-indexeddb.test.js` opens `generative-art-canvas-v1-test` fresh, runs create/list/load/update/delete round-trip, deletes the DB in teardown; deleting one work leaves others intact; a simulated malformed-import attempt leaves existing works/revisions byte-for-byte unchanged (isolation test) |
| 6.2 Thumbnails | `js/core/thumbnails.js` (small canvas render → data URL stored per revision), `test/thumbnails.test.js` | Generated thumbnail is a valid PNG data URL of the expected small size |
| 6.3 Library UI | `js/ui/library-panel.js` (list/open/rename/delete, draft-vs-saved indicator, delete confirmation modal, actionable import errors) | — (covered by UAT) |

**Hard phase UAT (after 6.3):** maintain and reopen multiple WIPs across a page reload without JSON files; delete requires confirmation; a deliberately malformed JSON import leaves the library untouched and shows an actionable error — matching [phases.md](phases.md) Phase 6. Agent runs this UAT script once in Chrome and records the result before marking Phase 6 done; do not start Phase 7 until the user accepts.

---

## Phase 7 - Vector path

**Prerequisites:** Phase 4 rendering pipeline (style capability plumbing).
**Out of scope:** no changes to `flow-field`/`ink-growth` generation logic — only a new style plus export wiring.

| Slice | Files | Automated verify |
| --- | --- | --- |
| 7.1 `clean-vector` style | `js/styles/clean-vector.js` (`renderCanvas` + `renderSVG`, `capabilities: { canvas: true, svg: true }`), `test/clean-vector.test.js` | Fixed seed/params → a deterministic, whitespace-normalized SVG string matches a recorded fixture; parsing the output with `DOMParser` yields no parser errors and contains at least one vector element (`path`/`polygon`) |
| 7.2 SVG export | `js/core/export-svg.js`, `test/export-svg.test.js` | Exported Blob's MIME type and root element are valid SVG for `clean-vector`; the same call path for `ink-tonal` (raster-only) is refused with a named "unsupported" result, not an empty/garbage file |
| 7.3 UI capability gating | `js/ui/export-panel.js` updated: "Export SVG" is disabled with an inline explanation whenever the active style's `capabilities.svg` is `false` | — (covered by UAT) |

**Hard phase UAT:** switch the flow system to `clean-vector`, export SVG, reopen the file directly in a browser, and confirm it matches the on-screen composition — matching [phases.md](phases.md) Phase 7.

---

## Phase 8 - Second composition system

**Prerequisites:** Phase 4 registry/schema/rendering pipeline. Does not depend on Phase 7.
**Out of scope:** no changes to `flow-field`, `clean-vector`, or `ink-tonal`.

| Slice | Files | Automated verify |
| --- | --- | --- |
| 8.1 `ink-growth` system | `js/systems/ink-growth.js`, `test/ink-growth.test.js` | Across a small matrix of param extremes, a fixed seed always produces finite, in-bounds geometry (no `NaN`/`Infinity`, no coordinates outside the `normalized-v1` rectangle); default params produce a measurable branch-count asymmetry across N seeds (non-zero variance left vs. right), encoded as a numeric assertion so a regression to a symmetric binary tree fails the test; emitted stroke shapes (`closed`/`fill`/`tags` combinations) are all within the required IR types both `clean-vector` and `ink-tonal` declare support for, per each style's `capabilities` |
| 8.2 Registration + preset picker | `js/core/bootstrap.js` updated; system switcher added to UI | — (covered by UAT) |

**Hard phase UAT:** create and fork `ink-growth` works in both v1 styles; visually confirm asymmetry and negative space, not a "fractal tree on black" demo — matching [phases.md](phases.md) Phase 8.

---

## Phase 9 - Framing-quality print export

**Prerequisites:** Phase 4 Canvas rendering path. Independent of Phases 5-8.
**Out of scope:** SVG print export; tiled/multi-canvas rendering for sizes beyond the tested guard (explicitly out of scope per `tech-brief.md`).

| Slice | Files | Automated verify |
| --- | --- | --- |
| 9.1 PNG DPI metadata | `js/core/png-dpi.js` (patches the `pHYs` chunk + CRC on `toBlob()` output), `test/png-dpi.test.js` | Parsing a patched PNG's `pHYs` chunk yields the requested DPI (converted from pixels-per-meter) with a valid CRC |
| 9.2 Print export pipeline | `js/core/export-print.js` (offscreen canvas at `round(widthIn·dpi) × round(heightIn·dpi)`, pre-allocation memory estimate/guard, progress callback, temp canvas/URL cleanup), `test/export-print.test.js` | The 12×18in @300dpi baseline exports exactly 3600×5400 px with 300-DPI metadata; a synthetic oversized request is rejected by the guard *before* allocation (no attempted `OffscreenCanvas`/`canvas` allocation at the oversized dimensions) |
| 9.3 Export UI | `js/ui/export-panel.js` updated: width/height/DPI inputs, busy/progress state, error messaging | — (covered by UAT) |

**Hard phase UAT:** export the 12×18in/300dpi baseline from both v1 styles in Safari, Chrome, and Firefox on macOS; inspect the file in a metadata-aware image application to confirm pixel dimensions and embedded DPI — matching [phases.md](phases.md) Phase 9.

---

## Phase 10 - v1 polish and cross-browser release

**Prerequisites:** Phases 4-9 complete.
**Out of scope:** no new module contracts, no behavior changes to any locked contract from `tech-brief.md`.

Touches only existing `css/*`, `js/ui/*`, `docs/extension-guide.md`, and `README.md`. No new files beyond documentation refinement.

**Automated verify:** the full existing `test/*.test.js` suite remains green after polish changes (no contract regressions).
**UAT (final v1 gate, matching [phases.md](phases.md) Phase 10):** the full `test/index.html` suite passes with zero failures in current Safari, Chrome, and Firefox on macOS; a solo-explore smoke flow (open → change controls → checkpoint → fork → export PNG/SVG) and an agent-extension smoke flow (cold-start read of [HANDOFF.md](HANDOFF.md) + `docs/extension-guide.md` → add a trivial parameter → verify via schema-generated UI, no bespoke code) both complete from a cold start in each browser.

---

## Plan-reference check

- Every phase above corresponds 1:1 to a phase in [phases.md](phases.md); no phase is renumbered, skipped, or reordered.
- Every automated-verify bullet in [phases.md](phases.md) (Phases 4-10) is covered by at least one slice's automated verify above, including registry/schema validation (Slice 4.5) and migration fixtures (Slice 5.4), which a prior pass of this plan omitted.
- Every UAT line in [phases.md](phases.md) (Phases 4-10) is repeated verbatim-in-substance at the end of its phase section above.
- Phase 5 also names a pre-UI contract gate after Slice 5.3 before Slice 5.5; Phases 5–6 require an agent Chrome pass of the hard phase UAT before user acceptance advances the phase.
- All module/state/geometry/export contracts referenced (`ArtworkRevision`, `ArtworkBundle`, module contract, IR, print/DPI, SVG capability gating, migration hooks) trace to a named section in `tech-brief.md`; none are introduced here without a tech-brief anchor.
- `docs/extension-guide.md`'s required contents (module interfaces, param vocabulary, IR + compatibility rules, minimal examples, versioning rules, registration steps, verification checklist) are all satisfiable from decisions locked in this plan by the time Slice 4.11 is written.
