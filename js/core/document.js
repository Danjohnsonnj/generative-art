export const ARTWORK_REVISION_SCHEMA_VERSION = 1;
export const SUPPORTED_IR_VERSION = 1;

export class ArtworkDocumentValidationError extends TypeError {
  constructor(message) {
    super(message);
    this.name = "ArtworkDocumentValidationError";
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function reject(message) {
  throw new ArtworkDocumentValidationError(message);
}

function requireRecord(value, path) {
  if (!isRecord(value)) {
    reject(`${path} must be an object`);
  }
}

function requireString(value, path) {
  if (typeof value !== "string") {
    reject(`${path} must be a string`);
  }
}

function requireNonEmptyString(value, path) {
  requireString(value, path);

  if (value.length === 0) {
    reject(`${path} must not be empty`);
  }
}

function requirePositiveInteger(value, path) {
  if (!Number.isInteger(value) || value < 1) {
    reject(`${path} must be a positive integer`);
  }
}

function requireNonNegativeInteger(value, path) {
  if (!Number.isInteger(value) || value < 0) {
    reject(`${path} must be a non-negative integer`);
  }
}

function requirePositiveNumber(value, path) {
  if (!Number.isFinite(value) || value <= 0) {
    reject(`${path} must be a positive finite number`);
  }
}

function requireTimestamp(value, path) {
  requireString(value, path);

  const isIsoTimestamp =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    );

  if (!isIsoTimestamp || Number.isNaN(Date.parse(value))) {
    reject(`${path} must be an ISO-8601 timestamp`);
  }
}

function validateNullableRevisionId(value, path) {
  if (value !== null) {
    requireNonEmptyString(value, path);
  }
}

function validateModuleReference(moduleReference, path) {
  requireRecord(moduleReference, path);
  requireNonEmptyString(moduleReference.id, `${path}.id`);
  requireNonNegativeInteger(moduleReference.version, `${path}.version`);
  requireRecord(moduleReference.params, `${path}.params`);
}

export function createArtworkRevision(revision) {
  return validateArtworkRevision({
    schemaVersion: ARTWORK_REVISION_SCHEMA_VERSION,
    ...revision,
  });
}

export function validateArtworkRevision(revision) {
  requireRecord(revision, "ArtworkRevision");

  if (revision.schemaVersion !== ARTWORK_REVISION_SCHEMA_VERSION) {
    reject(
      `Unsupported ArtworkRevision schemaVersion ${String(revision.schemaVersion)}`,
    );
  }

  requireNonEmptyString(revision.workId, "workId");
  requireNonEmptyString(revision.revisionId, "revisionId");
  validateNullableRevisionId(revision.parentRevisionId, "parentRevisionId");
  validateNullableRevisionId(revision.forkedFromRevisionId, "forkedFromRevisionId");
  requireString(revision.title, "title");
  requireString(revision.notes, "notes");
  requireTimestamp(revision.createdAt, "createdAt");
  requireTimestamp(revision.checkpointedAt, "checkpointedAt");

  requireRecord(revision.composition, "composition");
  requirePositiveNumber(revision.composition.aspectRatio, "composition.aspectRatio");
  requireNonEmptyString(revision.composition.background, "composition.background");
  if (revision.composition.coordinateSpace !== "normalized-v1") {
    reject("composition.coordinateSpace must be normalized-v1");
  }

  requireRecord(revision.rng, "rng");
  requireNonEmptyString(revision.rng.id, "rng.id");
  requirePositiveInteger(revision.rng.version, "rng.version");
  requireString(revision.rng.seed, "rng.seed");

  validateModuleReference(revision.system, "system");
  validateModuleReference(revision.style, "style");

  if (revision.irVersion !== SUPPORTED_IR_VERSION) {
    reject(`Unsupported ArtworkRevision irVersion ${String(revision.irVersion)}`);
  }

  requireRecord(revision.exportDefaults, "exportDefaults");
  requirePositiveNumber(revision.exportDefaults.widthIn, "exportDefaults.widthIn");
  requirePositiveNumber(revision.exportDefaults.heightIn, "exportDefaults.heightIn");
  requirePositiveNumber(revision.exportDefaults.dpi, "exportDefaults.dpi");
  requireRecord(revision.extensions, "extensions");

  return revision;
}
