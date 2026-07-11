import { createRng } from "../js/core/rng.js";
import { exportSvg } from "../js/core/export-svg.js";
import flowMeta, { generate } from "../js/systems/flow-field.js";
import * as cleanVector from "../js/styles/clean-vector.js";
import * as inkTonal from "../js/styles/ink-tonal.js";

function fixtureGeometry() {
  return generate({
    rng: createRng("svg-export-fixture-v1"),
    params: { ...flowMeta.defaultParams },
    aspectRatio: 1.5,
  });
}

export const tests = [
  {
    name: "SVG export returns a valid SVG Blob for clean-vector",
    async fn(assert) {
      const result = exportSvg({
        style: cleanVector,
        geometry: fixtureGeometry(),
        params: { ...cleanVector.default.defaultParams },
        widthPx: 600,
        heightPx: 400,
      });

      assert.equal(result.status, "ok");
      assert.equal(result.blob.type, "image/svg+xml");

      const svg = await result.blob.text();
      const document = new DOMParser().parseFromString(svg, "image/svg+xml");
      assert.equal(document.querySelector("parsererror"), null);
      assert.equal(document.documentElement.localName, "svg");
    },
  },
  {
    name: "SVG export reports ink-tonal as unsupported",
    fn(assert) {
      const result = exportSvg({
        style: inkTonal,
        geometry: fixtureGeometry(),
        params: { ...inkTonal.default.defaultParams },
        widthPx: 600,
        heightPx: 400,
      });

      assert.equal(result.status, "unsupported");
      assert.ok(result.reason.includes("unsupported"));
      assert.equal(Object.hasOwn(result, "blob"), false);
    },
  },
];
