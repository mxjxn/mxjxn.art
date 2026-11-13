// Foreground trees: procedurally generated trunks with branches and organic leaf clouds.
import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_COMMON } from './common.js';

export function makeTrees(uTime, uScroll) {
  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 2.2 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect, uSpeed;
      ${GLSL_COMMON}

      const vec3 TRUNK_COLOR = vec3(0.18, 0.11, 0.05);
      const vec3 LEAF_COLOR = vec3(0.22, 0.28, 0.12);

      // Draw trunk with taper and branches
      float drawTrunk(vec2 p, float trunkX, float seed) {
        const float BASE_Y = 0.12;
        const float TOP_Y = 0.45;
        
        float relY = (p.y - BASE_Y) / (TOP_Y - BASE_Y);
        if (relY < 0.0 || relY > 1.0) return 0.0;
        
        float relX = p.x - trunkX;
        
        // Tapered trunk: wider at base, narrower at top
        float baseWidth = 0.010;
        float taperingWidth = baseWidth * (1.0 - relY * 0.6);
        
        // Wobble using sine waves
        float wobble = sin(relY * 6.28 + seed * 10.0) * 0.002;
        taperingWidth += wobble;
        
        // Main trunk
        float dist = abs(relX);
        if (dist < taperingWidth) {
          return 1.0 - (dist / taperingWidth) * 0.3;
        }
        
        // Branches at 30%, 60%, 90%
        for (float i = 0.3; i < 1.0; i += 0.3) {
          float branchY = i;
          float distY = abs(relY - branchY);
          if (distY < 0.06) {
            float angle = sin(i * 3.14159 + seed) * 0.12;
            float len = (1.0 - i) * 0.08;
            float branchX = len * angle;
            float distX = abs(relX - branchX);
            float branchW = 0.003 * (1.0 - distY / 0.06);
            if (distX < branchW) {
              return 0.6;
            }
          }
        }
        
        return 0.0;
      }

      // Draw leaf cloud
      float drawLeaves(vec2 p, float trunkX, float seed) {
        const float BASE_Y = 0.12;
        const float TOP_Y = 0.45;
        
        float relY = (p.y - BASE_Y) / (TOP_Y - BASE_Y);
        if (relY < 0.2 || relY > 0.95) return 0.0;
        
        float relX = p.x - trunkX;
        
        // Canopy centered around 0.6 of trunk height
        float centerY = 0.60;
        float distY = abs(relY - centerY);
        if (distY > 0.30) return 0.0;
        
        // Canopy width tapers
        float canopyW = 0.12 * (1.0 - distY * 1.5);
        if (abs(relX) > canopyW) return 0.0;
        
        // Simple noise-like pattern using sine waves
        float noise = sin(relX * 20.0 + relY * 15.0 + seed * 100.0);
        float leaves = smoothstep(-0.3, 0.5, noise);
        leaves *= smoothstep(canopyW, 0.0, abs(relX));
        leaves *= smoothstep(0.35, 0.0, distY);
        
        return leaves * 0.6;
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Render ONLY in tree band
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        float cellPos = mod(wx, 0.50);
        
        // Three tree positions per 0.50 cell
        vec3 col = vec3(0.0);
        float bestDist = 1e6;
        float treeSeed = 0.0;
        float treeX = 0.0;
        
        // Find closest tree
        float d1 = abs(cellPos - 0.08);
        if (d1 < 0.12 && d1 < bestDist) {
          bestDist = d1;
          treeX = wx - cellPos + 0.08;
          treeSeed = mod(floor(wx / 0.50) * 37.5, 1.0);
        }
        
        float d2 = abs(cellPos - 0.20);
        if (d2 < 0.12 && d2 < bestDist) {
          bestDist = d2;
          treeX = wx - cellPos + 0.20;
          treeSeed = mod(floor(wx / 0.50) * 73.1, 1.0);
        }
        
        float d3 = abs(cellPos - 0.35);
        if (d3 < 0.12 && d3 < bestDist) {
          bestDist = d3;
          treeX = wx - cellPos + 0.35;
          treeSeed = mod(floor(wx / 0.50) * 91.7, 1.0);
        }
        
        // Draw trunk
        float trunk = drawTrunk(p, treeX, treeSeed);
        if (trunk > 0.1) {
          col = TRUNK_COLOR * (0.6 + trunk * 0.4);
        } else {
          // Draw leaves
          float leaves = drawLeaves(p, treeX, treeSeed);
          if (leaves > 0.05) {
            col = LEAF_COLOR * leaves;
          }
        }
        
        if (length(col) < 0.01) discard;
        gl_FragColor = vec4(col, 1.0);
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
