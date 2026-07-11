function createButton(label, dataAttribute, workId) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset[dataAttribute] = workId;
  return button;
}

function formatError(error) {
  return error instanceof Error ? error.message : "Library action failed";
}

export function createLibraryPanel({
  works = [],
  activeWorkId = null,
  draftIsSaved = true,
  onOpen = () => {},
  onRename = () => {},
  onDelete = () => {},
} = {}) {
  const panel = document.createElement("section");
  const heading = document.createElement("h2");
  const list = document.createElement("ol");
  const status = document.createElement("p");
  const deleteDialog = document.createElement("dialog");
  const deleteText = document.createElement("p");
  const deleteActions = document.createElement("div");
  const deleteCancel = document.createElement("button");
  const deleteConfirm = document.createElement("button");
  let currentWorks = works;
  let pendingDeleteWorkId = null;

  panel.className = "library-panel";
  heading.className = "library-panel__title";
  heading.textContent = "Library / WIP";
  list.className = "library-panel__list";
  status.className = "library-panel__status";
  status.dataset.libraryStatus = "";
  status.setAttribute("aria-live", "polite");

  deleteDialog.className = "library-panel__dialog";
  deleteText.className = "library-panel__dialog-text";
  deleteCancel.type = "button";
  deleteCancel.textContent = "Cancel";
  deleteConfirm.type = "button";
  deleteConfirm.textContent = "Delete work";
  deleteConfirm.dataset.libraryDeleteConfirm = "";
  deleteActions.className = "library-panel__dialog-actions";
  deleteActions.append(deleteCancel, deleteConfirm);
  deleteDialog.append(deleteText, deleteActions);

  function setStatus(message, saved = draftIsSaved) {
    status.textContent = message ?? (saved ? "Saved" : "Draft changes");
  }

  async function run(action) {
    try {
      await action();
    } catch (error) {
      setStatus(formatError(error));
    }
  }

  function closeDeleteDialog() {
    pendingDeleteWorkId = null;
    if (deleteDialog.open) {
      deleteDialog.close();
    }
  }

  function requestDelete(work) {
    pendingDeleteWorkId = work.workId;
    deleteText.textContent = `Delete "${work.title}"? This cannot be undone.`;
    if (deleteDialog.isConnected && typeof deleteDialog.showModal === "function") {
      deleteDialog.showModal();
    } else {
      deleteDialog.setAttribute("open", "");
    }
  }

  function renderWorks() {
    list.replaceChildren(
      ...currentWorks.map((work) => {
        const item = document.createElement("li");
        const preview = document.createElement("img");
        const title = document.createElement("input");
        const controls = document.createElement("div");
        const openButton = createButton("Open", "libraryOpen", work.workId);
        const renameButton = createButton("Rename", "libraryRename", work.workId);
        const deleteButton = createButton("Delete", "libraryDelete", work.workId);

        item.className = "library-panel__work";
        item.dataset.libraryWorkId = work.workId;
        item.toggleAttribute("data-active", work.workId === activeWorkId);
        preview.className = "library-panel__thumbnail";
        preview.alt = "";
        preview.width = 48;
        preview.height = 32;
        preview.hidden = !work.thumbnail?.dataUrl;
        preview.src = work.thumbnail?.dataUrl ?? "";
        title.className = "library-panel__title-input";
        title.value = work.title;
        title.name = `library-title-${work.workId}`;
        title.setAttribute("aria-label", `Title for ${work.title}`);
        title.dataset.libraryTitle = work.workId;
        controls.className = "library-panel__actions";
        controls.append(openButton, renameButton, deleteButton);
        item.append(preview, title, controls);

        openButton.addEventListener("click", () => run(() => onOpen(work.workId)));
        renameButton.addEventListener("click", () =>
          run(() => onRename(work.workId, title.value.trim())),
        );
        deleteButton.addEventListener("click", () => requestDelete(work));
        return item;
      }),
    );
  }

  deleteCancel.addEventListener("click", closeDeleteDialog);
  deleteDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDeleteDialog();
  });
  deleteConfirm.addEventListener("click", () =>
    run(async () => {
      if (!pendingDeleteWorkId) {
        return;
      }
      const workId = pendingDeleteWorkId;
      closeDeleteDialog();
      await onDelete(workId);
    }),
  );

  panel.append(heading, list, status, deleteDialog);
  renderWorks();
  setStatus(undefined, draftIsSaved);

  return Object.freeze({
    element: panel,
    update({
      works: nextWorks = currentWorks,
      activeWorkId: nextActiveWorkId = activeWorkId,
      draftIsSaved: nextDraftIsSaved = draftIsSaved,
      message,
    } = {}) {
      currentWorks = nextWorks;
      activeWorkId = nextActiveWorkId;
      draftIsSaved = nextDraftIsSaved;
      renderWorks();
      setStatus(message, draftIsSaved);
    },
  });
}
