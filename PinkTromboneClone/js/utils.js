export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function remap(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin || 1)) * (outMax - outMin);
}

export function formatHz(value) {
  return `${value.toFixed(0)} Hz`;
}

export function createNoiseBuffer(audioContext, length = 4096) {
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }
  return buffer;
}
