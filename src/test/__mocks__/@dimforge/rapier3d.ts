export const World = jest.fn().mockImplementation(() => ({
  step: jest.fn(),
  createRigidBody: jest.fn().mockReturnValue({
    setLinvel: jest.fn(),
    setTranslation: jest.fn(),
    setAngvel: jest.fn(),
    applyImpulse: jest.fn(),
    applyTorqueImpulse: jest.fn(),
    applyForce: jest.fn(),
    applyTorque: jest.fn(),
    addForce: jest.fn(),
    translation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    angvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
  }),
  createCollider: jest.fn(),
  removeRigidBody: jest.fn(),
  removeCollider: jest.fn(),
}));

const mockColliderDesc = {
  translation: jest.fn().mockReturnThis(),
  friction: jest.fn().mockReturnThis(),
  restitution: jest.fn().mockReturnThis(),
  setTranslation: jest.fn().mockReturnThis(),
  setFriction: jest.fn().mockReturnThis(),
  setRestitution: jest.fn().mockReturnThis(),
};

export const ColliderDesc = {
  ball: jest.fn().mockReturnValue(mockColliderDesc),
  cuboid: jest.fn().mockReturnValue(mockColliderDesc),
  capsule: jest.fn().mockReturnValue(mockColliderDesc),
  cylinder: jest.fn().mockReturnValue(mockColliderDesc),
  cone: jest.fn().mockReturnValue(mockColliderDesc),
  trimesh: jest.fn().mockReturnValue(mockColliderDesc),
  heightfield: jest.fn().mockReturnValue(mockColliderDesc),
  convexHull: jest.fn().mockReturnValue(mockColliderDesc),
  roundCuboid: jest.fn().mockReturnValue(mockColliderDesc),
  roundCylinder: jest.fn().mockReturnValue(mockColliderDesc),
  roundCone: jest.fn().mockReturnValue(mockColliderDesc),
  roundTrimesh: jest.fn().mockReturnValue(mockColliderDesc),
};

const mockRigidBodyDesc = {
  translation: jest.fn().mockReturnThis(),
  rotation: jest.fn().mockReturnThis(),
  mass: jest.fn().mockReturnThis(),
  restitution: jest.fn().mockReturnThis(),
  friction: jest.fn().mockReturnThis(),
  density: jest.fn().mockReturnThis(),
  linearDamping: jest.fn().mockReturnThis(),
  angularDamping: jest.fn().mockReturnThis(),
  gravityScale: jest.fn().mockReturnThis(),
  ccdEnabled: jest.fn().mockReturnThis(),
  canSleep: jest.fn().mockReturnThis(),
  sleeping: jest.fn().mockReturnThis(),
  lockTranslations: jest.fn().mockReturnThis(),
  lockRotations: jest.fn().mockReturnThis(),
  enabled: jest.fn().mockReturnThis(),
  userData: jest.fn().mockReturnThis(),
  setTranslation: jest.fn().mockReturnThis(),
  setRotation: jest.fn().mockReturnThis(),
  setMass: jest.fn().mockReturnThis(),
  setRestitution: jest.fn().mockReturnThis(),
  setFriction: jest.fn().mockReturnThis(),
  setDensity: jest.fn().mockReturnThis(),
  setLinearDamping: jest.fn().mockReturnThis(),
  setAngularDamping: jest.fn().mockReturnThis(),
  setGravityScale: jest.fn().mockReturnThis(),
  setCcdEnabled: jest.fn().mockReturnThis(),
};

export const RigidBodyDesc = {
  dynamic: jest.fn().mockReturnValue(mockRigidBodyDesc),
  fixed: jest.fn().mockReturnValue(mockRigidBodyDesc),
  kinematicPositionBased: jest.fn().mockReturnValue(mockRigidBodyDesc),
  kinematicVelocityBased: jest.fn().mockReturnValue(mockRigidBodyDesc),
};

export const Vector3 = {
  x: 0,
  y: 0,
  z: 0,
  set: jest.fn(),
  add: jest.fn(),
  sub: jest.fn(),
  scale: jest.fn(),
  normalize: jest.fn(),
  length: jest.fn(),
  lengthSquared: jest.fn(),
  dot: jest.fn(),
  cross: jest.fn(),
  zero: jest.fn(),
};

export const Quaternion = {
  x: 0,
  y: 0,
  z: 0,
  w: 1,
  set: jest.fn(),
  normalize: jest.fn(),
  conjugate: jest.fn(),
  inverse: jest.fn(),
  multiply: jest.fn(),
  fromEuler: jest.fn(),
  toEuler: jest.fn(),
  identity: jest.fn(),
};

export default {
  World,
  RigidBodyDesc,
  ColliderDesc,
  Vector3,
  Quaternion,
}; 