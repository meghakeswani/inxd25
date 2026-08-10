export class Glottis {
  constructor() {
    this.phase = 0;
    this.aperture = 0.22;
    this.vibrato = 0;
  }

  reset() {
    this.phase = 0;
    this.aperture = 0.22;
    this.vibrato = 0;
  }

  update(params, deltaTime) {
    this.aperture = 0.14 + (1 - params.tenseness) * 0.42 + params.breathiness * 0.16;
    this.vibrato = params.vibrato * 0.04;
    this.phase += deltaTime * (params.pitch / 90) * (1 + this.vibrato);
    if (this.phase > Math.PI * 2) {
      this.phase -= Math.PI * 2;
    }
  }

  getPulseShape() {
    const pulse = Math.sin(this.phase);
    const harmonic = Math.sin(this.phase * 2) * 0.2;
    return (pulse + harmonic) * 0.5;
  }
}
