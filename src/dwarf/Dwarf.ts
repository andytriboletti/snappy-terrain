import { Mesh, MeshStandardMaterial, BoxGeometry, Group, Vector3, RingGeometry, LineBasicMaterial, Line, BufferGeometry, Object3D } from 'three';
import type { RigidBody, World } from '@dimforge/rapier3d';

export class Dwarf extends Group {
  private body?: RigidBody;
  private isDropped = false;
  private isSelected: boolean = false;
  private selectionRing!: Line;
  private targetPosition?: Vector3;
  private debugMarker?: Group;
  private debugMarkerGroup: Group;

  constructor() {
    super();
    this.debugMarkerGroup = new Group();
    this.add(this.debugMarkerGroup);
    this.createDwarf();
    this.createSelectionRing();
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
    this.add(head);
    this.add(body);
    this.add(leftLeg);
    this.add(rightLeg);
    this.add(leftArm);
    this.add(rightArm);
  }

  private createSelectionRing() {
    const geometry = new RingGeometry(1.2, 1.3, 32);
    const material = new LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
    this.selectionRing = new Line(geometry, material);
    this.selectionRing.visible = false;
    this.add(this.selectionRing);
    console.log('Selection ring created:', this.selectionRing);
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this);
  }

  public addPhysics(world: World, rapier: any) {
    if (this.isDropped) return;

    const colliderDesc = rapier.ColliderDesc.cuboid(0.6, 1.5, 0.4)
      .setTranslation(0, 1.5, 0)
      .setFriction(0.7)
      .setRestitution(0.0);

    const rbDesc = rapier.RigidBodyDesc.dynamic()
      .setTranslation(0, 5, 0)
      .setLinearDamping(1.0)
      .setAngularDamping(1.0)
      .setCanSleep(false)
      .setCcdEnabled(true);

    this.body = world.createRigidBody(rbDesc);
    world.createCollider(colliderDesc, this.body);
    this.isDropped = true;
  }

  public setSelected(selected: boolean) {
    console.log('Setting dwarf selected:', selected);
    this.isSelected = selected;
    if (this.selectionRing) {
      this.selectionRing.visible = selected;
    }
  }

  public isSelectedState(): boolean {
    return this.isSelected;
  }

  private createDebugMarker(position: Vector3) {
    // Remove existing marker if any
    if (this.debugMarker) {
      this.debugMarkerGroup.remove(this.debugMarker);
    }

    // Create X shape
    const material = new LineBasicMaterial({ color: 0xff0000 });
    const points1 = [
      new Vector3(-0.5, 0, -0.5),
      new Vector3(0.5, 0, 0.5)
    ];
    const points2 = [
      new Vector3(-0.5, 0, 0.5),
      new Vector3(0.5, 0, -0.5)
    ];

    const geometry1 = new BufferGeometry().setFromPoints(points1);
    const geometry2 = new BufferGeometry().setFromPoints(points2);

    const line1 = new Line(geometry1, material);
    const line2 = new Line(geometry2, material);

    const markerGroup = new Group();
    markerGroup.add(line1);
    markerGroup.add(line2);
    // Ensure marker is always at ground level
    markerGroup.position.set(position.x, 0.01, position.z); // Slightly above ground to prevent z-fighting
    this.debugMarkerGroup.add(markerGroup);
    this.debugMarker = markerGroup;
  }

  public setTargetPosition(position: Vector3) {
    // Store target position at ground level
    this.targetPosition = new Vector3(position.x, 0, position.z);
    this.createDebugMarker(this.targetPosition);
    
    if (!this.body || !this.isSelected) return;

    const currentPos = this.body.translation();
    const direction = new Vector3(
      this.targetPosition.x - currentPos.x, // Use targetPosition here
      0,
      this.targetPosition.z - currentPos.z  // Use targetPosition here
    );
    const distance = direction.length();

    // If starting very close to the target, just stop/don't apply force
    if (distance < 0.15) {
      this.stopMovement();
      return;
    }

    // Normalize direction and apply initial force
    direction.normalize();
    // Reduced initial force, relying more on update loop braking
    const forceMagnitude = Math.min(distance * 5, 20); 
    this.body.addForce(
      { x: direction.x * forceMagnitude, y: 0, z: direction.z * forceMagnitude },
      true
    );
  }

  public update() {
    if (!this.body) return;

    // Update visual position to match physics body
    const position = this.body.translation();
    this.position.set(position.x, position.y, position.z);

    // Update selection ring position to stay at ground level
    if (this.selectionRing) {
      this.selectionRing.position.y = -position.y;
      this.selectionRing.visible = this.isSelected;
    }

    if (!this.targetPosition) return;

    const direction = new Vector3(
      this.targetPosition.x - position.x,
      0,
      this.targetPosition.z - position.z
    );
    const distance = direction.length();
    const velocity = this.body.linvel();

    // --- Stopping Conditions ---
    // 1. Reached target
    if (distance < 0.15) { // Slightly smaller threshold for precise stop
      this.stopMovement();
      return;
    }

    // 2. Overshot target (moving away)
    const dotProduct = direction.x * velocity.x + direction.z * velocity.z;
    if (dotProduct < 0 && distance < 0.5) { // Only stop if already close when overshooting
      this.stopMovement();
      return;
    }

    // --- Movement Logic ---
    // Apply continuous braking force, stronger when closer to the target
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (speed > 0.1) { // Only apply brake if moving
        // Stronger brake when close, gentler when further away
        const brakeFactor = Math.max(1.0, 5.0 / (distance + 0.1)); // Inverse relationship with distance
        const brakeForce = { x: -velocity.x * brakeFactor, y: 0, z: -velocity.z * brakeFactor };
        this.body.addForce(brakeForce, true);
    }

    // Re-apply gentle force towards target if moving too slow and far away
    if (speed < 1.0 && distance > 0.5) {
        direction.normalize();
        const gentleForceMagnitude = 5.0; // Small constant force
        this.body.addForce(
          { x: direction.x * gentleForceMagnitude, y: 0, z: direction.z * gentleForceMagnitude },
          true
        );
    }
  }

  private stopMovement() {
    if (!this.body) return;
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.targetPosition = undefined;
    if (this.debugMarker) {
      this.debugMarkerGroup.remove(this.debugMarker);
      this.debugMarker = undefined;
    }
  }

  public dispose() {
    this.removeFromParent();
  }

  public getBody(): RigidBody | undefined {
    return this.body;
  }

  public getTargetPosition(): Vector3 | undefined {
    return this.targetPosition;
  }
} 