// Post pass: low-res scene target -> saturation boost, split-tone grade,
// 8x8 Bayer ordered dither + posterize at the PIXEL grid, grain, vignette.
// This is where the "dither to pixelization saturation" look comes from.
import * as THREE from 'three';

export const POST_FRAG_HEAD = /* glsl */ `
  float Bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  float Bayer4(vec2 a){ return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
  float Bayer8(vec2 a){ return Bayer4(0.5 * a) * 0.25 + Bayer4(a); }
  float grainHash(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`;

export function makePost() {
  const rt = new THREE.WebGLRenderTarget(2, 2, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
  rt.texture.generateMipmaps = false;

  const uniforms = {
    tDiffuse: { value: rt.texture },
    uRtRes: { value: new THREE.Vector2(2, 2) },
    uTime: { value: 0 },
    uLevels: { value: 10.0 },
    uSat: { value: 1.38 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uRtRes;
      uniform float uTime, uLevels, uSat;
      ${POST_FRAG_HEAD}

      void main(){
        // sample once per RT pixel (nearest upscale keeps blocks flat)
        // NOTE: all layer shaders write display-space values directly
        // (color literals + NoColorSpace uniforms), so no gamma here.
        vec3 c = texture2D(tDiffuse, vUv).rgb;

        // saturation crunch
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = clamp(mix(vec3(l), c, uSat), 0.0, 1.0);

        // split-tone: indigo shadows, amber highlights
        c += (1.0 - smoothstep(0.0, 0.50, l)) * vec3(0.018, 0.000, 0.055);
        c += smoothstep(0.55, 1.00, l) * vec3(0.045, 0.010, -0.018);

        // dither + posterize ON the pixel grid
        vec2 rtPix = floor(vUv * uRtRes);
        float b = Bayer8(rtPix);
        c = floor(clamp(c, 0.0, 1.0) * uLevels + b) / uLevels;

        // film grain (per rt pixel, animated)
        c += (grainHash(rtPix + fract(uTime * 0.7) * 371.0) - 0.5) * 0.014;

        // soft vignette (screen space)
        vec2 q = vUv - 0.5;
        c *= 1.0 - dot(q, q) * 0.5;

        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function setSize(aspect) {
    const target = aspect >= 1 ? 270 : 300;
    let w, h;
    if (aspect >= 1) { h = target; w = Math.round(target * aspect); }
    else { w = target; h = Math.round(target / aspect); }
    w += w % 2; h += h % 2;
    rt.setSize(w, h);
    uniforms.uRtRes.value.set(w, h);
    return { w, h };
  }

  return { rt, scene, cam, uniforms, setSize };
}
