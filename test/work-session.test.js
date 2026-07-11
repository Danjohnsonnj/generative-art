import { createRng } from "../js/core/rng.js";
import { createWorkSession } from "../js/core/work-session.js";
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

function createFixtureSession() {
  let nextId = 1;
  return createWorkSession({
    draft: {
      title: "Flow study",
      notes: "",
      composition: { ...flowInkWash.composition },
      rng: { ...flowInkWash.rng },
      system: {
        ...flowInkWash.system,
        params: { ...flowInkWash.system.params },
      },
      style: {
        ...flowInkWash.style,
        params: { ...flowInkWash.style.params },
      },
      irVersion: 1,
      exportDefaults: { widthIn: 12, heightIn: 18, dpi: 300 },
      extensions: {},
    },
    createId(kind) {
      return `${kind}-${nextId++}`;
    },
    now() {
      return "2026-07-11T16:00:00.000Z";
    },
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
    name: "checkpoint creates an immutable revision without changing prior revisions",
    fn(assert) {
      const session = createFixtureSession();
      const firstRevision = session.checkpoint();

      session.setDraft({
        ...session.getDraft(),
        system: {
          ...session.getDraft().system,
          params: {
            ...session.getDraft().system.params,
            lineCount: 80,
          },
        },
      });
      const secondRevision = session.checkpoint();

      assert.equal(firstRevision.revisionId, "revision-2");
      assert.equal(secondRevision.parentRevisionId, firstRevision.revisionId);
      assert.equal(firstRevision.system.params.lineCount, 72);
      assert.throws(() => {
        firstRevision.system.params.lineCount = 99;
      }, TypeError);
    },
  },
  {
    name: "fork creates a new work whose first revision cites its source",
    fn(assert) {
      const source = createFixtureSession();
      const sourceRevision = source.checkpoint();
      const fork = source.fork(sourceRevision.revisionId);
      const forkRevision = fork.getRevisions()[0];

      assert.ok(fork.getWorkId() !== source.getWorkId());
      assert.equal(forkRevision.forkedFromRevisionId, sourceRevision.revisionId);
      assert.equal(forkRevision.parentRevisionId, null);
      assert.equal(source.getRevisions().length, 1);
    },
  },
  {
    name: "restoreRevision reproduces the checkpointed geometry",
    fn(assert) {
      const session = createFixtureSession();
      const revision = session.checkpoint();
      const checkpointHash = pointHash(geometryFor(revision));

      session.setDraft({
        ...session.getDraft(),
        rng: { ...session.getDraft().rng, seed: "changed-seed" },
      });
      const restored = session.restoreRevision(revision.revisionId);

      assert.equal(pointHash(geometryFor(restored)), checkpointHash);
      assert.equal(session.getDraft().rng.seed, revision.rng.seed);
    },
  },
];
