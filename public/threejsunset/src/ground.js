// Bike path band: the wide ground/dirt where the cyclist rides.
// Scrolls at base speed (1.0), provides a solid platform for the bike and trees rooted above it.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeGround(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.0 },  // base speed — world moves at this rate
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 EARTH = vec3(0.12, 0.08, 0.04);      // warm earth brown
      const vec3 DIRT = vec3(0.16, 0.11, 0.06);       // lighter path

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float wx = p.x + uScroll * uSpeed;

        // Ground band: y from 0.0 (bottom) to 0.12 (where trees start)
        if (p.y < 0.0 || p.y > 0.12) discard;

        // Textured earth: darker base + lighter streaks
        float noise = fbm(vec2(wx * 6.0, p.y * 20.0));
        float texture = smoothstep(0.2, 0.7, noise);
        vec3 col = mix(EARTH, DIRT, texture * 0.4);

        // Tire tracks / worn path effect
        float tracks = sin(wx * 8.0) * 0.5 + 0.5;
        col *= 0.92 + tracks * 0.08;

        // Slight darkening at top edge (where trees are rooted)
        col *= 0.85 + 0.15 * smoothstep(0.125, 0.105, p.y);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    transparent: false,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 1;  // behind trees, behind bike
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
