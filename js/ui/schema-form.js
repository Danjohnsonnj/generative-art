import { validateParams } from "../core/registry.js";

let formSequence = 0;

function orderedEntries(paramsSchema) {
  return Object.entries(paramsSchema).sort(
    ([nameA, definitionA], [nameB, definitionB]) =>
      (definitionA.order ?? 0) - (definitionB.order ?? 0) ||
      nameA.localeCompare(nameB),
  );
}

function controlLabel(name, definition) {
  return definition.label ?? name;
}

function setCommonAttributes(input, definition) {
  if (definition.help) {
    input.title = definition.help;
  }
}

function createNumberControl({ id, name, definition, value, commit }) {
  const container = document.createElement("div");
  const range = document.createElement("input");
  const number = document.createElement("input");

  container.className = "schema-number";
  range.type = "range";
  range.id = id;
  range.name = name;
  range.setAttribute("aria-label", controlLabel(name, definition));

  number.type = "number";
  number.id = `${id}-value`;
  number.name = `${name}-value`;
  number.setAttribute("aria-label", `${controlLabel(name, definition)} value`);
  number.className = "schema-number__readout";

  for (const input of [range, number]) {
    if (definition.min !== undefined) {
      input.min = String(definition.min);
    }
    if (definition.max !== undefined) {
      input.max = String(definition.max);
    }
    if (definition.step !== undefined) {
      input.step = String(definition.step);
    }
    setCommonAttributes(input, definition);
  }

  range.value = String(value);
  number.value = String(value);
  range.addEventListener("input", () => commit(range.valueAsNumber, range));
  number.addEventListener("change", () => commit(number.valueAsNumber, number));
  container.append(range, number);

  return {
    element: container,
    inputs: [range, number],
    sync(nextValue) {
      range.value = String(nextValue);
      number.value = String(nextValue);
    },
  };
}

function createBooleanControl({ id, name, definition, value, commit }) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  const track = document.createElement("span");

  label.className = "schema-toggle";
  input.type = "checkbox";
  input.id = id;
  input.name = name;
  input.checked = value;
  setCommonAttributes(input, definition);

  track.className = "schema-toggle__track";
  track.setAttribute("aria-hidden", "true");
  input.addEventListener("change", () => commit(input.checked, input));
  label.append(input, track);

  return {
    element: label,
    inputs: [input],
    sync(nextValue) {
      input.checked = nextValue;
    },
  };
}

function createSelectControl({ id, name, definition, value, commit }) {
  const select = document.createElement("select");

  select.id = id;
  select.name = name;
  select.className = "schema-select";
  setCommonAttributes(select, definition);

  definition.choices.forEach((choice, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = String(choice);
    option.selected = Object.is(choice, value);
    select.append(option);
  });

  select.addEventListener("change", () => {
    commit(definition.choices[Number(select.value)], select);
  });

  return {
    element: select,
    inputs: [select],
    sync(nextValue) {
      select.value = String(
        definition.choices.findIndex((choice) => Object.is(choice, nextValue)),
      );
    },
  };
}

function createSimpleInput({ id, name, definition, value, commit }) {
  const input = document.createElement("input");
  input.id = id;
  input.name = name;
  input.type = definition.type === "color" ? "color" : "text";
  input.value = value;

  if (definition.type === "seed") {
    input.autocomplete = "off";
    input.spellcheck = false;
  }

  input.setAttribute("aria-label", controlLabel(name, definition));
  setCommonAttributes(input, definition);
  input.addEventListener("change", () => commit(input.value, input));

  return {
    element: input,
    inputs: [input],
    sync(nextValue) {
      input.value = nextValue;
    },
  };
}

function createInput(options) {
  switch (options.definition.type) {
    case "number":
      return createNumberControl(options);
    case "boolean":
      return createBooleanControl(options);
    case "select":
      return createSelectControl(options);
    case "color":
    case "text":
    case "seed":
      return createSimpleInput(options);
    default:
      throw new TypeError(
        `Unsupported schema control type "${options.definition.type}"`,
      );
  }
}

function isVisible(definition, params) {
  if (!definition.visibleWhen) {
    return true;
  }

  const { param, equals } = definition.visibleWhen;
  return Object.is(params[param], equals);
}

export function createSchemaForm({ paramsSchema, params, onChange }) {
  validateParams(paramsSchema, params);

  if (typeof onChange !== "function") {
    throw new TypeError("onChange must be a function");
  }

  formSequence += 1;
  const formId = `schema-form-${formSequence}`;
  const currentParams = { ...params };
  const form = document.createElement("form");
  const groups = new Map();
  const controls = new Map();

  form.className = "schema-form";
  form.noValidate = true;
  form.addEventListener("submit", (event) => event.preventDefault());

  function updateVisibility() {
    for (const [name, control] of controls) {
      control.wrapper.hidden = !isVisible(control.definition, currentParams);
    }

    for (const group of groups.values()) {
      group.hidden = Array.from(
        group.querySelectorAll("[data-param-control]"),
      ).every((control) => control.hidden);
    }
  }

  orderedEntries(paramsSchema).forEach(([name, definition], index) => {
    const groupName = definition.group ?? "Parameters";
    let group = groups.get(groupName);

    if (!group) {
      group = document.createElement("fieldset");
      const legend = document.createElement("legend");
      const groupIndex = document.createElement("code");

      group.className = "schema-group";
      group.dataset.paramGroup = groupName;
      legend.textContent = groupName;
      groupIndex.textContent = String(groups.size + 1).padStart(2, "0");
      legend.append(groupIndex);
      group.append(legend);
      groups.set(groupName, group);
      form.append(group);
    }

    const wrapper = document.createElement("div");
    const heading = document.createElement("div");
    const label = document.createElement("label");
    const controlId = `${formId}-${index}`;

    wrapper.className = "schema-control";
    wrapper.dataset.paramControl = "";
    wrapper.dataset.paramName = name;
    wrapper.dataset.paramType = definition.type;
    heading.className = "schema-control__heading";
    label.htmlFor = controlId;
    label.textContent = controlLabel(name, definition);
    heading.append(label);

    if (definition.help) {
      const help = document.createElement("span");
      help.className = "schema-control__help";
      help.textContent = definition.help;
      heading.append(help);
    }

    let inputControl;
    const commit = (nextValue, sourceInput) => {
      const candidateParams = { ...currentParams, [name]: nextValue };

      try {
        validateParams(paramsSchema, candidateParams);
      } catch (error) {
        sourceInput.setCustomValidity(
          error instanceof Error ? error.message : String(error),
        );
        sourceInput.setAttribute("aria-invalid", "true");
        inputControl.sync(currentParams[name]);
        return;
      }

      for (const input of inputControl.inputs) {
        input.setCustomValidity("");
        input.removeAttribute("aria-invalid");
      }

      currentParams[name] = nextValue;
      inputControl.sync(nextValue);
      updateVisibility();
      onChange({
        name,
        value: nextValue,
        params: { ...currentParams },
      });
    };

    inputControl = createInput({
      id: controlId,
      name,
      definition,
      value: currentParams[name],
      commit,
    });

    wrapper.append(heading, inputControl.element);
    group.append(wrapper);
    controls.set(name, { wrapper, definition });
  });

  updateVisibility();
  return form;
}
