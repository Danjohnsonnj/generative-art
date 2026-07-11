import {
  createGeometry,
  createStroke,
  validateGeometry,
} from "../core/geometry.js";
import { validateParams } from "../core/registry.js";

const TAU = Math.PI * 2;

const paramsSchema = Object.freeze({
  lineCount: {
    type: "number",
    label: "Lines",
    min: 12,
    max: 160,
    step: 1,
    default: 72,
    group: "Structure",
    order: 10,
    randomize: true,
  },
  steps: {
    type: "number",
    label: "Line length",
    min: 24,
    max: 180,
    step: 1,
    default: 96,
    group: "Structure",
    order: 20,
    randomize: true,
  },
  stepLength: {
    type: "number",
    label: "Step length",
    min: 0.002,
    max: 0.025,
    step: 0.001,
    default: 0.009,
    group: "Flow",
    order: 30,
    randomize: true,
  },
  fieldScale: {
    type: "number",
    label: "Field scale",
    min: 0.5,
    max: 6,
    step: 0.1,
    default: 2.4,
    group: "Flow",
    order: 40,
    randomize: true,
  },
  turbulence: {
    type: "number",
    label: "Turbulence",
    min: 0,
    max: 2.4,
    step: 0.05,
    default: 1.15,
    group: "Flow",
    order: 50,
    randomize: true,
  },
  drift: {
    type: "number",
    label: "Vertical drift",
    min: -1,
    max: 1,
    step: 0.05,
    default: 0.1,
    group: "Flow",
    order: 60,
    randomize: true,
  },
  weight: {
    type: "number",
    label: "Stroke weight",
    min: 0.1,
    max: 3,
    step: 0.1,
    default: 1,
    group: "Mark",
    order: 70,
    randomize: true,
  },
  weightVariation: {
    type: "number",
    label: "Weight variation",
    min: 0,
    max: 0.8,
    step: 0.05,
    default: 0.35,
    group: "Mark",
    order: 80,
    randomize: true,
  },
  margin: {
    type: "number",
    label: "Margin",
    min: 0,
    max: 0.2,
    step: 0.01,
    default: 0.04,
    group: "Composition",
    order: 90,
    randomize: false,
  },
});

const defaultParams = Object.freeze(
  Object.fromEntries(
    Object.entries(paramsSchema).map(([name, definition]) => [
      name,
      definition.default,
    ]),
  ),
);

const meta = Object.freeze({
  id: "flow-field",
  version: 1,
  label: "Flow field",
  description: "Layered curves moving through a smooth, seeded vector field.",
  irVersion: 1,
  paramsSchema,
  defaultParams,
});

export default meta;

function shortestAngle(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function generate({ rng, params, aspectRatio }) {
  validateParams(meta.paramsSchema, params);

  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    throw new RangeError("aspectRatio must be a positive finite number");
  }

  if (typeof rng?.next !== "function") {
    throw new TypeError("rng must provide a next() function");
  }

  const xMargin = Math.min(params.margin, aspectRatio * 0.25);
  const yMargin = Math.min(params.margin, 0.25);
  const usableWidth = aspectRatio - xMargin * 2;
  const usableHeight = 1 - yMargin * 2;
  const columns = Math.ceil(Math.sqrt(params.lineCount * aspectRatio));
  const rows = Math.ceil(params.lineCount / columns);

  const phaseX = rng.next() * TAU;
  const phaseY = rng.next() * TAU;
  const phaseCross = rng.next() * TAU;
  const baseAngle = (rng.next() - 0.5) * 0.5;

  function fieldAngle(x, y) {
    const normalizedX = x / aspectRatio;
    const waveX = Math.sin(normalizedX * params.fieldScale * TAU + phaseX);
    const waveY = Math.cos(y * params.fieldScale * 0.83 * TAU + phaseY);
    const crossWave = Math.sin(
      (normalizedX + y) * params.fieldScale * 0.47 * TAU + phaseCross,
    );

    return (
      baseAngle +
      params.turbulence * (waveX * 0.58 + waveY * 0.3 + crossWave * 0.12) +
      params.drift * (y - 0.5)
    );
  }

  const strokes = [];

  for (let lineIndex = 0; lineIndex < params.lineCount; lineIndex += 1) {
    const column = lineIndex % columns;
    const row = Math.floor(lineIndex / columns);
    let x =
      xMargin +
      ((column + 0.15 + rng.next() * 0.7) / columns) * usableWidth;
    let y =
      yMargin +
      ((row + 0.15 + rng.next() * 0.7) / rows) * usableHeight;
    let heading = fieldAngle(x, y) + (rng.next() - 0.5) * 0.35;
    const weightPhase = rng.next() * TAU;
    const points = [];

    for (let stepIndex = 0; stepIndex < params.steps; stepIndex += 1) {
      const progress = stepIndex / Math.max(1, params.steps - 1);
      const pressure =
        params.weight *
        (1 + params.weightVariation * Math.sin(progress * Math.PI + weightPhase));

      points.push({ x, y, weight: pressure });

      const targetHeading = fieldAngle(x, y);
      heading += shortestAngle(heading, targetHeading) * 0.24;

      const nextX = x + Math.cos(heading) * params.stepLength;
      const nextY = y + Math.sin(heading) * params.stepLength;

      if (nextX < 0 || nextX > aspectRatio || nextY < 0 || nextY > 1) {
        break;
      }

      x = nextX;
      y = nextY;
    }

    strokes.push(
      createStroke({
        points,
        tags: ["flow"],
      }),
    );
  }

  return validateGeometry(createGeometry(strokes));
}
