// Foreground trees: static tapered trunks with simple leaves.
import * as THREE from 'three';
import { FULLSCREEN_VERT } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uAspect;

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        // Static trees: no scrolling, just fixed positions on screen
        // Tree 1 at x = -0.3
        float d1 = abs(p.x - (-0.3));
        // Tree 2 at x = 0.0
        float d2 = abs(p.x - 0.0);
        // Tree 3 at x = 0.3
        float d3 = abs(p.x - 0.3);
        
        float minDist = min(d1, min(d2, d3));
        if (minDist > 0.15) discard;
        
        // Find nearest tree
        float treeX;
        if (d1 < d2 && d1 < d3) treeX = -0.3;
        else if (d2 < d3) treeX = 0.0;
        else treeX = 0.3;
        
        float relX = p.x - treeX;
        float relY = (p.y - 0.12) / 0.33;
        
        // Tapered trunk
        float trunkW = 0.025 * (1.0 - relY * 0.6);
        if (abs(relX) < trunkW) {
          gl_FragColor = vec4(0.18, 0.11, 0.05, 1.0);
          return;
        }
        
        // Simple leaves: just solid blob
        if (relY > 0.2 && relY < 0.9) {
          float leafW = 0.15 * (1.0 - abs(relY - 0.6) * 1.2);
          if (abs(relX) < leafW * 0.7) {
            gl_FragColor = vec4(0.22, 0.28, 0.12, 0.6);
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
