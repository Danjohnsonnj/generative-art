import { createSchemaForm } from "../js/ui/schema-form.js";

const paramsSchema = Object.freeze({
  amount: {
    type: "number",
    label: "Amount",
    min: 0,
    max: 10,
    step: 0.5,
    group: "Shape",
    order: 10,
    help: "Controls the amount.",
  },
  enabled: {
    type: "boolean",
    label: "Enabled",
    group: "Shape",
    order: 20,
  },
  mode: {
    type: "select",
    label: "Mode",
    choices: ["quiet", "active"],
    group: "Material",
    order: 30,
  },
  paper: {
    type: "color",
    label: "Paper",
    group: "Material",
    order: 40,
  },
  title: {
    type: "text",
    label: "Title",
    group: "Identity",
    order: 50,
  },
  seed: {
    type: "seed",
    label: "Seed",
    group: "Identity",
    order: 60,
  },
});

function initialParams() {
  return {
    amount: 5,
    enabled: true,
    mode: "quiet",
    paper: "#f1eee5",
    title: "Study",
    seed: "abc",
  };
}

function showManualPreview(form) {
  const figure = document.createElement("figure");
  const caption = document.createElement("figcaption");

  figure.className = "schema-form-preview";
  caption.textContent = "Generated control rack preview";
  figure.append(form, caption);
  document.querySelector("main").append(figure);
}

export const tests = [
  {
    name: "schema form generates the expected control count and input types",
    fn(assert) {
      const form = createSchemaForm({
        paramsSchema,
        params: initialParams(),
        onChange() {},
      });

      assert.equal(form.querySelectorAll("[data-param-control]").length, 6);
      assert.ok(form.querySelector('input[type="range"]'));
      assert.ok(form.querySelector('input[type="number"]'));
      assert.ok(form.querySelector('input[type="checkbox"]'));
      assert.ok(form.querySelector("select"));
      assert.ok(form.querySelector('input[type="color"]'));
      assert.ok(form.querySelector('[data-param-type="text"] input[type="text"]'));
      assert.ok(form.querySelector('[data-param-type="seed"] input[type="text"]'));

      showManualPreview(form);
    },
  },
  {
    name: "schema form emits a validated correctly typed value",
    fn(assert) {
      const changes = [];
      const form = createSchemaForm({
        paramsSchema,
        params: initialParams(),
        onChange(change) {
          changes.push(change);
        },
      });
      const input = form.querySelector(
        '[data-param-name="amount"] input[type="number"]',
      );

      input.value = "7.5";
      input.dispatchEvent(new Event("change", { bubbles: true }));

      assert.equal(changes.length, 1);
      assert.equal(changes[0].name, "amount");
      assert.equal(changes[0].value, 7.5);
      assert.equal(typeof changes[0].value, "number");
      assert.equal(changes[0].params.amount, 7.5);
    },
  },
  {
    name: "schema form rejects an invalid edit without firing onChange",
    fn(assert) {
      const changes = [];
      const form = createSchemaForm({
        paramsSchema,
        params: initialParams(),
        onChange(change) {
          changes.push(change);
        },
      });
      const input = form.querySelector(
        '[data-param-name="amount"] input[type="number"]',
      );

      input.value = "99";
      input.dispatchEvent(new Event("change", { bubbles: true }));

      assert.equal(changes.length, 0);
      assert.equal(input.value, "5");
      assert.equal(input.getAttribute("aria-invalid"), "true");
    },
  },
  {
    name: "schema form preserves a valid fractional number on its fader",
    fn(assert) {
      const form = createSchemaForm({
        paramsSchema: {
          density: {
            type: "number",
            min: 0.1,
            max: 0.9,
            step: 0.01,
          },
        },
        params: { density: 0.48 },
        onChange() {},
      });
      const range = form.querySelector('input[type="range"]');
      const number = form.querySelector('input[type="number"]');

      assert.equal(range.value, "0.48");
      assert.ok(range.checkValidity());
      assert.ok(number.checkValidity());
    },
  },
];
