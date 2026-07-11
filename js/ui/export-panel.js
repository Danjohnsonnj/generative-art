import { exportCanvasAsPng } from "../core/export-png.js";

function downloadPng(blob, filename) {
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

export function createExportPanel({ canvas, filename = "generative-art.png" }) {
  const panel = document.createElement("section");
  const heading = document.createElement("h2");
  const button = document.createElement("button");
  const status = document.createElement("p");

  panel.className = "export-panel";
  heading.className = "export-panel__title";
  heading.textContent = "Export / PNG";
  button.type = "button";
  button.textContent = "Export PNG";
  status.className = "export-panel__status";
  status.setAttribute("aria-live", "polite");
  status.textContent = "Display size";

  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Encoding…";

    try {
      const blob = await exportCanvasAsPng(canvas);
      downloadPng(blob, filename);
      status.textContent = `${canvas.width} × ${canvas.height} px`;
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : "PNG export failed";
    } finally {
      button.disabled = false;
    }
  });

  panel.append(heading, button, status);
  return panel;
}
