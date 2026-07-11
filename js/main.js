import { resolvePreset } from "./core/bootstrap.js";
import {
  createArtworkBundle,
  prepareArtworkBundleImport,
  serializeArtworkBundle,
} from "./core/bundle-io.js";
import { createRng } from "./core/rng.js";
import { createWorkSession } from "./core/work-session.js";
import flowInkWash from "./presets/flow-ink-wash.js";
import { createCanvasView } from "./ui/canvas-view.js";
import { createCheckpointPanel } from "./ui/checkpoint-panel.js";
import { createExportPanel } from "./ui/export-panel.js";
import { createSchemaForm } from "./ui/schema-form.js";

const root = document.documentElement;
const elements = {
  canvas: document.querySelector("#art-canvas"),
  canvasStatus: document.querySelector("#canvas-status"),
  checkpointContent: document.querySelector("#checkpoint-content"),
  controlContent: document.querySelector("#control-content"),
  dimensionReadout: document.querySelector("#dimension-readout"),
  dockToggle: document.querySelector("#dock-toggle"),
  exportContent: document.querySelector("#export-content"),
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
let session = createWorkSession({ draft: createDraftFromState(state) });
let checkpointPanel;

const headerObserver = new ResizeObserver(syncHeaderHeight);
headerObserver.observe(elements.header);
syncHeaderHeight();

const canvasView = createCanvasView({
  canvas: elements.canvas,
  onRendered({ widthPx, heightPx }) {
    elements.dimensionReadout.textContent = `${widthPx} × ${heightPx} px`;
  },
});

elements.exportContent.append(
  createExportPanel({ canvas: elements.canvas }),
);

function createDraftFromState(nextState) {
  return {
    title: flowInkWash.label,
    notes: "",
    composition: { ...flowInkWash.composition },
    rng: { ...flowInkWash.rng, seed: nextState.seed },
    system: {
      ...flowInkWash.system,
      params: { ...nextState.systemParams },
    },
    style: {
      ...flowInkWash.style,
      params: { ...nextState.styleParams },
    },
    irVersion: 1,
    exportDefaults: { widthIn: 12, heightIn: 18, dpi: 300 },
    extensions: {},
  };
}

function stateFromDraft(draft) {
  return {
    seed: draft.rng.seed,
    systemParams: { ...draft.system.params },
    styleParams: { ...draft.style.params },
  };
}

function syncSessionDraft() {
  session.setDraft({
    ...session.getDraft(),
    ...createDraftFromState(state),
  });
}

function updateCheckpointPanel(message) {
  checkpointPanel.update({
    revisions: session.getRevisions(),
    message,
  });
}

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
        syncSessionDraft();
      },
    ),
    createModuleControls(
      "Style",
      modules.style,
      state.styleParams,
      (params) => {
        state.styleParams = params;
        syncSessionDraft();
      },
    ),
  );
}

function checkpointArtwork() {
  syncSessionDraft();
  const revision = session.checkpoint();
  updateCheckpointPanel(`Checkpoint saved · ${revision.revisionId}`);
  return { message: "Checkpoint saved" };
}

function forkArtwork() {
  const sourceRevision = session.getRevisions().at(-1);

  if (!sourceRevision) {
    throw new Error("Save a checkpoint before forking");
  }

  syncSessionDraft();
  session = session.fork(sourceRevision.revisionId);
  state = stateFromDraft(session.getDraft());
  updateShellReadouts();
  renderControls();
  renderArtwork();
  updateCheckpointPanel("Fork created");
  return { message: "Fork created" };
}

function restoreArtwork(revisionId) {
  session.restoreRevision(revisionId);
  state = stateFromDraft(session.getDraft());
  updateShellReadouts();
  renderControls();
  renderArtwork();
  updateCheckpointPanel("Revision restored");
}

function exportArtworkBundle() {
  syncSessionDraft();
  const revisions = session.getRevisions();

  if (revisions.length === 0) {
    throw new Error("Save a checkpoint before exporting JSON");
  }

  const bundle = createArtworkBundle({
    exportedAt: new Date().toISOString(),
    work: {
      workId: session.getWorkId(),
      title: session.getDraft().title,
      extensions: {},
    },
    draft: session.getDraft(),
    revisions,
    extensions: {},
  });

  return {
    text: serializeArtworkBundle(bundle),
    filename: `${bundle.work.workId}.json`,
  };
}

function createImportedSession(bundle) {
  const collision = bundle.work.workId === session.getWorkId();
  const replace = !collision || window.confirm(
    "This work is already open. Choose OK to replace it, or Cancel to import a new work.",
  );

  if (replace) {
    return createWorkSession({
      workId: bundle.work.workId,
      draft: bundle.draft ?? bundle.revisions.at(-1),
      revisions: bundle.revisions,
    });
  }

  const newWorkId = `work-${crypto.randomUUID()}`;
  const revisionIds = new Map(
    bundle.revisions.map((revision) => [
      revision.revisionId,
      `revision-${crypto.randomUUID()}`,
    ]),
  );
  const remapId = (id) => (id === null ? null : revisionIds.get(id) ?? null);
  const remapRevision = (revision) => ({
    ...structuredClone(revision),
    workId: newWorkId,
    revisionId: revisionIds.get(revision.revisionId),
    parentRevisionId: remapId(revision.parentRevisionId),
    forkedFromRevisionId: remapId(revision.forkedFromRevisionId),
  });
  const remappedRevisions = bundle.revisions.map(remapRevision);
  const sourceDraft = bundle.draft ?? bundle.revisions.at(-1);
  const remappedDraft = {
    ...remapRevision(sourceDraft),
    parentRevisionId: remapId(sourceDraft.parentRevisionId),
  };

  return createWorkSession({
    workId: newWorkId,
    draft: remappedDraft,
    revisions: remappedRevisions,
  });
}

function importArtworkBundle(serialized) {
  const prepared = prepareArtworkBundleImport(serialized, [session.getWorkId()]);

  session = createImportedSession(prepared.bundle);
  state = stateFromDraft(session.getDraft());
  updateShellReadouts();
  renderControls();
  renderArtwork();
  updateCheckpointPanel(
    prepared.collision ? "Imported as selected" : "JSON imported",
  );
  return { message: prepared.collision ? "Collision resolved" : "JSON imported" };
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
  syncSessionDraft();
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
  syncSessionDraft();
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

checkpointPanel = createCheckpointPanel({
  onCheckpoint: checkpointArtwork,
  onFork: forkArtwork,
  onRestore: restoreArtwork,
  onExport: exportArtworkBundle,
  onImport: importArtworkBundle,
});
elements.checkpointContent.append(checkpointPanel.element);

updateShellReadouts();
renderControls();
renderArtwork();

