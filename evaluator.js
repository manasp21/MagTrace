/**
 * Calculates model performance metrics
 */
export class Evaluator {
  /**
   * Calculate accuracy
   * @param {Array} trueLabels 
   * @param {Array} predLabels 
   * @returns {number} Accuracy score
   */
  accuracy(trueLabels, predLabels) {
    let correct = 0;
    for (let i = 0; i < trueLabels.length; i++) {
      if (trueLabels[i] === predLabels[i]) correct++;
    }
    return correct / trueLabels.length;
  }

  /**
   * Calculate precision
   * @param {Array} trueLabels 
   * @param {Array} predLabels 
   * @param {string} label 
   * @returns {number} Precision score
   */
  precision(trueLabels, predLabels, label) {
    let truePositives = 0;
    let falsePositives = 0;
    
    for (let i = 0; i < trueLabels.length; i++) {
      if (predLabels[i] === label) {
        if (trueLabels[i] === label) truePositives++;
        else falsePositives++;
      }
    }
    
    return truePositives / (truePositives + falsePositives);
  }

  /**
   * Calculate recall
   * @param {Array} trueLabels 
   * @param {Array} predLabels 
   * @param {string} label 
   * @returns {number} Recall score
   */
  recall(trueLabels, predLabels, label) {
    let truePositives = 0;
    let falseNegatives = 0;
    
    for (let i = 0; i < trueLabels.length; i++) {
      if (trueLabels[i] === label) {
        if (predLabels[i] === label) truePositives++;
        else falseNegatives++;
      }
    }
    
    return truePositives / (truePositives + falseNegatives);
  }

  /**
   * Calculate F1-score
   * @param {number} precision 
   * @param {number} recall 
   * @returns {number} F1-score
   */
  f1Score(precision, recall) {
    return 2 * (precision * recall) / (precision + recall);
  }

  /**
   * Generate confusion matrix
   * @param {Array} trueLabels 
   * @param {Array} predLabels 
   * @param {Array} classes 
   * @returns {Object} Confusion matrix
   */
  confusionMatrix(trueLabels, predLabels, classes) {
    const matrix = {};
    classes.forEach(cls => {
      matrix[cls] = classes.reduce((acc, c) => {
        acc[c] = 0;
        return acc;
      }, {});
    });

    for (let i = 0; i < trueLabels.length; i++) {
      const trueLabel = trueLabels[i];
      const predLabel = predLabels[i];
      matrix[trueLabel][predLabel]++;
    }

    return matrix;
  }
}
