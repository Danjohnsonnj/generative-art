import { createLibraryPanel } from "../js/ui/library-panel.js";

export const tests = [
  {
    name: "library panel lists works and reports draft persistence state",
    fn(assert) {
      const panel = createLibraryPanel({
        works: [
          {
            workId: "work-1",
            title: "Saved study",
            thumbnail: null,
          },
        ],
        activeWorkId: "work-1",
        draftIsSaved: false,
      });

      assert.equal(
        panel.element.querySelector("[data-library-title='work-1']").value,
        "Saved study",
      );
      assert.equal(
        panel.element.querySelector("[data-library-status]").textContent,
        "Draft changes",
      );
    },
  },
  {
    name: "library panel opens, renames, and confirms deletion of a work",
    async fn(assert) {
      const actions = [];
      const panel = createLibraryPanel({
        works: [{ workId: "work-1", title: "Saved study", thumbnail: null }],
        onOpen(workId) {
          actions.push(`open:${workId}`);
        },
        onRename(workId, title) {
          actions.push(`rename:${workId}:${title}`);
        },
        onDelete(workId) {
          actions.push(`delete:${workId}`);
        },
      });
      const element = panel.element;

      element.querySelector("[data-library-open='work-1']").click();
      const titleInput = element.querySelector("[data-library-title='work-1']");
      titleInput.value = "Renamed study";
      element.querySelector("[data-library-rename='work-1']").click();
      element.querySelector("[data-library-delete='work-1']").click();
      element.querySelector("[data-library-delete-confirm]").click();
      await Promise.resolve();

      assert.equal(
        actions.join(","),
        "open:work-1,rename:work-1:Renamed study,delete:work-1",
      );
    },
  },
];
