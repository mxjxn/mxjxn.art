// Foreground trees: textured sprites that scroll
import * as THREE from 'three';
import { FULLSCREEN_VERT } from './common.js';

export function makeTrees(uTime, uScroll) {
  const textureLoader = new THREE.TextureLoader();
  const treesTexture = textureLoader.load('../trees.png');
  treesTexture.magFilter = THREE.NearestFilter;
  treesTexture.minFilter = THREE.NearestFilter;

  const uniforms = {
    uTime: { value: 0 },
    uScroll: uScroll,
    uAspect: { value: 1 },
    uSpeed: { value: 1.0 },
    uTreeTexture: { value: treesTexture },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uScroll, uAspect, uSpeed;
      uniform sampler2D uTreeTexture;

      void main() {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        
        if (p.y < 0.10 || p.y > 0.48) discard;
        
        float wx = p.x + uScroll * uSpeed;
        
        // Place trees every 0.25 units (4 per screen width)
        float period = 0.25;
        float cellX = mod(wx, period);
        float cellIdx = floor(wx / period);
        
        // Tree sprite width in world space
        const float TREE_W = 0.06;
        const float TREE_H = 0.38;
        
        // Center of tree in this cell
        float treeX = floor(wx / period) * period + period * 0.5;
        float relX = p.x - treeX;
        
        // Only render where tree is
        if (abs(relX) > TREE_W * 0.5) discard;
        
        float relY = (p.y - 0.10) / TREE_H;
        if (relY < 0.0 || relY > 1.0) discard;
        
        // Pick sprite based on cell index (cycle through 4 trees)
        float spriteIdx = mod(cellIdx, 4.0);
        float spriteU = (spriteIdx + (relX / TREE_W + 0.5)) / 4.0;
        float spriteV = 1.0 - relY;  // flip V since image is top-down
        
        vec4 texel = texture2D(uTreeTexture, vec2(spriteU, spriteV));
        
        if (texel.a < 0.1) discard;
        
        gl_FragColor = texel;
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
