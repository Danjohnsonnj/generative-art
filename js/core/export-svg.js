function styleLabel(style) {
  const meta = style?.default;
  return meta?.id && meta?.version
    ? `${meta.id}@${meta.version}`
    : "active style";
}

export function exportSvg({ style, geometry, params, widthPx, heightPx }) {
  if (!style?.default?.capabilities?.svg || typeof style.renderSVG !== "function") {
    return {
      status: "unsupported",
      reason: `SVG export is unsupported for ${styleLabel(style)}`,
    };
  }

  const svg = style.renderSVG({ geometry, params, widthPx, heightPx });

  if (typeof svg !== "string" || svg.length === 0) {
    throw new Error(`${styleLabel(style)} returned an empty SVG document`);
  }

  return {
    status: "ok",
    blob: new Blob([svg], { type: "image/svg+xml" }),
  };
}
