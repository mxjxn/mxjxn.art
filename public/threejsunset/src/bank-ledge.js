// Bank ledge: the land where the bike path and trees are rooted.
// Sits between the river and trees, scrolls at mid-speed (parallax depth).
// Simple textured strip at the base of the river.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

// CACHE BUST 2026-11-13 v2
export function makeBankLedge(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 0.75 },  // mid-speed parallax (faster than world=1.0, slower than trees)
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 EARTH = vec3(0.16, 0.12, 0.08);    // dark earth/soil brown
      const vec3 GRASS = vec3(0.20, 0.18, 0.10);    // muted grass-gold

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Bank ledge only renders in the narrow strip just above water
        // (approximately y: 0.48-0.52 in UV space where river lives)
        if (p.y < 0.475 || p.y > 0.535) discard;
        
        float wx = p.x + uScroll * uSpeed;
        
        // Simple organic texture: noise-based grass tufts
        float noise = fbm(vec2(wx * 8.0, p.y * 20.0));
        float tex = smoothstep(0.3, 0.7, noise);
        
        // Blend earth and grass
        vec3 col = mix(EARTH, GRASS, tex * 0.6);
        
        // Slight darkening at edges for depth
        col *= 1.0 - 0.1 * abs(p.y - 0.505) / 0.03;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    transparent: false,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 4.5;  // after river (4), before trees (5)
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
