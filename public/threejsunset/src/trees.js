// Foreground trees: individual tall trunks with organic leaves, widely spaced.
// Rooted on land just above the bike path, rendersscroll fast so they move close to camera.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 2.2 },  // fast parallax
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 TRUNK = vec3(0.18, 0.11, 0.05);
      const vec3 LEAF = vec3(0.22, 0.28, 0.12);

      float sdLine(vec2 p, float x, float y0, float y1) {
        float dx = abs(p.x - x);
        float dy = abs(p.y - clamp(p.y, y0, y1));
        return sqrt(dx * dx + dy * dy);
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Only render in foreground zone
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        
        // Tree placement: every 0.50 units, we have a 0.08-width tree
        // 0.50 period with 3 trees spaced at 0.08, 0.20, 0.35 within each period
        float cellPos = mod(wx, 0.50);
        
        // Distance to nearest tree trunk center
        float dist1 = abs(cellPos - 0.08);
        float dist2 = abs(cellPos - 0.20);
        float dist3 = abs(cellPos - 0.35);
        float minDist = min(dist1, min(dist2, dist3));
        
        // Only render where we're near a tree
        const float TREE_HALF_WIDTH = 0.06;
        if (minDist > TREE_HALF_WIDTH) discard;
        
        // Find which tree this pixel is closest to
        float trunkX;
        if (dist1 < dist2 && dist1 < dist3) trunkX = wx - cellPos + 0.08;
        else if (dist2 < dist3) trunkX = wx - cellPos + 0.20;
        else trunkX = wx - cellPos + 0.35;
        
        // Draw trunk
        const float TRUNK_W = 0.012;
        const float TRUNK_BASE = 0.12;
        const float TRUNK_TOP = 0.45;
        float trunkDist = sdLine(p, trunkX, TRUNK_BASE, TRUNK_TOP);
        float trunk = smoothstep(TRUNK_W, TRUNK_W * 0.15, trunkDist);
        
        if (trunk > 0.3) {
          gl_FragColor = vec4(TRUNK, 1.0);
          return;
        }
        
        // Draw leaves: fuzzy organic cloud around upper trunk
        vec2 leafCenter = vec2(trunkX, 0.34);
        vec2 leafOff = p - leafCenter;
        
        float heightFromBase = (p.y - TRUNK_BASE) / (TRUNK_TOP - TRUNK_BASE);
        float leafWidth = 0.12 * (1.0 - heightFromBase * 0.2);
        
        float lx = leafOff.x / leafWidth;
        float ly = (leafOff.y + 0.03) / 0.15;
        
        float noise = fbm(vec2(lx * 2.5, ly * 3.5 + trunkX * 7.0));
        float leafShape = smoothstep(-0.1, 0.3, noise)
                        * smoothstep(0.14, -0.14, abs(lx))
                        * smoothstep(0.08, -0.10, ly);
        
        if (leafShape > 0.1) {
          gl_FragColor = vec4(LEAF, leafShape * 0.6);
          return;
        }
        
        discard;
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.renderOrder = 5;  // AFTER water (4) so trees render in front
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}
