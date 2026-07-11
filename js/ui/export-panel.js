import { exportCanvasAsPng } from "../core/export-png.js";
import { exportSvg } from "../core/export-svg.js";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function createExportPanel({
  canvas,
  getSvgRender = () => null,
  filename = "generative-art",
}) {
  const panel = document.createElement("section");
  const heading = document.createElement("h2");
  const pngButton = document.createElement("button");
  const pngStatus = document.createElement("p");
  const svgButton = document.createElement("button");
  const svgStatus = document.createElement("p");

  panel.className = "export-panel";
  heading.className = "export-panel__title";
  heading.textContent = "Export";
  pngButton.type = "button";
  pngButton.textContent = "Export PNG";
  pngStatus.className = "export-panel__status";
  pngStatus.setAttribute("aria-live", "polite");
  pngStatus.textContent = "Display size";
  svgButton.type = "button";
  svgButton.textContent = "Export SVG";
  svgButton.dataset.exportSvg = "";
  svgStatus.className = "export-panel__status";
  svgStatus.dataset.exportSvgStatus = "";
  svgStatus.setAttribute("aria-live", "polite");

  pngButton.addEventListener("click", async () => {
    pngButton.disabled = true;
    pngStatus.textContent = "Encoding…";

    try {
      const blob = await exportCanvasAsPng(canvas);
      downloadBlob(blob, `${filename}.png`);
      pngStatus.textContent = `${canvas.width} × ${canvas.height} px`;
    } catch (error) {
      pngStatus.textContent =
        error instanceof Error ? error.message : "PNG export failed";
    } finally {
      pngButton.disabled = false;
    }
  });

  svgButton.addEventListener("click", () => {
    const result = exportSvg(getSvgRender());

    if (result.status === "unsupported") {
      svgStatus.textContent = result.reason;
      return;
    }

    downloadBlob(result.blob, `${filename}.svg`);
    svgStatus.textContent = "SVG ready";
  });

  function update() {
    const render = getSvgRender();
    const style = render?.style;
    const supportsSvg =
      style?.default?.capabilities?.svg && typeof style.renderSVG === "function";

    svgButton.disabled = !supportsSvg;
    svgStatus.textContent = supportsSvg
      ? "True vector SVG"
      : `SVG is not available for ${style?.default?.label ?? "this style"}`;
  }

  panel.append(heading, pngButton, pngStatus, svgButton, svgStatus);
  update();

  return Object.freeze({ element: panel, update });
}
