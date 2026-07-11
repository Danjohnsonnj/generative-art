import { createRng } from "../js/core/rng.js";
import flowMeta, { generate } from "../js/systems/flow-field.js";
import inkTonalMeta, { renderCanvas } from "../js/styles/ink-tonal.js";

function fixtureGeometry() {
  return generate({
    rng: createRng("ink-tonal-preview-v1"),
    params: { ...flowMeta.defaultParams },
    aspectRatio: 1.5,
  });
}

function showManualPreview(canvas) {
  const figure = document.createElement("figure");
  const caption = document.createElement("figcaption");

  figure.dataset.testPreview = "ink-tonal";
  figure.style.margin = "2rem 0 0";
  figure.style.padding = "1rem";
  figure.style.border = "1px solid currentColor";

  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "auto";

  caption.textContent = "Manual UAT · ink-tonal fixture";
  caption.style.marginTop = "0.75rem";
  caption.style.fontSize = "0.75rem";
  caption.style.letterSpacing = "0.08em";
  caption.style.textTransform = "uppercase";

  figure.append(canvas, caption);
  document.querySelector("main").append(figure);
}

export const tests = [
  {
    name: "ink-tonal renders fixture geometry at the requested pixel size",
    fn(assert) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const renderedCanvas = renderCanvas({
        ctx,
        geometry: fixtureGeometry(),
        params: { ...inkTonalMeta.defaultParams },
        widthPx: 600,
        heightPx: 400,
      });

      assert.equal(renderedCanvas, canvas);
      assert.equal(canvas.width, 600);
      assert.equal(canvas.height, 400);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const firstPixel = pixels.slice(0, 4).join(",");
      let hasTonalMark = false;

      for (let index = 4; index < pixels.length; index += 4) {
        if (pixels.slice(index, index + 4).join(",") !== firstPixel) {
          hasTonalMark = true;
          break;
        }
      }

      assert.ok(hasTonalMark, "Expected rendered output to contain tonal marks");
      showManualPreview(canvas);
    },
  },
];
