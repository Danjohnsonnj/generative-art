const flowInkWash = Object.freeze({
  id: "flow-ink-wash",
  version: 1,
  label: "Flow / ink wash",
  description: "A layered field of gestural ink currents.",
  composition: Object.freeze({
    aspectRatio: 1.5,
    background: "#f1eee5",
    coordinateSpace: "normalized-v1",
  }),
  rng: Object.freeze({
    id: "mulberry32",
    version: 1,
    seed: "sumi-current-001",
  }),
  system: Object.freeze({
    id: "flow-field",
    version: 1,
    params: Object.freeze({
      lineCount: 72,
      steps: 96,
      stepLength: 0.009,
      fieldScale: 2.4,
      turbulence: 1.15,
      drift: 0.1,
      weight: 1,
      weightVariation: 0.35,
      margin: 0.04,
    }),
  }),
  style: Object.freeze({
    id: "ink-tonal",
    version: 1,
    params: Object.freeze({
      paperColor: "#f1eee5",
      inkColor: "#202b28",
      inkOpacity: 0.48,
      washStrength: 0.16,
      bleed: 0.004,
      strokeWidth: 1.1,
    }),
  }),
});

export default flowInkWash;
