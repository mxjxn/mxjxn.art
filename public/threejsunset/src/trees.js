// DEBUG: visualize uScroll value in real-time
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
      uniform float uScroll;

      void main() {
        if (vUv.y < 0.10 || vUv.y > 0.48) discard;
        
        // Color based on uScroll value: should change over time
        // uScroll goes from 0 upward
        // Map it cyclically: mod(uScroll * 3.0, 1.0) gives repeating color
        float cycle = mod(uScroll * 3.0, 1.0);
        
        gl_FragColor = vec4(cycle, 0.3, 0.1, 0.8);  // R channel = scroll cycle
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
