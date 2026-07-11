import {
  ArtworkBundleValidationError,
  createArtworkBundle,
  parseArtworkBundle,
  prepareArtworkBundleImport,
  serializeArtworkBundle,
} from "../js/core/bundle-io.js";
import { createWorkSession } from "../js/core/work-session.js";
import flowInkWash from "../js/presets/flow-ink-wash.js";

function createFixtureBundle() {
  let nextId = 1;
  const session = createWorkSession({
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
  const revision = session.checkpoint();

  return createArtworkBundle({
    exportedAt: "2026-07-11T16:02:00.000Z",
    work: {
      workId: session.getWorkId(),
      title: revision.title,
      extensions: {},
    },
    draft: session.getDraft(),
    revisions: session.getRevisions(),
    extensions: {},
  });
}

export const tests = [
  {
    name: "ArtworkBundle serializes and parses without structural changes",
    fn(assert) {
      const bundle = createFixtureBundle();
      const parsed = parseArtworkBundle(serializeArtworkBundle(bundle));

      assert.equal(JSON.stringify(parsed), JSON.stringify(bundle));
    },
  },
  {
    name: "ArtworkBundle preserves unknown optional fields on round-trip",
    fn(assert) {
      const bundle = createFixtureBundle();
      bundle.extensions.futureBundleField = { enabled: true };
      bundle.revisions[0].extensions.futureRevisionField = "preserve me";

      const parsed = parseArtworkBundle(serializeArtworkBundle(bundle));

      assert.equal(parsed.extensions.futureBundleField.enabled, true);
      assert.equal(
        parsed.revisions[0].extensions.futureRevisionField,
        "preserve me",
      );
    },
  },
  {
    name: "ArtworkBundle rejects an unsupported required module version",
    fn(assert) {
      const bundle = createFixtureBundle();
      bundle.revisions[0].system.version = 99;

      assert.throws(
        () => parseArtworkBundle(JSON.stringify(bundle)),
        ArtworkBundleValidationError,
      );
    },
  },
  {
    name: "ArtworkBundle rejects an unsupported required schema version",
    fn(assert) {
      const bundle = createFixtureBundle();
      bundle.revisions[0].schemaVersion = 99;

      assert.throws(
        () => parseArtworkBundle(JSON.stringify(bundle)),
        ArtworkBundleValidationError,
      );
    },
  },
  {
    name: "ArtworkBundle import reports a collision without mutating existing IDs",
    fn(assert) {
      const bundle = createFixtureBundle();
      const existingWorkIds = [bundle.work.workId];

      const prepared = prepareArtworkBundleImport(
        serializeArtworkBundle(bundle),
        existingWorkIds,
      );

      assert.equal(prepared.collision.workId, bundle.work.workId);
      assert.equal(prepared.collision.choices.join(","), "new-work,replace");
      assert.equal(existingWorkIds.length, 1);
    },
  },
];
