import { Dwarf } from './Dwarf';
import { Vector3 } from 'three';
import type { World } from '@dimforge/rapier3d';

describe('Dwarf', () => {
  let dwarf: Dwarf;
  let world: World;
  let rapier: any;

  beforeEach(async () => {
    dwarf = new Dwarf();
    rapier = await import('@dimforge/rapier3d');
    world = new rapier.World({ x: 0, y: -9.81, z: 0 });
  });

  describe('Stopping Behavior', () => {
    beforeEach(() => {
      dwarf.addPhysics(world, rapier);
      dwarf.setSelected(true);
    });

    it('should stop immediately when clicked at current position', () => {
      const currentPos = new Vector3(0, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      // Set initial position
      body.setTranslation(currentPos, true);
      
      // Click at current position
      dwarf.setTargetPosition(currentPos);
      
      // Verify velocity is zero
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when clicked very close to current position', () => {
      const currentPos = new Vector3(0, 0, 0);
      const clickPos = new Vector3(0.05, 0, 0.05); // Within 0.1 units
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(currentPos, true);
      dwarf.setTargetPosition(clickPos);
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when reaching target position', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when very close to target position', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const nearTarget = new Vector3(0.9, 0, 0); // Within 0.2 units
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate being near target
      body.setTranslation(nearTarget, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should clear target position when stopping', () => {
      const currentPos = new Vector3(0, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(currentPos, true);
      dwarf.setTargetPosition(currentPos);
      
      expect(dwarf.getTargetPosition()).toBeUndefined();
    });

    it('should not move when not selected', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      dwarf.setSelected(false);
      dwarf.setTargetPosition(targetPos);
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should apply braking force when moving too fast', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(10, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 10, y: 0, z: 0 }, true);
      dwarf.setTargetPosition(targetPos);
      
      const velocity = body.linvel();
      expect(velocity.x).toBeLessThan(10); // Should be braking
    });

    it('should maintain zero velocity after stopping', () => {
      const currentPos = new Vector3(0, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(currentPos, true);
      dwarf.setTargetPosition(currentPos);
      
      // Simulate multiple updates
      for (let i = 0; i < 10; i++) {
        dwarf.update();
        const velocity = body.linvel();
        expect(velocity.x).toBe(0);
        expect(velocity.y).toBe(0);
        expect(velocity.z).toBe(0);
      }
    });

    it('should stop even when falling', () => {
      const currentPos = new Vector3(0, 10, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(currentPos, true);
      body.setLinvel({ x: 0, y: -5, z: 0 }, true);
      dwarf.setTargetPosition(currentPos);
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.z).toBe(0);
      // y velocity might not be 0 due to gravity
    });

    it('should stop when clicked multiple times in same position', () => {
      const currentPos = new Vector3(0, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(currentPos, true);
      
      // Click multiple times
      for (let i = 0; i < 5; i++) {
        dwarf.setTargetPosition(currentPos);
        const velocity = body.linvel();
        expect(velocity.x).toBe(0);
        expect(velocity.y).toBe(0);
        expect(velocity.z).toBe(0);
      }
    });

    it('should stop when moving diagonally', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 1);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 1, y: 0, z: 1 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when moving at high speed', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 20, y: 0, z: 0 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when moving in negative direction', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(-1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: -1, y: 0, z: 0 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when moving in 3D space', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 1, 1);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 1, y: 1, z: 1 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.z).toBe(0);
      // y velocity might not be 0 due to gravity
    });

    it('should stop when moving in a curve', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 1);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 0.5, y: 0, z: 0.5 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when moving with angular velocity', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 1, y: 0, z: 0 }, true);
      body.setAngvel({ x: 1, y: 1, z: 1 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when moving with external forces', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 1, y: 0, z: 0 }, true);
      body.addForce({ x: 10, y: 0, z: 0 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate reaching target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should stop when moving with multiple updates', () => {
      const startPos = new Vector3(0, 0, 0);
      const targetPos = new Vector3(1, 0, 0);
      const body = dwarf.getBody();
      if (!body) throw new Error('Body not found');
      
      body.setTranslation(startPos, true);
      body.setLinvel({ x: 1, y: 0, z: 0 }, true);
      dwarf.setTargetPosition(targetPos);
      
      // Simulate multiple updates
      for (let i = 0; i < 10; i++) {
        body.setTranslation(new Vector3(i * 0.1, 0, 0), true);
        dwarf.update();
      }
      
      // Final update at target
      body.setTranslation(targetPos, true);
      dwarf.update();
      
      const velocity = body.linvel();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });
  });
}); 