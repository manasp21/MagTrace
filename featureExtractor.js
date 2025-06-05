/**
 * Feature extraction module for MagTrace
 * Supports: mean, variance, max, min, FFT features
 */

export class FeatureExtractor {
  constructor() {
    this.features = {
      mean: this.calculateMean,
      variance: this.calculateVariance,
      max: this.calculateMax,
      min: this.calculateMin,
      fft: this.calculateFFT
    };
  }

  extractFeatures(segment, selectedFeatures) {
    const features = {};
    selectedFeatures.forEach(feature => {
      if (this.features[feature]) {
        features[feature] = this.features[feature](segment);
      }
    });
    return features;
  }

  calculateMean(segment) {
    return segment.reduce((sum, val) => sum + val, 0) / segment.length;
  }

  calculateVariance(segment) {
    const mean = this.calculateMean(segment);
    return segment.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / segment.length;
  }

  calculateMax(segment) {
    return Math.max(...segment);
  }

  calculateMin(segment) {
    return Math.min(...segment);
  }

  calculateFFT(segment) {
    // Simple FFT magnitude calculation (placeholder for actual implementation)
    const real = [...segment];
    const imag = new Array(segment.length).fill(0);
    // Actual FFT implementation would go here
    return Math.sqrt(real[0] ** 2 + imag[0] ** 2); // Return first magnitude
  }

  // Data augmentation methods
  addGaussianNoise(segment, noiseLevel = 0.1) {
    return segment.map(value => {
      const noise = noiseLevel * (2 * Math.random() - 1);
      return value + noise;
    });
  }

  timeShift(segment, shiftAmount) {
    const shifted = [...segment];
    for (let i = 0; i < Math.abs(shiftAmount); i++) {
      if (shiftAmount > 0) shifted.unshift(shifted.pop());
      else shifted.push(shifted.shift());
    }
    return shifted;
  }
}
