// Foreground treeline: layered conifer silhouettes matching hills.js visual language
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime:   { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed:  { value: 1.0 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 TRUNK = vec3(0.14, 0.09, 0.03);
      const vec3 FOLIAGE = vec3(0.16, 0.24, 0.08);

      // Returns 1 if point (px,py) is inside a triangle tier centered at (cx,cy)
      // with half-width w and height h
      float inTier(float px, float py, float cx, float cy, float w, float h) {
        float dx = px - cx;
        float dy = py - cy;
        if (dy < 0.0 || dy > h) return 0.0;
        float edge = w * (1.0 - dy / h);  // tapers to point at top
        return step(abs(dx), edge);
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);

        if (p.y < 0.12 || p.y > 0.55) discard;

        float wx = p.x + uScroll * uSpeed;

        float period = 0.35;
        float cellIdx = floor(wx / period);
        float cellX   = mod(wx, period);

        // Per-tree hash variation
        float h1 = hash11(cellIdx * 3.1731 + 1.0);
        float h2 = hash11(cellIdx * 7.5317 + 2.0);
        float h3 = hash11(cellIdx * 5.9173 + 3.0);

        // Skip ~25% of cells
        if (h1 < 0.25) discard;

        // Tree trunk center within cell
        float cx = period * (0.25 + h2 * 0.50);
        float dx = cellX - cx;

        // Tree size variation
        float scale = 0.7 + h3 * 0.6;  // 0.7..1.3
        float rootY = 0.13;

        // Trunk
        float trunkH = 0.04 * scale;
        float trunkW = 0.007 * scale;
        if (abs(dx) < trunkW && p.y > rootY && p.y < rootY + trunkH) {
          gl_FragColor = vec4(TRUNK, 1.0);
          return;
        }

        // Three stacked tiers, each overlapping, bottom widest
        float base = rootY + trunkH * 0.5;
        float tierH = 0.10 * scale;
        float tierW = 0.055 * scale;
        float overlap = 0.65;  // how much tiers overlap vertically

        float t1 = inTier(dx, p.y, 0.0, base,                       tierW,       tierH);
        float t2 = inTier(dx, p.y, 0.0, base + tierH * overlap,      tierW * 0.8, tierH);
        float t3 = inTier(dx, p.y, 0.0, base + tierH * overlap * 2.0, tierW * 0.6, tierH);

        if (t1 + t2 + t3 > 0.0) {
          // Slightly lighter at tips for depth
          float brightness = 0.85 + 0.15 * t3;
          gl_FragColor = vec4(FOLIAGE * brightness, 1.0);
          return;
        }

        discard;
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 5;
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
