import { VocalTract } from './vocalTract.js';
import { Tongue } from './tongue.js';
import { AudioEngine } from './audioEngine.js';
import { createControlBindings } from './ui.js';
import { clamp, formatHz } from './utils.js';

const tractCanvas = document.querySelector('#tractCanvas');
const analysisCanvas = document.querySelector('#analysisCanvas');
const tractCtx = tractCanvas.getContext('2d');
const analysisCtx = analysisCanvas.getContext('2d');

const state = {
  params: {
    pitch: 140,
    voice: 0.82,
    tenseness: 0.45,
    breathiness: 0.24,
    volume: 0.55,
    vibrato: 0.16,
    noise: 0.14,
    tongueStiffness: 0.2,
    tractLength: 0.68,
    resonance: 0.62,
  },
  active: false,
  pointer: { x: 0.5, y: 0.5 },
};

const tract = new VocalTract();
const tongue = new Tongue();
const audioEngine = new AudioEngine();

let lastFrame = 0;
let timeAccumulator = 0;

function resizeCanvases() {
  // Match canvas backing store to the visible display size for crisp rendering.
  const ratio = window.devicePixelRatio || 1;
  const width = tractCanvas.clientWidth;
  const height = tractCanvas.clientHeight;
  tractCanvas.width = width * ratio;
  tractCanvas.height = height * ratio;
  tractCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  analysisCanvas.width = analysisCanvas.clientWidth * ratio;
  analysisCanvas.height = analysisCanvas.clientHeight * ratio;
  analysisCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function syncTongueFromPointer() {
  // Map the last pointer position into tract articulation values.
  tongue.setPosition(clamp(state.pointer.x, 0.05, 0.95), clamp(state.pointer.y, 0.15, 0.92));
  tract.setTongue(tongue.x, tongue.y);
}

function renderTract() {
  // Draw the animated mouth cavity, lips, tongue, and particles in one frame.
  const width = tractCanvas.clientWidth;
  const height = tractCanvas.clientHeight;
  tractCtx.clearRect(0, 0, width, height);

  const gradient = tractCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1325');
  gradient.addColorStop(1, '#08070d');
  tractCtx.fillStyle = gradient;
  tractCtx.fillRect(0, 0, width, height);

  const geometry = tract.getGeometry();
  const lipPoints = [
    { x: 140, y: 260 },
    { x: 180, y: 280 },
    { x: 220, y: 300 },
    { x: 260, y: 290 },
  ];

  const glow = tractCtx.createRadialGradient(width * 0.47, height * 0.2, 0, width * 0.5, height * 0.42, width * 0.7);
  glow.addColorStop(0, 'rgba(255, 94, 153, 0.15)');
  glow.addColorStop(1, 'rgba(255, 94, 153, 0)');
  tractCtx.fillStyle = glow;
  tractCtx.fillRect(0, 0, width, height);

  tractCtx.beginPath();
  tractCtx.moveTo(120, 220);
  tractCtx.bezierCurveTo(140, 180, 180, 160, 220, 180);
  tractCtx.bezierCurveTo(260, 200, 320, 210, 360, 220);
  tractCtx.lineTo(360, 320);
  tractCtx.bezierCurveTo(330, 340, 280, 340, 240, 320);
  tractCtx.bezierCurveTo(190, 295, 150, 280, 120, 220);
  tractCtx.closePath();

  tractCtx.fillStyle = 'rgba(255, 142, 182, 0.18)';
  tractCtx.fill();

  tractCtx.lineWidth = 2.2;
  tractCtx.strokeStyle = 'rgba(255, 153, 190, 0.9)';
  tractCtx.stroke();

  tractCtx.beginPath();
  tractCtx.moveTo(120, 220);
  geometry.forEach((point, index) => {
    if (index === 0) {
      tractCtx.moveTo(point.x, point.y);
    } else {
      tractCtx.lineTo(point.x, point.y);
    }
  });
  tractCtx.strokeStyle = 'rgba(255, 98, 156, 0.95)';
  tractCtx.lineWidth = 3.5;
  tractCtx.stroke();

  tractCtx.beginPath();
  tractCtx.moveTo(120, 220);
  tractCtx.bezierCurveTo(130, 250, 150, 270, 170, 290);
  tractCtx.lineTo(220, 290);
  tractCtx.bezierCurveTo(210, 270, 200, 250, 190, 230);
  tractCtx.closePath();
  tractCtx.fillStyle = 'rgba(255, 120, 178, 0.7)';
  tractCtx.fill();

  tractCtx.beginPath();
  tractCtx.moveTo(170, 290);
  tractCtx.lineTo(220, 290);
  tractCtx.lineTo(220, 330);
  tractCtx.lineTo(170, 330);
  tractCtx.closePath();
  tractCtx.fillStyle = 'rgba(255, 184, 210, 0.32)';
  tractCtx.fill();

  tractCtx.beginPath();
  tractCtx.arc(220, 290, 10 + tract.lips * 40, 0, Math.PI * 2);
  tractCtx.fillStyle = 'rgba(255, 178, 206, 0.85)';
  tractCtx.fill();

  tractCtx.beginPath();
  tractCtx.moveTo(220, 290);
  tractCtx.bezierCurveTo(260, 280, 290, 270, 320, 260);
  tractCtx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  tractCtx.stroke();

  tractCtx.beginPath();
  for (let i = 0; i < 18; i += 1) {
    const offset = i * 8;
    tractCtx.moveTo(170 + offset, 292);
    tractCtx.lineTo(180 + offset, 312 + ((i % 2) * 4));
  }
  tractCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  tractCtx.lineWidth = 1.2;
  tractCtx.stroke();

  const tongueX = 180 + tongue.x * 140;
  const tongueY = 220 + tongue.y * 90;
  tractCtx.beginPath();
  tractCtx.moveTo(180, 300);
  tractCtx.quadraticCurveTo(tongueX, tongueY, 260, 300);
  tractCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  tractCtx.lineWidth = 4;
  tractCtx.stroke();

  tractCtx.beginPath();
  tractCtx.arc(tongueX, tongueY, 8, 0, Math.PI * 2);
  tractCtx.fillStyle = '#ffd9e6';
  tractCtx.fill();

  const particles = 24;
  for (let i = 0; i < particles; i += 1) {
    const t = (i / particles + performance.now() * 0.00007) % 1;
    const px = 140 + t * 160;
    const py = 220 + Math.sin(t * Math.PI * 2 + performance.now() * 0.001) * 18;
    tractCtx.fillStyle = `rgba(255, 255, 255, ${0.14 + (1 - t) * 0.12})`;
    tractCtx.beginPath();
    tractCtx.arc(px, py, 2.2, 0, Math.PI * 2);
    tractCtx.fill();
  }

  if (state.active) {
    tractCtx.beginPath();
    tractCtx.arc(220 + Math.sin(performance.now() * 0.005) * 6, 290 + Math.cos(performance.now() * 0.0045) * 4, 14, 0, Math.PI * 2);
    tractCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    tractCtx.lineWidth = 2;
    tractCtx.stroke();
  }
}

function renderAnalysis() {
  // Visualize the current waveform on the analysis canvas.
  const width = analysisCanvas.clientWidth;
  const height = analysisCanvas.clientHeight;
  analysisCtx.clearRect(0, 0, width, height);
  analysisCtx.fillStyle = '#0a090f';
  analysisCtx.fillRect(0, 0, width, height);

  const samples = audioEngine.waveform;
  analysisCtx.beginPath();
  for (let i = 0; i < samples.length; i += 1) {
    const x = (i / samples.length) * width;
    const y = height / 2 + samples[i] * 50;
    if (i === 0) {
      analysisCtx.moveTo(x, y);
    } else {
      analysisCtx.lineTo(x, y);
    }
  }
  analysisCtx.strokeStyle = '#ff5e99';
  analysisCtx.lineWidth = 1.6;
  analysisCtx.stroke();

  analysisCtx.beginPath();
  analysisCtx.moveTo(0, height / 2);
  analysisCtx.lineTo(width, height / 2);
  analysisCtx.strokeStyle = 'rgba(255,255,255,0.1)';
  analysisCtx.stroke();
}

function updateIndicators() {
  // Keep the top overlay readouts aligned with the live synthesis values.
  const pitch = state.params.pitch;
  const formants = [500 + pitch * 1.7, 1200 + pitch * 0.8, 2600 + pitch * 0.5];
  document.querySelector('#pitchReadout').textContent = `Pitch: ${formatHz(pitch)}`;
  document.querySelector('#formantReadout').textContent = `Formants: ${formants[0].toFixed(0)} / ${formants[1].toFixed(0)} / ${formants[2].toFixed(0)}`;
}

function animate(now) {
  if (!lastFrame) {
    lastFrame = now;
  }
  const delta = (now - lastFrame) / 1000;
  lastFrame = now;
  timeAccumulator += delta;

  tract.update(delta, state.params);
  syncTongueFromPointer();
  renderTract();
  renderAnalysis();
  updateIndicators();

  if (state.active) {
    audioEngine.setParams(state.params);
    audioEngine.renderFrame(now);
  }

  requestAnimationFrame(animate);
}

function onPointerMove(event) {
  const rect = tractCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  state.pointer = { x, y };
  if (tongue.dragging) {
    syncTongueFromPointer();
  }
}

function onPointerDown(event) {
  if (event.button === 0 || event.pointerType === 'touch') {
    state.active = true;
    tongue.dragging = true;
    audioEngine.start();
    onPointerMove(event);
  }
}

function onPointerUp() {
  tongue.dragging = false;
}

function onDoubleClick() {
  tongue.reset();
  tract.reset();
  state.pointer = { x: 0.5, y: 0.5 };
}

function onWheel(event) {
  state.params.pitch = clamp(state.params.pitch + event.deltaY * -0.03, 70, 260);
  const pitchControl = document.querySelector('#pitch');
  if (pitchControl) {
    pitchControl.value = state.params.pitch;
  }
}

function onKeydown(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    state.active = !state.active;
  }
}

function attachEvents() {
  createControlBindings(state);
  window.addEventListener('resize', resizeCanvases);
  tractCanvas.addEventListener('pointerdown', onPointerDown);
  tractCanvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  tractCanvas.addEventListener('dblclick', onDoubleClick);
  tractCanvas.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('keydown', onKeydown);
}

function boot() {
  // Initialize the scene, controls, and render loop.
  resizeCanvases();
  attachEvents();
  audioEngine.setParams(state.params);
  requestAnimationFrame(animate);
}

boot();
