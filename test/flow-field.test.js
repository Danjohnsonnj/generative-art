import { validateGeometry } from "../js/core/geometry.js";
import { createRng } from "../js/core/rng.js";
import flowMeta, { generate } from "../js/systems/flow-field.js";

function pointHash(geometry) {
  const serialized = geometry.strokes
    .map((stroke) =>
      stroke.points
        .map((point) =>
          [point.x, point.y, point.weight]
            .map((value) => value.toFixed(6))
            .join(","),
        )
        .join(";"),
    )
    .join("|");

  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function generateFixture() {
  return generate({
    rng: createRng("flow-field-fixture-v1"),
    params: { ...flowMeta.defaultParams },
    aspectRatio: 1.5,
  });
}

export const tests = [
  {
    name: "flow-field fixture has stable stroke count and point hash",
    fn(assert) {
      const geometry = generateFixture();
      assert.equal(geometry.strokes.length, 72);
      assert.equal(pointHash(geometry), "906c7571");
    },
  },
  {
    name: "flow-field emits finite in-bounds normalized geometry",
    fn(assert) {
      const geometry = generateFixture();
      validateGeometry(geometry);

      for (const stroke of geometry.strokes) {
        for (const point of stroke.points) {
          assert.ok(Number.isFinite(point.x));
          assert.ok(Number.isFinite(point.y));
          assert.ok(point.x >= 0 && point.x <= 1.5);
          assert.ok(point.y >= 0 && point.y <= 1);
        }
      }
    },
  },
];
