// Foreground trees: sparse procedural trunks with organic leaves.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,      // this is the same object reference from main.js
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
        
        // Tree placement: repeating every 0.50 units
        float cellX = mod(wx, 0.50);
        float d1 = abs(cellX - 0.08);
        float d2 = abs(cellX - 0.20);
        float d3 = abs(cellX - 0.35);
        
        float minDist = min(d1, min(d2, d3));
        if (minDist > 0.10) discard;
        
        float treeX;
        if (d1 < d2 && d1 < d3) treeX = wx - cellX + 0.08;
        else if (d2 < d3) treeX = wx - cellX + 0.20;
        else treeX = wx - cellX + 0.35;
        
        float relX = p.x - treeX;
        float relY = (p.y - 0.10) / 0.38;
        
        if (relY > 0.15 && relY < 0.95) {
          float leafWidth = 0.14 * (1.0 - abs(relY - 0.55) * 1.1);
          if (abs(relX) < leafWidth) {
            float leafNoise = sin(relX * 25.0 + relY * 18.0 + treeX * 80.0) * 0.5 + 0.5;
            if (leafNoise > 0.30) {
              gl_FragColor = vec4(LEAF, leafNoise * 0.70);
              return;
            }
          }
        }
        
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
  mesh.renderOrder = 5;
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
