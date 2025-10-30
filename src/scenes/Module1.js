import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { BaseModule } from './BaseModule.js';
import { buildWorld, createExtinguisher, createDoor, createExitSign, createFireAlarm, createKitchen } from './WorldFactory.js';
import { GameState } from '../game/GameState.js';
import { createRadialTexture } from '../utils/Textures.js';

export class Module1 extends BaseModule {
  constructor(engine, hud){
    super(engine, hud);
    this.fireParticles = [];
    this.smokeParticles = [];
  }
  start(){
    GameState.module = 1;
    this.hud.setTitle('Module 1: Fire Detection');
    this.hud.setObjective('Explore the office. A fire will start soon...');

    buildWorld(this.scene);
    this.alarm = createFireAlarm(this.scene, -20, 1.5, -5);
    this.addInteractive(this.alarm);
    this.exitDoor = createDoor(this.scene, 0, 0, 14);
    createExitSign(this.scene, 0, 3, 14);
    this.extinguisher = createExtinguisher(this.scene, 15, 0, -8);

    const kitchen = createKitchen(this.scene, -15, 0, -5);
    this.microwavePos = kitchen.microwave.position.clone();

    setTimeout(()=> this.startFire(1.0), 3000);

    this.clickHandler = ()=> this.onClick();
    document.addEventListener('click', this.clickHandler);
  }
  onClick(){
    const target = this.pickCenter();
    if (!target) { this.hud.hidePrompt(); return; }
    if (target.userData?.type==='fire-alarm' && GameState.flags.fireStarted && !GameState.flags.alarmActivated){
      this.activateAlarm();
    }
  }
  startFire(intensity=1.0){
    GameState.flags.fireStarted = true;
    this.hud.setObjective('🔥 FIRE DETECTED! Activate the fire alarm on the wall!');

    const fireTex = createRadialTexture('rgba(255,190,0,1)','rgba(255,0,0,0)');
    const smokeTex = createRadialTexture('rgba(120,120,120,0.5)','rgba(80,80,80,0)');
    for (let i=0;i<40*intensity;i++){
      const mat = new THREE.SpriteMaterial({ map: fireTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite:false, transparent:true });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(this.microwavePos);
      sprite.position.y += Math.random()*0.6;
      sprite.scale.setScalar(0.5+Math.random()*0.6);
      sprite.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.08, Math.random()*0.2, (Math.random()-0.5)*0.08), life: Math.random()*0.8+0.4, baseScale: sprite.scale.x };
      this.scene.add(sprite);
      this.fireParticles.push(sprite);
    }
    for (let i=0;i<25*intensity;i++){
      const mat = new THREE.SpriteMaterial({ map: smokeTex, color: 0x777777, depthWrite:false, transparent:true, opacity:0.6 });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(this.microwavePos);
      sprite.position.y += Math.random()*1.0;
      sprite.scale.setScalar(0.8+Math.random()*1.2);
      sprite.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.03, Math.random()*0.1+0.02, (Math.random()-0.5)*0.03), life: Math.random()*3+1.5, baseScale: sprite.scale.x };
      this.scene.add(sprite);
      this.smokeParticles.push(sprite);
    }
    this.fireLight = new THREE.PointLight(0xff7a00, 2.2, 12);
    this.fireLight.position.copy(this.microwavePos);
    this.scene.add(this.fireLight);
  }
  activateAlarm(){
    GameState.flags.alarmActivated = true;
    this.hud.setObjective('✓ Fire alarm activated! Well done!');
    if (this.alarm) {
      this.alarm.children[0].material.emissive = new THREE.Color(0xff0000);
      this.alarm.children[0].material.emissiveIntensity = 1;
    }
    setTimeout(()=> this.complete(85), 2000);
  }
  complete(score){
    const feedback = 'You successfully detected the fire and activated the alarm. Remember: early detection saves lives!';
    this.hud.showCompletion(score, feedback);
  }
  update(dt){
    // prompt display
    const target = this.pickCenter();
    if (target && target.userData?.interactive) {
      this.hud.showPrompt('Press to Interact');
    } else {
      this.hud.hidePrompt();
    }

    // particles update + light flicker
    for (let i=this.fireParticles.length-1;i>=0;i--){
      const p = this.fireParticles[i];
      p.position.add(p.userData.velocity.clone().multiplyScalar(dt*60));
      p.userData.life -= dt;
      const scale = p.userData.baseScale * (0.8 + Math.random()*0.4);
      p.scale.setScalar(scale);
      p.material.opacity = Math.max(0, p.userData.life/1.2);
      if (p.userData.life<=0){ this.scene.remove(p); this.fireParticles.splice(i,1); }
    }
    for (let i=this.smokeParticles.length-1;i>=0;i--){
      const p = this.smokeParticles[i];
      p.position.add(p.userData.velocity.clone().multiplyScalar(dt*60));
      p.userData.life -= dt;
      p.scale.x += 0.02; p.scale.y += 0.02;
      p.material.opacity = Math.max(0, Math.min(0.6, p.userData.life/3));
      if (p.userData.life<=0){ this.scene.remove(p); this.smokeParticles.splice(i,1); }
    }
    if (this.fireLight){
      this.fireLight.intensity = 1.8 + Math.random()*0.8;
      this.fireLight.color.setHSL(0.06 + Math.random()*0.02, 1.0, 0.5);
    }

    if (GameState.flags.fireStarted && this.fireParticles.length < 40){
      const fireTex = createRadialTexture('rgba(255,190,0,1)','rgba(255,0,0,0)');
      const mat = new THREE.SpriteMaterial({ map: fireTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite:false, transparent:true });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(this.microwavePos);
      sprite.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.08, Math.random()*0.2, (Math.random()-0.5)*0.08), life: Math.random()*0.8+0.4, baseScale: 0.8 };
      sprite.scale.setScalar(0.8);
      this.scene.add(sprite);
      this.fireParticles.push(sprite);
    }
  }
  dispose(){
    super.dispose();
    document.removeEventListener('click', this.clickHandler);
  }
}
