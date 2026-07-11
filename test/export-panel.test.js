import { createGeometry, createStroke } from "../js/core/geometry.js";
import * as cleanVector from "../js/styles/clean-vector.js";
import * as inkTonal from "../js/styles/ink-tonal.js";
import { createExportPanel } from "../js/ui/export-panel.js";

const geometry = createGeometry([
  createStroke({
    points: [
      { x: 0.1, y: 0.2, weight: 1 },
      { x: 1.2, y: 0.8, weight: 1 },
    ],
  }),
]);

function renderData(style) {
  return {
    style,
    geometry,
    params: { ...style.default.defaultParams },
    widthPx: 600,
    heightPx: 400,
  };
}

export const tests = [
  {
    name: "export panel enables SVG only for vector-capable styles",
    fn(assert) {
      const canvas = document.createElement("canvas");
      let currentRender = renderData(cleanVector);
      const panel = createExportPanel({
        canvas,
        getSvgRender: () => currentRender,
      });

      document.body.append(panel.element);
      const svgButton = panel.element.querySelector("[data-export-svg]");
      const status = panel.element.querySelector("[data-export-svg-status]");

      assert.equal(svgButton.disabled, false);
      assert.equal(status.textContent, "True vector SVG");

      currentRender = renderData(inkTonal);
      panel.update();

      assert.equal(svgButton.disabled, true);
      assert.ok(status.textContent.includes("not available"));
      panel.element.remove();
    },
  },
];
