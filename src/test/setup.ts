import { World, Vector3, Quaternion } from '@dimforge/rapier3d';

// Create a mock world instance
const world = new World({ x: 0, y: -9.81, z: 0 });

// Make the mock world and types available globally
(global as any).RAPIER = {
  World,
  Vector3,
  Quaternion,
};

// Make the world instance available globally
(global as any).world = world; 