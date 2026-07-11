import { assert } from "./assert.js";
import * as bundleIoTests from "./bundle-io.test.js";
import * as documentTests from "./document.test.js";
import * as exportPngTests from "./export-png.test.js";
import * as flowFieldTests from "./flow-field.test.js";
import * as geometryTests from "./geometry.test.js";
import * as inkTonalTests from "./ink-tonal.test.js";
import * as presetWiringTests from "./preset-wiring.test.js";
import * as registryTests from "./registry.test.js";
import * as rngTests from "./rng.test.js";
import * as schemaFormTests from "./schema-form.test.js";
import * as workSessionTests from "./work-session.test.js";

// Add each browser test module here as it is introduced.
const testModules = [
  rngTests,
  geometryTests,
  registryTests,
  documentTests,
  workSessionTests,
  bundleIoTests,
  flowFieldTests,
  inkTonalTests,
  exportPngTests,
  schemaFormTests,
  presetWiringTests,
];

const summaryElement = document.querySelector("[data-test-summary]");
const resultsElement = document.querySelector("[data-test-results]");

async function runTests() {
  const results = [];

  for (const module of testModules) {
    for (const test of module.tests) {
      try {
        await test.fn(assert);
        results.push({ name: test.name, status: "passed", error: null });
      } catch (error) {
        results.push({
          name: test.name,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const passed = results.filter((result) => result.status === "passed").length;
  const failed = results.length - passed;

  summaryElement.textContent = `${passed} passed / ${failed} failed`;
  resultsElement.replaceChildren(
    ...results.map((result) => {
      const item = document.createElement("li");
      item.className = `test-result test-result--${result.status}`;
      item.textContent = `${result.status.toUpperCase()} · ${result.name}`;

      if (result.error) {
        const error = document.createElement("pre");
        error.textContent = result.error;
        item.append(error);
      }

      return item;
    }),
  );

  window.__TEST_RESULTS__ = { passed, failed, results };
}

runTests();
