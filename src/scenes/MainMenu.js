export class MainMenu {
  constructor(engine, hud, sceneManager, factories){
    this.engine = engine; this.hud = hud; this.sceneManager = sceneManager; this.factories = factories;
  }
  start(){
    this.hud.setTitle('Fire Safety Training');
    this.hud.setObjective('Select a module: Click to start Module 1');
    this.clickHandler = ()=> this.onClick();
    document.addEventListener('click', this.clickHandler);
  }
  onClick(){
    this.factories.startModule(1);
  }
  update(){}
  dispose(){ document.removeEventListener('click', this.clickHandler); }
}
