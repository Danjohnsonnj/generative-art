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
  strokeWidth: {
    type: "number",
    label: "Stroke width",
    min: 0.25,
    max: 6,
    step: 0.25,
    default: 2,
    group: "Material",
    order: 30,
    randomize: true,
  },
  fillOpacity: {
    type: "number",
    label: "Fill opacity",
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.2,
    group: "Material",
    order: 40,
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
  id: "clean-vector",
  version: 1,
  label: "Clean vector",
  description: "Crisp weighted paths and translucent geometric fills.",
  irVersion: 1,
  paramsSchema,
  defaultParams,
  capabilities: Object.freeze({ canvas: true, svg: true }),
});

export default meta;

function validateRenderArguments({ geometry, params, widthPx, heightPx }) {
  validateGeometry(geometry);
  validateParams(meta.paramsSchema, params);

  if (
    !Number.isInteger(widthPx) ||
    widthPx <= 0 ||
    !Number.isInteger(heightPx) ||
    heightPx <= 0
  ) {
    throw new RangeError("widthPx and heightPx must be positive integers");
  }
}

function averageWeight(stroke) {
  if (stroke.points.length === 0) {
    return 1;
  }

  const total = stroke.points.reduce((sum, point) => sum + point.weight, 0);
  return total / stroke.points.length;
}

function scalePoint(point, heightPx) {
  return { x: point.x * heightPx, y: point.y * heightPx };
}

function traceCanvasPath(ctx, stroke, heightPx) {
  if (stroke.points.length === 0) {
    return false;
  }

  const first = scalePoint(stroke.points[0], heightPx);
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);

  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = scalePoint(stroke.points[index], heightPx);
    ctx.lineTo(point.x, point.y);
  }

  if (stroke.closed) {
    ctx.closePath();
  }

  return true;
}

function formatNumber(value) {
  return String(Number(value.toFixed(4)));
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function createPathData(stroke, heightPx) {
  if (stroke.points.length === 0) {
    return null;
  }

  const commands = stroke.points.map((point, index) => {
    const { x, y } = scalePoint(point, heightPx);
    return `${index === 0 ? "M" : "L"} ${formatNumber(x)} ${formatNumber(y)}`;
  });

  if (stroke.closed) {
    commands.push("Z");
  }

  return commands.join(" ");
}

export function renderCanvas({
  ctx,
  geometry,
  params,
  widthPx,
  heightPx,
}) {
  validateRenderArguments({ geometry, params, widthPx, heightPx });

  if (!ctx?.canvas) {
    throw new TypeError("ctx must be a CanvasRenderingContext2D");
  }

  const canvas = ctx.canvas;
  canvas.width = widthPx;
  canvas.height = heightPx;

  ctx.fillStyle = params.paperColor;
  ctx.fillRect(0, 0, widthPx, heightPx);
  ctx.strokeStyle = params.inkColor;
  ctx.fillStyle = params.inkColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of geometry.strokes) {
    if (!traceCanvasPath(ctx, stroke, heightPx)) {
      continue;
    }

    ctx.lineWidth = params.strokeWidth * averageWeight(stroke);

    if (stroke.closed && stroke.fill) {
      ctx.globalAlpha = params.fillOpacity;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  return canvas;
}

export function renderSVG({ geometry, params, widthPx, heightPx }) {
  validateRenderArguments({ geometry, params, widthPx, heightPx });

  const paperColor = escapeAttribute(params.paperColor);
  const inkColor = escapeAttribute(params.inkColor);
  const paths = geometry.strokes.flatMap((stroke) => {
    const d = createPathData(stroke, heightPx);

    if (!d) {
      return [];
    }

    const strokeWidth = formatNumber(params.strokeWidth * averageWeight(stroke));
    const fill = stroke.closed && stroke.fill ? inkColor : "none";
    const fillOpacity =
      stroke.closed && stroke.fill
        ? ` fill-opacity="${formatNumber(params.fillOpacity)}"`
        : "";

    return `<path d="${d}" fill="${fill}"${fillOpacity} stroke="${inkColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}"><rect width="100%" height="100%" fill="${paperColor}"/>${paths.join("")}</svg>`;
}
