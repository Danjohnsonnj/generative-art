import { validateArtworkRevision } from "./document.js";

export const PRODUCTION_DATABASE_NAME = "generative-art-canvas-v1";
export const TEST_DATABASE_NAME = "generative-art-canvas-v1-test";

const DATABASE_VERSION = 1;
const WORKS_STORE = "works";
const REVISIONS_STORE = "revisions";
const WORK_ID_INDEX = "workId";

export class IndexedDbArtworkStoreValidationError extends TypeError {
  constructor(message) {
    super(message);
    this.name = "IndexedDbArtworkStoreValidationError";
  }
}

function clone(value) {
  return structuredClone(value);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function reject(message) {
  throw new IndexedDbArtworkStoreValidationError(message);
}

function validateWork(work) {
  if (!isRecord(work)) {
    reject("Stored work must be an object");
  }
  if (typeof work.workId !== "string" || work.workId.length === 0) {
    reject("Stored work.workId must be a non-empty string");
  }
  if (typeof work.title !== "string") {
    reject("Stored work.title must be a string");
  }
  if (!isRecord(work.extensions)) {
    reject("Stored work.extensions must be an object");
  }
}

function validateRevision(revision, path, workId) {
  try {
    validateArtworkRevision(revision);
  } catch (error) {
    reject(
      `${path} is invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (revision.workId !== workId) {
    reject(`${path}.workId must match work.workId`);
  }
}

function validateSnapshot(snapshot) {
  if (!isRecord(snapshot)) {
    reject("Stored artwork must be an object");
  }

  validateWork(snapshot.work);

  if (snapshot.draft !== null) {
    validateRevision(snapshot.draft, "Stored draft", snapshot.work.workId);
  }

  if (!Array.isArray(snapshot.revisions)) {
    reject("Stored revisions must be an array");
  }

  const revisionIds = new Set();
  snapshot.revisions.forEach((revision, index) => {
    validateRevision(
      revision,
      `Stored revisions[${index}]`,
      snapshot.work.workId,
    );
    if (revisionIds.has(revision.revisionId)) {
      reject(`Stored revisions contains duplicate revisionId ${revision.revisionId}`);
    }
    revisionIds.add(revision.revisionId);
  });

  return clone(snapshot);
}

function requestResult(request) {
  return new Promise((resolve, rejectRequest) => {
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener(
      "error",
      () => rejectRequest(request.error ?? new Error("IndexedDB request failed")),
      { once: true },
    );
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, rejectTransaction) => {
    transaction.addEventListener("complete", resolve, { once: true });
    transaction.addEventListener(
      "abort",
      () =>
        rejectTransaction(
          transaction.error ?? new Error("IndexedDB transaction aborted"),
        ),
      { once: true },
    );
    transaction.addEventListener(
      "error",
      () =>
        rejectTransaction(
          transaction.error ?? new Error("IndexedDB transaction failed"),
        ),
      { once: true },
    );
  });
}

function openDatabase(databaseName) {
  return new Promise((resolve, rejectOpen) => {
    const request = indexedDB.open(databaseName, DATABASE_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      const works = database.createObjectStore(WORKS_STORE, { keyPath: "workId" });
      const revisions = database.createObjectStore(REVISIONS_STORE, {
        keyPath: "revisionId",
      });
      revisions.createIndex(WORK_ID_INDEX, "workId");
      void works;
    });
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener(
      "error",
      () => rejectOpen(request.error ?? new Error("IndexedDB could not open")),
      { once: true },
    );
  });
}

function withoutStorageFields(record) {
  const { draft, revisionIds, ...work } = record;
  return work;
}

function createStoredWork(snapshot) {
  return {
    ...snapshot.work,
    draft: snapshot.draft,
    revisionIds: snapshot.revisions.map((revision) => revision.revisionId),
  };
}

export async function deleteIndexedDbArtworkDatabase(
  databaseName = TEST_DATABASE_NAME,
) {
  return new Promise((resolve, rejectDelete) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.addEventListener("success", resolve, { once: true });
    request.addEventListener(
      "error",
      () =>
        rejectDelete(request.error ?? new Error("IndexedDB database deletion failed")),
      { once: true },
    );
  });
}

export async function openIndexedDbArtworkStore({
  databaseName = PRODUCTION_DATABASE_NAME,
} = {}) {
  const database = await openDatabase(databaseName);

  async function saveWork(snapshot, { create }) {
    const validated = validateSnapshot(snapshot);
    const existing = await requestResult(
      database
        .transaction(WORKS_STORE, "readonly")
        .objectStore(WORKS_STORE)
        .get(validated.work.workId),
    );

    if (create && existing) {
      reject(`Work ${validated.work.workId} already exists`);
    }
    if (!create && !existing) {
      reject(`Work ${validated.work.workId} does not exist`);
    }

    const transaction = database.transaction(
      [WORKS_STORE, REVISIONS_STORE],
      "readwrite",
    );
    const works = transaction.objectStore(WORKS_STORE);
    const revisions = transaction.objectStore(REVISIONS_STORE);
    const revisionIndex = revisions.index(WORK_ID_INDEX);
    const existingRevisionIds = await requestResult(
      revisionIndex.getAllKeys(IDBKeyRange.only(validated.work.workId)),
    );

    for (const revisionId of existingRevisionIds) {
      revisions.delete(revisionId);
    }
    if (create) {
      works.add(createStoredWork(validated));
      validated.revisions.forEach((revision) => revisions.add(revision));
    } else {
      works.put(createStoredWork(validated));
      validated.revisions.forEach((revision) => revisions.put(revision));
    }

    await transactionDone(transaction);
    return clone(validated);
  }

  return Object.freeze({
    createWork(snapshot) {
      return saveWork(snapshot, { create: true });
    },

    async listWorks() {
      const transaction = database.transaction(WORKS_STORE, "readonly");
      const records = await requestResult(
        transaction.objectStore(WORKS_STORE).getAll(),
      );
      await transactionDone(transaction);
      return records.map((record) => clone(withoutStorageFields(record)));
    },

    async loadWork(workId) {
      const transaction = database.transaction(
        [WORKS_STORE, REVISIONS_STORE],
        "readonly",
      );
      const workRecord = await requestResult(
        transaction.objectStore(WORKS_STORE).get(workId),
      );

      if (!workRecord) {
        await transactionDone(transaction);
        return null;
      }

      const revisions = await requestResult(
        transaction
          .objectStore(REVISIONS_STORE)
          .index(WORK_ID_INDEX)
          .getAll(IDBKeyRange.only(workId)),
      );
      await transactionDone(transaction);

      const revisionsById = new Map(
        revisions.map((revision) => [revision.revisionId, revision]),
      );
      return clone({
        work: withoutStorageFields(workRecord),
        draft: workRecord.draft,
        revisions: workRecord.revisionIds.map((revisionId) =>
          revisionsById.get(revisionId),
        ),
      });
    },

    updateWork(snapshot) {
      return saveWork(snapshot, { create: false });
    },

    async deleteWork(workId) {
      const transaction = database.transaction(
        [WORKS_STORE, REVISIONS_STORE],
        "readwrite",
      );
      const revisions = transaction.objectStore(REVISIONS_STORE);
      const revisionIds = await requestResult(
        revisions.index(WORK_ID_INDEX).getAllKeys(IDBKeyRange.only(workId)),
      );
      revisionIds.forEach((revisionId) => revisions.delete(revisionId));
      transaction.objectStore(WORKS_STORE).delete(workId);
      await transactionDone(transaction);
    },

    close() {
      database.close();
    },
  });
}
