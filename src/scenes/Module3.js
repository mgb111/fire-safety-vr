import { BaseModule } from './BaseModule.js';
import { buildWorld, createDoor, createExitSign, createFireAlarm, createExtinguisher, createKitchen } from './WorldFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GameState } from '../game/GameState.js';

export class Module3 extends BaseModule {
  constructor(engine, hud){ super(engine, hud); this.fireParticles=[]; this.smokeParticles=[]; }
  start(){
    GameState.module = 3; GameState.resetFlags();
    this.hud.setTitle('Module 3: Evacuation');
    this.hud.setObjective('The fire is too large! Evacuate through the exit door immediately!');

    buildWorld(this.scene);
    this.exitDoor = createDoor(this.scene, 0, 0, 14);
    this.addInteractive(this.exitDoor);
    createExitSign(this.scene, 0, 3, 14);
    createFireAlarm(this.scene, -20, 1.5, -5);
    createExtinguisher(this.scene, 15, 0, -8);
    const kitchen = createKitchen(this.scene, -15, 0, -5);
    this.microwavePos = kitchen.microwave.position.clone();

    this.startFire(1.5);

    this.clickHandler = ()=> this.onClick();
    document.addEventListener('click', this.clickHandler);
  }
  onClick(){
    const target = this.pickCenter();
    if (target && target.userData?.type==='exit-door' && !GameState.flags.evacuated){
      this.evacuate();
    }
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
  evacuate(){
    GameState.flags.evacuated = true;
    this.hud.setObjective('✓ Successfully evacuated! You made it to safety!');
    setTimeout(()=> this.complete(90), 2000);
  }
  complete(score){
    const feedback = 'You evacuated safely! Always prioritize evacuation over fighting large fires.';
    this.hud.showCompletion(score, feedback);
  }
  update(){
    const target = this.pickCenter();
    if (target && target.userData?.interactive) this.hud.showPrompt(); else this.hud.hidePrompt();
  }
  dispose(){ super.dispose(); document.removeEventListener('click', this.clickHandler); }
}
