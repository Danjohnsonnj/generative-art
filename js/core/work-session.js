import { createArtworkRevision } from "./document.js";

function clone(value) {
  return structuredClone(value);
}

function freezeDeep(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
  }

  return value;
}

function defaultCreateId(kind) {
  return `${kind}-${crypto.randomUUID()}`;
}

function createDraftFromRevision(revision) {
  const draft = clone(revision);
  draft.parentRevisionId = revision.revisionId;
  draft.forkedFromRevisionId = null;
  return draft;
}

export function createWorkSession({
  draft,
  workId,
  revisions = [],
  createId = defaultCreateId,
  now = () => new Date().toISOString(),
}) {
  const sessionWorkId = workId ?? createId("work");
  const sessionRevisions = revisions.map((revision) =>
    freezeDeep(createArtworkRevision(clone(revision))),
  );
  let sessionDraft = clone(draft);

  function findRevision(revisionId) {
    const revision = sessionRevisions.find(
      (candidate) => candidate.revisionId === revisionId,
    );

    if (!revision) {
      throw new Error(`Revision ${revisionId} does not exist in this work`);
    }

    return revision;
  }

  return Object.freeze({
    getWorkId() {
      return sessionWorkId;
    },

    getDraft() {
      return clone(sessionDraft);
    },

    setDraft(nextDraft) {
      sessionDraft = clone(nextDraft);
    },

    getRevisions() {
      return [...sessionRevisions];
    },

    checkpoint() {
      const priorRevision = sessionRevisions.at(-1);
      const revision = freezeDeep(
        createArtworkRevision({
          ...clone(sessionDraft),
          workId: sessionWorkId,
          revisionId: createId("revision"),
          parentRevisionId:
            sessionDraft.parentRevisionId ?? priorRevision?.revisionId ?? null,
          forkedFromRevisionId: sessionDraft.forkedFromRevisionId ?? null,
          createdAt: sessionDraft.createdAt ?? now(),
          checkpointedAt: now(),
        }),
      );

      sessionRevisions.push(revision);
      sessionDraft = createDraftFromRevision(revision);
      return revision;
    },

    fork(revisionId) {
      const sourceRevision = findRevision(revisionId);
      const fork = createWorkSession({
        draft: {
          ...clone(sourceRevision),
          parentRevisionId: null,
          forkedFromRevisionId: sourceRevision.revisionId,
          createdAt: undefined,
          checkpointedAt: undefined,
        },
        createId,
        now,
      });

      fork.checkpoint();
      return fork;
    },

    restoreRevision(revisionId) {
      const revision = findRevision(revisionId);
      sessionDraft = createDraftFromRevision(revision);
      return revision;
    },
  });
}
