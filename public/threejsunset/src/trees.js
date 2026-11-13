// The river: warm horizon reflection, dark near water, hill silhouettes mirrored,
// a shimmering sun-glitter column, drifting streaks and twinkles.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON, LINES } from './common.js';

export function makeTrees(uTime, uScroll, sunX) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSunX: { value: sunX },           // aspect-corrected x of the sun
    uTop: { value: LINES.waterTop },
    uBottom: { value: LINES.bankTop },
    uRidgeSpeed: { value: 0.10 },     // mid-ridge speed, for its reflection
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSunX, uTop, uBottom, uRidgeSpeed;
      ${GLSL_COMMON}

      // must mirror hills.js mid-ridge height field
      float ridgeH(float x){
        float v = 0.0, a = 0.55;
        mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
        vec2 q = vec2(x * 4.0, 2.7);
        for (int i = 0; i < 4; i++){
          float n = vnoise(q);
          n = 1.0 - abs(n * 2.0 - 1.0);
          v += a * n * n;
          q = r * q * 2.11; a *= 0.5;
        }
        return 0.545 + 0.030 * v;
      }

      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float wy = (p.y - uBottom) / (uTop - uBottom);  // 0 near viewer, 1 at waterline

        // base: deep plum-teal near, molten amber at the waterline
        vec3 col = mix(vec3(0.15, 0.05, 0.20), vec3(1.00, 0.52, 0.24), pow(wy, 1.6) * 0.9);
        col = mix(col, vec3(0.30, 0.10, 0.26), smoothstep(0.55, 1.0, wy) * 0.4);

        // wobble distortion (stronger up close)
        float wob = 0.012 * (1.0 - wy * 0.7);
        float sx = p.x + wob * sin(p.y * 70.0 + uTime * 1.7) + wob * sin(p.y * 23.0 - uTime * 0.9);

        // mirrored ridge silhouettes (far band only)
        float rx = sx + uScroll * uRidgeSpeed;
        float rh = ridgeH(rx);
        float mirrorY = uTop + (uTop - p.y);
        float refl = smoothstep(mirrorY + 0.012, mirrorY - 0.012, rh); // 1 where ridge reflects
        col = mix(col, vec3(0.22, 0.07, 0.22), refl * smoothstep(0.75, 0.95, wy) * 0.65);

        // broad warm wash below the sun
        float sunWash = exp(-abs(sx - uSunX) * 2.2) * smoothstep(0.35, 1.0, wy);
        col += vec3(0.9, 0.35, 0.10) * sunWash * 0.35;

        // sun glitter column: widens toward viewer
        float gw = 0.030 + 0.13 * (1.0 - wy);
        float gx = abs(sx - uSunX);
        float column = smoothstep(gw, gw * 0.15, gx);

        float stripes = vnoise(vec2(sx * (30.0 + 60.0 * (1.0 - wy)), wy * 9.0 - uTime * 0.55));
        stripes = stripes * stripes * 1.5;
        col += vec3(1.00, 0.62, 0.28) * column * (0.30 + stripes * 0.75) * smoothstep(0.12, 0.65, wy);

        // sparse hard twinkles
        vec2 cell = floor(vec2(sx * 150.0, wy * 55.0));
        float tw = hash21(cell + floor(uTime * 2.5) * vec2(0.113, 1.71));
        float twinkle = step(0.985, tw) * (0.5 + 0.5 * sin(uTime * 12.0 + tw * 40.0));
        col += vec3(1.0, 0.85, 0.55) * twinkle * column * 0.8;

        // drifting surface streaks everywhere
        float streak = fbm(vec2(p.x * 5.0 + uScroll * uRidgeSpeed * 2.0, p.y * 26.0 - uTime * 0.30));
        col = mix(col, col * 1.3 + vec3(0.20, 0.05, 0.02), streak * 0.30);

        // dark edge at the waterline
        col *= 1.0 - smoothstep(uTop - 0.012, uTop, p.y) * 0.25;

        float alpha = smoothstep(uBottom - 0.002, uBottom + 0.002, p.y) *
                      smoothstep(uTop + 0.002, uTop - 0.002, p.y);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 4;  // behind trees (5), after ground/bike
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
