// Foreground treeline: shader-based, near bank, scrolling.
// Pure geometry math — no noise, no texture, no fbm.
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

      const vec3 TRUNK = vec3(0.16, 0.10, 0.04);
      const vec3 LEAF  = vec3(0.18, 0.26, 0.10);

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);

        // Trees live between ground top (0.12) and water (0.48)
        if (p.y < 0.12 || p.y > 0.47) discard;

        float wx = p.x + uScroll * uSpeed;

        // One tree per 0.30-unit cell
        float period = 0.30;
        float cellIdx = floor(wx / period);         // integer cell id
        float cellX   = mod(wx, period);            // 0..period within cell

        // Per-tree variation seeded by cell index (NOT world position)
        float h11 = hash11(cellIdx * 3.1731 + 1.0); // 0..1
        float h12 = hash11(cellIdx * 7.5317 + 2.0);

        // Skip ~30% of cells for spacing
        if (h11 < 0.30) discard;

        // Tree center within cell
        float treeCenter = period * (0.3 + h12 * 0.4); // 0.3..0.7 of cell
        float relX = cellX - treeCenter;               // local x from trunk

        // Height variation per tree: 0.20..0.34 in UV space
        float treeH   = 0.20 + h11 * 0.14;
        float rootY   = 0.13;
        float topY    = rootY + treeH;
        float relY    = (p.y - rootY) / treeH;        // 0=root 1=top

        if (p.y < rootY || p.y > topY) discard;

        // --- TRUNK: tapered rectangle ---
        float trunkW = 0.008 * (1.0 - relY * 0.6);
        if (abs(relX) < trunkW) {
          gl_FragColor = vec4(TRUNK, 1.0);
          return;
        }

        // --- CANOPY: ellipse, upper 60% of tree ---
        if (relY > 0.25) {
          float cy = 0.72;                           // ellipse center (in relY)
          float rx = 0.055 + h12 * 0.02;            // half-width
          float ry = 0.38;                           // half-height
          float ex = relX / rx;
          float ey = (relY - cy) / ry;
          if (ex*ex + ey*ey < 1.0) {
            // Slight brightness variation top-to-bottom
            float shade = 0.85 + 0.15 * relY;
            gl_FragColor = vec4(LEAF * shade, 0.92);
            return;
          }
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
