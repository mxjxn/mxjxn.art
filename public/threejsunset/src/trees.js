// Foreground trees: rooted on the bank ledge, scrolling fast (close parallax).
// Distinct brown trunks with organic, semi-transparent leaf clouds.
// Big gaps between trees so you see the river/landscape through them.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.8 },  // fast parallax — close to camera
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 TRUNK = vec3(0.14, 0.08, 0.04);     // dark brown
      const vec3 LEAF = vec3(0.18, 0.24, 0.10);      // dark olive green

      // Signed distance to vertical line segment
      float sdTrunk(vec2 p, float x, float y0, float y1) {
        float dx = abs(p.x - x);
        float clamped_y = clamp(p.y, y0, y1);
        float dy = abs(p.y - clamped_y);
        return sqrt(dx * dx + dy * dy);
      }

      // One tree: trunk + leaf cloud
      vec3 singleTree(vec2 p, float trunkX, float seed) {
        const float TRUNK_W = 0.008;        // thin brown trunk
        const float TRUNK_Y0 = 0.475;       // rooted at bank ledge
        const float TRUNK_Y1 = 0.70;        // tall, reaching up
        
        // Trunk: thin vertical line
        float trunkDist = sdTrunk(p, trunkX, TRUNK_Y0, TRUNK_Y1);
        float trunk = smoothstep(TRUNK_W, TRUNK_W * 0.2, trunkDist);
        
        // Leaves: organic noise cloud around upper trunk
        vec2 leafP = p - vec2(trunkX, 0.60);  // center cloud at mid-trunk height
        float leafX = leafP.x / 0.12;  // scale horizontally
        float leafY = (leafP.y + 0.05) / 0.20;  // scale vertically, slight upward bias
        
        float noiseVal = fbm(vec2(leafX * 2.0 + seed * 10.0, leafY * 3.0 + seed * 7.0));
        float leafCloud = smoothstep(-0.1, 0.4, noiseVal) 
                        * smoothstep(0.15, -0.20, abs(leafP.x) / 0.12)  // taper edges
                        * smoothstep(-0.08, 0.15, leafY);  // taper top and bottom
        
        // Combine trunk (opaque) + leaves (semi-transparent)
        vec3 col = vec3(0.0);
        if (trunk > 0.1) {
          col = TRUNK;
        } else if (leafCloud > 0.05) {
          col = mix(vec3(0.0), LEAF, leafCloud * 0.6);  // semi-transparent leaves
        }
        return col;
      }

      vec3 treeLine(vec2 p) {
        float wx = p.x + uScroll * uSpeed;
        
        // One tree per ~0.25 screen-widths, widely spaced
        float cellWidth = 0.25;
        float cellCount = wx / cellWidth;
        float cellIdx = floor(cellCount);
        
        float seed = hash11(cellIdx * 17.3);
        if (seed < 0.70) return vec3(0.0);  // 70% gaps (sparse forest)
        
        // Tree position: random offset ±30% of cell width
        float trunkX = (cellIdx + 0.5 + (seed - 0.5) * 0.6) * cellWidth;
        
        vec3 col = singleTree(p, trunkX, seed * 100.0);
        
        // Optional: check neighboring cells
        float neighborSeed = hash11((cellIdx + 1.0) * 17.3);
        if (neighborSeed >= 0.70) {
          float neighborX = ((cellIdx + 1.0) + 0.5 + (neighborSeed - 0.5) * 0.6) * cellWidth;
          col = max(col, singleTree(p, neighborX, neighborSeed * 100.0));
        }
        
        return col;
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Trees only in the foreground zone (above bank ledge, below far ridges)
        if (p.y < 0.475 || p.y > 0.75) discard;
        
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
  mesh.renderOrder = 5;  // after bank ledge (4.5), before bike (6)
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
