// Foreground reeds: big dark cattail clusters sweeping past faster than the world,
// rooted below the near bank edge. Occasional full occlusion = depth.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeReeds(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.9 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 REED = vec3(0.045, 0.018, 0.055);

      // one tapered blade: root r, tip t, width w
      float blade(vec2 p, vec2 r, vec2 t, float w){
        float d = sdSeg(p, r, t);
        return smoothstep(w, w * 0.3, d);
      }

      float cluster(vec2 p, float wx){
        float cells = wx * 1.35;             // one cluster per ~0.74 screen-heights
        float i = floor(cells);
        float cx = (i + hash11(i * 13.7)) / 1.35;
        float rnd = hash11(i * 7.77);
        if (rnd < 0.45) return 0.0;          // gaps between clusters

        float m = 0.0;
        float rootY = 0.02;
        for (int k = 0; k < 4; k++){
          float fk = float(k);
          float bx = cx + (hash11(i * 3.1 + fk * 5.9) - 0.5) * 0.05;
          float H = 0.26 + hash11(i * 9.3 + fk * 2.7) * 0.16;
          float sway = 0.010 * sin(uTime * 1.1 + i * 2.3 + fk * 1.7) + 0.004 * sin(uTime * 2.7 + fk);
          float lean = (hash11(i * 4.4 + fk) - 0.5) * 0.05 + sway;
          vec2 root = vec2(bx, rootY);
          vec2 tip = vec2(bx + lean, rootY + H);

          float w = 0.0035 + 0.0015 * hash11(i + fk * 8.8);
          m = max(m, blade(p, root, tip, w));

          // cattail head on some blades
          if (hash11(i * 2.9 + fk * 11.3) > 0.55){
            vec2 hp = mix(root, tip, 0.86);
            float ell = length((p - hp) / vec2(1.0, 1.9));
            m = max(m, smoothstep(0.0085, 0.006, ell) * 0.9);
          }
        }
        return m;
      }

      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float wx = p.x + uScroll * uSpeed;

        // fade in from below so roots stay hidden behind the bank strip
        float m = cluster(p, wx) * smoothstep(0.0, 0.05, p.y);
        if (m <= 0.0) discard;

        gl_FragColor = vec4(REED, m);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 7;
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
