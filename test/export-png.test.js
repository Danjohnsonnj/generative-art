import { exportCanvasAsPng } from "../js/core/export-png.js";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function readUint32(bytes, offset) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

export const tests = [
  {
    name: "PNG export preserves the canvas's DPR-scaled dimensions",
    async fn(assert) {
      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 640;
      canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);

      const blob = await exportCanvasAsPng(canvas);
      const bytes = new Uint8Array(await blob.arrayBuffer());

      assert.equal(blob.type, "image/png");
      PNG_SIGNATURE.forEach((byte, index) => {
        assert.equal(bytes[index], byte, `Expected PNG signature byte ${index}`);
      });
      assert.equal(readUint32(bytes, 16), 960);
      assert.equal(readUint32(bytes, 20), 640);
    },
  },
];
