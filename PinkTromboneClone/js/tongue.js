export class Tongue {
  constructor() {
    this.x = 0.3;
    this.y = 0.45;
    this.dragging = false;
  }

  reset() {
    this.x = 0.3;
    this.y = 0.45;
    this.dragging = false;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  getState() {
    return { x: this.x, y: this.y };
  }
}
