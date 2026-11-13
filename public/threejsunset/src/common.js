// Shared GLSL chunks + scene constants for the river ride.
// All shaders work in aspect-corrected coords: p = vec2(vUv.x * uAspect, vUv.y)
// so 1.0 == one screen height, horizontally AND vertically.

export const SCROLL = {
  farRidge: 0.04,
  midRidge: 0.10,
  farBank: 0.30,
  water: 0.55,
  ground: 1.0,
  fgReeds: 1.9,
};

// Horizon / composition lines (vUv.y units)
export const LINES = {
  bankTop: 0.14,   // near bank edge — the bike rides on this
  waterTop: 0.52,  // waterline
};

export const GLSL_COMMON = /* glsl */ `
  float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash21(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i),               hash21(i + vec2(1.0, 0.0)), u.x),
               mix(hash21(i + vec2(0.0,1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = r * p * 2.03; a *= 0.5; }
    return v;
  }
  float ridgeFbm(vec2 p){
    float v = 0.0, a = 0.55;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++){
      float n = vnoise(p);
      n = 1.0 - abs(n * 2.0 - 1.0);
      v += a * n * n;
      p = r * p * 2.11; a *= 0.5;
    }
    return v;
  }
  float sdSeg(vec2 p, vec2 a, vec2 b){
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }
`;

// Standard fullscreen-pass vertex shader shared by every layer.
export const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
