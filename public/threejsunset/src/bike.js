// Bike + rider silhouette: spinning spoked wheels, diamond frame, pedaling rider
// (2-bone IK legs on a crank), bobbing gently, scarf flapping in the wind.
//
// The group lives in NDC space; main.js sets group.scale.x = 1/aspect so local
// units are square (1 unit = half a screen height). Ground line is local y = 0.
import * as THREE from 'three';

const BODY = 0x170a12;      // warm near-black plum
const ACCENT = 0x7d2130;    // dark scarf red

const WHEEL_R = 0.052;
const WHEEL_X = 0.115;
const BB = { x: -0.010, y: 0.075 };       // bottom bracket
const SADDLE = { x: -0.058, y: 0.168 };
const HEAD_TOP = { x: 0.075, y: 0.158 };  // head tube top
const GRIP = { x: 0.093, y: 0.168 };
const HIP = { x: -0.056, y: 0.182 };
const SHOULDER = { x: -0.018, y: 0.240 };
const HEAD_C = { x: 0.001, y: 0.258 };
const THIGH = 0.062, SHIN = 0.062;
const CRANK_R = 0.019;

// raw display-space colors (post pass does no gamma conversion)
function rawColor(hex) {
  return new THREE.Color().setHex(hex, THREE.NoColorSpace);
}

function boneMat(color) {
  // transparent: true is REQUIRED — three draws all opaque objects before any
  // transparent ones (renderOrder only sorts within each bucket), so an opaque
  // bike would render *under* the alpha-1 fullscreen shader layers.
  return new THREE.MeshBasicMaterial({ color: rawColor(color), transparent: true });
}

// thin quad stretched between two points
function makeBone(color, w) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), boneMat(color));
  m.userData.w = w;
  return m;
}

function setBone(m, p0, p1, w) {
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const len = Math.max(Math.hypot(dx, dy), 0.0001);
  m.position.set((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, 0);
  m.rotation.z = Math.atan2(dy, dx);
  m.scale.set(len, w !== undefined ? w : m.userData.w, 1);
}

function makeWheel(x) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(WHEEL_R - 0.0055, WHEEL_R, 48),
    boneMat(BODY)
  );
  g.add(ring);
  const spokes = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(WHEEL_R * 2 - 0.006, 0.0032), boneMat(BODY));
    s.rotation.z = (i * Math.PI) / 4;
    spokes.add(s);
  }
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.006, 12), boneMat(BODY));
  spokes.add(hub);
  g.add(spokes);
  g.position.x = x;
  g.position.y = WHEEL_R;
  g.userData.spokes = spokes;
  return g;
}

export function makeBike() {
  const group = new THREE.Group();

  const rear = makeWheel(-WHEEL_X);
  const front = makeWheel(WHEEL_X);
  group.add(rear, front);

  // frame
  const F = 0.0085;
  const frame = [
    makeBone(BODY, F), makeBone(BODY, F), makeBone(BODY, F),
    makeBone(BODY, F * 0.8), makeBone(BODY, F * 0.8),
    makeBone(BODY, F * 0.8), makeBone(BODY, F),
  ];
  group.add(...frame);

  // saddle + handlebar
  const saddle = makeBone(BODY, 0.012);
  setBone(saddle, { x: SADDLE.x - 0.014, y: SADDLE.y }, { x: SADDLE.x + 0.010, y: SADDLE.y }, 0.012);
  const bar = makeBone(BODY, 0.007);
  setBone(bar, HEAD_TOP, GRIP);
  group.add(saddle, bar);

  // rider body — thicker, solid forms (not sticks)
  const torso = makeBone(BODY, 0.042);      // wide solid torso
  const arm = makeBone(BODY, 0.011);        // thicker arms
  const thighA = makeBone(BODY, 0.018);     // thicker thigh
  const shinA = makeBone(BODY, 0.012);      // thicker shin
  const thighB = makeBone(BODY, 0.018);
  const shinB = makeBone(BODY, 0.012);
  group.add(torso, arm, thighA, shinA, thighB, shinB);

  const head = new THREE.Mesh(new THREE.CircleGeometry(0.0175, 16), boneMat(BODY));
  head.position.set(HEAD_C.x, HEAD_C.y, 0);
  group.add(head);

  // scarf: 3 chained flapping segments (accent color)
  const scarf = [makeBone(ACCENT, 0.008), makeBone(ACCENT, 0.006), makeBone(ACCENT, 0.004)];
  group.add(...scarf);

  // crank + pedals
  const pedalA = new THREE.Mesh(new THREE.CircleGeometry(0.0055, 10), boneMat(BODY));
  const pedalB = new THREE.Mesh(new THREE.CircleGeometry(0.0055, 10), boneMat(BODY));
  group.add(pedalA, pedalB);

  let crankAngle = 0;

  group.userData.update = (t, dt, v) => {
    // wheel spin: world moves left => wheels turn clockwise
    const w = v / WHEEL_R;
    rear.userData.spokes.rotation.z -= w * dt;
    front.userData.spokes.rotation.z -= w * dt;

    // crank (geared down from wheel, integrated so speed changes stay smooth)
    crankAngle -= w * 0.42 * dt;
    const ca = crankAngle;
    const pa = {
      x: BB.x + CRANK_R * Math.cos(ca),
      y: BB.y + CRANK_R * Math.sin(ca),
    };
    const pb = {
      x: BB.x + CRANK_R * Math.cos(ca + Math.PI),
      y: BB.y + CRANK_R * Math.sin(ca + Math.PI),
    };
    pedalA.position.set(pa.x, pa.y, 0);
    pedalB.position.set(pb.x, pb.y, 0);

    // legs: hip -> knee -> ankle(pedal), knee bent forward
    setLeg(thighA, shinA, HIP, pa);
    setLeg(thighB, shinB, HIP, pb);

    // torso + arm (tiny breathing motion)
    const sh = { x: SHOULDER.x, y: SHOULDER.y + 0.0025 * Math.sin(t * 2.3) };
    setBone(torso, HIP, sh);
    setBone(arm, sh, GRIP);

    // frame static
    setBone(frame[0], BB, SADDLE);
    setBone(frame[1], SADDLE, HEAD_TOP);
    setBone(frame[2], BB, HEAD_TOP);
    setBone(frame[3], BB, { x: -WHEEL_X, y: WHEEL_R });
    setBone(frame[4], SADDLE, { x: -WHEEL_X, y: WHEEL_R });
    setBone(frame[5], HEAD_TOP, { x: WHEEL_X, y: WHEEL_R });
    setBone(frame[6], HEAD_TOP, GRIP);

    // scarf flutters off the neck
    let px = HEAD_C.x - 0.014, py = HEAD_C.y + 0.002;
    for (let i = 0; i < scarf.length; i++) {
      const ang = Math.PI * 0.78 + Math.sin(t * 7.5 + i * 1.9) * 0.35 + i * 0.12;
      const nx = px + Math.cos(ang) * 0.017;
      const ny = py + Math.sin(ang) * 0.017;
      setBone(scarf[i], { x: px, y: py }, { x: nx, y: ny });
      px = nx; py = ny;
    }

    // gentle bob + pitch (add to base position, never overwrite it)
    const baseY = group.userData.baseY !== undefined ? group.userData.baseY : 0;
    group.position.y = baseY + 0.0035 * Math.sin(t * 2.6);
    group.rotation.z = 0.008 * Math.sin(t * 2.6 + 1.2);
  };

  return { group };
}

function setLeg(thigh, shin, hip, ankle) {
  let dx = ankle.x - hip.x, dy = ankle.y - hip.y;
  let d = Math.hypot(dx, dy);
  const maxD = (THIGH + SHIN) * 0.999;
  if (d > maxD) { d = maxD; dx *= maxD / Math.hypot(dx, dy) || 1; dy *= maxD / Math.hypot(dx, dy) || 1; }
  const base = Math.atan2(dy, dx);
  const cosK = (d * d + THIGH * THIGH - SHIN * SHIN) / (2 * d * THIGH);
  const bend = Math.acos(Math.min(1, Math.max(-1, cosK)));
  // two solutions; pick the one with the knee more forward (+x)
  const k1 = { x: hip.x + THIGH * Math.cos(base + bend), y: hip.y + THIGH * Math.sin(base + bend) };
  const k2 = { x: hip.x + THIGH * Math.cos(base - bend), y: hip.y + Math.sin(base - bend) * THIGH };
  const knee = k1.x >= k2.x ? k1 : k2;
  setBone(thigh, hip, knee);
  setBone(shin, knee, ankle);
}
