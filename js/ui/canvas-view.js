export function createCanvasView({ canvas, onRendered = () => {} }) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError("canvas must be an HTMLCanvasElement");
  }

  const frame = canvas.parentElement;
  let currentRender = null;
  let animationFrame = null;

  function draw() {
    animationFrame = null;

    if (!currentRender) {
      return null;
    }

    const { geometry, style, params, aspectRatio } = currentRender;
    frame.style.aspectRatio = String(aspectRatio);

    const widthCss = Math.max(1, frame.clientWidth);
    const heightCss = widthCss / aspectRatio;
    const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
    const widthPx = Math.max(1, Math.round(widthCss * pixelRatio));
    const heightPx = Math.max(1, Math.round(heightCss * pixelRatio));
    const ctx = canvas.getContext("2d");

    style.renderCanvas({
      ctx,
      geometry,
      params,
      widthPx,
      heightPx,
    });

    onRendered({ widthPx, heightPx });
    return canvas;
  }

  function scheduleDraw() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(scheduleDraw);
  resizeObserver.observe(frame);

  return Object.freeze({
    render(renderOptions) {
      currentRender = renderOptions;
      return draw();
    },

    destroy() {
      resizeObserver.disconnect();
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    },
  });
}
