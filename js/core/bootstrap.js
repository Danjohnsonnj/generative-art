import { rngMeta } from "./rng.js";
import { validateArtworkRevision } from "./document.js";
import {
  getStyle,
  getSystem,
  listStyles,
  listSystems,
  registerStyle,
  registerSystem,
  validateParams,
} from "./registry.js";
import * as flowField from "../systems/flow-field.js";
import * as cleanVector from "../styles/clean-vector.js";
import * as inkTonal from "../styles/ink-tonal.js";

registerSystem(flowField);
registerStyle(cleanVector);
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

function resolveModuleReference(reference, kind, getModule, listModules) {
  try {
    return {
      module: getModule(reference.id, reference.version),
      params: reference.params,
    };
  } catch {
    const currentModule = listModules()
      .filter((candidate) => candidate.default.id === reference.id)
      .sort((left, right) => left.default.version - right.default.version)
      .at(-1);

    if (!currentModule || typeof currentModule.migrate !== "function") {
      throw new Error(`Unsupported ${kind} ${reference.id}@${reference.version}`);
    }

    try {
      const params = currentModule.migrate(reference.params, reference.version);
      validateParams(currentModule.default.paramsSchema, params);
      return { module: currentModule, params };
    } catch (error) {
      throw new Error(
        `Unsupported ${kind} ${reference.id}@${reference.version}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

export function resolveArtworkRevision(revision) {
  validateArtworkRevision(revision);

  if (
    revision.rng.id !== rngMeta.id ||
    revision.rng.version !== rngMeta.version
  ) {
    throw new Error(
      `Unsupported RNG ${revision.rng.id}@${revision.rng.version}`,
    );
  }

  const system = resolveModuleReference(
    revision.system,
    "system",
    getSystem,
    listSystems,
  );
  const style = resolveModuleReference(
    revision.style,
    "style",
    getStyle,
    listStyles,
  );

  if (
    system.module.default.irVersion !== style.module.default.irVersion ||
    system.module.default.irVersion !== revision.irVersion
  ) {
    throw new Error("Revision modules do not share the recorded Geometry IR");
  }

  return {
    system: system.module,
    style: style.module,
    revision: {
      ...structuredClone(revision),
      system: {
        id: system.module.default.id,
        version: system.module.default.version,
        params: system.params,
      },
      style: {
        id: style.module.default.id,
        version: style.module.default.version,
        params: style.params,
      },
    },
  };
}
