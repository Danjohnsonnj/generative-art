export class RegistryError extends Error {
  constructor(message) {
    super(message);
    this.name = "RegistryError";
  }
}

export class ParameterValidationError extends TypeError {
  constructor(message) {
    super(message);
    this.name = "ParameterValidationError";
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function moduleKey(id, version) {
  return `${id}@${version}`;
}

export function createRegistry(kind) {
  const modules = new Map();

  return Object.freeze({
    register(moduleDefinition) {
      const meta = moduleDefinition?.default;

      if (!isRecord(meta)) {
        throw new RegistryError(`${kind} module must have a default metadata export`);
      }

      if (typeof meta.id !== "string" || meta.id.length === 0) {
        throw new RegistryError(`${kind} module id must be a non-empty string`);
      }

      if (!Number.isInteger(meta.version) || meta.version < 1) {
        throw new RegistryError(`${kind} module version must be a positive integer`);
      }

      const key = moduleKey(meta.id, meta.version);

      if (modules.has(key)) {
        throw new RegistryError(`${kind} module ${key} is already registered`);
      }

      modules.set(key, moduleDefinition);
      return moduleDefinition;
    },

    get(id, version) {
      const key = moduleKey(id, version);
      const moduleDefinition = modules.get(key);

      if (!moduleDefinition) {
        throw new RegistryError(`${kind} module ${key} is not registered`);
      }

      return moduleDefinition;
    },

    list() {
      return Array.from(modules.values());
    },
  });
}

function rejectParam(name, message) {
  throw new ParameterValidationError(`Parameter "${name}" ${message}`);
}

function validateParam(name, definition, value) {
  switch (definition.type) {
    case "number":
      if (!Number.isFinite(value)) {
        rejectParam(name, "must be a finite number");
      }
      if (definition.min !== undefined && value < definition.min) {
        rejectParam(name, `must be at least ${definition.min}`);
      }
      if (definition.max !== undefined && value > definition.max) {
        rejectParam(name, `must be at most ${definition.max}`);
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        rejectParam(name, "must be a boolean");
      }
      break;
    case "select":
      if (
        !Array.isArray(definition.choices) ||
        !definition.choices.includes(value)
      ) {
        rejectParam(name, "must be one of its declared choices");
      }
      break;
    case "color":
    case "text":
    case "seed":
      if (typeof value !== "string") {
        rejectParam(name, "must be a string");
      }
      break;
    default:
      rejectParam(name, `uses unsupported schema type "${definition.type}"`);
  }
}

export function validateParams(paramsSchema, params) {
  if (!isRecord(paramsSchema)) {
    throw new ParameterValidationError("Parameter schema must be an object");
  }

  if (!isRecord(params)) {
    throw new ParameterValidationError("Parameters must be an object");
  }

  for (const [name, definition] of Object.entries(paramsSchema)) {
    if (!isRecord(definition) || typeof definition.type !== "string") {
      rejectParam(name, "must have a schema type");
    }

    if (!Object.hasOwn(params, name)) {
      rejectParam(name, "is required");
    }

    validateParam(name, definition, params[name]);
  }

  for (const name of Object.keys(params)) {
    if (!Object.hasOwn(paramsSchema, name)) {
      rejectParam(name, "is not declared in the schema");
    }
  }

  return params;
}

export const systemRegistry = createRegistry("system");
export const styleRegistry = createRegistry("style");

export const registerSystem = systemRegistry.register;
export const getSystem = systemRegistry.get;
export const listSystems = systemRegistry.list;
export const registerStyle = styleRegistry.register;
export const getStyle = styleRegistry.get;
export const listStyles = styleRegistry.list;
