// Parallax silhouette bands: far ridge, mid ridge (with conifers), far bank (with reeds).
// One factory, three configs.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeBand(cfg, uTime, uScroll) {
  // cfg: { speed, base, amp, freq, seed, colorTop, colorBottom, treeAmp, treeFreq, order }
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: cfg.speed },
    uBase: { value: cfg.base },
    uAmp: { value: cfg.amp },
    uFreq: { value: cfg.freq },
    uSeed: { value: cfg.seed },
    uColorTop: { value: new THREE.Color().setHex(cfg.colorTop, THREE.NoColorSpace) },
    uColorBottom: { value: new THREE.Color().setHex(cfg.colorBottom, THREE.NoColorSpace) },
    uTreeAmp: { value: cfg.treeAmp },
    uTreeFreq: { value: cfg.treeFreq },
    uStripLow: { value: cfg.strip !== undefined ? cfg.strip : -10.0 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed, uBase, uAmp, uFreq, uSeed, uTreeAmp, uTreeFreq, uStripLow;
      uniform vec3 uColorTop, uColorBottom;
      ${GLSL_COMMON}

      // conifer / reed spikes on the crest
      float spikes(float x){
        float cells = x * uTreeFreq;
        float i = floor(cells), f = fract(cells);
        float rnd = hash11(i * 7.13 + uSeed);
        float present = step(0.30, rnd);
        float tri = 1.0 - abs(f - 0.5) * 2.0;
        tri = pow(max(tri, 0.0), 1.5);
        float h = 0.55 + 0.45 * hash11(i * 3.71 + uSeed * 2.0);
        return tri * h * present;
      }

      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float off = uScroll * uSpeed;
        float wx = p.x + off;

        float h = uBase + uAmp * ridgeFbm(vec2(wx * uFreq, uSeed));
        h += uTreeAmp * spikes(wx);

        float alpha = smoothstep(h + 0.0015, h - 0.0015, p.y);
        // optional strip mode: confine the band to a horizontal slice (marsh strips)
        alpha *= smoothstep(uStripLow, uStripLow + 0.005, p.y);
        if (alpha <= 0.0) discard;

        // depth shading: crest catches warm haze, body sinks into the layer color
        float depth = smoothstep(h, h - 0.09, p.y);
        vec3 col = mix(uColorTop, uColorBottom, depth);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = cfg.order;
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
