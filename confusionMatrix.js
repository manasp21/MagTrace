/**
 * Visualizes confusion matrix using Chart.js
 */
class ConfusionMatrix {
  /**
   * Render confusion matrix
   * @param {HTMLElement} container - DOM element to render in
   * @param {Object} matrix - Confusion matrix object
   * @param {Array} classes - Class labels
   */
  render(container, matrix, classes) {
    // Clear container
    container.innerHTML = '';

    // Create canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Prepare data for Chart.js
    const data = {
      labels: classes,
      datasets: [{
        label: 'Confusion Matrix',
        data: this._matrixToArray(matrix, classes),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    // Create chart
    new Chart(canvas, {
      type: 'matrix',
      data: data,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Predicted'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Actual'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Actual: ${classes[context.row]}, Predicted: ${classes[context.column]}, Count: ${context.dataset.data[context.dataIndex].v}`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Convert matrix object to array format for Chart.js
   * @private
   */
  _matrixToArray(matrix, classes) {
    const result = [];
    for (let i = 0; i < classes.length; i++) {
      for (let j = 0; j < classes.length; j++) {
        result.push({
          x: classes[j],  // Predicted
          y: classes[i],  // Actual
          v: matrix[classes[i]][classes[j]] || 0
        });
      }
    }
    return result;
  }
}

module.exports = ConfusionMatrix;