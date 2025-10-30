import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
window.THREE = THREE; // expose for Input Euler

import { Engine } from './core/Engine.js';
import { SceneManager } from './core/SceneManager.js';
import { Input } from './core/Input.js';
import { HUD } from './ui/HUD.js';
import { Module1 } from './scenes/Module1.js';
import { Module2 } from './scenes/Module2.js';
import { Module3 } from './scenes/Module3.js';
import { MainMenu } from './scenes/MainMenu.js';

const container = document.getElementById('canvas-container');
const hud = new HUD();

const engine = new Engine({ canvasContainer: container });
const sceneManager = new SceneManager(engine);
const input = new Input(engine.renderer.domElement, engine.camera);

const factories = {
  startMenu(){ sceneManager.set(new MainMenu(engine, hud, sceneManager, factories)); },
  startModule(n){
    if (n===1) sceneManager.set(new Module1(engine, hud));
    else if (n===2) sceneManager.set(new Module2(engine, hud));
    else if (n===3) sceneManager.set(new Module3(engine, hud));
  }
};

factories.startModule(1);

engine.onFrame = () => {
  input.update(engine.deltaTime);
  sceneManager.update(engine.deltaTime);
};
engine.start();

// Hook existing buttons in completion overlay
window.nextModule = function(){
  const current = sceneManager.current;
  if (current && current.constructor.name==='Module1') factories.startModule(2);
  else if (current && current.constructor.name==='Module2') factories.startModule(3);
  else alert('Training Complete! You have finished all modules.');
  hud.hideCompletion();
};
window.restartModule = function(){
  const current = sceneManager.current;
  if (!current) return;
  if (current.constructor.name==='Module1') factories.startModule(1);
  if (current.constructor.name==='Module2') factories.startModule(2);
  if (current.constructor.name==='Module3') factories.startModule(3);
  hud.hideCompletion();
};
