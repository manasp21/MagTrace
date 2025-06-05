/**
 * ML Training pipeline for MagTrace
 * Updated to use backend training API
 */

import { API_BASE_URL } from './apiService.js';

export class MLTrainer {
  constructor() {
    console.log("[ML] MLTrainer initialized");
    this.trainingProgressCallback = () => {};
  }

  setProgressCallback(callback) {
    this.trainingProgressCallback = callback;
  }

  async trainModel(modelId) {
    this.trainingProgressCallback('Training started...');
    console.log(`[ML] Starting training for model ${modelId}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/models/train`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ model_id: modelId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Training failed');
      }
      
      const result = await response.json();
      if (result.status === 'success') {
        this.trainingProgressCallback('Training completed!');
        console.log(`[ML] Training completed for model ${modelId}`);
        
        // Save the new model version
        if (window.modelManager) {
          window.modelManager.saveModelVersion(modelId, result.model_path);
        } else {
          console.error("[ML] modelManager not found");
        }
        return result;
      } else {
        throw new Error(result.error || 'Training failed');
      }
    } catch (error) {
      const errorMsg = `Error: ${error.message}`;
      this.trainingProgressCallback(errorMsg);
      console.error("[ML] Training error:", error);
      throw error;
    }
  }
}
