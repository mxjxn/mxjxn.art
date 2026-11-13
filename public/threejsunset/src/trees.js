// Foreground trees: individual tall trunks with organic leaves, widely spaced.
// Rooted on land just above the bike path.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

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
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Render ONLY in tree band: y 0.10 to 0.48
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        float cellPos = mod(wx, 0.50);
        
        // THREE fixed tree positions in each 0.50-unit cell
        float d1 = abs(cellPos - 0.08);
        float d2 = abs(cellPos - 0.20);
        float d3 = abs(cellPos - 0.35);
        float minDist = min(d1, min(d2, d3));
        
        // Render trees as opaque boxes where minDist is small
        if (minDist < 0.06) {
          gl_FragColor = vec4(0.4, 0.25, 0.1, 1.0);
        } else {
          discard;
        }
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 5;  // AFTER water (4) so trees are in front
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
