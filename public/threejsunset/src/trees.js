// DEBUG: solid tree band to verify mesh is rendering
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

      void main() {
        // Just render a solid band at y 0.10-0.48 with NO discard
        if (vUv.y < 0.10 || vUv.y > 0.48) discard;
        gl_FragColor = vec4(0.5, 0.3, 0.1, 0.8);  // solid brown with alpha
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
