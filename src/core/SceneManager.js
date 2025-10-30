export class SceneManager {
  constructor(engine) {
    this.engine = engine;
    this.current = null;
  }

  set(sceneInstance) {
    if (this.current && this.current.dispose) {
      this.current.dispose();
    }
    this.current = sceneInstance;
    if (this.current && this.current.start) {
      this.current.start();
    }
  }

  update(dt) {
    if (this.current && this.current.update) {
      this.current.update(dt);
    }
  }
}
