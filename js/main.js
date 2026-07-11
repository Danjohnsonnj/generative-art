import { resolvePreset } from "./core/bootstrap.js";
import { createRng } from "./core/rng.js";
import flowInkWash from "./presets/flow-ink-wash.js";
import { createCanvasView } from "./ui/canvas-view.js";
import { createSchemaForm } from "./ui/schema-form.js";

const root = document.documentElement;
const elements = {
  canvas: document.querySelector("#art-canvas"),
  canvasStatus: document.querySelector("#canvas-status"),
  controlContent: document.querySelector("#control-content"),
  dimensionReadout: document.querySelector("#dimension-readout"),
  dockToggle: document.querySelector("#dock-toggle"),
  header: document.querySelector("#app-header"),
  newSeed: document.querySelector("#new-seed"),
  peek: document.querySelector("#rail-peek"),
  presetTitle: document.querySelector("#preset-title"),
  railCollapse: document.querySelector("#rail-collapse"),
  railStatus: document.querySelector("#rail-status"),
  regenerate: document.querySelector("#regenerate"),
  reset: document.querySelector("#reset-preset"),
  seedInput: document.querySelector("#seed-input"),
  seedReadout: document.querySelector("#seed-readout"),
  styleReadout: document.querySelector("#style-readout"),
  systemReadout: document.querySelector("#system-readout"),
  themeToggle: document.querySelector("#theme-toggle"),
};

const modules = resolvePreset(flowInkWash);

function syncHeaderHeight() {
  root.style.setProperty(
    "--app-header-height",
    `${elements.header.getBoundingClientRect().height}px`,
  );
}

function initialState() {
  return {
    seed: flowInkWash.rng.seed,
    systemParams: { ...flowInkWash.system.params },
    styleParams: { ...flowInkWash.style.params },
  };
}

let state = initialState();

const headerObserver = new ResizeObserver(syncHeaderHeight);
headerObserver.observe(elements.header);
syncHeaderHeight();

const canvasView = createCanvasView({
  canvas: elements.canvas,
  onRendered({ widthPx, heightPx }) {
    elements.dimensionReadout.textContent = `${widthPx} × ${heightPx} px`;
  },
});

function renderArtwork() {
  const geometry = modules.system.generate({
    rng: createRng(state.seed),
    params: state.systemParams,
    aspectRatio: flowInkWash.composition.aspectRatio,
  });

  canvasView.render({
    geometry,
    style: modules.style,
    params: state.styleParams,
    aspectRatio: flowInkWash.composition.aspectRatio,
  });

  elements.seedReadout.textContent = state.seed;
  elements.canvasStatus.textContent = "Render / live";
  elements.railStatus.textContent =
    `Preset online · ${geometry.strokes.length} strokes`;
}

function createModuleControls(label, module, params, updateParams) {
  const section = document.createElement("section");
  const title = document.createElement("h2");

  section.className = "module-controls";
  title.className = "module-controls__title";
  title.textContent = `${label} / ${module.default.id}`;
  section.append(title);
  section.append(
    createSchemaForm({
      paramsSchema: module.default.paramsSchema,
      params,
      onChange({ params: nextParams }) {
        updateParams(nextParams);
        renderArtwork();
      },
    }),
  );

  return section;
}

function renderControls() {
  elements.controlContent.replaceChildren(
    createModuleControls(
      "System",
      modules.system,
      state.systemParams,
      (params) => {
        state.systemParams = params;
      },
    ),
    createModuleControls(
      "Style",
      modules.style,
      state.styleParams,
      (params) => {
        state.styleParams = params;
      },
    ),
  );
}

function setSeed(seed) {
  if (seed.length === 0) {
    elements.seedInput.setAttribute("aria-invalid", "true");
    elements.seedInput.setCustomValidity("Seed must not be empty");
    return;
  }

  elements.seedInput.removeAttribute("aria-invalid");
  elements.seedInput.setCustomValidity("");
  elements.seedInput.value = seed;
  state.seed = seed;
  renderArtwork();
}

function makeSeed() {
  const words = new Uint32Array(2);
  crypto.getRandomValues(words);
  return Array.from(words, (word) => word.toString(36)).join("-");
}

function setRailCollapsed(collapsed) {
  root.dataset.railCollapsed = String(collapsed);
  elements.peek.hidden = !collapsed;
  elements.railCollapse.setAttribute("aria-expanded", String(!collapsed));
}

function updateShellReadouts() {
  elements.presetTitle.textContent = flowInkWash.label;
  elements.systemReadout.textContent =
    `${modules.system.default.id} / ${String(modules.system.default.version).padStart(2, "0")}`;
  elements.styleReadout.textContent =
    `${modules.style.default.id} / ${String(modules.style.default.version).padStart(2, "0")}`;
  elements.seedInput.value = state.seed;
}

elements.regenerate.addEventListener("click", renderArtwork);

elements.newSeed.addEventListener("click", () => {
  const seed = makeSeed();
  elements.seedInput.value = seed;
  setSeed(seed);
});

elements.reset.addEventListener("click", () => {
  state = initialState();
  updateShellReadouts();
  renderControls();
  renderArtwork();
});

elements.seedInput.addEventListener("change", () => {
  setSeed(elements.seedInput.value.trim());
});

elements.themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "graphite" ? "light" : "graphite";
  root.dataset.theme = nextTheme;
  elements.themeToggle.setAttribute(
    "aria-pressed",
    String(nextTheme === "light"),
  );
  elements.themeToggle.textContent =
    nextTheme === "graphite" ? "Light mode" : "Dark mode";
});

elements.dockToggle.addEventListener("click", () => {
  const nextSide = root.dataset.railSide === "left" ? "right" : "left";
  root.dataset.railSide = nextSide;
  elements.dockToggle.textContent =
    nextSide === "left" ? "Dock right" : "Dock left";
});

elements.railCollapse.addEventListener("click", () => {
  setRailCollapsed(true);
});

elements.peek.addEventListener("click", () => {
  setRailCollapsed(false);
});

updateShellReadouts();
renderControls();
renderArtwork();

