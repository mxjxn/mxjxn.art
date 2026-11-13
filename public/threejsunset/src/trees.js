// Foreground trees: sparse tapered trunks with leaves
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.0 },
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
        
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        
        // Three trees per 0.50-unit cell
        float cellX = mod(wx, 0.50);
        
        // Distance to tree centers at 0.08, 0.20, 0.35
        float d1 = abs(cellX - 0.08);
        float d2 = abs(cellX - 0.20);
        float d3 = abs(cellX - 0.35);
        float minDist = min(d1, min(d2, d3));
        
        // Only render near tree trunks
        if (minDist > 0.08) discard;
        
        // Find which tree
        float treeX;
        if (d1 < d2 && d1 < d3) treeX = wx - cellX + 0.08;
        else if (d2 < d3) treeX = wx - cellX + 0.20;
        else treeX = wx - cellX + 0.35;
        
        float relX = p.x - treeX;
        float relY = (p.y - 0.10) / 0.38;
        
        // Leaves first
        if (relY > 0.15 && relY < 0.95) {
          float leafW = 0.12 * (1.0 - abs(relY - 0.55) * 1.0);
          if (abs(relX) < leafW) {
            // Seed with cellX (tree's position within cell), not treeX (world position)
            float leafNoise = sin(relX * 20.0 + relY * 15.0 + cellX * 100.0) * 0.5 + 0.5;
            if (leafNoise > 0.30) {
              gl_FragColor = vec4(LEAF, leafNoise * 0.65);
              return;
            }
          }
        }
        
        // Trunk on top
        float trunkW = 0.010 * (1.0 - relY * 0.5);
        if (abs(relX) < trunkW) {
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
  mesh.renderOrder = 5;
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
