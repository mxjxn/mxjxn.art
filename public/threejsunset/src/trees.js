// Foreground trees: fractal branching + leaf clusters, world-space SDF
// Tests 3 adjacent cells so overlapping trees don't clip each other
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime:   { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed:  { value: 1.0 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 BARK  = vec3(0.13, 0.08, 0.03);
      const vec3 LEAF0 = vec3(0.12, 0.19, 0.06);
      const vec3 LEAF1 = vec3(0.18, 0.27, 0.09);
      const vec3 LEAF2 = vec3(0.24, 0.34, 0.12);

      float cap(vec2 p, vec2 a, vec2 b, float ra, float rb) {
        vec2 ba = b - a;
        float t = clamp(dot(p - a, ba) / dot(ba, ba), 0.0, 1.0);
        return length(p - a - ba * t) - mix(ra, rb, t);
      }

      // Test one cell's tree against world-space pixel pw.
      // Returns vec4(color, alpha) where alpha=0 means no hit.
      vec4 testTree(vec2 pw, float cellIdx, float period) {
        float h0 = hash11(cellIdx * 3.173 + 0.11);
        float h1 = hash11(cellIdx * 7.531 + 0.22);
        float h2 = hash11(cellIdx * 5.917 + 0.33);
        float h3 = hash11(cellIdx * 2.431 + 0.44);
        float h4 = hash11(cellIdx * 9.113 + 0.55);
        float h5 = hash11(cellIdx * 4.667 + 0.66);
        float h6 = hash11(cellIdx * 6.283 + 0.77);
        float h7 = hash11(cellIdx * 1.618 + 0.88);
        float h8 = hash11(cellIdx * 8.421 + 0.99);
        float h9 = hash11(cellIdx * 2.718 + 0.05);

        if (h0 < 0.08) return vec4(0.0);  // empty cell

        float treeX = cellIdx * period + period * (0.15 + h1 * 0.70);
        float rootY = 0.12;
        float treeH = 0.28 + h2 * 0.22;
        float topY  = rootY + treeH;

        // Coarse cull
        if (abs(pw.x - treeX) > 0.30 || pw.y < rootY || pw.y > topY + 0.06)
          return vec4(0.0);

        float lean = (h3 - 0.5) * 0.06;
        vec2 tb = vec2(treeX,                rootY);
        vec2 tt = vec2(treeX + lean * treeH, topY );
        float trW0 = 0.011 + h0 * 0.004;
        float trW1 = 0.002;

        float s1 = h7 > 0.5 ? 1.0 : -1.0;
        float s2 = -s1;

        // Branches
        float b1t = 0.28 + h4 * 0.10;
        vec2  b1base = mix(tb, tt, b1t);
        float b1ang  = 0.55 + h5 * 0.25;
        float b1len  = treeH * (0.28 + h6 * 0.10);
        vec2  b1tip  = b1base + vec2(s1 * sin(b1ang) * b1len, cos(b1ang) * b1len);
        float b1W    = trW0 * 0.55;

        float b2t = 0.50 + h5 * 0.08;
        vec2  b2base = mix(tb, tt, b2t);
        float b2ang  = 0.50 + h8 * 0.22;
        float b2len  = treeH * (0.22 + h9 * 0.10);
        vec2  b2tip  = b2base + vec2(s2 * sin(b2ang) * b2len, cos(b2ang) * b2len);
        float b2W    = trW0 * 0.45;

        float b3t = 0.70 + h6 * 0.10;
        vec2  b3base = mix(tb, tt, b3t);
        float b3ang  = 0.48 + h3 * 0.22;
        float b3len  = treeH * (0.17 + h7 * 0.08);
        vec2  b3tip  = b3base + vec2(s1 * sin(b3ang) * b3len, cos(b3ang) * b3len);
        float b3W    = trW0 * 0.35;

        float sbScale = 0.45;
        vec2 sb1a = b1tip + vec2(s1 * sin(b1ang - 0.50) * b1len * sbScale, cos(b1ang - 0.50) * b1len * sbScale);
        vec2 sb1b = b1tip + vec2(s1 * sin(b1ang + 0.40) * b1len * sbScale * 0.8, cos(b1ang + 0.40) * b1len * sbScale * 0.8);
        vec2 sb2a = b2tip + vec2(s2 * sin(b2ang - 0.45) * b2len * sbScale, cos(b2ang - 0.45) * b2len * sbScale);
        vec2 sb2b = b2tip + vec2(s2 * sin(b2ang + 0.38) * b2len * sbScale * 0.8, cos(b2ang + 0.38) * b2len * sbScale * 0.8);
        vec2 sb3a = b3tip + vec2(s1 * sin(b3ang - 0.42) * b3len * sbScale, cos(b3ang - 0.42) * b3len * sbScale);
        vec2 sb3b = b3tip + vec2(s1 * sin(b3ang + 0.35) * b3len * sbScale * 0.8, cos(b3ang + 0.35) * b3len * sbScale * 0.8);
        float sbW = b1W * 0.45;

        // Bark tests
        if (cap(pw, tb,     tt,     trW0,        trW1  ) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b1base, b1tip,  b1W,         0.001 ) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b2base, b2tip,  b2W,         0.001 ) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b3base, b3tip,  b3W,         0.001 ) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b1tip,  sb1a,   sbW,         0.0005) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b1tip,  sb1b,   sbW,         0.0005) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b2tip,  sb2a,   sbW * 0.8,   0.0005) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b2tip,  sb2b,   sbW * 0.8,   0.0005) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b3tip,  sb3a,   sbW * 0.65,  0.0005) < 0.0) return vec4(BARK, 1.0);
        if (cap(pw, b3tip,  sb3b,   sbW * 0.65,  0.0005) < 0.0) return vec4(BARK, 1.0);

        // Leaf ellipses
        #define LF(cx,cy,rx,ry,col) { vec2 _d=(pw-vec2(cx,cy))/vec2(rx,ry); if(dot(_d,_d)<1.0) return vec4(col,0.92); }
        LF(sb1a.x, sb1a.y+0.012, 0.022+h0*0.012, 0.030+h1*0.015, LEAF2)
        LF(sb1b.x, sb1b.y+0.010, 0.020+h2*0.010, 0.027+h3*0.013, LEAF1)
        LF(sb2a.x, sb2a.y+0.012, 0.022+h4*0.012, 0.030+h5*0.015, LEAF2)
        LF(sb2b.x, sb2b.y+0.010, 0.019+h6*0.010, 0.026+h7*0.013, LEAF1)
        LF(sb3a.x, sb3a.y+0.010, 0.019+h8*0.010, 0.025+h9*0.012, LEAF2)
        LF(sb3b.x, sb3b.y+0.008, 0.017+h0*0.009, 0.023+h1*0.011, LEAF1)
        LF(b1tip.x+s1*0.008*h2, b1tip.y+0.018, 0.038+h3*0.018, 0.048+h4*0.022, LEAF1)
        LF(b1tip.x-s1*0.010*h5, b1tip.y+0.010, 0.030+h6*0.014, 0.040+h7*0.018, LEAF0)
        LF(b2tip.x+s2*0.009*h8, b2tip.y+0.016, 0.035+h9*0.016, 0.045+h0*0.020, LEAF1)
        LF(b2tip.x-s2*0.011*h1, b2tip.y+0.008, 0.028+h2*0.013, 0.038+h3*0.016, LEAF0)
        LF(b3tip.x+s1*0.007*h4, b3tip.y+0.014, 0.030+h5*0.014, 0.040+h6*0.018, LEAF1)
        LF(b3tip.x,              tt.y   +0.012, 0.025+h7*0.012, 0.035+h8*0.016, LEAF2)
        LF(treeX+s1*(0.04+h9*0.03), rootY+treeH*0.72, 0.055+h0*0.025, 0.070+h1*0.030, LEAF0)
        LF(treeX+s2*(0.03+h2*0.03), rootY+treeH*0.60, 0.050+h3*0.022, 0.065+h4*0.028, LEAF0)
        LF(treeX+(h5-0.5)*0.04,     rootY+treeH*0.82, 0.040+h6*0.018, 0.055+h7*0.025, LEAF0)

        return vec4(0.0);  // miss
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        if (p.y < 0.11 || p.y > 0.70) discard;

        float wx     = p.x + uScroll * uSpeed;
        vec2  pw     = vec2(wx, p.y);
        float period = 0.35;
        float cell   = floor(wx / period);

        // Test current cell and both neighbours — composited back-to-front
        vec4 col = vec4(0.0);
        vec4 c;

        // Back cell first (lower z-order)
        c = testTree(pw, cell - 1.0, period);
        if (c.a > 0.0 && col.a < 1.0) col = c;

        c = testTree(pw, cell + 1.0, period);
        if (c.a > 0.0 && col.a < 1.0) col = mix(col, c, c.a);

        // Current cell on top
        c = testTree(pw, cell, period);
        if (c.a > 0.0) col = mix(col, c, c.a);

        if (col.a < 0.01) discard;
        gl_FragColor = col;
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
