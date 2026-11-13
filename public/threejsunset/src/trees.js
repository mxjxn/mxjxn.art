// Foreground trees: tapered trunks with leaves.
import * as THREE from 'three';
import { FULLSCREEN_VERT } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 2.2 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        float cellPos = mod(wx, 0.50);
        
        float d1 = abs(cellPos - 0.08);
        float d2 = abs(cellPos - 0.20);
        float d3 = abs(cellPos - 0.35);
        float minDist = min(d1, min(d2, d3));
        
        if (minDist > 0.12) discard;
        
        float treeX;
        if (d1 < d2 && d1 < d3) treeX = wx - cellPos + 0.08;
        else if (d2 < d3) treeX = wx - cellPos + 0.20;
        else treeX = wx - cellPos + 0.35;
        
        float relX = p.x - treeX;
        float relY = (p.y - 0.12) / 0.33;
        
        float trunkW = 0.010 * (1.0 - relY * 0.6);
        if (abs(relX) < trunkW) {
          gl_FragColor = vec4(0.18, 0.11, 0.05, 1.0);
          return;
        }
        
        if (relY > 0.2 && relY < 0.9) {
          float leafW = 0.12 * (1.0 - abs(relY - 0.6) * 1.5);
          if (abs(relX) < leafW) {
            float noise = sin(relX * 20.0 + relY * 15.0) * 0.5 + 0.5;
            if (noise > 0.3) {
              gl_FragColor = vec4(0.22, 0.28, 0.12, noise * 0.7);
              return;
            }
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
