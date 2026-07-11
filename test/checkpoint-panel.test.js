import { createCheckpointPanel } from "../js/ui/checkpoint-panel.js";

const revisions = [
  {
    revisionId: "revision-1",
    title: "First checkpoint",
    checkpointedAt: "2026-07-11T16:00:00.000Z",
  },
  {
    revisionId: "revision-2",
    title: "Second checkpoint",
    checkpointedAt: "2026-07-11T16:01:00.000Z",
  },
];

export const tests = [
  {
    name: "checkpoint panel renders checkpoint, fork, JSON, and history controls",
    fn(assert) {
      const panel = createCheckpointPanel({
        revisions,
        onCheckpoint() {},
        onFork() {},
        onRestore() {},
        onExport() {
          return { text: "{}", filename: "fixture.json" };
        },
        onImport() {},
      });

      assert.ok(panel.element.querySelector('[data-checkpoint-action="save"]'));
      assert.ok(panel.element.querySelector('[data-checkpoint-action="fork"]'));
      assert.ok(panel.element.querySelector('[data-checkpoint-action="export"]'));
      assert.ok(panel.element.querySelector('input[type="file"]'));
      assert.equal(
        panel.element.querySelectorAll("[data-revision-id]").length,
        revisions.length,
      );
    },
  },
  {
    name: "checkpoint panel restores the selected revision",
    fn(assert) {
      const restored = [];
      const panel = createCheckpointPanel({
        revisions,
        onCheckpoint() {},
        onFork() {},
        onRestore(revisionId) {
          restored.push(revisionId);
        },
        onExport() {
          return { text: "{}", filename: "fixture.json" };
        },
        onImport() {},
      });

      panel.element
        .querySelector('[data-revision-id="revision-1"]')
        .click();

      assert.equal(restored[0], "revision-1");
    },
  },
];
