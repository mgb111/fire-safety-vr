import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { BaseModule } from './BaseModule.js';
import { buildWorld, createExtinguisher, createDoor, createExitSign, createFireAlarm, createKitchen } from './WorldFactory.js';
import { GameState } from '../game/GameState.js';

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
    for (let i=0;i<20*intensity;i++){
      const smokeGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const smokeMat = new THREE.MeshBasicMaterial({ color:0x555555, transparent:true, opacity:0.4 });
      const smoke = new THREE.Mesh(smokeGeo, smokeMat);
      smoke.position.copy(this.microwavePos);
      smoke.position.y += Math.random()*2;
      smoke.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.01, Math.random()*0.03, (Math.random()-0.5)*0.01), life: Math.random()*5+3 };
      this.scene.add(smoke);
      this.smokeParticles.push(smoke);
    }
    this.fireLight = new THREE.PointLight(0xff4500, 2, 10);
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

    // particles update
    this.fireParticles.forEach((p, i)=>{
      p.position.add(p.userData.velocity);
      p.userData.life -= dt;
      p.material.opacity = Math.max(0, p.userData.life/2);
      if (p.userData.life<=0){ this.scene.remove(p); this.fireParticles.splice(i,1); }
    });
    this.smokeParticles.forEach((p,i)=>{
      p.position.add(p.userData.velocity);
      p.scale.addScalar(0.01);
      p.userData.life -= dt;
      p.material.opacity = Math.max(0, p.userData.life/5 * 0.4);
      if (p.userData.life<=0){ this.scene.remove(p); this.smokeParticles.splice(i,1); }
    });

    if (GameState.flags.fireStarted && this.fireParticles.length < 30){
      const fireGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const fireMat = new THREE.MeshBasicMaterial({ color: Math.random()>0.5?0xff4500:0xffa500, transparent:true, opacity:0.8 });
      const fire = new THREE.Mesh(fireGeo, fireMat);
      fire.position.copy(this.microwavePos);
      fire.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.02, Math.random()*0.05, (Math.random()-0.5)*0.02), life: Math.random()*2+1 };
      this.scene.add(fire);
      this.fireParticles.push(fire);
    }
  }
  dispose(){
    super.dispose();
    document.removeEventListener('click', this.clickHandler);
  }
}
