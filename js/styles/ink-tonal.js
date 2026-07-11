import { validateGeometry } from "../core/geometry.js";
import { validateParams } from "../core/registry.js";

const paramsSchema = Object.freeze({
  paperColor: {
    type: "color",
    label: "Paper",
    default: "#f1eee5",
    group: "Palette",
    order: 10,
    randomize: false,
  },
  inkColor: {
    type: "color",
    label: "Ink",
    default: "#202b28",
    group: "Palette",
    order: 20,
    randomize: true,
  },
  inkOpacity: {
    type: "number",
    label: "Ink density",
    min: 0.1,
    max: 0.9,
    step: 0.01,
    default: 0.48,
    group: "Material",
    order: 30,
    randomize: true,
  },
  washStrength: {
    type: "number",
    label: "Wash",
    min: 0,
    max: 0.5,
    step: 0.01,
    default: 0.16,
    group: "Material",
    order: 40,
    randomize: true,
  },
  bleed: {
    type: "number",
    label: "Bleed",
    min: 0,
    max: 0.015,
    step: 0.001,
    default: 0.004,
    group: "Material",
    order: 50,
    randomize: true,
  },
  strokeWidth: {
    type: "number",
    label: "Stroke width",
    min: 0.3,
    max: 3,
    step: 0.1,
    default: 1.1,
    group: "Material",
    order: 60,
    randomize: true,
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
  id: "ink-tonal",
  version: 1,
  label: "Ink tonal",
  description: "Layered translucent ink with soft bleed and tonal overlap.",
  irVersion: 1,
  paramsSchema,
  defaultParams,
  capabilities: Object.freeze({ canvas: true, svg: false }),
});

export default meta;

function traceStroke(ctx, stroke, scale, offsetX = 0, offsetY = 0) {
  if (stroke.points.length === 0) {
    return false;
  }

  ctx.beginPath();
  ctx.moveTo(
    stroke.points[0].x * scale + offsetX,
    stroke.points[0].y * scale + offsetY,
  );

  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = stroke.points[index];
    ctx.lineTo(point.x * scale + offsetX, point.y * scale + offsetY);
  }

  if (stroke.closed) {
    ctx.closePath();
  }

  return true;
}

function averageWeight(stroke) {
  if (stroke.points.length === 0) {
    return 1;
  }

  const total = stroke.points.reduce((sum, point) => sum + point.weight, 0);
  return total / stroke.points.length;
}

function renderWash(ctx, geometry, params, scale) {
  ctx.strokeStyle = params.inkColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  geometry.strokes.forEach((stroke, strokeIndex) => {
    const weight = averageWeight(stroke);

    for (let layer = 0; layer < 3; layer += 1) {
      const spread = params.bleed * scale * (layer + 1);
      const offsetX = Math.sin((strokeIndex + 1) * 12.9898 + layer) * spread;
      const offsetY = Math.cos((strokeIndex + 1) * 7.233 + layer) * spread;

      if (!traceStroke(ctx, stroke, scale, offsetX, offsetY)) {
        continue;
      }

      ctx.globalAlpha = params.washStrength / (layer + 2);
      ctx.lineWidth =
        Math.max(0.5, params.strokeWidth * weight * (4.5 - layer)) *
        (scale / 400);
      ctx.stroke();
    }
  });
}

function renderInk(ctx, geometry, params, scale) {
  ctx.strokeStyle = params.inkColor;
  ctx.fillStyle = params.inkColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of geometry.strokes) {
    if (stroke.closed && stroke.fill && traceStroke(ctx, stroke, scale)) {
      ctx.globalAlpha = params.inkOpacity * 0.55;
      ctx.fill();
    }

    for (let index = 1; index < stroke.points.length; index += 1) {
      const from = stroke.points[index - 1];
      const to = stroke.points[index];
      const pressure = (from.weight + to.weight) / 2;

      ctx.beginPath();
      ctx.moveTo(from.x * scale, from.y * scale);
      ctx.lineTo(to.x * scale, to.y * scale);
      ctx.globalAlpha = params.inkOpacity;
      ctx.lineWidth =
        Math.max(0.45, params.strokeWidth * pressure) * (scale / 400);
      ctx.stroke();
    }
  }
}

export function renderCanvas({
  ctx,
  geometry,
  params,
  widthPx,
  heightPx,
}) {
  validateGeometry(geometry);
  validateParams(meta.paramsSchema, params);

  if (!ctx?.canvas) {
    throw new TypeError("ctx must be a CanvasRenderingContext2D");
  }

  if (
    !Number.isInteger(widthPx) ||
    widthPx <= 0 ||
    !Number.isInteger(heightPx) ||
    heightPx <= 0
  ) {
    throw new RangeError("widthPx and heightPx must be positive integers");
  }

  const canvas = ctx.canvas;
  canvas.width = widthPx;
  canvas.height = heightPx;

  ctx.fillStyle = params.paperColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  renderWash(ctx, geometry, params, heightPx);
  renderInk(ctx, geometry, params, heightPx);
  ctx.restore();

  return canvas;
}
