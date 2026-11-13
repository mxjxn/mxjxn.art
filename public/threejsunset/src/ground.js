// Near bank: the dark ground strip the bike rides on, rim-lit by the sun,
// with sparse grass tufts scrolling at base speed.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON, LINES } from './common.js';

export function makeGround(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.0 },
    uTop: { value: LINES.bankTop },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed, uTop;
      ${GLSL_COMMON}

      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float wx = p.x + uScroll * uSpeed;

        // almost-flat edge with a whisper of fbm
        float h = uTop + (fbm(vec2(wx * 9.0, 3.7)) - 0.5) * 0.006;

        float inside = smoothstep(h + 0.0015, h - 0.0015, p.y);
        if (inside <= 0.0) discard;

        vec3 col = vec3(0.085, 0.032, 0.095);

        // sunlit rim along the very edge
        float rim = smoothstep(h - 0.010, h, p.y);
        col += vec3(1.00, 0.42, 0.16) * rim * 0.55;

        // grass tufts on the edge, base scroll speed
        float cells = wx * 46.0;
        float i = floor(cells), f = fract(cells);
        float rnd = hash11(i * 5.31);
        if (rnd > 0.62 && f > 0.25 && f < 0.75){
          float tri = 1.0 - abs(f - 0.5) * 4.0; // 0 at .25/.75, 1 at .5
          float hh = 0.006 + 0.010 * hash11(i * 9.17);
          float base = h + 0.001;
          float blade = smoothstep(0.0, 0.004, tri * hh - max(p.y - base, 0.0));
          // sway
          col = mix(col, vec3(0.14, 0.05, 0.13) + vec3(0.5, 0.2, 0.05) * rim, blade * 0.9);
        }

        gl_FragColor = vec4(col, inside);
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
