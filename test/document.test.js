import {
  ArtworkDocumentValidationError,
  createArtworkRevision,
  validateArtworkRevision,
} from "../js/core/document.js";

function validRevision() {
  return {
    schemaVersion: 1,
    workId: "work-flow-001",
    revisionId: "revision-flow-001",
    parentRevisionId: null,
    forkedFromRevisionId: null,
    title: "Flow study",
    notes: "First checkpoint.",
    createdAt: "2026-07-11T16:00:00.000Z",
    checkpointedAt: "2026-07-11T16:01:00.000Z",
    composition: {
      aspectRatio: 1.5,
      background: "#f1eee5",
      coordinateSpace: "normalized-v1",
    },
    rng: { id: "mulberry32", version: 1, seed: "flow-001" },
    system: { id: "flow-field", version: 1, params: { density: 24 } },
    style: { id: "ink-tonal", version: 1, params: { washOpacity: 0.5 } },
    irVersion: 1,
    exportDefaults: { widthIn: 12, heightIn: 18, dpi: 300 },
    extensions: {},
  };
}

export const tests = [
  {
    name: "createArtworkRevision builds a valid v1 revision",
    fn(assert) {
      const revision = createArtworkRevision(validRevision());

      assert.equal(revision.schemaVersion, 1);
      assert.equal(revision.workId, "work-flow-001");
      assert.equal(validateArtworkRevision(revision), revision);
    },
  },
  {
    name: "validateArtworkRevision rejects a missing required field",
    fn(assert) {
      const revision = validRevision();
      delete revision.rng;

      assert.throws(
        () => validateArtworkRevision(revision),
        ArtworkDocumentValidationError,
      );
    },
  },
  {
    name: "validateArtworkRevision rejects an unsupported schema version",
    fn(assert) {
      const revision = { ...validRevision(), schemaVersion: 2 };

      const error = assert.throws(
        () => validateArtworkRevision(revision),
        ArtworkDocumentValidationError,
      );

      assert.ok(error.message.includes("schemaVersion"));
    },
  },
  {
    name: "validateArtworkRevision rejects an unsupported IR version",
    fn(assert) {
      const revision = { ...validRevision(), irVersion: 2 };

      const error = assert.throws(
        () => validateArtworkRevision(revision),
        ArtworkDocumentValidationError,
      );

      assert.ok(error.message.includes("irVersion"));
    },
  },
  {
    name: "validateArtworkRevision rejects a non-ISO timestamp",
    fn(assert) {
      const revision = { ...validRevision(), createdAt: "July 11, 2026" };

      assert.throws(
        () => validateArtworkRevision(revision),
        ArtworkDocumentValidationError,
      );
    },
  },
];
