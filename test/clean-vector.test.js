import { createGeometry, createStroke } from "../js/core/geometry.js";
import cleanVectorMeta, {
  renderCanvas,
  renderSVG,
} from "../js/styles/clean-vector.js";

const fixtureGeometry = createGeometry([
  createStroke({
    points: [
      { x: 0.25, y: 0.25, weight: 1 },
      { x: 1.25, y: 0.75, weight: 2 },
    ],
    tags: ["flow"],
  }),
  createStroke({
    points: [
      { x: 0.5, y: 0.2, weight: 1 },
      { x: 1, y: 0.2, weight: 1 },
      { x: 0.75, y: 0.6, weight: 1 },
    ],
    closed: true,
    fill: true,
    tags: ["region"],
  }),
]);

const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="#f1eee5"/><path d="M 100 100 L 500 300" fill="none" stroke="#202b28" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M 200 80 L 400 80 L 300 240 Z" fill="#202b28" fill-opacity="0.2" stroke="#202b28" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const tests = [
  {
    name: "clean-vector serializes a deterministic SVG fixture",
    fn(assert) {
      const svg = renderSVG({
        geometry: fixtureGeometry,
        params: { ...cleanVectorMeta.defaultParams },
        widthPx: 600,
        heightPx: 400,
      });

      assert.equal(svg.replace(/\s+/g, " ").trim(), expectedSvg);

      const document = new DOMParser().parseFromString(svg, "image/svg+xml");
      assert.equal(document.querySelector("parsererror"), null);
      assert.ok(document.querySelector("path, polygon"));
    },
  },
  {
    name: "clean-vector renders fixture geometry at the requested pixel size",
    fn(assert) {
      const canvas = document.createElement("canvas");
      const renderedCanvas = renderCanvas({
        ctx: canvas.getContext("2d"),
        geometry: fixtureGeometry,
        params: { ...cleanVectorMeta.defaultParams },
        widthPx: 600,
        heightPx: 400,
      });

      assert.equal(renderedCanvas, canvas);
      assert.equal(canvas.width, 600);
      assert.equal(canvas.height, 400);
    },
  },
];
