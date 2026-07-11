import { validateArtworkRevision } from "./document.js";
import { resolveArtworkRevision } from "./bootstrap.js";

export const ARTWORK_BUNDLE_VERSION = 1;

export class ArtworkBundleValidationError extends TypeError {
  constructor(message) {
    super(message);
    this.name = "ArtworkBundleValidationError";
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return structuredClone(value);
}

function reject(message) {
  throw new ArtworkBundleValidationError(message);
}

function validateWork(work) {
  if (!isRecord(work)) {
    reject("ArtworkBundle work must be an object");
  }
  if (typeof work.workId !== "string" || work.workId.length === 0) {
    reject("ArtworkBundle work.workId must be a non-empty string");
  }
  if (typeof work.title !== "string") {
    reject("ArtworkBundle work.title must be a string");
  }
  if (!isRecord(work.extensions)) {
    reject("ArtworkBundle work.extensions must be an object");
  }
}

function validateRevision(revision, path, workId) {
  try {
    validateArtworkRevision(revision);
    resolveArtworkRevision(revision);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reject(`${path} is unsupported: ${message}`);
  }

  if (revision.workId !== workId) {
    reject(`${path}.workId must match ArtworkBundle work.workId`);
  }
}

function validateArtworkBundle(bundle) {
  if (!isRecord(bundle)) {
    reject("ArtworkBundle must be an object");
  }
  if (bundle.bundleVersion !== ARTWORK_BUNDLE_VERSION) {
    reject(`Unsupported ArtworkBundle version ${String(bundle.bundleVersion)}`);
  }
  if (
    typeof bundle.exportedAt !== "string" ||
    Number.isNaN(Date.parse(bundle.exportedAt))
  ) {
    reject("ArtworkBundle exportedAt must be an ISO-8601 timestamp");
  }

  validateWork(bundle.work);

  if (bundle.draft !== null) {
    validateRevision(bundle.draft, "ArtworkBundle draft", bundle.work.workId);
  }

  if (!Array.isArray(bundle.revisions)) {
    reject("ArtworkBundle revisions must be an array");
  }
  bundle.revisions.forEach((revision, index) => {
    validateRevision(
      revision,
      `ArtworkBundle revisions[${index}]`,
      bundle.work.workId,
    );
  });

  if (!isRecord(bundle.extensions)) {
    reject("ArtworkBundle extensions must be an object");
  }

  return bundle;
}

export function createArtworkBundle(bundle) {
  return validateArtworkBundle(
    clone({
      bundleVersion: ARTWORK_BUNDLE_VERSION,
      ...bundle,
    }),
  );
}

export function serializeArtworkBundle(bundle) {
  return JSON.stringify(validateArtworkBundle(bundle));
}

export function parseArtworkBundle(serialized) {
  if (typeof serialized !== "string") {
    reject("ArtworkBundle JSON must be a string");
  }

  try {
    return validateArtworkBundle(JSON.parse(serialized));
  } catch (error) {
    if (error instanceof ArtworkBundleValidationError) {
      throw error;
    }

    reject(
      `ArtworkBundle JSON is invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export function prepareArtworkBundleImport(serialized, existingWorkIds = []) {
  const bundle = parseArtworkBundle(serialized);
  const hasCollision = existingWorkIds.includes(bundle.work.workId);

  return {
    bundle,
    collision: hasCollision
      ? {
          workId: bundle.work.workId,
          choices: ["new-work", "replace"],
        }
      : null,
  };
}
