// Foreground trees: rooted on land just above the bike path.
// Tall, distinct brown trunks with organic semi-transparent leaf clouds.
// Scrolls fast (close parallax) so they move noticeably as you ride.
// Renders BELOW the river so trees are in front, visible against the water.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 2.2 },  // fast parallax — very close to camera
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 TRUNK = vec3(0.18, 0.11, 0.05);     // warm brown trunk
      const vec3 LEAF = vec3(0.22, 0.28, 0.12);      // olive-green leaves

      // Signed distance to vertical line
      float sdLine(vec2 p, float x, float y0, float y1) {
        float dx = abs(p.x - x);
        float dy = abs(p.y - clamp(p.y, y0, y1));
        return sqrt(dx * dx + dy * dy);
      }

      // One tree: trunk + organic leaf cloud
      vec3 singleTree(vec2 p, float trunkX, float seed) {
        const float TRUNK_W = 0.012;       // medium thick trunk
        const float TRUNK_BASE = 0.12;     // rooted at bike path area
        const float TRUNK_TOP = 0.45;      // tall, reaches up
        
        // Trunk: dark vertical line
        float trunkDist = sdLine(p, trunkX, TRUNK_BASE, TRUNK_TOP);
        float trunk = smoothstep(TRUNK_W, TRUNK_W * 0.15, trunkDist);
        
        // Leaf cloud: organic FBM-based canopy
        // Center around upper 2/3 of trunk
        vec2 leafCenter = vec2(trunkX, 0.35);
        vec2 leafRel = p - leafCenter;
        
        // Taper: wider at top, narrower toward trunk
        float heightFromBase = (p.y - TRUNK_BASE) / (TRUNK_TOP - TRUNK_BASE);
        float canopyWidth = 0.14 * (1.0 - heightFromBase * 0.3);  // taper as height increases
        
        float leafX = leafRel.x / canopyWidth;
        float leafY = (leafRel.y + 0.05) / 0.18;
        
        // Organic noise-based leaf shape
        float noise = fbm(vec2(leafX * 2.5 + seed * 10.0, leafY * 3.5 + seed * 7.0));
        float leafCloud = smoothstep(-0.15, 0.35, noise)
                        * smoothstep(0.16, -0.15, abs(leafX))  // taper horizontal edges
                        * smoothstep(0.10, -0.12, leafY);      // taper vertical

        // Combine: opaque trunk + semi-transparent leaves
        vec3 col = vec3(0.0);
        if (trunk > 0.2) {
          col = TRUNK;
        } else if (leafCloud > 0.08) {
          // Blend leaves with transparency
          col = mix(vec3(0.0), LEAF, leafCloud * 0.55);
        }
        return col;
      }

      vec3 forestLine(vec2 p) {
        float wx = p.x + uScroll * uSpeed;
        
        // Sparse trees: one tree per ~0.30 screen-widths
        float cellWidth = 0.30;
        float cellIdx = floor(wx / cellWidth);
        
        // Hash-based sparsity: 60% gaps, 40% trees
        float seed = hash11(cellIdx * 23.5);
        if (seed < 0.60) return vec3(0.0);  // 60% empty space between trees
        
        // Position within cell: ±40% offset for natural irregularity
        float trunkX = (cellIdx + 0.5 + (seed - 0.5) * 0.8) * cellWidth;
        
        vec3 col = singleTree(p, trunkX, seed * 100.0);
        
        // Check neighbor cell for seamless coverage
        float neighborSeed = hash11((cellIdx + 1.0) * 23.5);
        if (neighborSeed >= 0.60) {
          float neighborX = ((cellIdx + 1.0) + 0.5 + (neighborSeed - 0.5) * 0.8) * cellWidth;
          col = max(col, singleTree(p, neighborX, neighborSeed * 100.0));
        }
        
        return col;
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Trees render ONLY in foreground strip just above bike path, below river
        // Approximately y: 0.10 to 0.48 (before the water starts at 0.48)
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        vec3 col = forestLine(p);
        if (length(col) < 0.01) discard;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 3;  // BEFORE water (renderOrder 4), so trees are in front
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
