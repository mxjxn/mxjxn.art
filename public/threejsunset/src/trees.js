// Foreground trees: scrolling tapered trunks with leaves.
import * as THREE from 'three';
import { FULLSCREEN_VERT } from './common.js';

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
    fragmentShader: `
      varying vec2 vUv;
      uniform float uAspect, uScroll, uSpeed;

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        // Scrolling world position
        float wx = p.x + uScroll * uSpeed;
        
        // Three trees per 0.50 unit cell
        float cellPos = mod(wx, 0.50);
        float d1 = abs(cellPos - 0.08);
        float d2 = abs(cellPos - 0.20);
        float d3 = abs(cellPos - 0.35);
        float minDist = min(d1, min(d2, d3));
        
        if (minDist > 0.12) discard;
        
        // Which tree?
        float treeX;
        if (d1 < d2 && d1 < d3) treeX = wx - cellPos + 0.08;
        else if (d2 < d3) treeX = wx - cellPos + 0.20;
        else treeX = wx - cellPos + 0.35;
        
        float relX = p.x - treeX;
        float relY = (p.y - 0.12) / 0.33;
        
        // Draw leaves FIRST (so trunk draws over them)
        if (relY > 0.1 && relY < 0.95) {
          float leafW = 0.15 * (1.0 - abs(relY - 0.55) * 1.1);
          if (abs(relX) < leafW) {
            // Add slight variation
            float leafNoise = sin(relX * 30.0 + relY * 20.0 + treeX * 100.0) * 0.5 + 0.5;
            if (leafNoise > 0.25) {
              gl_FragColor = vec4(0.22, 0.28, 0.12, leafNoise * 0.65);
              return;
            }
          }
        }
        
        // Draw trunk (draws on top of leaves)
        float trunkW = 0.012 * (1.0 - relY * 0.5);
        if (abs(relX) < trunkW) {
          gl_FragColor = vec4(0.18, 0.11, 0.05, 1.0);
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
