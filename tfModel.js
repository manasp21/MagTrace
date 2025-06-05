/**
 * TensorFlow.js model implementation for MagTrace
 */

import * as tf from '@tensorflow/tfjs';

class TFModel {
  constructor(inputShape, numClasses) {
    this.model = this.createModel(inputShape, numClasses);
    this.compiled = false;
  }

  createModel(inputShape, numClasses, hyperparams = {}) {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      units: hyperparams.hiddenUnits || 16,
      activation: 'relu',
      inputShape: [inputShape]
    }));
    
    // Hidden layers
    const hiddenLayers = hyperparams.hiddenLayers || 1;
    for (let i = 1; i < hiddenLayers; i++) {
      model.add(tf.layers.dense({
        units: hyperparams.hiddenUnits || 16,
        activation: 'relu'
      }));
    }
    
    // Output layer
    model.add(tf.layers.dense({
      units: numClasses,
      activation: 'softmax'
    }));
    
    return model;
  }

  compile(learningRate = 0.001) {
    this.model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    this.compiled = true;
  }

  async train(xTrain, yTrain, epochs = 10, batchSize = 32, progressCallback) {
    if (!this.compiled) this.compile();
    
    const xs = tf.tensor2d(xTrain);
    const ys = tf.oneHot(tf.tensor1d(yTrain, 'int32'), this.model.layers[this.model.layers.length-1].units);
    
    await this.model.fit(xs, ys, {
      epochs,
      batchSize,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (progressCallback) {
            const progress = Math.min(100, Math.round((epoch + 1) / epochs * 100));
            progressCallback(progress, logs);
          }
        }
      }
    });
  }

  predict(features) {
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input);
    return prediction.arraySync()[0];
  }
  
  // Note: Removed file system operations since they are Node.js-specific
  // and not compatible with browser environments
}
