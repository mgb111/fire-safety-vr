import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { BaseModule } from './BaseModule.js';
import { buildWorld, createExtinguisher, createDoor, createExitSign, createFireAlarm, createKitchen } from './WorldFactory.js';
import { GameState } from '../game/GameState.js';
import { createRadialTexture } from '../utils/Textures.js';

export class Module2 extends BaseModule {
  constructor(engine, hud){
    super(engine, hud);
    this.fireParticles = [];
    this.smokeParticles = [];
  }
  start(){
    GameState.module = 2;
    GameState.resetFlags();
    this.hud.setTitle('Module 2: Fire Extinguisher');
    this.hud.setObjective('Locate the fire extinguisher and put out the small fire');

    buildWorld(this.scene);
    this.alarm = createFireAlarm(this.scene, -20, 1.5, -5);
    this.exitDoor = createDoor(this.scene, 0, 0, 14);
    createExitSign(this.scene, 0, 3, 14);
    this.extinguisher = createExtinguisher(this.scene, 15, 0, -8);
    this.addInteractive(this.extinguisher);

    const kitchen = createKitchen(this.scene, -15, 0, -5);
    this.microwavePos = kitchen.microwave.position.clone();

    setTimeout(()=> this.startFire(0.5), 2000);

    this.clickHandler = ()=> this.onClick();
    document.addEventListener('click', this.clickHandler);
  }
  onClick(){
    const target = this.pickCenter();
    if (target && target.userData?.type==='extinguisher' && !GameState.flags.extinguisherGrabbed){
      this.grabExtinguisher();
      return;
    }
    if (GameState.flags.extinguisherGrabbed && GameState.flags.fireStarted && !GameState.flags.fireExtinguished){
      this.extinguishFire();
    }
  }
  grabExtinguisher(){
    GameState.flags.extinguisherGrabbed = true;
    this.hud.setObjective('✓ Extinguisher grabbed! Approach the fire and click to extinguish it (P.A.S.S. method)');
    this.extinguisher.position.set(0.3, 1.2, -0.5);
    this.camera.add(this.extinguisher);
  }
  startFire(intensity){
    GameState.flags.fireStarted = true;
    const fireTex = createRadialTexture('rgba(255,190,0,1)','rgba(255,0,0,0)');
    for (let i=0;i<35*intensity;i++){
      const mat = new THREE.SpriteMaterial({ map: fireTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite:false, transparent:true });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(this.microwavePos);
      sprite.position.y += Math.random()*0.6;
      sprite.scale.setScalar(0.5+Math.random()*0.6);
      sprite.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.08, Math.random()*0.18, (Math.random()-0.5)*0.08), life: Math.random()*0.8+0.4, baseScale: sprite.scale.x };
      this.scene.add(sprite);
      this.fireParticles.push(sprite);
    }
    this.fireLight = new THREE.PointLight(0xff7a00, 2.0, 10);
    this.fireLight.position.copy(this.microwavePos);
    this.scene.add(this.fireLight);
  }
  extinguishFire(){
    GameState.flags.fireExtinguished = true;
    this.hud.setObjective('✓ Fire extinguished! Excellent work using the P.A.S.S. method!');
    this.fireParticles.forEach(p=> this.scene.remove(p));
    this.smokeParticles.forEach(p=> this.scene.remove(p));
    this.fireParticles = [];
    this.smokeParticles = [];
    setTimeout(()=> this.complete(95), 2000);
  }
  complete(score){
    const feedback = 'Great job using the fire extinguisher! Remember P.A.S.S.: Pull, Aim, Squeeze, Sweep.';
    this.hud.showCompletion(score, feedback);
  }
  update(){
    const target = this.pickCenter();
    if (target && target.userData?.interactive) this.hud.showPrompt(); else this.hud.hidePrompt();
    // update fire sprites and light flicker
    const dt = 1/60; // simple approximation here since Module2 doesn't receive dt param
    for (let i=this.fireParticles.length-1;i>=0;i--){
      const p = this.fireParticles[i];
      p.position.add(p.userData.velocity.clone().multiplyScalar(dt*60));
      p.userData.life -= dt;
      p.scale.setScalar(p.userData.baseScale * (0.85 + Math.random()*0.3));
      p.material.opacity = Math.max(0, p.userData.life/1.2);
      if (p.userData.life<=0){ this.scene.remove(p); this.fireParticles.splice(i,1); }
    }
    if (this.fireLight){ this.fireLight.intensity = 1.6 + Math.random()*0.6; }
  }
  dispose(){ super.dispose(); document.removeEventListener('click', this.clickHandler); }
}
