import { BaseModule } from './BaseModule.js';
import { buildWorld, createDoor, createExitSign, createFireAlarm, createExtinguisher, createKitchen } from './WorldFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GameState } from '../game/GameState.js';
import { createRadialTexture } from '../utils/Textures.js';

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
    const fireTex = createRadialTexture('rgba(255,190,0,1)','rgba(255,0,0,0)');
    for (let i=0;i<60*intensity;i++){
      const mat = new THREE.SpriteMaterial({ map: fireTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite:false, transparent:true });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(this.microwavePos);
      sprite.position.y += Math.random()*1.0;
      sprite.scale.setScalar(0.6+Math.random()*0.9);
      sprite.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.1, Math.random()*0.25, (Math.random()-0.5)*0.1), life: Math.random()*1.0+0.5, baseScale: sprite.scale.x };
      this.scene.add(sprite);
      this.fireParticles.push(sprite);
    }
    this.fireLight = new THREE.PointLight(0xff7a00, 2.5, 14);
    this.fireLight.position.copy(this.microwavePos);
    this.scene.add(this.fireLight);
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
    const dt = 1/60;
    for (let i=this.fireParticles.length-1;i>=0;i--){
      const p = this.fireParticles[i];
      p.position.add(p.userData.velocity.clone().multiplyScalar(dt*60));
      p.userData.life -= dt;
      p.scale.setScalar(p.userData.baseScale * (0.8 + Math.random()*0.4));
      p.material.opacity = Math.max(0, p.userData.life/1.2);
      if (p.userData.life<=0){ this.scene.remove(p); this.fireParticles.splice(i,1); }
    }
    if (this.fireLight){ this.fireLight.intensity = 2.0 + Math.random()*1.0; }
  }
  dispose(){ super.dispose(); document.removeEventListener('click', this.clickHandler); }
}
