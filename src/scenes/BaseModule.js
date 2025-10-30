import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class BaseModule {
  constructor(engine, hud) {
    this.engine = engine;
    this.hud = hud;
    this.scene = engine.scene;
    this.camera = engine.camera;
    this.interactive = [];
    this.raycaster = new THREE.Raycaster();
  }
  pickCenter(){
    this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
    const hits = this.raycaster.intersectObjects(this.interactive, true);
    return hits.length ? (hits[0].object.parent?.userData?.type ? hits[0].object.parent : hits[0].object) : null;
  }
  addInteractive(obj){ this.interactive.push(obj); }
  removeAllInteractive(){ this.interactive.length = 0; }
  update(){}
  dispose(){ this.removeAllInteractive(); }
}
