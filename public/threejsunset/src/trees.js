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

      // Generate a single tree at world position trunkX
      vec3 drawTree(vec2 p, float trunkX, float seed) {
        const float TRUNK_BASE = 0.12;
        const float TRUNK_HEIGHT = 0.33;
        const float TRUNK_TOP = TRUNK_BASE + TRUNK_HEIGHT;
        
        // Normalize position relative to trunk base
        float relY = (p.y - TRUNK_BASE) / TRUNK_HEIGHT;
        if (relY < 0.0 || relY > 1.0) return vec3(0.0);
        
        float relX = p.x - trunkX;
        
        // Trunk taper and noise: thinner as we go up
        float baseWidth = 0.010;
        float taperingWidth = baseWidth * (1.0 - relY * 0.6);
        
        // Add organic wobble to trunk edges
        float trunkNoise = fbm(vec3(trunkX * 7.0, relY * 4.0, seed * 13.0));
        taperingWidth *= (0.8 + trunkNoise * 0.3);
        
        // Draw main trunk
        float trunkDist = abs(relX);
        if (trunkDist < taperingWidth) {
          return mix(TRUNK_COLOR * 0.7, TRUNK_COLOR, trunkNoise);
        }
        
        // Branches: appear at 30%, 60%, 90% of trunk height
        float branchStrength = 0.0;
        for (float i = 0.3; i < 1.0; i += 0.3) {
          float branchY = i;
          float distToBranch = abs(relY - branchY);
          if (distToBranch < 0.08) {
            // Branch angle based on height
            float branchAngle = sin(i * 3.14159) * 0.15;
            float branchLen = (1.0 - i) * 0.12;
            float branchX = branchLen * branchAngle;
            float distAlongBranch = abs(relX - branchX);
            float branchWidth = 0.004 * (1.0 - distToBranch / 0.08);
            if (distAlongBranch < branchWidth) {
              branchStrength = max(branchStrength, 1.0 - distToBranch / 0.08);
            }
          }
        }
        
        if (branchStrength > 0.1) {
          return mix(TRUNK_COLOR * 0.6, TRUNK_COLOR * 0.8, branchStrength);
        }
        
        // Leaf cloud: fuzzy canopy around upper 2/3 of trunk
        if (relY > 0.2) {
          float leafCenterY = 0.65;
          float canopyDist = abs(relY - leafCenterY);
          if (canopyDist < 0.35) {
            // Width varies with height (wider in middle)
            float heightInCanopy = (relY - 0.2) / 0.6;
            float canopyWidth = 0.14 * (1.0 - abs(heightInCanopy - 0.5) * 1.2);
            
            // Organic leaf noise
            float leafNoise = fbm(vec3(relX * 3.0 + seed * 2.0, relY * 2.5, trunkX * 5.0));
            float leafDensity = smoothstep(-0.2, 0.4, leafNoise);
            leafDensity *= smoothstep(canopyWidth, canopyWidth * -0.8, abs(relX));
            leafDensity *= smoothstep(0.40, -0.15, canopyDist);
            
            if (leafDensity > 0.05) {
              return mix(LEAF_COLOR * 0.8, LEAF_COLOR, leafDensity) * leafDensity;
            }
          }
        }
        
        return vec3(0.0);
      }

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        // Render ONLY in tree band
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        float cellPos = mod(wx, 0.50);
        
        // Three trees per cell at fixed positions
        float d1 = abs(cellPos - 0.08);
        float d2 = abs(cellPos - 0.20);
        float d3 = abs(cellPos - 0.35);
        
        vec3 col = vec3(0.0);
        float minDist = 1e6;
        float treeSeed = 0.0;
        
        // Check which tree is closest
        if (d1 < d2 && d1 < d3 && d1 < 0.12) {
          col = drawTree(p, wx - cellPos + 0.08, mod(floor(wx / 0.50) * 37.5, 1.0));
          minDist = d1;
        }
        if (d2 < d1 && d2 < d3 && d2 < 0.12) {
          col = drawTree(p, wx - cellPos + 0.20, mod(floor(wx / 0.50) * 73.1, 1.0));
          minDist = d2;
        }
        if (d3 < d1 && d3 < d2 && d3 < 0.12) {
          col = drawTree(p, wx - cellPos + 0.35, mod(floor(wx / 0.50) * 91.7, 1.0));
          minDist = d3;
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
