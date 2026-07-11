import { createRng, hashSeed, rngMeta } from "../js/core/rng.js";

const SEED_ABC_HASH = 440920331;
const SEED_ABC_SEQUENCE = Object.freeze([
  0.5166419988963753,
  0.6596221292857081,
  0.0018796597141772509,
  0.8993499737698585,
  0.7205349628347903,
  0.47386677167378366,
  0.9036288792267442,
  0.6176504602190107,
]);

export const tests = [
  {
    name: "rng meta identifies mulberry32 version 1",
    fn(assert) {
      assert.equal(rngMeta.id, "mulberry32");
      assert.equal(rngMeta.version, 1);
    },
  },
  {
    name: "hashSeed maps abc to the FNV-1a fixture",
    fn(assert) {
      assert.equal(hashSeed("abc"), SEED_ABC_HASH);
    },
  },
  {
    name: "same seed produces an identical sequence",
    fn(assert) {
      const first = createRng("studio-seed");
      const second = createRng("studio-seed");

      for (let index = 0; index < 16; index += 1) {
        assert.equal(first.next(), second.next());
      }
    },
  },
  {
    name: "seed abc matches the recorded mulberry32 fixture",
    fn(assert) {
      const rng = createRng("abc");

      for (const expected of SEED_ABC_SEQUENCE) {
        assert.equal(rng.next(), expected);
      }
    },
  },
  {
    name: "different seeds diverge",
    fn(assert) {
      const first = createRng("abc").next();
      const second = createRng("abd").next();
      assert.ok(first !== second);
    },
  },
];
