import {
  ParameterValidationError,
  RegistryError,
  createRegistry,
  validateParams,
} from "../js/core/registry.js";

function systemModule(id = "fixture-system", version = 1) {
  return {
    default: {
      id,
      version,
      label: "Fixture system",
      description: "Used to verify registry behavior.",
      irVersion: 1,
      paramsSchema: {},
      defaultParams: {},
    },
    generate() {},
  };
}

const paramsSchema = Object.freeze({
  density: { type: "number", min: 1, max: 100 },
  enabled: { type: "boolean" },
  mode: { type: "select", choices: ["quiet", "active"] },
  paper: { type: "color" },
  title: { type: "text" },
  seed: { type: "seed" },
});

function validParams() {
  return {
    density: 42,
    enabled: true,
    mode: "quiet",
    paper: "#f4f0e8",
    title: "Study",
    seed: "abc",
  };
}

export const tests = [
  {
    name: "registry register get and list round-trip a module",
    fn(assert) {
      const registry = createRegistry("system");
      const module = systemModule();

      assert.equal(registry.register(module), module);
      assert.equal(registry.get("fixture-system", 1), module);
      assert.equal(registry.list()[0], module);
    },
  },
  {
    name: "registry rejects duplicate id and version",
    fn(assert) {
      const registry = createRegistry("system");
      registry.register(systemModule());

      assert.throws(
        () => registry.register(systemModule()),
        RegistryError,
      );
    },
  },
  {
    name: "validateParams accepts correctly typed in-range values",
    fn(assert) {
      const params = validParams();
      assert.equal(validateParams(paramsSchema, params), params);
    },
  },
  {
    name: "validateParams rejects an out-of-range number",
    fn(assert) {
      const params = validParams();
      params.density = 101;

      assert.throws(
        () => validateParams(paramsSchema, params),
        ParameterValidationError,
      );
    },
  },
  {
    name: "validateParams rejects a wrong-type value",
    fn(assert) {
      const params = validParams();
      params.enabled = "yes";

      assert.throws(
        () => validateParams(paramsSchema, params),
        ParameterValidationError,
      );
    },
  },
];
