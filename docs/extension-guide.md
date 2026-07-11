# Extension guide

This is the entry point for agent-guided extensions. Read `docs/_handoff/HANDOFF.md` first for the active phase and constraints, then use this guide to add a system, style, parameter, or preset without changing existing output.

The shipped runtime is vanilla HTML, CSS, and native ES modules. Do not add a package manager, bundler, or compile step. Serve the repository over HTTP; `file://` is not supported for modules.

## 1. Module interfaces and registry locations

Systems live in `js/systems/`; styles live in `js/styles/`. Each module has a default metadata export and named implementation functions. The registry in `js/core/registry.js` stores full module namespaces by stable `id@version`.

### System module contract

```js
const meta = Object.freeze({
  id: "my-system",
  version: 1,
  label: "My system",
  description: "What it composes.",
  irVersion: 1,
  paramsSchema,
  defaultParams,
});

export default meta;

export function generate({ rng, params, aspectRatio }) {
  // Validate params, use rng.next() for every random choice,
  // and return valid Geometry IR v1.
}
```

`generate` must be deterministic for the supplied versioned RNG, parameters, and aspect ratio. It must not use `Math.random()`, the viewport, time, locale, or ambient iteration order.

### Style module contract

```js
const meta = Object.freeze({
  id: "my-style",
  version: 1,
  label: "My style",
  description: "What it renders.",
  irVersion: 1,
  paramsSchema,
  defaultParams,
  capabilities: Object.freeze({ canvas: true, svg: false }),
});

export default meta;

export function renderCanvas({ ctx, geometry, params, widthPx, heightPx }) {
  // Validate geometry and params, then render at the requested size.
}
```

Every v1 style must provide `renderCanvas`. Phase 4 ships Canvas rendering and PNG export only. A style that can produce true vector output may additionally export `renderSVG({ geometry, params, widthPx, heightPx })` and set `capabilities.svg` to `true`; the SVG export pipeline and capability gating are introduced in Phase 7. Do not represent raster pixels as SVG.

### Registration

`js/core/bootstrap.js` is the source of truth for registered modules. Import the entire namespace, then register it exactly once:

```js
import * as mySystem from "../systems/my-system.js";
import * as myStyle from "../styles/my-style.js";

registerSystem(mySystem);
registerStyle(myStyle);
```

`resolvePreset` verifies the selected RNG version, module versions, parameters, and matching IR version before returning the resolved modules. A duplicate `id@version` or unresolved version fails visibly.

## 2. Parameter-schema vocabulary

`paramsSchema` is a record keyed by parameter name. `defaultParams` must include exactly the declared keys and their valid defaults; this is an authoring convention — the registry validates submitted parameter objects, not `defaultParams` itself, so an incorrect default will not raise an error at registration time but will cause failures when the preset is loaded. The schema-form UI renders ordinary parameters from this definition; do not add bespoke UI controls for them.

Supported `type` values:

- `number` — finite number; use `min`, `max`, and `step` where applicable.
- `boolean` — `true` or `false`.
- `select` — include `choices`, and supply one of those values.
- `color`, `text`, and `seed` — strings.

Presentation metadata is additive: `label`, `help`, `group`, `order`, `default`, `randomize`, `visibleWhen`, and `extensions`. `visibleWhen`, when used, must depend only on another parameter value. `extensions` is reserved for additive future metadata.

All parameter input is validated by `validateParams` in `js/core/registry.js` before the application accepts it. It rejects missing, extra, out-of-range, or incorrectly typed values with `ParameterValidationError`.

```js
const paramsSchema = Object.freeze({
  density: {
    type: "number",
    label: "Density",
    min: 1,
    max: 64,
    step: 1,
    default: 24,
    group: "Structure",
    order: 10,
    randomize: true,
  },
});

const defaultParams = Object.freeze({ density: 24 });
```

## 3. Geometry IR and compatibility

Geometry is versioned by `irVersion: 1` and generated in normalized space: `x ∈ [0, aspectRatio]`, `y ∈ [0, 1]`. Renderers scale this once-generated geometry to their requested pixel dimensions.

```js
{
  irVersion: 1,
  strokes: [{
    points: [{ x: 0.2, y: 0.3, weight: 1 }],
    closed: false,
    fill: false,
    tags: ["flow"],
    styleHints: {},
  }],
}
```

- `points` contain finite `x`, `y`, and `weight` values.
- Open paths use `closed: false` and must also use `fill: false`.
- Filled shapes use both `closed: true` and `fill: true`.
- `tags` is an array of strings; `styleHints` is an object. Both are optional semantic input for a renderer.

Use `createStroke`, `createGeometry`, and `validateGeometry` from `js/core/geometry.js` rather than hand-rolling validation. New systems must stay in bounds and emit only types that every supported target style can render. Unknown optional attributes may be ignored; a required unsupported geometry type must produce a visible compatibility error, never an empty composition.

## 4. Minimal examples

### Minimal system example

```js
import { createGeometry, createStroke, validateGeometry } from "../core/geometry.js";
import { validateParams } from "../core/registry.js";

export function generate({ rng, params, aspectRatio }) {
  validateParams(meta.paramsSchema, params);

  const y = 0.2 + rng.next() * 0.6;

  return validateGeometry(createGeometry([
    createStroke({
      points: [
        { x: 0.1 * aspectRatio, y, weight: params.weight },
        { x: 0.9 * aspectRatio, y, weight: params.weight },
      ],
      tags: ["example"],
    }),
  ]));
}
```

### Minimal style example

```js
import { validateGeometry } from "../core/geometry.js";
import { validateParams } from "../core/registry.js";

export function renderCanvas({ ctx, geometry, params, widthPx, heightPx }) {
  validateGeometry(geometry);
  validateParams(meta.paramsSchema, params);

  ctx.canvas.width = widthPx;
  ctx.canvas.height = heightPx;
  ctx.fillStyle = params.paperColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  ctx.strokeStyle = params.inkColor;
  for (const stroke of geometry.strokes) {
    ctx.beginPath();
    stroke.points.forEach((point, index) => {
      const x = point.x * heightPx;
      const y = point.y * heightPx;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}
```

### Minimal preset example

Presets live in `js/presets/` and are ordinary immutable document data. Copy the shape of `js/presets/flow-ink-wash.js`, pinning every version:

```js
export default Object.freeze({
  id: "my-preset",
  version: 1,
  label: "My preset",
  description: "A concise description.",
  composition: Object.freeze({
    aspectRatio: 1.5,
    background: "#f1eee5",
    coordinateSpace: "normalized-v1",
  }),
  rng: Object.freeze({ id: "mulberry32", version: 1, seed: "my-seed" }),
  system: Object.freeze({ id: "my-system", version: 1, params: Object.freeze({}) }),
  style: Object.freeze({ id: "my-style", version: 1, params: Object.freeze({}) }),
});
```

Populate both parameter objects completely. A preset is not a visual shortcut: it is a portable record of exactly what must resolve to reproduce an image.

## 5. Versioning and migrations

IDs are stable; versions are positive integers. Do not change the behavior of an existing registered `id@version`: prior checkpoints must keep their generated geometry and style decisions.

- Change implementation behavior or parameter meaning: introduce a new module version.
- Add a backwards-compatible optional field: preserve it through document/bundle round trips when the persistence phase is present.
- Change the IR: introduce a new `irVersion` and retain compatible renderers/modules or reject the combination visibly.
- Change a parameter schema for an existing module lineage: provide a named `migrate(oldParams, fromVersion)` only when it returns valid current params and automated fixtures prove identical historical output. Migration resolution is live as of Phase 5 via `resolveArtworkRevision` in `js/core/bootstrap.js`.

If exact migration cannot be demonstrated, keep the old module implementation registered. Never silently coerce an old revision into a new appearance.

Phase 5 includes a synthetic legacy `flow-field` v0 fixture that renames
`lineAmount` to v1's `lineCount`. Version 0 is only a stored historical fixture;
registered module versions remain positive integers. The migration must validate
the resulting v1 params and preserve the recorded geometry hash.

### Phase 5 work sessions

`js/core/work-session.js` owns one in-memory work. Create it with a draft, then
use `checkpoint()` to create an immutable revision, `fork(revisionId)` to create
a new work whose first revision cites the source, and
`restoreRevision(revisionId)` to return the draft to a prior revision. Treat
values returned by `getRevisions()` as immutable; edit only a draft supplied by
`getDraft()` and pass it back through `setDraft(nextDraft)`.

The work-session module is an application-state API, not a module-extension
point. Later Phase 5 slices add portable bundle I/O, migrations, and UI wiring.

### Phase 5 portable bundles

`js/core/bundle-io.js` serializes an `ArtworkBundle` with the immutable
revisions, current draft, work metadata, and extension objects. Use
`createArtworkBundle()` and `serializeArtworkBundle()` to export, then
`parseArtworkBundle()` to validate incoming JSON before accepting it.
`prepareArtworkBundleImport()` reports a collision and offers `new-work` or
`replace`; it never silently overwrites existing state.

Unknown optional fields in `extensions` survive a parse/serialize round-trip.
Unsupported document, module, RNG, or IR versions reject with
`ArtworkBundleValidationError` before any application state changes.

### Phase 5 checkpoint panel

`js/ui/checkpoint-panel.js` is wired by `js/main.js`. It exposes Save checkpoint,
Fork, revision-history restore, Export JSON, and Import JSON. Import explicitly
asks whether an open work should be replaced or copied as a new work; the latter
remaps its work and revision IDs before opening it.

## 6. Exact extension steps

1. Read `docs/_handoff/HANDOFF.md`, this guide, and the active phase plan before editing.
2. Record the intended module ID, version, parameters, compatible IR, migration impact, and acceptance checks.
3. Add the module in `js/systems/` or `js/styles/` with metadata, valid defaults, and the named entry point.
4. Add focused browser tests in `test/<module>.test.js`.
5. Add its static import and `registerSystem` or `registerStyle` call in `js/core/bootstrap.js`.
6. Add or update a preset in `js/presets/` only after the module resolves through the registry.
7. Wire ordinary parameters via `createSchemaForm`; do not bypass schema validation.
8. Add the test module import and entry in `test/run-tests.js`.
9. Run automated verification and the UI smoke check below. Update the handoff history only after accepted UAT.

## 7. Verification checklist

Serve the root with `python3 -m http.server 8000`, then open `http://127.0.0.1:8000/test/`.

### Phase 4 (required for every new module)

- Add a deterministic fixture for the generator: fixed seed and params must yield its recorded geometry hash or equivalent stable assertion in `test/<module>.test.js`.
- Test parameter boundaries, types, missing values, and extra values via `validateParams`; confirm `ParameterValidationError` is thrown for out-of-range and incorrectly typed values.
- Verify every generated coordinate is finite and within the normalized rectangle (`x ∈ [0, aspectRatio]`, `y ∈ [0, 1]`).
- Test the new style on fixture geometry at a requested pixel size; confirm `renderCanvas` returns the canvas at the exact requested dimensions and the result is non-blank.
- Confirm the browser test page reports zero failures and the console has no errors.
- Open `http://127.0.0.1:8000/`, confirm the preset loads, and exercise each schema-generated control; confirm invalid edits are rejected without firing `onChange`.
- Regenerate with the same seed and verify the composition remains unchanged; use a new seed and verify it changes.
- Confirm PNG export preserves the live canvas dimensions.

### Future phases (apply only when the stated phase is complete)

- **Phase 5 — checkpoint/fork lineage:** after checkpointing, forking, and restoring a revision, confirm the same seed+params yields an identical geometry hash as when the revision was saved. **Live as of Phase 5 close (2026-07-11).**
- **Phase 5 — bundle import/collision:** export a bundle, re-import it, and confirm the round-trip is structurally identical. Import a second bundle with the same `workId` and confirm a collision decision is prompted rather than silently overwriting. **Live as of Phase 5 close (2026-07-11).**
- **Phase 5 — migration fixture:** for any `migrate(oldParams, fromVersion)` export, confirm the migrated params produce an identical geometry hash to an equivalent hand-written current-version revision. **Live as of Phase 5 close (2026-07-11).**
- **Phase 6 — IndexedDB:** after a page reload, confirm persisted works reopen without JSON import; confirm deleting one work leaves others intact. **Not live yet.**
- **Phase 7 — SVG serialization:** for a `capabilities.svg: true` style, confirm `renderSVG` produces a valid, non-empty SVG string with no `DOMParser` errors; reopen the exported SVG file in a browser and compare its composition to the screen. Confirm SVG export is disabled with an explanation for `canvas`-only styles.
- **Phase 9 — PNG `pHYs` metadata:** confirm a 12 × 18 in @ 300 DPI print export produces exactly 3600 × 5400 px and the `pHYs` chunk reports 300 DPI.
