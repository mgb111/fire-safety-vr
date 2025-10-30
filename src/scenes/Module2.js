import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { BaseModule } from './BaseModule.js';
import { buildWorld, createExtinguisher, createDoor, createExitSign, createFireAlarm, createKitchen } from './WorldFactory.js';
import { GameState } from '../game/GameState.js';

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
    for (let i=0;i<30*intensity;i++){
      const fireGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const fireMat = new THREE.MeshBasicMaterial({ color: Math.random()>0.5?0xff4500:0xffa500, transparent:true, opacity:0.8 });
      const fire = new THREE.Mesh(fireGeo, fireMat);
      fire.position.copy(this.microwavePos);
      fire.position.y += Math.random()*0.5;
      fire.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.02, Math.random()*0.05, (Math.random()-0.5)*0.02), life: Math.random()*2+1 };
      this.scene.add(fire);
      this.fireParticles.push(fire);
    }
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
  }
  dispose(){ super.dispose(); document.removeEventListener('click', this.clickHandler); }
}
