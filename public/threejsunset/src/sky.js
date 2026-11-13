// Sky: sunset gradient, sun disc + glow, drifting underlit cloud bands, distant birds.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeSky(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSun: { value: new THREE.Vector2(0.62, 0.635) }, // aspect-corrected coords
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uScroll;
      uniform float uAspect;
      uniform vec2 uSun;
      ${GLSL_COMMON}

      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float y = vUv.y;
        vec2 sun = uSun;
        float d = distance(p, sun);

        // ---- gradient ----
        vec3 col = mix(vec3(1.00, 0.40, 0.14), vec3(0.98, 0.66, 0.30), smoothstep(0.50, 0.68, y));
        col = mix(col, vec3(0.60, 0.16, 0.44), smoothstep(0.64, 0.84, y));
        col = mix(col, vec3(0.12, 0.04, 0.26), smoothstep(0.82, 1.02, y));

        // ---- sun glow (broad + tight) ----
        col += vec3(1.00, 0.50, 0.20) * exp(-d * 3.0) * 0.55;
        col += vec3(1.00, 0.72, 0.38) * exp(-d * 8.5) * 0.65;

        // ---- sun disc, slightly flattened by atmosphere ----
        float sunR = 0.055;
        float disc = smoothstep(sunR + 0.004, sunR - 0.004, d);
        vec3 sunCol = mix(vec3(1.00, 0.88, 0.62), vec3(1.00, 0.36, 0.10), smoothstep(0.0, sunR, d));
        col = mix(col, sunCol, disc);

        // ---- cloud bands (two depths, slow drift, underlit near the sun) ----
        for (int k = 0; k < 2; k++){
          float fk = float(k);
          float sp = mix(0.020, 0.045, fk);
          float cf = mix(3.2, 6.5, fk);
          float band = fbm(vec2(p.x * cf + uTime * sp + uScroll * mix(0.02, 0.05, fk) + fk * 7.3,
                                p.y * mix(11.0, 18.0, fk) + fk * 3.1));
          float zone = smoothstep(0.60 + 0.06 * fk, 0.70 + 0.06 * fk, y) *
                       smoothstep(0.92, 0.78 + 0.05 * fk, y);
          float cl = smoothstep(0.52, 0.72, band) * zone;
          vec3 cloudDark = mix(vec3(0.34, 0.10, 0.30), vec3(0.16, 0.06, 0.24), fk);
          vec3 underlit = vec3(1.00, 0.45, 0.22) * exp(-d * 2.2);
          col = mix(col, cloudDark + underlit * 0.9, cl * 0.6);
        }

        // ---- birds: three tiny flapping silhouettes drifting left ----
        vec3 birdCol = vec3(0.20, 0.06, 0.16);
        for (int i = 0; i < 3; i++){
          float fi = float(i);
          float bp = fract(uTime * (0.012 + 0.005 * fi) + fi * 0.41);
          float bx = (1.0 - bp) * uAspect * 1.3 - 0.15;
          float by = 0.80 + 0.045 * sin(fi * 2.7 + 1.3) + 0.008 * sin(uTime * (0.7 + fi * 0.3) + fi);
          vec2 c = vec2(bx, by);
          float flap = sin(uTime * 7.0 + fi * 2.2);
          float w = 0.0085;
          vec2 a1 = c + vec2(-w, flap * w * 0.85);
          vec2 b1 = c + vec2( w, flap * w * 0.85);
          float bd = min(sdSeg(p, c, a1), sdSeg(p, c, b1));
          float shape = smoothstep(0.0028, 0.0012, bd);
          col = mix(col, birdCol, shape * 0.85);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 0;
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
