export function exportCanvasAsPng(canvas) {
  if (
    !canvas ||
    typeof canvas.toBlob !== "function" ||
    !Number.isInteger(canvas.width) ||
    canvas.width < 1 ||
    !Number.isInteger(canvas.height) ||
    canvas.height < 1
  ) {
    throw new TypeError("canvas must be an encoded canvas with positive dimensions");
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("PNG encoding failed"));
      },
      "image/png",
    );
  });
}
