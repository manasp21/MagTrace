/**
 * ML Training pipeline for MagTrace
 * Supports k-NN and TensorFlow.js models
 */

const FeatureExtractor = require('./featureExtractor');
const tf = require('@tensorflow/tfjs');
const fs = require('fs');

class MLTrainer {
  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.model = null;
    this.trainingData = null;
    this.trainingLabels = null;
    this.trainingProgressCallback = () => {};
    this.modelType = null;
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
      // TensorFlow.js implementation
      this.model = this.createTFModel(hyperparams);
      
      // Prepare tensors
      const xs = tf.tensor2d(this.trainingData);
      const ys = tf.oneHot(tf.tensor1d(this.trainingLabels, 'int32'), hyperparams.numClasses);
      
      // Train model
      await this.model.fit(xs, ys, {
        epochs: hyperparams.epochs || 10,
        batchSize: hyperparams.batchSize || 32,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress = Math.min(100, Math.round((epoch + 1) / hyperparams.epochs * 100));
            this.trainingProgressCallback(progress, logs);
          }
        }
      });
      
      return this.model;
    }
  }

  createTFModel(hyperparams) {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: hyperparams.hiddenUnits || 16,
      activation: 'relu',
      inputShape: [this.trainingData[0].length]
    }));
    
    if (hyperparams.hiddenLayers > 1) {
      for (let i = 1; i < hyperparams.hiddenLayers; i++) {
        model.add(tf.layers.dense({
          units: hyperparams.hiddenUnits || 16,
          activation: 'relu'
        }));
      }
    }
    
    model.add(tf.layers.dense({
      units: hyperparams.numClasses,
      activation: 'softmax'
    }));
    
    model.compile({
      optimizer: tf.train.adam(hyperparams.learningRate || 0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  saveModel(filePath) {
    if (!this.model) throw new Error('No model trained');
    
    if (this.modelType === 'knn') {
      const modelData = JSON.stringify(this.model);
      fs.writeFileSync(filePath, modelData);
    } 
    else if (this.modelType === 'tf') {
      this.model.save(`file://${filePath}`);
    }
  }

  loadModel(filePath, modelType) {
    this.modelType = modelType;
    
    if (modelType === 'knn') {
      const modelData = fs.readFileSync(filePath, 'utf8');
      this.model = JSON.parse(modelData);
    } 
    else if (modelType === 'tf') {
      this.model = tf.loadLayersModel(`file://${filePath}/model.json`);
    }
  }
}

module.exports = MLTrainer;