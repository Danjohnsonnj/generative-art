import { resolvePreset } from "../js/core/bootstrap.js";
import { createRng } from "../js/core/rng.js";
import flowInkWash from "../js/presets/flow-ink-wash.js";

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

export const tests = [
  {
    name: "starter preset resolves registered modules and stable geometry",
    fn(assert) {
      const { system, style } = resolvePreset(flowInkWash);
      const geometry = system.generate({
        rng: createRng(flowInkWash.rng.seed),
        params: flowInkWash.system.params,
        aspectRatio: flowInkWash.composition.aspectRatio,
      });

      assert.equal(system.default.id, "flow-field");
      assert.equal(style.default.id, "ink-tonal");
      assert.equal(pointHash(geometry), "f6350686");
    },
  },
];
