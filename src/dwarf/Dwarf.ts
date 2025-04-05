import { Mesh, MeshStandardMaterial, BoxGeometry, Group, Vector3 } from 'three';
import type { RigidBody, World } from '@dimforge/rapier3d';

export class Dwarf {
  private group: Group;
  private body?: RigidBody;
  private isDropped = false;

  constructor() {
    this.group = new Group();
    this.createDwarf();
  }

  private createDwarf() {
    // Head
    const headGeometry = new BoxGeometry(1, 1, 1);
    const headMaterial = new MeshStandardMaterial({ color: 0xffcc99 });
    const head = new Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;

    // Body
    const bodyGeometry = new BoxGeometry(1.2, 1.5, 0.8);
    const bodyMaterial = new MeshStandardMaterial({ color: 0x8B4513 });
    const body = new Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;

    // Legs
    const legGeometry = new BoxGeometry(0.4, 1, 0.4);
    const legMaterial = new MeshStandardMaterial({ color: 0x4B2F0A });
    
    const leftLeg = new Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.5, 0);
    leftLeg.castShadow = true;
    
    const rightLeg = new Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.5, 0);
    rightLeg.castShadow = true;

    // Arms
    const armGeometry = new BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new MeshStandardMaterial({ color: 0x8B4513 });
    
    const leftArm = new Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.8, 0.5, 0);
    leftArm.castShadow = true;
    
    const rightArm = new Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.8, 0.5, 0);
    rightArm.castShadow = true;

    // Add all parts to the group
    this.group.add(head);
    this.group.add(body);
    this.group.add(leftLeg);
    this.group.add(rightLeg);
    this.group.add(leftArm);
    this.group.add(rightArm);
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.group);
  }

  public addPhysics(world: World, rapier: any) {
    if (this.isDropped) return;

    // Create a compound collider that matches the dwarf's shape
    const colliderDesc = rapier.ColliderDesc.cuboid(0.6, 1.5, 0.4) // Main body
      .setTranslation(0, 0.5, 0)
      .setFriction(0.5)
      .setRestitution(0.2);

    const rbDesc = rapier.RigidBodyDesc.dynamic()
      .setTranslation(0, 10, 0)
      .setLinearDamping(0.5)
      .setAngularDamping(0.5)
      .setCcdEnabled(true);

    this.body = world.createRigidBody(rbDesc);
    world.createCollider(colliderDesc, this.body);
    this.isDropped = true;
  }

  public update() {
    if (this.body) {
      const position = this.body.translation();
      this.group.position.set(position.x, position.y, position.z);
    }
  }

  public dispose() {
    this.group.removeFromParent();
  }
} 