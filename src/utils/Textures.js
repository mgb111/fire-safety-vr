import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createRadialTexture(inner='rgba(255,180,0,1)', outer='rgba(255,0,0,0)'){
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 1, size/2, size/2, size/2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createCheckerTexture(colorA='#9b9b9b', colorB='#8a8a8a', squares=8){
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const step = size / squares;
  for (let y=0; y<squares; y++){
    for (let x=0; x<squares; x++){
      ctx.fillStyle = ((x+y)%2===0)? colorA : colorB;
      ctx.fillRect(x*step, y*step, step, step);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8,8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
