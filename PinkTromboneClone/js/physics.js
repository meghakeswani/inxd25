export function computeReflection(previousArea, nextArea) {
  const sum = previousArea + nextArea + 1e-4;
  return clamp((nextArea - previousArea) / sum, -0.95, 0.95);
}

export function dampen(value, amount) {
  return value * (1 - amount);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
