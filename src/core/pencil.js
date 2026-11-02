export function createDrawingPad(canvas, options = {}) {
  const context = canvas.getContext("2d", { willReadFrequently: false });
  const history = [];
  let active = false;
  let tool = "pen";
  let color = options.color || "#7458d8";
  let last = null;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const saved = canvas.toDataURL("image/png");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (saved && saved !== "data:,") {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = saved;
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement);
  resize();

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, pressure: event.pressure || .5 };
  }
  function start(event) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    active = true;
    canvas.setPointerCapture(event.pointerId);
    history.push(canvas.toDataURL("image/png"));
    if (history.length > 20) history.shift();
    last = point(event);
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = tool === "highlighter" ? color + "55" : color;
    context.lineWidth = tool === "eraser" ? 18 : tool === "highlighter" ? 14 : Math.max(1.2, last.pressure * 4);
    context.lineTo(last.x + .1, last.y + .1);
    context.stroke();
    options.onChange?.();
  }
  function move(event) {
    if (!active || !last) return;
    event.preventDefault();
    const current = point(event);
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(current.x, current.y);
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = tool === "highlighter" ? color + "55" : color;
    context.lineWidth = tool === "eraser" ? 18 : tool === "highlighter" ? 14 : Math.max(1.2, current.pressure * 4);
    context.stroke();
    last = current;
    options.onChange?.();
  }
  function stop(event) {
    if (!active) return;
    active = false;
    last = null;
    context.globalCompositeOperation = "source-over";
    try { canvas.releasePointerCapture(event.pointerId); } catch {}
    options.onChange?.();
  }
  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  return {
    setTool(next) { tool = next; },
    setColor(next) { color = next; },
    undo() {
      const previous = history.pop();
      if (!previous) return false;
      const image = new Image();
      image.onload = () => { context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); context.drawImage(image, 0, 0, canvas.clientWidth, canvas.clientHeight); options.onChange?.(); };
      image.src = previous;
      return true;
    },
    clear() { history.push(canvas.toDataURL("image/png")); context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); options.onChange?.(); },
    serialize() { return canvas.toDataURL("image/png"); },
    restore(data) {
      if (!data || data === "data:,") return;
      const image = new Image();
      image.onload = () => { context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); context.drawImage(image, 0, 0, canvas.clientWidth, canvas.clientHeight); options.onChange?.(); };
      image.src = data;
    },
    dispose() { observer.disconnect(); }
  };
}