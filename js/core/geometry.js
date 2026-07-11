export const IR_VERSION = 1;

export class GeometryValidationError extends TypeError {
  constructor(message) {
    super(message);
    this.name = "GeometryValidationError";
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function reject(message) {
  throw new GeometryValidationError(message);
}

export function createStroke({
  points,
  closed = false,
  fill = false,
  tags = [],
  styleHints = {},
}) {
  return { points, closed, fill, tags, styleHints };
}

export function createGeometry(strokes = []) {
  return { irVersion: IR_VERSION, strokes };
}

export function validateGeometry(geometry) {
  if (!isRecord(geometry)) {
    reject("Geometry must be an object");
  }

  if (geometry.irVersion !== IR_VERSION) {
    reject(`Geometry irVersion must be ${IR_VERSION}`);
  }

  if (!Array.isArray(geometry.strokes)) {
    reject("Geometry strokes must be an array");
  }

  geometry.strokes.forEach((stroke, strokeIndex) => {
    const path = `strokes[${strokeIndex}]`;

    if (!isRecord(stroke)) {
      reject(`${path} must be an object`);
    }

    if (!Array.isArray(stroke.points)) {
      reject(`${path}.points must be an array`);
    }

    stroke.points.forEach((point, pointIndex) => {
      if (
        !isRecord(point) ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        !Number.isFinite(point.weight)
      ) {
        reject(
          `${path}.points[${pointIndex}] must contain finite x, y, and weight values`,
        );
      }
    });

    if (typeof stroke.closed !== "boolean") {
      reject(`${path}.closed must be a boolean`);
    }

    if (typeof stroke.fill !== "boolean") {
      reject(`${path}.fill must be a boolean`);
    }

    if (stroke.fill && !stroke.closed) {
      reject(`${path} cannot be filled unless it is closed`);
    }

    if (
      !Array.isArray(stroke.tags) ||
      !stroke.tags.every((tag) => typeof tag === "string")
    ) {
      reject(`${path}.tags must be an array of strings`);
    }

    if (!isRecord(stroke.styleHints)) {
      reject(`${path}.styleHints must be an object`);
    }
  });

  return geometry;
}
