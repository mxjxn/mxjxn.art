// River Ride — side-scrolling bike at sunset. Assembly + loop.
// Layers are fullscreen shader passes scrolling at parallax rates;
// a post pass dithers + posterizes + saturates on the pixel grid.
import * as THREE from 'three';
import { makeSky } from './sky.js';
import { makeBand } from './hills.js';
import { makeWater } from './water.js';
import { makeBankLedge } from './bank-ledge.js';
import { makeTrees } from './trees.js';
import { makeGround } from './ground.js';
import { makeBike } from './bike.js';
import { makePost } from './post.js';
import { SCROLL, LINES } from './common.js';

const sig = document.getElementById('sig');
window.onerror = (m, s, l, c) => { if (sig) { sig.style.opacity = '1'; sig.textContent = `ERR ${m} @ ${l}:${c}`; } };
window.addEventListener('unhandledrejection', (e) => { if (sig) { sig.style.opacity = '1'; sig.textContent = `ERR ${e.reason}`; } });

const SUN_X_UV = 0.62;
const BIKE_X_UV = 0.30;
const BASE_SPEED = 0.22;      // screen-heights per second
const BOOST = 1.7;

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10); // z=0 geometry sits mid-volume (near 0 clips it)

const uTime = { value: 0 };
const uScroll = { value: 0 };

const layers = [];
function addLayer(layer, name) { layer.mesh.userData.name = name; layers.push(layer); scene.add(layer.mesh); return layer; }

// ?hide=sky,farRidge,... debug switch
const HIDE = new URLSearchParams(location.search).get('hide');

const sky = addLayer(makeSky(uTime, uScroll), 'sky');
const farRidge = addLayer(makeBand({
  speed: SCROLL.farRidge, base: 0.585, amp: 0.035, freq: 3.0, seed: 2.1,
  colorTop: 0x2a1548, colorBottom: 0x0d0515, treeAmp: 0.020, treeFreq: 18, order: 0,
}, uTime, uScroll), 'farRidge');
const midRidge = addLayer(makeBand({
  speed: SCROLL.midRidge, base: 0.545, amp: 0.030, freq: 4.0, seed: 3.1,
  colorTop: 0x3a1440, colorBottom: 0x1d0c30, treeAmp: 0.014, treeFreq: 26, order: 2,
}, uTime, uScroll), 'midRidge');
const water = addLayer(makeWater(uTime, uScroll, SUN_X_UV * 1), 'water');
const farBank = addLayer(makeBand({
  speed: SCROLL.farBank, base: 0.505, amp: 0.008, freq: 9.0, seed: 5.1,
  colorTop: 0x1c0b2a, colorBottom: 0x120720, treeAmp: 0.018, treeFreq: 42, order: 4,
  strip: 0.48,
}, uTime, uScroll), 'farBank');
const ground = addLayer(makeGround(uTime, uScroll), 'ground');
const trees = makeTrees(uTime, uScroll);
trees.userData.name = 'trees';
scene.add(trees);

if (HIDE) {
  const hideSet = new Set(HIDE.split(','));
  for (const L of layers) if (hideSet.has(L.mesh.userData.name)) L.mesh.visible = false;
}

const bike = makeBike();
if (HIDE && HIDE.split(',').includes('bike')) bike.group.visible = false;
bike.group.traverse((o) => { o.renderOrder = 6; o.frustumCulled = false; });
bike.group.position.set(BIKE_X_UV * 2 - 1, LINES.bankTop * 2 - 1, 0); // left third, on the bank line
bike.group.userData.baseY = 0.06 * 2 - 1;  // center of ground band in NDC
scene.add(bike.group);

const post = makePost();

// water shader wants the sun x in aspect-corrected units
water.uniforms.uSunX.value = SUN_X_UV;

let aspect = 1;
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  aspect = w / h;
  for (const L of layers) L.uniforms.uAspect.value = aspect;
  sky.uniforms.uSun.value.set(SUN_X_UV * aspect, 0.635);
  water.uniforms.uSunX.value = SUN_X_UV * aspect;
  post.setSize(aspect);
  bike.group.scale.set(1 / aspect, 1, 1);
}
window.addEventListener('resize', resize);
resize();

// ---- input: disabled ----
let boost = 1, boostTarget = 1;

// ---- loop ----
let last = performance.now();
let elapsed = 0;
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  elapsed += dt;
  boost += (boostTarget - boost) * Math.min(dt * 2.5, 1);

  const v = BASE_SPEED * boost;
  uScroll.value += v * dt;
  uTime.value = elapsed;

  for (const L of layers) {
    if (L.uniforms.uTime) L.uniforms.uTime.value = elapsed;
  }
  
  if (elapsed < 0.5) {
    console.log(`t=${elapsed.toFixed(3)}: v=${v.toFixed(3)}`);
  }
  
  trees.userData.update(elapsed, dt, v);
  bike.group.userData.update(elapsed, dt, v);

  renderer.setRenderTarget(post.rt);
  renderer.render(scene, cam);
  renderer.setRenderTarget(null);
  post.uniforms.uTime.value = elapsed;
  renderer.render(post.scene, post.cam);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

setTimeout(() => { if (sig) sig.style.opacity = '0'; }, 6000);
// cache bust
