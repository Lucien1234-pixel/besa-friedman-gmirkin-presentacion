const viewport = document.getElementById('viewport');
const surface = document.getElementById('surface');
const diagram = document.getElementById('diagram');
const slider = document.getElementById('zoom');
const percent = document.getElementById('percent');
const fullscreen = document.getElementById('fullscreen');
let scale = 1;
let fitted = true;
let drag = null;

function fitScale() {
  return Math.min((viewport.clientWidth - 32) / diagram.naturalWidth, (viewport.clientHeight - 32) / diagram.naturalHeight, 1);
}

function render(next, reset = false) {
  if (!diagram.naturalWidth) return;
  const oldWidth = surface.scrollWidth;
  const oldHeight = surface.scrollHeight;
  const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth;
  const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / oldHeight;
  scale = Math.max(.1, Math.min(3, next));
  const width = diagram.naturalWidth * scale;
  const height = diagram.naturalHeight * scale;
  diagram.style.maxWidth = 'none';
  diagram.style.width = `${width}px`;
  diagram.style.height = `${height}px`;
  surface.style.width = `${Math.max(viewport.clientWidth, width + 32)}px`;
  surface.style.height = `${Math.max(viewport.clientHeight, height + 32)}px`;
  viewport.scrollLeft = reset ? 0 : centerX * surface.scrollWidth - viewport.clientWidth / 2;
  viewport.scrollTop = reset ? 0 : centerY * surface.scrollHeight - viewport.clientHeight / 2;
  slider.value = Math.round(scale * 100);
  percent.value = `${Math.round(scale * 100)}%`;
  document.getElementById('minus').disabled = scale <= .1;
  document.getElementById('plus').disabled = scale >= 3;
  viewport.classList.toggle('enlarged', scale > fitScale() + .01);
}

function fit() { fitted = true; render(fitScale(), true); }
function zoom(next) { fitted = false; render(next); }
document.getElementById('plus').addEventListener('click', () => zoom(scale * 1.3));
document.getElementById('minus').addEventListener('click', () => zoom(scale / 1.3));
document.getElementById('fit').addEventListener('click', fit);
slider.addEventListener('input', () => zoom(Number(slider.value) / 100));
diagram.addEventListener('dblclick', () => scale >= 1 ? fit() : zoom(1));
viewport.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.classList.contains('enlarged')) return;
  drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('dragging');
  event.preventDefault();
});
viewport.addEventListener('pointermove', event => {
  if (!drag) return;
  viewport.scrollLeft = drag.left - event.clientX + drag.x;
  viewport.scrollTop = drag.top - event.clientY + drag.y;
});
function stopDrag() { drag = null; viewport.classList.remove('dragging'); }
viewport.addEventListener('pointerup', stopDrag);
viewport.addEventListener('pointercancel', stopDrag);
viewport.addEventListener('lostpointercapture', stopDrag);
fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { fullscreen.title = 'Pantalla completa no disponible'; }
});
document.addEventListener('fullscreenchange', () => {
  fullscreen.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
});
new ResizeObserver(() => fitted ? fit() : render(scale)).observe(viewport);
diagram.addEventListener('load', fit);
diagram.addEventListener('error', () => { document.getElementById('error').hidden = false; });
if (diagram.complete && diagram.naturalWidth) fit();
if (window.lucide) window.lucide.createIcons();
