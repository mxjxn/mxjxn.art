// Foreground trees: sparse, tall trunks rooted at the near bank edge (where bike path is).
// Procedural leaf texture via GLSL — leaves are organic noise clouds, trunks are thin dark lines.
// Scrolls past at the ground speed (1.0) so trees stay planted at the bank line.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.0 },  // same as ground — stays rooted at bank
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      // Trunk color: dark brown
      const vec3 TRUNK = vec3(0.12, 0.08, 0.04);
      // Leaf color: dark green
      const vec3 LEAF = vec3(0.08, 0.16, 0.06);

      // Signed distance to a line segment (for trunk)
      float sdSegment(vec2 p, vec2 a, vec2 b) {
        vec2 ba = b - a, pa = p - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }

      // Organic leaf cloud: Perlin-like noise
      float leafNoise(vec2 p) {
        return fbm(p * 3.5 + vec2(0.0, 0.1));
      }

      // One tree: sparse trunk + organic leaves above it
      vec3 tree(vec2 p, float treeX, float seed) {
        // Trunk: thin vertical line from rootY to tipY
        const float TRUNK_W = 0.0035;
        const float ROOT_Y = 0.0;
        const float TIP_Y = 0.35;
        
        vec2 root = vec2(treeX, ROOT_Y);
        vec2 tip = vec2(treeX, TIP_Y);
        float trunkDist = sdSegment(p, root, tip);
        float trunk = smoothstep(TRUNK_W, TRUNK_W * 0.3, trunkDist);

        // Leaves: organic noise cloud, centered above mid-trunk, taper with height
        float py = p.y - 0.15;  // center leaf mass at mid-height
        float lx = (p.x - treeX) / (0.08 + 0.08 * abs(py / 0.15));  // wider at base, narrower at top
        float noiseVal = leafNoise(vec2(lx * 2.0, py * 4.0) + vec2(seed, 0.0));
        float leaves = smoothstep(-0.1, 0.3, noiseVal) * smoothstep(0.05, -0.08, py + 0.15) * smoothstep(-0.05, -0.25, py);
        
        // Trunk opaque, leaves semi-transparent
        return mix(vec3(0.0), TRUNK, trunk) + mix(vec3(0.0), LEAF, leaves * 0.7);
      }

      // Procedural tree grid: hash-spaced trees along the bank
      vec3 treeLine(vec2 p) {
        float wx = p.x + uScroll * uSpeed;  // scroll in world space
        
        // One tree per ~0.15 screen-widths, scattered horizontally
        float cells = wx * 6.67;  // ~0.15 screen-widths per tree
        float treeIdx = floor(cells);
        float fracCell = fract(cells);
        
        // Seed this cell's tree
        float seed = hash11(treeIdx * 13.7);
        if (seed < 0.55) return vec3(0.0);  // 55% gaps (sparse forest)
        
        // Tree position within cell: random offset ±20% of cell width
        float cellWidth = 1.0 / 6.67;
        float treeX = (treeIdx + 0.5 + (seed - 0.5) * 0.4) * cellWidth;
        
        // Merge this tree
        vec3 col = tree(p, treeX, seed * 100.0);
        
        // Optional: check neighboring cells for trees near edges (smooth seams)
        // (kept simple for now — slight pop-in at cell boundaries is acceptable)
        
        return col;
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Trees only render in the ground/near-bank zone (bottom ~15% of screen)
        if (p.y > 0.15) discard;
        
        vec3 col = treeLine(p);
        if (length(col) < 0.01) discard;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 5.5;  // after water/bank, before reeds
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
