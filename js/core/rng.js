export const rngMeta = Object.freeze({
  id: "mulberry32",
  version: 1,
});

export function hashSeed(seed) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function mulberry32(seedInteger) {
  let state = seedInteger >>> 0;

  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed) {
  return Object.freeze({
    id: rngMeta.id,
    version: rngMeta.version,
    seed: String(seed),
    next: mulberry32(hashSeed(String(seed))),
  });
}
