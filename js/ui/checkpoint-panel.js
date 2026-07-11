function downloadJson(text, filename) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatRevision(revision) {
  return `${revision.title || "Untitled"} · ${revision.checkpointedAt}`;
}

export function createCheckpointPanel({
  revisions = [],
  onCheckpoint,
  onFork,
  onRestore,
  onExport,
  onImport,
}) {
  const panel = document.createElement("section");
  const heading = document.createElement("h2");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  const forkButton = document.createElement("button");
  const exportButton = document.createElement("button");
  const importLabel = document.createElement("label");
  const importInput = document.createElement("input");
  const history = document.createElement("ol");
  const status = document.createElement("p");

  panel.className = "checkpoint-panel";
  heading.className = "checkpoint-panel__title";
  heading.textContent = "History / JSON";
  actions.className = "checkpoint-panel__actions";
  history.className = "checkpoint-panel__history";
  status.className = "checkpoint-panel__status";
  status.setAttribute("aria-live", "polite");
  status.textContent = "No checkpoints";

  saveButton.type = "button";
  saveButton.dataset.checkpointAction = "save";
  saveButton.textContent = "Save checkpoint";
  forkButton.type = "button";
  forkButton.dataset.checkpointAction = "fork";
  forkButton.textContent = "Fork";
  exportButton.type = "button";
  exportButton.dataset.checkpointAction = "export";
  exportButton.textContent = "Export JSON";
  importLabel.className = "checkpoint-panel__import";
  importLabel.textContent = "Import JSON";
  importInput.type = "file";
  importInput.accept = "application/json,.json";
  importInput.hidden = true;
  importLabel.append(importInput);
  actions.append(saveButton, forkButton, exportButton, importLabel);

  function setStatus(message) {
    status.textContent = message;
  }

  function renderHistory(nextRevisions) {
    history.replaceChildren(
      ...nextRevisions.map((revision) => {
        const item = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";
        button.dataset.revisionId = revision.revisionId;
        button.textContent = formatRevision(revision);
        button.addEventListener("click", async () => {
          await onRestore(revision.revisionId);
        });
        item.append(button);
        return item;
      }),
    );
    forkButton.disabled = nextRevisions.length === 0;
    exportButton.disabled = nextRevisions.length === 0;
  }

  async function runAction(action, busyMessage) {
    saveButton.disabled = true;
    forkButton.disabled = true;
    exportButton.disabled = true;
    setStatus(busyMessage);

    try {
      const result = await action();
      setStatus(result?.message ?? "Ready");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Action failed");
    } finally {
      saveButton.disabled = false;
      renderHistory(currentRevisions);
    }
  }

  let currentRevisions = revisions;
  renderHistory(currentRevisions);

  saveButton.addEventListener("click", () =>
    runAction(onCheckpoint, "Saving checkpoint…"),
  );
  forkButton.addEventListener("click", () => runAction(onFork, "Forking…"));
  exportButton.addEventListener("click", () =>
    runAction(async () => {
      const result = await onExport();
      downloadJson(result.text, result.filename);
      return { message: "JSON exported" };
    }, "Preparing JSON…"),
  );
  importInput.addEventListener("change", () => {
    const [file] = importInput.files;

    if (!file) {
      return;
    }

    runAction(async () => onImport(await file.text()), "Importing JSON…");
    importInput.value = "";
  });

  panel.append(heading, actions, history, status);

  return {
    element: panel,
    update({ revisions: nextRevisions, message }) {
      currentRevisions = nextRevisions;
      renderHistory(currentRevisions);
      if (message) {
        setStatus(message);
      }
    },
  };
}
