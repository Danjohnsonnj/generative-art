import { resolveArtworkRevision } from "./bootstrap.js";
import { createRng } from "./rng.js";

export const DEFAULT_THUMBNAIL_WIDTH_PX = 192;

function validateWidth(widthPx) {
  if (!Number.isInteger(widthPx) || widthPx <= 0) {
    throw new RangeError("Thumbnail widthPx must be a positive integer");
  }
}

export function createRevisionThumbnail(
  revision,
  { widthPx = DEFAULT_THUMBNAIL_WIDTH_PX } = {},
) {
  validateWidth(widthPx);

  const { system, style, revision: resolvedRevision } =
    resolveArtworkRevision(revision);
  const heightPx = Math.max(
    1,
    Math.round(widthPx / resolvedRevision.composition.aspectRatio),
  );
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Thumbnail canvas does not support 2D rendering");
  }

  const geometry = system.generate({
    rng: createRng(resolvedRevision.rng.seed),
    params: resolvedRevision.system.params,
    aspectRatio: resolvedRevision.composition.aspectRatio,
  });

  style.renderCanvas({
    ctx,
    geometry,
    params: resolvedRevision.style.params,
    widthPx,
    heightPx,
  });

  return Object.freeze({
    ...structuredClone(revision),
    thumbnail: Object.freeze({
      dataUrl: canvas.toDataURL("image/png"),
      widthPx,
      heightPx,
    }),
  });
}
