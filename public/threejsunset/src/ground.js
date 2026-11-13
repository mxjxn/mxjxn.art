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

      const vec3 EARTH = vec3(0.12, 0.08, 0.04);
      const vec3 DIRT  = vec3(0.16, 0.11, 0.06);
      const vec3 GRASS = vec3(0.13, 0.17, 0.05);  // dark grass at crest

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float wx = p.x + uScroll * uSpeed;

        // Rolling horizon: gentle hills, same ridgeFbm as the distant bands
        float horizon = 0.10 + 0.028 * ridgeFbm(vec2(wx * 1.4, 1.7));

        // Fill everything below the horizon
        if (p.y > horizon) discard;

        // Textured earth
        float noise = fbm(vec2(wx * 6.0, p.y * 20.0));
        float tex = smoothstep(0.2, 0.7, noise);
        vec3 col = mix(EARTH, DIRT, tex * 0.4);

        // Grass tint near the crest
        float crest = smoothstep(horizon - 0.012, horizon, p.y);
        col = mix(col, GRASS, crest * 0.7);

        // Darken at very bottom
        col *= 0.80 + 0.20 * smoothstep(0.0, 0.06, p.y);

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
