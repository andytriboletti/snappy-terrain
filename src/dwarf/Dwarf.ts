import { Mesh, MeshStandardMaterial, BoxGeometry, Group, Vector3, RingGeometry, LineBasicMaterial, Line, BufferGeometry, Object3D } from 'three';
import type { RigidBody, World } from '@dimforge/rapier3d';

export class Dwarf extends Group {
  private body?: RigidBody;
  private isDropped = false;
  private isSelected: boolean = false;
  private selectionRing!: Line;
  private targetPosition?: Vector3;
  private debugMarker?: Group;
  private readonly stopThreshold = 0.1; // Stop when close AND slow
  private readonly forceFactor = 10.0; // How strongly force scales with distance
  private readonly maxForce = 40.0;    // Max force to apply
  private collider?: any; // Use specific Rapier Collider type if available

  constructor() {
    super();
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

    // Use a capsule collider for potentially smoother movement
    // Use standard capsule(halfHeight, radius) instead of capsuleY
    const halfHeight = 1.0 / 2;
    const radius = 0.5;
    const colliderDesc = rapier.ColliderDesc.capsule(halfHeight, radius)
      .setTranslation(0, halfHeight + radius, 0) // Center the capsule properly (bottom sphere at y=0)
      .setFriction(0.7)
      .setRestitution(0.0);

    // *** Change to Kinematic Position Based ***
    const rbDesc = rapier.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(0, 5, 0) // Start position
      // Damping is not directly used by kinematic bodies in the same way
      .setCcdEnabled(true); // Still good practice

    this.body = world.createRigidBody(rbDesc);
    const collider = world.createCollider(colliderDesc, this.body);
    this.collider = collider; 

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

  private createDebugMarker(position: Vector3, parentGroup: Group) {
    // Remove existing marker if any
    if (this.debugMarker) {
      this.debugMarker.removeFromParent();
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
    parentGroup.add(markerGroup);
    this.debugMarker = markerGroup;
  }

  public setTargetPosition(position: Vector3, debugGroup: Group) {
    // ONLY set the target. No velocity/force changes here.
    if (!this.body || !this.isSelected) return;

    // Clear previous target marker if needed
    if (this.debugMarker) {
        this.debugMarker.removeFromParent();
        this.debugMarker = undefined;
    }

    // Store new target position at ground level
    this.targetPosition = new Vector3(position.x, 0, position.z);
    this.createDebugMarker(this.targetPosition, debugGroup);
  }

  public update() {
    if (!this.body) return;

    // Update visual position
    const position = this.body.translation();
    this.position.set(position.x, position.y, position.z);

    // Update selection ring
    if (this.selectionRing) {
      this.selectionRing.position.y = -position.y;
      this.selectionRing.visible = this.isSelected;
    }

    if (!this.targetPosition) return; // No target, do nothing

    const direction = new Vector3(
      this.targetPosition.x - position.x,
      0,
      this.targetPosition.z - position.z
    );
    const distance = direction.length();
    const velocity = this.body.linvel();
    const speedXZ = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);

    // --- Stop Condition --- (Relies on damping to slow down first)
    if (distance < this.stopThreshold && speedXZ < 0.5) {
      this.stopMovement();
      return;
    }
    // Optional: Add an overshoot stop condition if needed later
    // const dotProduct = direction.x * velocity.x + direction.z * velocity.z;
    // if (dotProduct < 0 && distance < this.stopThreshold * 2 && speedXZ < 1.0) { ... }

    // --- Simple Movement Force ---
    if (distance > 0.05) { // Only apply force if not extremely close
      let forceMagnitude = distance * this.forceFactor;
      forceMagnitude = Math.min(forceMagnitude, this.maxForce); // Cap the force
      
      direction.normalize();
      const propulsionForce = {
          x: direction.x * forceMagnitude,
          y: 0,
          z: direction.z * forceMagnitude
      };
      this.body.addForce(propulsionForce, true);
    }
  }

  private stopMovement() {
    if (!this.body) return;
    // Preserve Y velocity, kill XZ velocity
    this.body.setLinvel({ x: 0, y: this.body.linvel().y, z: 0 }, true);
    // Maybe reset forces if supported: this.body.resetForces(true);
    this.targetPosition = undefined;
    if (this.debugMarker) {
      this.debugMarker.removeFromParent();
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

  public getCollider(): any | undefined { // Return specific type if possible
      return this.collider;
  }

  public clearTargetPosition() {
    this.targetPosition = undefined;
    if (this.debugMarker) {
      this.debugMarker.removeFromParent();
      this.debugMarker = undefined;
    }
    // Optionally, also reset velocity if desired when deselecting
    // if (this.body) {
    //   this.body.setLinvel({ x: 0, y: this.body.linvel().y, z: 0 }, true);
    // }
  }

  public calculateDesiredMovement(deltaTime: number, gravity: Vector3): { x: number; y: number; z: number } {
    let desiredMovement = new Vector3(0, 0, 0);

    // Apply gravity (scaled by deltaTime)
    desiredMovement.addScaledVector(gravity, deltaTime);

    // Apply movement towards target if applicable
    if (this.targetPosition && this.body) {
        const position = this.body.translation(); // Use physics body position
        const direction = new Vector3(
            this.targetPosition.x - position.x,
            0,
            this.targetPosition.z - position.z
        );
        const distance = direction.length();

        // Stop condition is handled by controller, just calculate desired velocity
        if (distance > this.stopThreshold * 0.5) { // Only move if not extremely close
            direction.normalize();
            desiredMovement.x += direction.x * this.forceFactor * deltaTime; // Use forceFactor as a proxy for speed influence
            desiredMovement.z += direction.z * this.forceFactor * deltaTime; 
        }
    }
    // Clamp horizontal movement speed if needed?
    // const speedXZ = Math.sqrt(desiredMovement.x * desiredMovement.x + desiredMovement.z * desiredMovement.z);
    // const maxSpeed = someValue * deltaTime;
    // if (speedXZ > maxSpeed) { ... scale x/z ... }

    return { x: desiredMovement.x, y: desiredMovement.y, z: desiredMovement.z };
  }

  public updateVisuals() {
      if (!this.body) return;
      // Update visual position to match physics body AFTER physics step
      const position = this.body.translation();
      this.position.set(position.x, position.y, position.z);

      // Update selection ring
      if (this.selectionRing) {
          // Adjust Y based on actual body position, not just negating it
          this.selectionRing.position.y = -position.y + 0.01; // Slightly above ground
          this.selectionRing.rotation.x = -Math.PI / 2; // Keep it flat on XZ plane
          this.selectionRing.visible = this.isSelected;
      }
  }
} 