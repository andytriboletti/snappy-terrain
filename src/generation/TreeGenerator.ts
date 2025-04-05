import {
    Group,
    Mesh,
    MeshStandardMaterial,
    CylinderGeometry,
    ConeGeometry,
    Vector3,
    Scene
} from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { ResourcePool } from '../lib'; // Adjust path if needed

export interface TreeGeneratorOptions {
    count: number;
    areaSize: number; // Square area dimension centered at 0,0
    world: RAPIER.World;
    rapier: typeof RAPIER;
    scene: Scene;
    pool: ResourcePool;
}

export class TreeGenerator {
    private trees: Group[] = [];

    constructor(private options: TreeGeneratorOptions) {}

    public generate(): void {
        const { count, areaSize, world, rapier, scene, pool } = this.options;
        const halfSize = areaSize / 2;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * areaSize - halfSize;
            const z = Math.random() * areaSize - halfSize;
            // TODO: Get actual terrain height at (x, z) instead of using 0
            const y = 0; 

            const tree = this.createTreeMesh();
            tree.position.set(x, y, z);
            scene.add(tree);
            this.trees.push(tree);

            // Add simple static physics collider (optional)
            // A simple cylinder might suffice for basic collision
            const trunkHeight = 2.0;
            const trunkRadius = 0.3;
            const treeColliderDesc = rapier.ColliderDesc.cylinder(trunkHeight / 2, trunkRadius)
                .setTranslation(x, y + trunkHeight / 2, z); // Position collider relative to tree base
            world.createCollider(treeColliderDesc); 
        }
        console.log(`Generated ${count} trees.`);
        pool.add(this); // Add the generator itself to the pool for disposal
    }

    private createTreeMesh(): Group {
        const treeGroup = new Group();

        // Trunk
        const trunkHeight = 2.0;
        const trunkRadius = 0.3;
        const trunkGeo = new CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
        const trunkMat = new MeshStandardMaterial({ color: 0x8B4513 }); // Brown
        const trunk = new Mesh(trunkGeo, trunkMat);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Leaves (Cone)
        const leavesHeight = 3.0;
        const leavesRadius = 1.5;
        const leavesGeo = new ConeGeometry(leavesRadius, leavesHeight, 8);
        const leavesMat = new MeshStandardMaterial({ color: 0x228B22 }); // Forest Green
        const leaves = new Mesh(leavesGeo, leavesMat);
        leaves.position.y = trunkHeight + leavesHeight / 2 - 0.2; // Slightly overlap trunk
        leaves.castShadow = true;
        treeGroup.add(leaves);

        return treeGroup;
    }

    public dispose(): void {
        console.log(`Disposing ${this.trees.length} trees.`);
        this.trees.forEach(tree => {
            tree.removeFromParent();
            // If tree meshes/materials need explicit disposal, do it here
            tree.traverse(obj => {
                if (obj instanceof Mesh) {
                    obj.geometry?.dispose();
                    // Dispose materials carefully (might be shared)
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material?.dispose();
                    }
                }
            });
        });
        this.trees = [];
    }
} 