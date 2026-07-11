import { resolveArtworkRevision } from "../js/core/bootstrap.js";
import { createArtworkRevision } from "../js/core/document.js";
import { createRng } from "../js/core/rng.js";
import { generate } from "../js/systems/flow-field.js";
import flowInkWash from "../js/presets/flow-ink-wash.js";

function pointHash(geometry) {
  const serialized = geometry.strokes
    .map((stroke) =>
      stroke.points
        .map((point) =>
          [point.x, point.y, point.weight]
            .map((value) => value.toFixed(6))
            .join(","),
        )
        .join(";"),
    )
    .join("|");

  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function revisionForSystem(version, params) {
  return createArtworkRevision({
    workId: "work-migration",
    revisionId: "revision-migration",
    parentRevisionId: null,
    forkedFromRevisionId: null,
    title: "Migration fixture",
    notes: "",
    createdAt: "2026-07-11T16:00:00.000Z",
    checkpointedAt: "2026-07-11T16:00:00.000Z",
    composition: { ...flowInkWash.composition },
    rng: { ...flowInkWash.rng },
    system: { id: "flow-field", version, params },
    style: {
      ...flowInkWash.style,
      params: { ...flowInkWash.style.params },
    },
    irVersion: 1,
    exportDefaults: { widthIn: 12, heightIn: 18, dpi: 300 },
    extensions: {},
  });
}

function geometryFor(revision) {
  return generate({
    rng: createRng(revision.rng.seed),
    params: revision.system.params,
    aspectRatio: revision.composition.aspectRatio,
  });
}

export const tests = [
  {
    name: "flow-field migrates v0 params to identical v1 geometry",
    fn(assert) {
      const { lineCount, ...sharedParams } = flowInkWash.system.params;
      const legacyRevision = revisionForSystem(0, {
        ...sharedParams,
        lineAmount: lineCount,
      });
      const currentRevision = revisionForSystem(1, {
        ...flowInkWash.system.params,
      });

      const resolved = resolveArtworkRevision(legacyRevision);

      assert.equal(resolved.revision.system.version, 1);
      assert.equal(resolved.revision.system.params.lineCount, lineCount);
      assert.equal(
        pointHash(geometryFor(resolved.revision)),
        pointHash(geometryFor(currentRevision)),
      );
    },
  },
  {
    name: "revision resolution rejects an unsupported flow-field version",
    fn(assert) {
      const revision = revisionForSystem(99, {
        ...flowInkWash.system.params,
      });

      assert.throws(() => resolveArtworkRevision(revision), /Unsupported/);
    },
  },
];
