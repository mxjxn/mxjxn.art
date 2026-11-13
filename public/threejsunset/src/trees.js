// Foreground trees: sparse procedural trunks with organic leaves.
// Positioned between ground (0.12) and water (0.48), scrolls at 1.0× speed.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.0 },  // base speed — same as ground/world
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 TRUNK = vec3(0.18, 0.11, 0.05);
      const vec3 LEAF = vec3(0.22, 0.28, 0.12);

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Trees occupy y ∈ [0.10, 0.48]
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        
        // Tree placement: repeating every 0.50 units
        // 3 trees per cell at relative x: 0.08, 0.20, 0.35
        float cellX = mod(wx, 0.50);
        float d1 = abs(cellX - 0.08);
        float d2 = abs(cellX - 0.20);
        float d3 = abs(cellX - 0.35);
        
        float minDist = min(d1, min(d2, d3));
        
        // Discard if too far from any tree trunk center
        if (minDist > 0.10) discard;
        
        // Find which tree we're closest to
        float treeX;
        if (d1 < d2 && d1 < d3) treeX = wx - cellX + 0.08;
        else if (d2 < d3) treeX = wx - cellX + 0.20;
        else treeX = wx - cellX + 0.35;
        
        // Local coordinates relative to tree position
        float relX = p.x - treeX;
        float relY = (p.y - 0.10) / 0.38;  // normalize 0.10–0.48 to 0–1
        
        // Draw leaves first (so trunk renders on top)
        if (relY > 0.15 && relY < 0.95) {
          // Leaf cloud: wider middle, tapers top and bottom
          float leafWidth = 0.14 * (1.0 - abs(relY - 0.55) * 1.1);
          
          if (abs(relX) < leafWidth) {
            // Organic variation using sine noise + position seed
            float leafNoise = sin(relX * 25.0 + relY * 18.0 + treeX * 80.0) * 0.5 + 0.5;
            
            // Only render where noise is high enough
            if (leafNoise > 0.30) {
              gl_FragColor = vec4(LEAF, leafNoise * 0.70);
              return;
            }
          }
        }
        
        // Draw trunk: tapered (wider at base, narrower at top)
        float trunkWidth = 0.012 * (1.0 - relY * 0.5);
        if (abs(relX) < trunkWidth) {
          gl_FragColor = vec4(TRUNK, 1.0);
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
  mesh.renderOrder = 5;  // AFTER water (4), AFTER ground (1)
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
