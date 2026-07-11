# Tech brief - feasibility and provisional technical direction

## Current architecture (verified)

- The repo contains the handoff set and a placeholder README; there is no application code.
- Product requirements are canonical in [product-brief.md](product-brief.md).
- This document records feasibility constraints and contracts that a later implementation plan must satisfy; it is not that plan.

## Locked technical decisions

- **Runtime:** Vanilla HTML/CSS/JavaScript with native ES modules; no framework, bundler, compile, or package-manager step.
- **Launch:** HTTP localhost is required because browser ES modules do not reliably run from `file://`. Cursor/VS Code Live Server is the default; `python3 -m http.server` is an acceptable fallback.
- **Browser target:** Current stable Safari, Chrome, and Firefox on macOS.
- **Rendering:** Hybrid Canvas 2D + SVG DOM, fed by resolution-independent geometry.
- **Persistence:** IndexedDB for the in-app library plus validated JSON import/export.
- **Determinism:** All random choices use one versioned seeded PRNG. `Math.random()` is prohibited in generation/render paths.
- **Evolution:** Documents, PRNG, geometry IR, systems, and styles are independently versioned.
- **v1 content:** Systems `flow-field` and `ink-growth`; styles `clean-vector` and `ink-tonal`; preset `Flow · ink wash`.

## Artwork state and revision contract

An editable **work** has a stable `workId`. A saved **checkpoint** is an immutable revision with a unique `revisionId`. Editing occurs in a draft; saving creates a new revision rather than mutating history. Forking creates a new `workId` whose first revision points to the source revision.

```text
ArtworkRevision v1
  schemaVersion: 1
  workId: string
  revisionId: string
  parentRevisionId: string | null
  forkedFromRevisionId: string | null
  title: string
  notes: string
  createdAt: ISO-8601 string
  checkpointedAt: ISO-8601 string

  composition:
    aspectRatio: number
    background: color
    coordinateSpace: "normalized-v1"

  rng:
    id: string
    version: number
    seed: string

  system:
    id: string
    version: number
    params: object

  style:
    id: string
    version: number
    params: object

  irVersion: number
  exportDefaults:
    widthIn: number
    heightIn: number
    dpi: number

  extensions: object
```

Portable JSON exports use an `ArtworkBundle` envelope containing bundle version, export timestamp, work metadata, the current draft (if any), and all immutable revisions for that work. Import is atomic: either the validated bundle is accepted in full or the library remains unchanged.

### Exact reproduction

- A revision resolves exact system/style/PRNG/IR versions; changing the latest implementation must not alter prior output.
- Old versions remain loadable until a tested migration produces identical output. If identity cannot be preserved, retain the old module.
- Generation uses normalized coordinates and depends only on revision state, never viewport size, device pixel ratio, clock, locale, or iteration order outside the document.
- Screen, print, and SVG outputs render the same generated geometry at different resolutions; export does not consume additional randomness.
- “Exact” means stable generated geometry and style decisions for the saved module versions. Canvas antialiasing may vary slightly across browser engines/OS updates; cross-browser bitwise raster equality is not a v1 guarantee.

### Storage and import

- IndexedDB stores work metadata, drafts, immutable revisions, and optional preview thumbnails.
- JSON is the portable source of truth for an `ArtworkBundle`. Export includes all version identifiers needed to resolve every included revision.
- Import validates structure and value bounds without `eval` or executable content.
- Unknown optional fields are preserved on round-trip. Unknown required schema/module versions fail visibly and do not partially overwrite library data.
- ID collisions prompt for “import as new work” or explicit replacement; silent replacement is forbidden.
- Titles/notes are rendered as text, never injected HTML.

## Module and parameter-schema contract

Every system/style module registers:

- stable `id`, integer `version`, label, description, and supported `irVersion`
- `paramsSchema` and defaults
- pure generation or render entry point
- declared render capabilities (`canvas`, `svg`)
- migration hooks from explicitly supported prior parameter versions

The v1 parameter schema supports:

- `number` (min, max, step), `boolean`, `select` (choices), `color`, `text`, and `seed`
- label, help text, group, display order, default, and whether the control participates in randomization
- optional visibility conditions based only on other parameter values
- an `extensions` object for additive future metadata

Validation happens before state is accepted. The UI is generated from this schema; a module must not require hand-coded controls for ordinary parameters.

## Geometry and rendering contract

### Geometry IR

The minimal normalized IR contains:

- open polylines/curves
- closed filled regions/polygons
- per-vertex or per-segment pressure/weight hints
- semantic tags and optional style hints that renderers may interpret but need not obey

All v1 styles must render the required core geometry types. Unknown optional attributes are ignored; unknown required geometry types produce a visible compatibility error, not an empty canvas. This supports curated presets first while retaining free system × style mixing as the destination.

### SVG

- A style declares whether it can produce true vector SVG.
- `clean-vector` must support true SVG in v1.
- SVG export is disabled with an explanation for a raster-only style. Raster pixels are not wrapped in an `.svg` file and described as vector output.
- SVG UAT therefore uses `clean-vector`; PNG remains available for every style.

### Print PNG

- Render dimensions are `round(widthIn × dpi)` by `round(heightIn × dpi)`.
- Canvas `toBlob()` normally emits 96-DPI metadata, so the exporter must patch/write the PNG `pHYs` chunk (including CRC) to the requested DPI after encoding.
- Output is sRGB with an opaque paper background by default.
- Before allocating export surfaces, estimate pixel count and memory. The implementation plan must establish a cross-browser-tested guard that permits at least the 12 × 18 inch, 300-DPI baseline (19.44 MP), then show a clear error above the verified limit.
- Export exposes a busy/progress state and cleans up temporary canvases/object URLs.

## Extension contract

The first implementation increment must create `docs/extension-guide.md` as the stable entry for future agent-guided extension sessions. It must contain:

1. module interfaces and registry locations
2. parameter-schema vocabulary
3. geometry IR definitions and compatibility rules
4. minimal system, style, and preset examples
5. versioning/migration rules
6. exact registration steps
7. deterministic browser-test and manual verification checklist

The app README should link to `docs/_handoff/HANDOFF.md` for project state and `docs/extension-guide.md` for extension mechanics.

## Verification contract for the future plan

The no-build test surface is a browser-served test page plus ES-module test files. At minimum, automate:

- seeded PRNG repeatability and version fixtures
- document validation and known migrations
- immutable checkpoint/fork lineage
- JSON export/import round-trip and collision handling
- registry and parameter-schema validation
- viewport-independent geometry hashes
- SVG serialization for `clean-vector`
- PNG pixel dimensions and `pHYs` metadata
- IndexedDB create/load/revision behavior

Each implementation increment must name its automated check and an observable UI smoke test. Final UAT runs on current Safari, Chrome, and Firefox on macOS.

## Feasibility and material risks

- The browser-native stack supports the required runtime, persistence, Canvas, SVG, and downloads.
- Exact historical reproduction is feasible but requires retaining versioned modules; it is an ongoing maintenance cost, not merely a schema field.
- Framing-size PNG is feasible at the 12 × 18 inch baseline; larger sizes need empirical memory limits and may later require tiled rendering.
- True SVG is feasible for vector-capable styles. Watercolor-like future styles may remain PNG-only unless intentionally approximated with SVG primitives/filters.

## Out of scope for the first implementation plan

- Animation/video
- cloud sync or collaboration
- CMYK/prepress workflow
- arbitrary plugin execution or user-authored code
- guaranteeing every future raster style has true-vector SVG

## Hard invariants

- Do not create application code or an implementation plan until readiness review passes.
- No build step in the shipped workflow.
- Never silently change a checkpoint’s rendered result or discard imported state.
- Solo exploration never requires an agent.
- Preserve the organic, intentional art direction; avoid fractal-demo defaults.
