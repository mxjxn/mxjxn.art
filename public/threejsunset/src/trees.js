// Foreground trees: rendered as individual mesh instances
import * as THREE from 'three';

export function makeTrees(uTime, uScroll) {
  const group = new THREE.Group();
  group.renderOrder = 5;
  group.frustumCulled = false;

  // Create one tree geometry
  function createTree() {
    const g = new THREE.Group();
    
    // Trunk: simple tapered cylinder
    const trunkGeom = new THREE.ConeGeometry(0.02, 0.3, 8);
    const trunkMat = new THREE.MeshBasicMaterial({ color: 0x2d1c0d });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 0.15;
    g.add(trunk);
    
    // Leaves: sphere
    const leafGeom = new THREE.IcosahedronGeometry(0.08, 3);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x384a1e, transparent: true, opacity: 0.7 });
    const leaves = new THREE.Mesh(leafGeom, leafMat);
    leaves.position.y = 0.15;
    leaves.scale.y = 1.3;
    g.add(leaves);
    
    return g;
  }

  // Spawn trees at regular intervals
  const treeSpacing = 0.3;
  const numTrees = 20;  // enough to cover screen + buffer
  const trees = [];
  
  for (let i = 0; i < numTrees; i++) {
    const tree = createTree();
    const worldX = (i - numTrees / 2) * treeSpacing;
    tree.position.x = worldX;
    tree.position.y = 0;
    tree.position.z = 0;
    group.add(tree);
    trees.push({ mesh: tree, baseX: worldX });
  }

  // Update function: called each frame
  const update = (elapsed, dt, v) => {
    const scrollDist = v * elapsed;
    
    trees.forEach(t => {
      // Position based on scroll
      let x = t.baseX - scrollDist;
      
      // Wrap around
      if (x < -2) x += treeSpacing * numTrees;
      if (x > 2) x -= treeSpacing * numTrees;
      
      t.mesh.position.x = x;
      
      // Only render if in viewport
      t.mesh.visible = x > -1.2 && x < 1.2;
    });
  };

  group.userData.update = update;
  
  return group;
}
