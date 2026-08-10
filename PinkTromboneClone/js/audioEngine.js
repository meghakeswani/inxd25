import { clamp } from './utils.js';
import { Glottis } from './glottis.js';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.gainNode = null;
    this.filter = null;
    this.scriptNode = null;
    this.glottis = new Glottis();
    this.isRunning = false;
    this.sampleCursor = 0;
    this.waveform = new Float32Array(512);
    this.formants = [500, 1450, 2500];
    this.params = {
      pitch: 140,
      voice: 0.82,
      tenseness: 0.45,
      breathiness: 0.24,
      volume: 0.55,
      vibrato: 0.16,
      noise: 0.14,
      resonance: 0.62,
    };
  }

  init() {
    if (this.audioContext) {
      return;
    }

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.0001;
    this.masterGain.connect(this.audioContext.destination);

    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.masterGain);

    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 1200;
    this.filter.Q.value = 0.8;
    this.filter.connect(this.gainNode);

    this.scriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.scriptNode.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i += 1) {
        output[i] = this.generateSample();
        this.waveform[this.sampleCursor % this.waveform.length] = output[i];
        this.sampleCursor += 1;
      }
    };
    this.scriptNode.connect(this.filter);

    this.isRunning = true;
  }

  generateSample() {
    const dt = 1 / this.audioContext.sampleRate;
    this.glottis.update(this.params, dt * 220);
    const pulse = this.glottis.getPulseShape();
    const aspiration = (Math.random() * 2 - 1) * this.params.breathiness * 0.14;
    const fricative = (Math.random() * 2 - 1) * this.params.noise * 0.28;
    const resonance = this.formants.reduce((sum, formant, index) => {
      const phase = ((this.sampleCursor + index * 13) / this.audioContext.sampleRate) * Math.PI * 2 * formant;
      return sum + Math.sin(phase) * 0.04;
    }, 0);

    const sample = pulse * (0.65 + this.params.voice * 0.35) + aspiration + fricative + resonance * this.params.resonance;
    return clamp(sample * this.params.volume * 0.8, -1, 1);
  }

  start() {
    this.init();
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.masterGain.gain.setTargetAtTime(0.001, this.audioContext.currentTime, 0.02);
  }

  stop() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.masterGain.gain.setTargetAtTime(0.0001, this.audioContext.currentTime, 0.05);
    }
  }

  setParams(params) {
    this.params = { ...this.params, ...params };
  }

  renderFrame() {
    if (!this.isRunning || !this.audioContext) {
      return;
    }

    this.gainNode.gain.setValueAtTime(this.params.volume * 0.42, this.audioContext.currentTime);
    this.filter.frequency.setTargetAtTime(650 + this.params.pitch * 1.5, this.audioContext.currentTime, 0.02);
    this.filter.Q.setTargetAtTime(0.4 + this.params.noise * 0.7, this.audioContext.currentTime, 0.02);
  }
}
