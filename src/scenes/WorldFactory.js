import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createCheckerTexture } from '../utils/Textures.js';

export function buildWorld(scene){
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorTex = createCheckerTexture('#9f9f9f', '#8b8b8b', 12);
  const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9, metalness: 0.0 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceilGeo = new THREE.PlaneGeometry(50, 50);
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 1.0, metalness: 0.0 });
  const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 5;
  ceiling.receiveShadow = false;
  scene.add(ceiling);

  createWall(scene, 0, 2.5, -10, 50, 5, 0.5, 0xcccccc);
  createWall(scene, 0, 2.5, 15, 50, 5, 0.5, 0xcccccc);
  createWall(scene, -25, 2.5, 2.5, 0.5, 5, 25, 0xcccccc);
  createWall(scene, 25, 2.5, 2.5, 0.5, 5, 25, 0xcccccc);

  createKitchen(scene, -15, 0, -5);
  createDesk(scene, 10, 0, 0);
  createDesk(scene, 10, 0, 5);
  createDesk(scene, -5, 0, 5);
}

function createWall(scene, x,y,z,w,h,d,color){
  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.0 });
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(x, y, z);
  wall.receiveShadow = true;
  wall.castShadow = true;
  scene.add(wall);
}

export function createKitchen(scene, x,y,z){
  const counterGeo = new THREE.BoxGeometry(4, 1, 2);
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x6f4b3e, roughness: 0.8, metalness: 0.05 });
  const counter = new THREE.Mesh(counterGeo, counterMat);
  counter.position.set(x, y + 0.5, z);
  scene.add(counter);

  const microGeo = new THREE.BoxGeometry(0.8, 0.6, 0.6);
  const microMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.2 });
  const microwave = new THREE.Mesh(microGeo, microMat);
  microwave.position.set(x, y + 1.3, z);
  microwave.userData = { type: 'fire-source' };
  scene.add(microwave);

  return { microwave };
}

function createDesk(scene, x,y,z){
  const deskGeo = new THREE.BoxGeometry(2, 0.8, 1);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x7a583a, roughness: 0.85, metalness: 0.0 });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.set(x, y + 0.4, z);
  scene.add(desk);
}

export function createExitSign(scene, x,y,z){
  const signGeo = new THREE.BoxGeometry(1.5, 0.5, 0.1);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(x, y, z);
  scene.add(sign);
}

export function createDoor(scene, x,y,z){
  const doorGeo = new THREE.BoxGeometry(2, 3, 0.2);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7, metalness: 0.05 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(x, y + 1.5, z);
  door.userData = { type: 'exit-door', interactive: true };
  scene.add(door);
  return door;
}

export function createExtinguisher(scene, x,y,z){
  const bodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd40000, roughness: 0.4, metalness: 0.2 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);

  const nozzleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
  const nozzle = new THREE.Mesh(nozzleGeo, bodyMat);
  nozzle.position.y = 0.6;
  nozzle.rotation.z = Math.PI / 4;

  const extinguisher = new THREE.Group();
  extinguisher.add(body);
  extinguisher.add(nozzle);
  extinguisher.position.set(x, y + 0.5, z);
  extinguisher.userData = { type: 'extinguisher', interactive: true };
  scene.add(extinguisher);
  return extinguisher;
}

export function createFireAlarm(scene, x,y,z){
  const boxGeo = new THREE.BoxGeometry(0.3, 0.4, 0.15);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const alarmBox = new THREE.Mesh(boxGeo, boxMat);

  const handleGeo = new THREE.BoxGeometry(0.2, 0.15, 0.1);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0, -0.15, 0.1);

  const alarmGroup = new THREE.Group();
  alarmGroup.add(alarmBox);
  alarmGroup.add(handle);
  alarmGroup.position.set(x, y, z);
  alarmGroup.userData = { type: 'fire-alarm', interactive: true };
  scene.add(alarmGroup);
  return alarmGroup;
}
