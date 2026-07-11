# Product brief - Generative Art Canvas

## Background

Greenfield repo. Personal tool for making organic-feeling recursive abstract art across multiple visual languages — vector, watercolor-like, tonal, mid-century modern, and more — without cheesy 1990s fractal aesthetics.

Aesthetic north stars (inspirations, not literal copies):

- Modernists and Bauhaus (structure, geometry, limited palettes, intentional composition)
- Japanese ink painting (gesture, negative space, tonal wash, controlled accident)
- Cubism (faceting, overlapping planes, multiple viewpoints)
- Mid-century / 50s modern (organic curves, bold shapes, poster-like clarity)
- Contemporary generative practice that balances order and organic unpredictability (flow fields, recursive deformation, layered transparency — Hobbs-like process, not a clone)

Anti-goals aesthetically: Mandelbrot/Julia zooms, neon psychedelic fractals, default “fractal tree on black” demos.

## Goal

A **personal playground UI** where the user explores seeds, parameters, and styles on agent-authored generative systems, produces still compositions, exports them, and **iterates via checkpoints** (save → fork → experiment → return → branch again).

Two complementary ways of working (both first-class from the outset):

1. **Solo explore** — open the tool, pick system/style/preset, use UI controls, fork/save/export. No agent required.
2. **Agent-guided extension** — interview-style session: cold-start agent loads handoff + module registry/schemas/state, discovers what to add (new system, style, params, preset), implements it, then the user immediately experiments via the new UI controls. Back-and-forth aims at: converse → extend → play → maybe extend again.

Success bar:

- Many distinct, gallery-worthy variations from one system via UI controls
- Switch style treatments without the user rewriting code
- Can save a WIP, create an immutable checkpoint, fork it, load another work, and return to the same deterministic composition
- Export display PNG, framing-quality print PNG, and true SVG when the active style supports vectors
- Open through localhost in a current browser with no project-dependency install or build step
- Cold-start agent can extend the system from docs + code without rediscovering the product from scratch
- User can explore existing combinations without an agent

## Locked decisions

- **Audience:** Solo / personal only
- **Who writes code:** The agent. User does not author sketches day-to-day
- **Workflow:** Playground-first UI; agent-authored systems behind the controls; dual mode solo-explore + agent-extension interview
- **Interface:** Required — live canvas + controls (seed, params, style, regenerate, export, checkpoint/fork/load)
- **Delivery:** No build system; native ES modules served through localhost (Cursor/VS Code Live Server is acceptable)
- **Browser baseline:** Current stable Safari, Chrome, and Firefox on macOS
- **Output:** Stills only (no animation as a v1 goal)
- **Export:** (1) PNG at display/retina resolution, (2) high-res PNG with requested pixel dimensions and embedded DPI metadata, (3) true SVG when supported by the active style
- **Print acceptance baseline:** 12 × 18 inches at 300 DPI (3600 × 5400 pixels), embedded 300-DPI metadata, sRGB output, and an opaque paper background by default
- **Iteration:** First-class — editable WIPs, immutable checkpoints, forks with lineage, exact return to prior checkpoints, and multiple loadable works
- **Reproduction:** A checkpoint must regenerate the same normalized geometry and style decisions after later application changes; algorithm versions are retained or explicitly migrated. Bit-for-bit raster equality across different browser engines is not required.
- **State model:** Schema/config-based serializable documents (versioned, extensible as systems/styles grow)
- **Persistence:** Both — an in-browser WIP library for fast fork/load, plus JSON import/export as portable source of truth / backup
- **Render:** Hybrid — composition as geometry/paths; styles render via Canvas and/or SVG; PNG always available; SVG export when the style supports true vectors
- **System × style:** End state = free mix (any system + any style). Ship path = **C → A**: curated presets first (thin documents), geometry IR designed for eventual universal mixing; temporary compatibility/fallbacks allowed while styles catch up
- **v1 composition systems:** Flow field ribbons/curves; ink-like growth/branching (avoid cheesy fractal-tree default)
- **v1 styles:** Clean vector (SVG-true); ink / tonal wash
- **v1 starter preset:** “Flow · ink wash” (flow-field + ink-tonal), openable and forkable on first launch
- **Expansion backlog (confirmed direction, not v1):** subdivision system; watercolor-like layers; mid-century bold shapes; further as requested

## Core user flows

1. **First launch:** App opens the “Flow · ink wash” preset and clearly distinguishes “regenerate this seed” from “new variation.”
2. **Explore:** Changing a schema-driven control updates the still; resetting restores the loaded checkpoint/preset values.
3. **Checkpoint:** Saving a checkpoint creates an immutable revision. Subsequent edits occur in a working draft and do not overwrite it.
4. **Fork:** Forking creates a new work with lineage back to the source revision; both remain independently loadable.
5. **Return:** Loading a prior checkpoint reproduces the exact image, including composition dimensions, system/style versions, seed, and parameters.
6. **Library safety:** Unsaved/draft state is visible; destructive deletion requires confirmation; load/import errors are actionable.
7. **Portable state:** JSON export/import round-trips a work and its required revision metadata. ID collisions never overwrite silently.
8. **Export:** PNG/SVG actions state availability, target dimensions, progress/busy state, and errors. SVG is disabled with an explanation for a raster-only style.

## Rationale

The artist operates a tool and needs branching exploration. Programmability is exercised through **agent sessions that extend modules**, not a user code editor. Schema-driven UI + handoff docs make both solo play and cold-start extension possible.

## Non-goals

- NFT / blockchain minting
- Photorealistic painting simulation as primary goal
- Social gallery / marketplace
- Reproducing specific copyrighted artworks
- User-facing code editor / “write your own sketch” as a v1 feature
- Bundlers, npm scripts, TypeScript compile step, or framework build pipelines
- Real-time animation / video export as a v1 goal
- Requiring an agent present for everyday exploration
- CMYK conversion, printer profiles, professional prepress proofing, and guaranteed exports beyond the declared browser memory guard in v1

## Boundaries

- Always: aesthetic direction explicit; seeded/deterministic randomness; no-build localhost delivery; exact checkpoint reproduction; artwork state serializable via versioned schema; keep registry/schemas/docs agent-readable for cold-start extension
- Ask first: public publishing, monetization, native apps, print-shop pipelines, adding a build step later, cloud sync
- Never: default product identity as a fractal explorer; require the user to write code to use the tool; silently alter or discard saved state during migration/import; make solo explore depend on an agent

## Success criteria

- [x] Core requirements locked
- [x] Named starter preset: yes (“Flow · ink wash”)
- [x] Dual workflow (solo explore + agent extension) locked
- [x] Feasibility decisions locked (localhost, versioned algorithms, pixel-plus-metadata print DPI)
- [x] Handoff readiness findings applied and re-reviewed
- [ ] Separate implementation plan drafted and approved

## Reference landscape (research notes)

| Reference | Why it matters |
| --- | --- |
| [canvas-sketch](https://github.com/mattdesl/canvas-sketch/) | Export / dimension ideas — not adopted as a build-dependent framework |
| [p5.js](https://p5js.org/) | Creative-coding baseline; vanilla browser APIs remain preferred for v1 |
| [Paper.js](http://paperjs.org/) / [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) | Vector path and export reference |
| [Tyler Hobbs on flow fields](https://www.artblocks.io/legacy/info/spectrum/in-conversation-with-tyler-hobbs) | Order/chaos and organic flow-field process |
| [Watercolor layering process](https://opensource.com/article/17/9/how-hack-painting) | Layered transparency and recursive edge deformation |
| [fxhash deterministic randomness](https://docs.fxhash.xyz/creating-on-fxhash/genart-in-the-browser/deterministic-randomness) | Seeded parameter exploration pattern (not minting) |

## Open requirement questions

None blocking implementation planning.
