import { createRevisionThumbnail } from "../js/core/thumbnails.js";
import { createWorkSession } from "../js/core/work-session.js";
import flowInkWash from "../js/presets/flow-ink-wash.js";

function createFixtureRevision() {
  const session = createWorkSession({
    draft: {
      title: "Flow thumbnail",
      notes: "",
      composition: { ...flowInkWash.composition },
      rng: { ...flowInkWash.rng },
      system: {
        ...flowInkWash.system,
        params: { ...flowInkWash.system.params },
      },
      style: {
        ...flowInkWash.style,
        params: { ...flowInkWash.style.params },
      },
      irVersion: 1,
      exportDefaults: { widthIn: 12, heightIn: 18, dpi: 300 },
      extensions: {},
    },
    createId(kind) {
      return `${kind}-thumbnail`;
    },
    now() {
      return "2026-07-11T17:00:00.000Z";
    },
  });

  return session.checkpoint();
}

function pngDimensions(dataUrl) {
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (character) =>
    character.charCodeAt(0),
  );

  return {
    width:
      (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
    height:
      (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23],
  };
}

export const tests = [
  {
    name: "revision thumbnail is a small PNG data URL at its expected dimensions",
    fn(assert) {
      const revision = createFixtureRevision();
      const thumbnailRevision = createRevisionThumbnail(revision, {
        widthPx: 192,
      });
      const dimensions = pngDimensions(thumbnailRevision.thumbnail.dataUrl);

      assert.ok(
        thumbnailRevision.thumbnail.dataUrl.startsWith("data:image/png;base64,"),
      );
      assert.equal(thumbnailRevision.thumbnail.widthPx, 192);
      assert.equal(thumbnailRevision.thumbnail.heightPx, 128);
      assert.equal(dimensions.width, 192);
      assert.equal(dimensions.height, 128);
      assert.equal(revision.thumbnail, undefined);
    },
  },
];
