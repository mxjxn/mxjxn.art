// DEBUG: use wx to offset a repeating pattern — should scroll
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
      uniform float uScroll, uAspect, uSpeed;

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        // World x coordinate
        float wx = p.x + uScroll * uSpeed;
        
        // Simple repeating pattern every 0.50 units
        float pattern = mod(wx * 2.0, 1.0);  // 0-1 repeats every 0.50 units
        
        // Should see vertical stripes that scroll left-to-right
        gl_FragColor = vec4(pattern, 0.3, 0.1, 0.8);
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
