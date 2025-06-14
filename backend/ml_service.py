import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
from datetime import datetime
from .models import Dataset, MagnetometerReading, Label, MLModel


class MLService:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model = None
        
    def prepare_features(self, data):
        """
        Extract features from magnetometer data for ML training
        """
        features = []
        
        for reading in data:
            # Basic magnetic field components
            b_x, b_y, b_z = reading.b_x, reading.b_y, reading.b_z
            
            # Magnitude
            magnitude = np.sqrt(b_x**2 + b_y**2 + b_z**2)
            
            # Normalized components
            b_x_norm = b_x / magnitude if magnitude > 0 else 0
            b_y_norm = b_y / magnitude if magnitude > 0 else 0
            b_z_norm = b_z / magnitude if magnitude > 0 else 0
            
            # Angular features
            inclination = np.arctan2(b_z, np.sqrt(b_x**2 + b_y**2))
            declination = np.arctan2(b_y, b_x)
            
            # Orientation features
            theta_x, theta_y, theta_z = reading.thetax, reading.thetay, reading.thetaz
            
            # Combine all features
            feature_vector = [
                b_x, b_y, b_z,                    # Raw components
                magnitude,                         # Magnitude
                b_x_norm, b_y_norm, b_z_norm,     # Normalized components
                inclination, declination,          # Angular features
                theta_x, theta_y, theta_z,         # Orientation
                reading.lat, reading.lon,          # Location
                reading.altitude                   # Altitude
            ]
            
            features.append(feature_vector)
            
        return np.array(features)
    
    def create_time_series_features(self, data, window_size=10):
        """
        Create time-series features using sliding windows
        """
        features = self.prepare_features(data)
        
        if len(features) < window_size:
            return features
        
        windowed_features = []
        
        for i in range(window_size, len(features)):
            window = features[i-window_size:i]
            
            # Statistical features over the window
            window_mean = np.mean(window, axis=0)
            window_std = np.std(window, axis=0)
            window_min = np.min(window, axis=0)
            window_max = np.max(window, axis=0)
            
            # Trend features (difference between current and window average)
            current_features = features[i]
            trend = current_features - window_mean
            
            # Combine all window features
            combined_features = np.concatenate([
                current_features,
                window_mean,
                window_std,
                window_min,
                window_max,
                trend
            ])
            
            windowed_features.append(combined_features)
            
        return np.array(windowed_features)
    
    def prepare_labels(self, dataset_id, data):
        """
        Prepare labels for training based on existing annotations
        """
        labels_qs = Label.objects.filter(dataset_id=dataset_id)
        data_labels = ['normal'] * len(data)
        
        for label in labels_qs:
            start_idx = max(0, label.start_index)
            end_idx = min(len(data) - 1, label.end_index)
            
            for i in range(start_idx, end_idx + 1):
                data_labels[i] = label.label_type
                
        return data_labels
    
    def build_anomaly_detection_model(self, input_shape):
        """
        Build an autoencoder for anomaly detection
        """
        model = tf.keras.Sequential([
            # Encoder
            tf.keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            
            # Bottleneck
            tf.keras.layers.Dense(8, activation='relu'),
            
            # Decoder
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(input_shape, activation='linear')
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def build_classification_model(self, input_shape, num_classes):
        """
        Build a classification model for labeled data
        """
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(input_shape,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train_model(self, dataset_id, model_type='anomaly_detection', parameters=None):
        """
        Train a model on the given dataset
        """
        if parameters is None:
            parameters = {
                'epochs': 100,
                'batch_size': 32,
                'validation_split': 0.2,
                'learning_rate': 0.001
            }
        
        # Load data
        dataset = Dataset.objects.get(id=dataset_id)
        readings = list(dataset.readings.all().order_by('timestamp_pc'))
        
        if len(readings) == 0:
            raise ValueError("No data found in dataset")
        
        # Prepare features
        if parameters.get('use_time_series', True):
            features = self.create_time_series_features(readings)
            # Adjust readings for windowed features
            window_size = 10
            readings = readings[window_size:]
        else:
            features = self.prepare_features(readings)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        if model_type == 'anomaly_detection':
            # For anomaly detection, we only use normal data for training
            labels = self.prepare_labels(dataset_id, readings)
            normal_indices = [i for i, label in enumerate(labels) if label == 'normal']
            
            if len(normal_indices) == 0:
                # If no labels exist, assume all data is normal for initial training
                training_features = features_scaled
            else:
                training_features = features_scaled[normal_indices]
            
            # Build and train autoencoder
            model = self.build_anomaly_detection_model(features_scaled.shape[1])
            
            history = model.fit(
                training_features,
                training_features,
                epochs=parameters['epochs'],
                batch_size=parameters['batch_size'],
                validation_split=parameters['validation_split'],
                verbose=0
            )
            
            # Calculate threshold for anomaly detection
            predictions = model.predict(training_features)
            mse = np.mean(np.square(training_features - predictions), axis=1)
            threshold = np.percentile(mse, 95)  # 95th percentile as threshold
            
            metrics = {
                'threshold': float(threshold),
                'final_loss': float(history.history['loss'][-1]),
                'final_val_loss': float(history.history['val_loss'][-1])
            }
            
        elif model_type == 'classification':
            # For classification, we need labeled data
            labels = self.prepare_labels(dataset_id, readings)
            
            # Encode labels
            labels_encoded = self.label_encoder.fit_transform(labels)
            
            # Check if we have enough labeled data
            unique_labels = np.unique(labels_encoded)
            if len(unique_labels) < 2:
                raise ValueError("Need at least 2 different label types for classification")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                features_scaled, labels_encoded,
                test_size=parameters['validation_split'],
                random_state=42,
                stratify=labels_encoded
            )
            
            # Build and train classifier
            model = self.build_classification_model(
                features_scaled.shape[1],
                len(unique_labels)
            )
            
            history = model.fit(
                X_train, y_train,
                epochs=parameters['epochs'],
                batch_size=parameters['batch_size'],
                validation_data=(X_test, y_test),
                verbose=0
            )
            
            # Calculate metrics
            y_pred = np.argmax(model.predict(X_test), axis=1)
            
            metrics = {
                'accuracy': float(accuracy_score(y_test, y_pred)),
                'precision': float(precision_score(y_test, y_pred, average='weighted')),
                'recall': float(recall_score(y_test, y_pred, average='weighted')),
                'f1_score': float(f1_score(y_test, y_pred, average='weighted')),
                'final_loss': float(history.history['loss'][-1]),
                'final_val_loss': float(history.history['val_loss'][-1])
            }
        
        # Save model and preprocessing objects
        model_dir = f'media/models/{dataset.name}_{model_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        os.makedirs(model_dir, exist_ok=True)
        
        model.save(os.path.join(model_dir, 'model.h5'))
        joblib.dump(self.scaler, os.path.join(model_dir, 'scaler.pkl'))
        
        if model_type == 'classification':
            joblib.dump(self.label_encoder, os.path.join(model_dir, 'label_encoder.pkl'))
        
        return model, metrics, model_dir
    
    def load_model(self, model_path):
        """
        Load a trained model and its preprocessing objects
        """
        self.model = tf.keras.models.load_model(os.path.join(model_path, 'model.h5'))
        self.scaler = joblib.load(os.path.join(model_path, 'scaler.pkl'))
        
        label_encoder_path = os.path.join(model_path, 'label_encoder.pkl')
        if os.path.exists(label_encoder_path):
            self.label_encoder = joblib.load(label_encoder_path)
    
    def predict(self, data, model_type='anomaly_detection', threshold=None):
        """
        Make predictions on new data
        """
        if self.model is None:
            raise ValueError("No model loaded")
        
        # Prepare features
        features = self.prepare_features(data)
        features_scaled = self.scaler.transform(features)
        
        if model_type == 'anomaly_detection':
            # Predict using autoencoder
            predictions = self.model.predict(features_scaled)
            mse = np.mean(np.square(features_scaled - predictions), axis=1)
            
            if threshold is None:
                threshold = np.percentile(mse, 95)
            
            # Classify as anomaly if reconstruction error > threshold
            anomaly_predictions = ['anomaly' if error > threshold else 'normal' for error in mse]
            confidence_scores = mse / np.max(mse)  # Normalize to 0-1
            
            return anomaly_predictions, confidence_scores.tolist()
        
        elif model_type == 'classification':
            # Predict using classifier
            predictions = self.model.predict(features_scaled)
            predicted_classes = np.argmax(predictions, axis=1)
            
            # Decode labels
            predicted_labels = self.label_encoder.inverse_transform(predicted_classes)
            confidence_scores = np.max(predictions, axis=1)
            
            return predicted_labels.tolist(), confidence_scores.tolist()
    
    def generate_active_learning_suggestions(self, dataset_id, model_type='anomaly_detection', num_suggestions=10):
        """
        Generate suggestions for active learning
        """
        dataset = Dataset.objects.get(id=dataset_id)
        readings = list(dataset.readings.all().order_by('timestamp_pc'))
        
        if len(readings) == 0:
            return []
        
        # Get existing labels
        existing_labels = set()
        for label in Label.objects.filter(dataset_id=dataset_id):
            for i in range(label.start_index, label.end_index + 1):
                existing_labels.add(i)
        
        # Prepare features for unlabeled data
        unlabeled_indices = [i for i in range(len(readings)) if i not in existing_labels]
        
        if len(unlabeled_indices) == 0:
            return []
        
        unlabeled_data = [readings[i] for i in unlabeled_indices]
        
        # Make predictions
        predictions, confidence_scores = self.predict(unlabeled_data, model_type)
        
        # Select uncertain predictions for suggestions
        suggestions = []
        
        if model_type == 'anomaly_detection':
            # Suggest points with medium confidence (uncertain predictions)
            for i, (pred, conf) in enumerate(zip(predictions, confidence_scores)):
                if 0.3 < conf < 0.7:  # Uncertain range
                    suggestions.append({
                        'index': unlabeled_indices[i],
                        'suggestion': pred,
                        'confidence': conf
                    })
        
        elif model_type == 'classification':
            # Suggest points with low confidence
            for i, (pred, conf) in enumerate(zip(predictions, confidence_scores)):
                if conf < 0.8:  # Low confidence
                    suggestions.append({
                        'index': unlabeled_indices[i],
                        'suggestion': pred,
                        'confidence': conf
                    })
        
        # Sort by confidence (ascending for classification, middle values for anomaly detection)
        if model_type == 'classification':
            suggestions.sort(key=lambda x: x['confidence'])
        else:
            suggestions.sort(key=lambda x: abs(x['confidence'] - 0.5))
        
        return suggestions[:num_suggestions]


ml_service = MLService()