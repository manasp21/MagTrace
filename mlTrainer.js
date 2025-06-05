/**
 * ML Training pipeline for MagTrace
 * Supports k-NN and TensorFlow.js models
 */

import * as tf from '@tensorflow/tfjs';
import { FeatureExtractor } from './featureExtractor.js';
import { TFModel } from './tfModel.js';

export class MLTrainer {
  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.model = null;
    this.trainingData = null;
    this.trainingLabels = null;
    this.trainingProgressCallback = () => {};
    this.modelType = null;
    this.tfModel = null;
  }

  setProgressCallback(callback) {
    this.trainingProgressCallback = callback;
  }

  prepareData(segments, labels, selectedFeatures, augmentationOptions = {}) {
    // Extract features
    const features = segments.map(segment =>
      this.featureExtractor.extractFeatures(segment, selectedFeatures)
    );
    
    // Convert to array of arrays
    const featureVectors = features.map(feat => Object.values(feat));
    
    // Apply augmentation
    if (augmentationOptions.enabled) {
      const augmented = this.augmentData(segments, labels, augmentationOptions);
      const augFeatures = augmented.segments.map(segment =>
        this.featureExtractor.extractFeatures(segment, selectedFeatures)
      );
      const augVectors = augFeatures.map(feat => Object.values(feat));
      
      return {
        features: [...featureVectors, ...augVectors],
        labels: [...labels, ...augmented.labels]
      };
    }
    
    return {
      features: featureVectors,
      labels: labels
    };
  }

  augmentData(segments, labels, options) {
    const augmentedSegments = [];
    const augmentedLabels = [];
    
    segments.forEach((segment, i) => {
      // Original segment
      augmentedSegments.push(segment);
      augmentedLabels.push(labels[i]);
      
      // Add noise
      if (options.noiseLevel > 0) {
        const noisySegment = this.featureExtractor.addGaussianNoise(segment, options.noiseLevel);
        augmentedSegments.push(noisySegment);
        augmentedLabels.push(labels[i]);
      }
      
      // Time shift
      if (options.shiftAmount !== 0) {
        const shiftedSegment = this.featureExtractor.timeShift(segment, options.shiftAmount);
        augmentedSegments.push(shiftedSegment);
        augmentedLabels.push(labels[i]);
      }
    });
    
    return {
      segments: augmentedSegments,
      labels: augmentedLabels
    };
  }

  async trainModel(modelType, data, hyperparams) {
    this.modelType = modelType;
    this.trainingData = data.features;
    this.trainingLabels = data.labels;
    
    if (modelType === 'knn') {
      // k-NN implementation
      this.model = {
        type: 'knn',
        k: hyperparams.k || 3,
        data: this.trainingData,
        labels: this.trainingLabels
      };
      this.trainingProgressCallback(100);
      return this.model;
    }
    else if (modelType === 'tf') {
      // Create and train TensorFlow model
      this.tfModel = new TFModel();
      this.tfModel.createModel(
        this.trainingData[0].length,
        hyperparams.numClasses,
        hyperparams
      );
      this.tfModel.compile(hyperparams.learningRate || 0.001);

      await this.tfModel.train(
        this.trainingData,
        this.trainingLabels,
        hyperparams.epochs || 10,
        hyperparams.batchSize || 32,
        (progress, logs) => {
          this.trainingProgressCallback(progress, logs);
        }
      );

      return this.tfModel;
    }
  }
}
