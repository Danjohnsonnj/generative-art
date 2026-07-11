import { rngMeta } from "./rng.js";
import { validateArtworkRevision } from "./document.js";
import {
  getStyle,
  getSystem,
  registerStyle,
  registerSystem,
  validateParams,
} from "./registry.js";
import * as flowField from "../systems/flow-field.js";
import * as inkTonal from "../styles/ink-tonal.js";

registerSystem(flowField);
registerStyle(inkTonal);

export function resolvePreset(preset) {
  if (
    preset.rng.id !== rngMeta.id ||
    preset.rng.version !== rngMeta.version
  ) {
    throw new Error(
      `Unsupported RNG ${preset.rng.id}@${preset.rng.version}`,
    );
  }

  const system = getSystem(preset.system.id, preset.system.version);
  const style = getStyle(preset.style.id, preset.style.version);

  validateParams(system.default.paramsSchema, preset.system.params);
  validateParams(style.default.paramsSchema, preset.style.params);

  if (
    system.default.irVersion !== style.default.irVersion ||
    system.default.irVersion !== 1
  ) {
    throw new Error("Preset modules do not share supported Geometry IR v1");
  }

  return { system, style };
}

export function resolveArtworkRevision(revision) {
  validateArtworkRevision(revision);

  return resolvePreset({
    rng: revision.rng,
    system: revision.system,
    style: revision.style,
  });
}
