export class Input {
  constructor(domElement, camera) {
    this.dom = domElement;
    this.camera = camera;

    this.keys = { w:false, a:false, s:false, d:false };
    this.move = { x:0, z:0 };
    this.velocity = { x:0, z:0 };

    this.euler = new window.THREE.Euler(0, 0, 0, 'YXZ');

    document.addEventListener('keydown', (e)=>this.onKeyDown(e));
    document.addEventListener('keyup', (e)=>this.onKeyUp(e));
    document.addEventListener('mousemove', (e)=>this.onMouseMove(e));

    this.dom.addEventListener('click', ()=>{
      this.dom.requestPointerLock();
    });
  }

  onKeyDown(e){
    if (e.code==='KeyW'||e.code==='ArrowUp') this.keys.w=true;
    if (e.code==='KeyS'||e.code==='ArrowDown') this.keys.s=true;
    if (e.code==='KeyA'||e.code==='ArrowLeft') this.keys.a=true;
    if (e.code==='KeyD'||e.code==='ArrowRight') this.keys.d=true;
  }
  onKeyUp(e){
    if (e.code==='KeyW'||e.code==='ArrowUp') this.keys.w=false;
    if (e.code==='KeyS'||e.code==='ArrowDown') this.keys.s=false;
    if (e.code==='KeyA'||e.code==='ArrowLeft') this.keys.a=false;
    if (e.code==='KeyD'||e.code==='ArrowRight') this.keys.d=false;
  }
  onMouseMove(e){
    if (document.pointerLockElement === this.dom) {
      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y -= e.movementX * 0.002;
      this.euler.x -= e.movementY * 0.002;
      this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    }
  }

  update(dt){
    this.move.z = (this.keys.w?1:0) - (this.keys.s?1:0);
    this.move.x = (this.keys.d?1:0) - (this.keys.a?1:0);

    const accel = 20.0;
    this.velocity.z -= this.move.z * accel * dt;
    this.velocity.x -= this.move.x * accel * dt;

    this.camera.translateX(this.velocity.x * dt);
    this.camera.translateZ(this.velocity.z * dt);

    this.velocity.x *= 0.9;
    this.velocity.z *= 0.9;

    this.camera.position.y = 1.6;
  }
}
