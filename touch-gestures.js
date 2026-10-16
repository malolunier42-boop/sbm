// Touch stays independent of OrbitControls so a vertical swipe can scroll the
// page while a deliberate horizontal swipe turns the architectural model.
export function installTouchGestures({ canvas, onStart, onOrbit, onZoom, getZoom }) {
  const pointers = new Map();
  let immersive = false;
  let axis = "pending";
  let started = false;
  let origin = null;
  let last = null;
  let pinchDistance = 0;
  let pinchZoom = 1;

  const distance = () => {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const begin = () => {
    if (started) return;
    started = true;
    onStart();
  };
  const rebase = () => {
    started = false;
    if (pointers.size >= 2) {
      axis = "pinch";
      pinchDistance = distance();
      pinchZoom = getZoom();
    } else {
      axis = "pending";
      origin = last = pointers.values().next().value || null;
      pinchDistance = 0;
    }
  };
  const clear = () => {
    const ids = [...pointers.keys()];
    pointers.clear();
    rebase();
    for (const id of ids) {
      if (canvas.hasPointerCapture?.(id)) canvas.releasePointerCapture(id);
    }
  };
  const down = (event) => {
    if (event.pointerType !== "touch") return;
    // OrbitControls keeps handling mice and pens, but never receives this touch.
    event.stopImmediatePropagation();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture?.(event.pointerId);
    rebase();
  };
  const move = (event) => {
    if (event.pointerType !== "touch" || !pointers.has(event.pointerId)) return;
    event.stopImmediatePropagation();
    const point = { x: event.clientX, y: event.clientY };
    pointers.set(event.pointerId, point);
    if (pointers.size >= 2) {
      if (event.cancelable) event.preventDefault();
      const nextDistance = distance();
      if (pinchDistance > 6 && nextDistance > 6) {
        begin();
        onZoom(pinchZoom * nextDistance / pinchDistance);
      }
      return;
    }
    if (!origin || !last || axis === "vertical") return;
    if (axis === "pending") {
      const dx = Math.abs(point.x - origin.x);
      const dy = Math.abs(point.y - origin.y);
      if (Math.max(dx, dy) < 7) return;
      if (!immersive && dy > dx * 1.15) {
        axis = "vertical";
        return;
      }
      if (!immersive && dx <= dy * 1.15) return;
      axis = "rotate";
      begin();
    }
    if (event.cancelable) event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scale = Math.max(180, Math.min(rect.width, rect.height));
    const sensitivity = 2 * Math.PI * 0.65 / scale;
    onOrbit(-(point.x - last.x) * sensitivity,
      immersive ? -(point.y - last.y) * sensitivity : 0);
    last = point;
  };
  const end = (event) => {
    if (event.pointerType !== "touch" || !pointers.has(event.pointerId)) return;
    event.stopImmediatePropagation();
    pointers.delete(event.pointerId);
    // Start the remaining finger from its current position, never the position
    // it had before the pinch. This prevents a jump back into one-finger orbit.
    rebase();
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  const visibility = () => { if (document.hidden) clear(); };
  const options = { capture: true, passive: false };
  canvas.addEventListener("pointerdown", down, options);
  canvas.addEventListener("pointermove", move, options);
  canvas.addEventListener("pointerup", end, options);
  canvas.addEventListener("pointercancel", end, options);
  canvas.addEventListener("lostpointercapture", end, options);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", visibility);
  return {
    setInteraction(enabled) {
      clear();
      immersive = Boolean(enabled);
      canvas.style.touchAction = immersive ? "none" : "pan-y";
    },
    dispose() {
      clear();
      canvas.removeEventListener("pointerdown", down, true);
      canvas.removeEventListener("pointermove", move, true);
      canvas.removeEventListener("pointerup", end, true);
      canvas.removeEventListener("pointercancel", end, true);
      canvas.removeEventListener("lostpointercapture", end, true);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
