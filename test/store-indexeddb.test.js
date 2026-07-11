import {
  IndexedDbArtworkStoreValidationError,
  openIndexedDbArtworkStore,
  deleteIndexedDbArtworkDatabase,
} from "../js/core/store-indexeddb.js";
import { createWorkSession } from "../js/core/work-session.js";
import flowInkWash from "../js/presets/flow-ink-wash.js";

const TEST_DATABASE_NAME = "generative-art-canvas-v1-test";

function createFixtureSnapshot({ title = "Flow study", idPrefix = "" } = {}) {
  let nextId = 1;
  const session = createWorkSession({
    draft: {
      title,
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
      return `${kind}${idPrefix}-${nextId++}`;
    },
    now() {
      return "2026-07-11T16:00:00.000Z";
    },
  });

  session.checkpoint();

  return {
    work: {
      workId: session.getWorkId(),
      title,
      extensions: {},
    },
    draft: session.getDraft(),
    revisions: session.getRevisions(),
  };
}

async function withTestStore(fn) {
  await deleteIndexedDbArtworkDatabase(TEST_DATABASE_NAME);
  const store = await openIndexedDbArtworkStore({
    databaseName: TEST_DATABASE_NAME,
  });

  try {
    await fn(store);
  } finally {
    store.close();
    await deleteIndexedDbArtworkDatabase(TEST_DATABASE_NAME);
  }
}

export const tests = [
  {
    name: "IndexedDB store creates, lists, loads, updates, and deletes a work",
    async fn(assert) {
      await withTestStore(async (store) => {
        const snapshot = createFixtureSnapshot();
        await store.createWork(snapshot);

        const listed = await store.listWorks();
        assert.equal(listed.length, 1);
        assert.equal(listed[0].workId, snapshot.work.workId);
        assert.equal(listed[0].title, "Flow study");

        const loaded = await store.loadWork(snapshot.work.workId);
        assert.equal(JSON.stringify(loaded), JSON.stringify(snapshot));

        const updated = {
          ...snapshot,
          work: { ...snapshot.work, title: "Renamed flow study" },
          draft: { ...snapshot.draft, title: "Renamed flow study" },
        };
        await store.updateWork(updated);
        const loadedUpdated = await store.loadWork(snapshot.work.workId);
        assert.equal(loadedUpdated.work.title, "Renamed flow study");
        assert.equal(loadedUpdated.draft.title, "Renamed flow study");

        await store.deleteWork(snapshot.work.workId);
        assert.equal((await store.listWorks()).length, 0);
        assert.equal(await store.loadWork(snapshot.work.workId), null);
      });
    },
  },
  {
    name: "IndexedDB store deleting one work preserves other works and revisions",
    async fn(assert) {
      await withTestStore(async (store) => {
        const first = createFixtureSnapshot({ title: "First study", idPrefix: "-first" });
        const second = createFixtureSnapshot({
          title: "Second study",
          idPrefix: "-second",
        });

        await store.createWork(first);
        await store.createWork(second);
        await store.deleteWork(first.work.workId);

        const remaining = await store.loadWork(second.work.workId);
        assert.equal((await store.listWorks()).length, 1);
        assert.equal(remaining.work.title, "Second study");
        assert.equal(remaining.revisions.length, 1);
      });
    },
  },
  {
    name: "IndexedDB store rejects malformed imports without changing existing data",
    async fn(assert) {
      await withTestStore(async (store) => {
        const existing = createFixtureSnapshot();
        await store.createWork(existing);
        const before = JSON.stringify(await store.loadWork(existing.work.workId));
        const malformed = {
          ...createFixtureSnapshot({ title: "Broken import" }),
          revisions: [{ revisionId: "not-a-revision" }],
        };

        let error;
        try {
          await store.createWork(malformed);
        } catch (caught) {
          error = caught;
        }
        assert.ok(error instanceof IndexedDbArtworkStoreValidationError);

        assert.equal(
          JSON.stringify(await store.loadWork(existing.work.workId)),
          before,
        );
      });
    },
  },
];
