// Foreground trees: fractal branching + leaf clusters, world-space SDF
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
      const vec3 LEAF0 = vec3(0.12, 0.19, 0.06);  // dark back leaves
      const vec3 LEAF1 = vec3(0.18, 0.27, 0.09);  // mid leaves
      const vec3 LEAF2 = vec3(0.24, 0.34, 0.12);  // bright front leaves

      // Tapered capsule SDF — negative = inside
      float cap(vec2 p, vec2 a, vec2 b, float ra, float rb) {
        vec2 ba = b - a;
        float t = clamp(dot(p - a, ba) / dot(ba, ba), 0.0, 1.0);
        return length(p - a - ba * t) - mix(ra, rb, t);
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        if (p.y < 0.11 || p.y > 0.70) discard;

        float wx  = p.x + uScroll * uSpeed;
        vec2  pw  = vec2(wx, p.y);  // world-space pixel — used for ALL geometry tests

        float period  = 0.35;
        float cellIdx = floor(wx / period);
        float cellX   = mod(wx, period);

        // Per-tree hashes seeded ONLY by cellIdx — stable as tree scrolls by
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

        if (h0 < 0.08) discard;  // skip ~8% of cells

        // Tree root — world x
        float treeX = cellIdx * period + period * (0.15 + h1 * 0.70);
        float rootY = 0.12;
        float treeH = 0.28 + h2 * 0.22;  // height 0.28..0.50
        float topY  = rootY + treeH;

        // Coarse cull using world x — generous to avoid edge clipping
        if (abs(wx - treeX) > 0.30 || p.y > topY + 0.06) discard;

        // Trunk geometry in world space
        float lean = (h3 - 0.5) * 0.06;
        vec2 tb = vec2(treeX,                   rootY);
        vec2 tt = vec2(treeX + lean * treeH,    topY );
        float trW0 = 0.011 + h0 * 0.004;
        float trW1 = 0.002;

        // Branch side alternation
        float s1 = h7 > 0.5 ? 1.0 : -1.0;
        float s2 = -s1;

        // --- Helpers: branch base = point along trunk at fraction t ---
        // branchBase(t) = mix(tb, tt, t)
        // branchTip = base + (side*sin(angle)*len, cos(angle)*len)

        // Branch 1: lower
        float b1t = 0.28 + h4 * 0.10;
        vec2  b1base = mix(tb, tt, b1t);
        float b1ang  = 0.55 + h5 * 0.25;
        float b1len  = treeH * (0.28 + h6 * 0.10);
        vec2  b1tip  = b1base + vec2(s1 * sin(b1ang) * b1len, cos(b1ang) * b1len);
        float b1W    = trW0 * 0.55;

        // Branch 2: mid
        float b2t = 0.50 + h5 * 0.08;
        vec2  b2base = mix(tb, tt, b2t);
        float b2ang  = 0.50 + h8 * 0.22;
        float b2len  = treeH * (0.22 + h9 * 0.10);
        vec2  b2tip  = b2base + vec2(s2 * sin(b2ang) * b2len, cos(b2ang) * b2len);
        float b2W    = trW0 * 0.45;

        // Branch 3: upper
        float b3t = 0.70 + h6 * 0.10;
        vec2  b3base = mix(tb, tt, b3t);
        float b3ang  = 0.48 + h3 * 0.22;
        float b3len  = treeH * (0.17 + h7 * 0.08);
        vec2  b3tip  = b3base + vec2(s1 * sin(b3ang) * b3len, cos(b3ang) * b3len);
        float b3W    = trW0 * 0.35;

        // Sub-branches (2 per main branch)
        float sbScale = 0.45;
        vec2 sb1a = b1tip + vec2(s1 * sin(b1ang - 0.50) * b1len * sbScale, cos(b1ang - 0.50) * b1len * sbScale);
        vec2 sb1b = b1tip + vec2(s1 * sin(b1ang + 0.40) * b1len * sbScale * 0.8, cos(b1ang + 0.40) * b1len * sbScale * 0.8);
        vec2 sb2a = b2tip + vec2(s2 * sin(b2ang - 0.45) * b2len * sbScale, cos(b2ang - 0.45) * b2len * sbScale);
        vec2 sb2b = b2tip + vec2(s2 * sin(b2ang + 0.38) * b2len * sbScale * 0.8, cos(b2ang + 0.38) * b2len * sbScale * 0.8);
        vec2 sb3a = b3tip + vec2(s1 * sin(b3ang - 0.42) * b3len * sbScale, cos(b3ang - 0.42) * b3len * sbScale);
        vec2 sb3b = b3tip + vec2(s1 * sin(b3ang + 0.35) * b3len * sbScale * 0.8, cos(b3ang + 0.35) * b3len * sbScale * 0.8);

        float sbW = b1W * 0.45;

        // --- Draw bark (trunk + branches) ---
        if (cap(pw, tb,    tt,    trW0,       trW1      ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b1base, b1tip, b1W,       0.001     ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b2base, b2tip, b2W,       0.001     ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b3base, b3tip, b3W,       0.001     ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b1tip, sb1a,   sbW,       0.0005    ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b1tip, sb1b,   sbW,       0.0005    ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b2tip, sb2a,   sbW * 0.8, 0.0005    ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b2tip, sb2b,   sbW * 0.8, 0.0005    ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b3tip, sb3a,   sbW * 0.65, 0.0005   ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }
        if (cap(pw, b3tip, sb3b,   sbW * 0.65, 0.0005   ) < 0.0) { gl_FragColor = vec4(BARK, 1.0); return; }

        // --- Draw leaf clusters (ellipses at branch tips + canopy fill) ---
        // Test pixel against each ellipse. Defined in world space (wx, p.y).
        #define LEAF(cx, cy, rx, ry, col) { vec2 _d = (pw - vec2(cx, cy)) / vec2(rx, ry); if (dot(_d,_d) < 1.0) { gl_FragColor = vec4(col, 0.92); return; } }

        // Clusters at sub-branch tips (smallest)
        LEAF(sb1a.x, sb1a.y + 0.012, 0.022 + h0*0.012, 0.030 + h1*0.015, LEAF2)
        LEAF(sb1b.x, sb1b.y + 0.010, 0.020 + h2*0.010, 0.027 + h3*0.013, LEAF1)
        LEAF(sb2a.x, sb2a.y + 0.012, 0.022 + h4*0.012, 0.030 + h5*0.015, LEAF2)
        LEAF(sb2b.x, sb2b.y + 0.010, 0.019 + h6*0.010, 0.026 + h7*0.013, LEAF1)
        LEAF(sb3a.x, sb3a.y + 0.010, 0.019 + h8*0.010, 0.025 + h9*0.012, LEAF2)
        LEAF(sb3b.x, sb3b.y + 0.008, 0.017 + h0*0.009, 0.023 + h1*0.011, LEAF1)

        // Clusters at main branch tips (medium)
        LEAF(b1tip.x + s1*0.008*h2, b1tip.y + 0.018, 0.038 + h3*0.018, 0.048 + h4*0.022, LEAF1)
        LEAF(b1tip.x - s1*0.010*h5, b1tip.y + 0.010, 0.030 + h6*0.014, 0.040 + h7*0.018, LEAF0)
        LEAF(b2tip.x + s2*0.009*h8, b2tip.y + 0.016, 0.035 + h9*0.016, 0.045 + h0*0.020, LEAF1)
        LEAF(b2tip.x - s2*0.011*h1, b2tip.y + 0.008, 0.028 + h2*0.013, 0.038 + h3*0.016, LEAF0)
        LEAF(b3tip.x + s1*0.007*h4, b3tip.y + 0.014, 0.030 + h5*0.014, 0.040 + h6*0.018, LEAF1)
        LEAF(b3tip.x,                tt.y    + 0.012, 0.025 + h7*0.012, 0.035 + h8*0.016, LEAF2)

        // Large canopy fill blobs (back layer, biggest)
        LEAF(treeX + s1*(0.04 + h9*0.03), rootY + treeH*0.72, 0.055 + h0*0.025, 0.070 + h1*0.030, LEAF0)
        LEAF(treeX + s2*(0.03 + h2*0.03), rootY + treeH*0.60, 0.050 + h3*0.022, 0.065 + h4*0.028, LEAF0)
        LEAF(treeX + (h5-0.5)*0.04,       rootY + treeH*0.82, 0.040 + h6*0.018, 0.055 + h7*0.025, LEAF0)

        discard;
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
