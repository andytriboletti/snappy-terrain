import {
    Group,
    Mesh,
    MeshStandardMaterial,
    DodecahedronGeometry, // Use a less regular shape
    Vector3,
    Scene
} from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { ResourcePool } from '../lib'; // Adjust path if needed

export interface RockGeneratorOptions {
    count: number;
    areaSize: number; // Square area dimension centered at 0,0
    minSize: number;
    maxSize: number;
    world: RAPIER.World;
    rapier: typeof RAPIER;
    scene: Scene;
    pool: ResourcePool;
}

export class RockGenerator {
    private rocks: Mesh[] = [];

    constructor(private options: RockGeneratorOptions) {}

    public generate(): void {
        const { count, areaSize, minSize, maxSize, world, rapier, scene, pool } = this.options;
        const halfSize = areaSize / 2;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * areaSize - halfSize;
            const z = Math.random() * areaSize - halfSize;
            const size = minSize + Math.random() * (maxSize - minSize);
            // TODO: Get actual terrain height at (x, z) instead of using 0
            const y = 0 + size / 2; // Place base roughly on ground

            const rock = this.createRockMesh(size);
            rock.position.set(x, y, z);
            // Random rotation
            rock.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            scene.add(rock);
            this.rocks.push(rock);

            // Add simple static physics collider (optional)
            // Ball is a reasonable approximation for a rock
            const rockColliderDesc = rapier.ColliderDesc.ball(size / 2)
                .setTranslation(x, y, z);
            world.createCollider(rockColliderDesc);
        }
        console.log(`Generated ${count} rocks.`);
        pool.add(this); // Add the generator itself to the pool
    }

    private createRockMesh(size: number): Mesh {
        const rockGeo = new DodecahedronGeometry(size / 2, 0); // Radius, detail level 0 for chunky look
        const rockMat = new MeshStandardMaterial({ 
            color: 0x888888, // Grey
            roughness: 0.8,
            metalness: 0.1 
        }); 
        const rock = new Mesh(rockGeo, rockMat);
        rock.castShadow = true;
        rock.receiveShadow = true;
        return rock;
    }

    public dispose(): void {
        console.log(`Disposing ${this.rocks.length} rocks.`);
        this.rocks.forEach(rock => {
            rock.removeFromParent();
            rock.geometry?.dispose();
            // Dispose materials carefully
            if (Array.isArray(rock.material)) {
                rock.material.forEach(mat => mat.dispose());
            } else {
                rock.material?.dispose();
            }
        });
        this.rocks = [];
    }
} 