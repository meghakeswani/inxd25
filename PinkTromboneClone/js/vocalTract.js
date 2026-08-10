import { clamp, lerp } from './utils.js';
import { computeReflection } from './physics.js';

export class VocalTract {
  constructor() {
    this.segments = [];
    this.length = 0.72;
    this.oralOpening = 0.28;
    this.nasalOpening = 0.12;
    this.lips = 0.16;
    this.velum = 0.12;
    this.tongueHeight = 0.42;
    this.tongueAdvance = 0.32;
    this.tongueStiffness = 0.2;
    this.reset();
  }

  reset() {
    const count = 36;
    this.segments = [];
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const baseDiameter = lerp(0.18, 0.08, t * 0.6) + (i < count / 2 ? 0.02 : -0.01);
      const diameter = baseDiameter + Math.sin(t * Math.PI * 2) * 0.01;
      this.segments.push({
        diameter,
        pressure: 0,
        reflection: 0,
        wave: 0,
        history: 0,
      });
    }
  }

  setTongue(x, y) {
    this.tongueAdvance = clamp(x, -0.35, 0.55);
    this.tongueHeight = clamp(y, 0.1, 0.9);
  }

  update(deltaTime, params) {
    this.length = 0.46 + params.tractLength * 0.5;
    this.tongueStiffness = params.tongueStiffness;
    this.lips = 0.08 + (1 - params.voice) * 0.08;
    this.velum = 0.15 + (1 - params.voice) * 0.06;
    this.oralOpening = 0.16 + (1 - params.voice) * 0.16 + this.tongueHeight * 0.03;
    this.nasalOpening = 0.06 + this.tongueHeight * 0.02 + (1 - params.voice) * 0.03;

    const count = this.segments.length;
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const tongueInfluence = Math.max(0, 1 - Math.abs(t - (0.38 + this.tongueAdvance * 0.22)) / 0.18);
      const heightFactor = this.tongueHeight * 0.55;
      const area = 0.004 + (1 - t * this.length) * 0.0012 + tongueInfluence * 0.0009 + heightFactor * 0.00025;
      const diameter = Math.sqrt(area / Math.PI) * 2.2;
      this.segments[i].diameter = lerp(this.segments[i].diameter, diameter, 0.15 + this.tongueStiffness * 0.18);
      this.segments[i].reflection = computeReflection(
        i > 0 ? this.segments[i - 1].diameter : this.segments[i].diameter,
        i < count - 1 ? this.segments[i + 1].diameter : this.segments[i].diameter,
      );
      this.segments[i].pressure = this.segments[i].pressure * (1 - deltaTime * 0.75) + this.segments[i].reflection * 0.0003;
    }
  }

  getGeometry() {
    const points = [];
    const count = this.segments.length;
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const baseY = 280 + t * 120;
      const xShift = (this.tongueAdvance * 18) + (this.tongueHeight - 0.5) * 16;
      const offset = (this.segments[i].diameter - 0.08) * 120;
      points.push({
        x: 170 + t * 240 + xShift,
        y: baseY - offset * 0.6,
      });
    }
    return points;
  }
}
