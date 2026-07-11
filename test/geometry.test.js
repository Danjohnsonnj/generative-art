import {
  GeometryValidationError,
  createGeometry,
  createStroke,
  validateGeometry,
} from "../js/core/geometry.js";

function validGeometry() {
  return {
    irVersion: 1,
    strokes: [
      {
        points: [
          { x: 0.1, y: 0.2, weight: 0.75 },
          { x: 0.8, y: 0.9, weight: 1 },
        ],
        closed: false,
        fill: false,
        tags: ["gesture"],
        styleHints: { opacity: 0.8 },
      },
    ],
  };
}

export const tests = [
  {
    name: "geometry validator accepts a valid IR v1 object",
    fn(assert) {
      const geometry = validGeometry();
      assert.equal(validateGeometry(geometry), geometry);
    },
  },
  {
    name: "geometry validator rejects fill on an open stroke",
    fn(assert) {
      const geometry = validGeometry();
      geometry.strokes[0].fill = true;

      assert.throws(
        () => validateGeometry(geometry),
        GeometryValidationError,
      );
    },
  },
  {
    name: "geometry validator rejects non-finite coordinates",
    fn(assert) {
      const geometry = validGeometry();
      geometry.strokes[0].points[1].x = Number.POSITIVE_INFINITY;

      assert.throws(
        () => validateGeometry(geometry),
        /finite x, y, and weight/,
      );
    },
  },
  {
    name: "geometry helpers create valid IR with safe defaults",
    fn(assert) {
      const stroke = createStroke({
        points: [
          { x: 0, y: 0, weight: 1 },
          { x: 1, y: 1, weight: 1 },
        ],
      });
      const geometry = createGeometry([stroke]);

      assert.equal(stroke.closed, false);
      assert.equal(stroke.fill, false);
      assert.equal(stroke.tags.length, 0);
      assert.equal(validateGeometry(geometry), geometry);
    },
  },
];
