import os
import sys
import subprocess
import tempfile
import importlib.util
import traceback
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import numpy as np

# Try TensorFlow import
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


class UserScriptService:
    """
    Service for executing user-defined Python scripts for model training
    """
    
    def __init__(self):
        self.tf_available = TF_AVAILABLE
        self.safe_imports = {
            'tensorflow', 'tf', 'keras',
            'numpy', 'np',
            'pandas', 'pd', 
            'matplotlib', 'plt',
            'sklearn', 'scikit-learn',
            'scipy',
            'math', 'random', 'json', 'datetime',
            'os', 'sys'  # Limited access
        }
    
    def validate_script(self, script_content: str) -> Tuple[bool, str]:
        """
        Validate user script for safety and syntax
        """
        try:
            # Basic syntax check
            compile(script_content, '<string>', 'exec')
            
            # Check for dangerous imports/operations
            dangerous_patterns = [
                'import subprocess',
                'import os.system',
                'exec(',
                'eval(',
                '__import__',
                'open(',  # File access
                'file(',
                'input(',  # User input
                'raw_input(',
            ]
            
            for pattern in dangerous_patterns:
                if pattern in script_content:
                    return False, f"Potentially unsafe operation detected: {pattern}"
            
            return True, "Script validation passed"
            
        except SyntaxError as e:
            return False, f"Syntax error: {str(e)}"
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def create_model_template(self, model_type: str) -> str:
        """
        Generate template script for different model types
        """
        if not self.tf_available:
            return self._create_sklearn_template(model_type)
        
        templates = {
            'classification': self._create_classification_template(),
            'regression': self._create_regression_template(),
            'autoencoder': self._create_autoencoder_template(),
            'sequence_prediction': self._create_sequence_template(),
            'transformer': self._create_transformer_template(),
            'custom_tensorflow': self._create_custom_template()
        }
        
        return templates.get(model_type, self._create_custom_template())
    
    def _create_classification_template(self) -> str:
        return '''
import tensorflow as tf
import numpy as np
from tensorflow.keras import layers, models

def create_model(input_shape, num_classes, hyperparameters):
    """
    Create a classification model for magnetic field data
    
    Args:
        input_shape: Shape of input data (e.g., [100, 15] for 100 timesteps, 15 features)
        num_classes: Number of output classes
        hyperparameters: Dict with model configuration
    
    Returns:
        tf.keras.Model: Compiled model
    """
    
    # Extract hyperparameters with defaults
    learning_rate = hyperparameters.get('learning_rate', 0.001)
    dropout_rate = hyperparameters.get('dropout_rate', 0.2)
    hidden_units = hyperparameters.get('hidden_units', [128, 64, 32])
    
    # Build model
    model = models.Sequential([
        layers.Input(shape=input_shape),
        layers.Flatten(),
    ])
    
    # Add hidden layers
    for units in hidden_units:
        model.add(layers.Dense(units, activation='relu'))
        model.add(layers.Dropout(dropout_rate))
    
    # Output layer
    model.add(layers.Dense(num_classes, activation='softmax'))
    
    # Compile model
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def preprocess_data(data, labels, hyperparameters):
    """
    Preprocess magnetic field data for training
    
    Args:
        data: Raw magnetometer readings
        labels: Corresponding labels
        hyperparameters: Preprocessing configuration
    
    Returns:
        Tuple[np.ndarray, np.ndarray]: Processed features and labels
    """
    
    # Convert to numpy arrays
    features = np.array(data)
    labels = np.array(labels)
    
    # Normalize features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    features = scaler.fit_transform(features)
    
    return features, labels

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """
    Train the model with given data
    
    Args:
        model: tf.keras.Model to train
        train_data, train_labels: Training data
        val_data, val_labels: Validation data
        training_config: Training configuration
    
    Returns:
        History object from training
    """
    
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=training_config.get('patience', 10),
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7
        )
    ]
    
    # Train model
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )
    
    return history
'''
    
    def _create_autoencoder_template(self) -> str:
        return '''
import tensorflow as tf
import numpy as np
from tensorflow.keras import layers, models

def create_model(input_shape, output_shape, hyperparameters):
    """
    Create an autoencoder for magnetic field anomaly detection
    """
    
    # Hyperparameters
    encoding_dim = hyperparameters.get('encoding_dim', 32)
    learning_rate = hyperparameters.get('learning_rate', 0.001)
    
    # Encoder
    encoder_input = layers.Input(shape=input_shape)
    encoded = layers.Dense(128, activation='relu')(encoder_input)
    encoded = layers.Dense(64, activation='relu')(encoded)
    encoded = layers.Dense(encoding_dim, activation='relu')(encoded)
    
    # Decoder
    decoded = layers.Dense(64, activation='relu')(encoded)
    decoded = layers.Dense(128, activation='relu')(decoded)
    decoder_output = layers.Dense(input_shape[0], activation='linear')(decoded)
    
    # Autoencoder model
    autoencoder = models.Model(encoder_input, decoder_output)
    
    # Compile
    autoencoder.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='mse',
        metrics=['mae']
    )
    
    return autoencoder

def preprocess_data(data, labels, hyperparameters):
    """
    Preprocess data for autoencoder training
    """
    features = np.array(data)
    
    # For autoencoders, target is the same as input
    return features, features

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """
    Train autoencoder
    """
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_data,  # Autoencoder learns to reconstruct input
        validation_data=(val_data, val_data),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history
'''
    
    def _create_sequence_template(self) -> str:
        return '''
import tensorflow as tf
import numpy as np
from tensorflow.keras import layers, models

def create_model(input_shape, output_shape, hyperparameters):
    """
    Create LSTM model for sequence prediction
    """
    
    lstm_units = hyperparameters.get('lstm_units', [64, 32])
    dropout_rate = hyperparameters.get('dropout_rate', 0.2)
    learning_rate = hyperparameters.get('learning_rate', 0.001)
    
    model = models.Sequential([
        layers.Input(shape=input_shape),
    ])
    
    # LSTM layers
    for i, units in enumerate(lstm_units):
        return_sequences = i < len(lstm_units) - 1
        model.add(layers.LSTM(units, return_sequences=return_sequences, dropout=dropout_rate))
    
    # Output layer
    model.add(layers.Dense(output_shape[0], activation='linear'))
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='mse',
        metrics=['mae']
    )
    
    return model

def preprocess_data(data, labels, hyperparameters):
    """
    Create sequences for LSTM training
    """
    sequence_length = hyperparameters.get('sequence_length', 50)
    
    features = np.array(data)
    
    # Create sequences
    X, y = [], []
    for i in range(len(features) - sequence_length):
        X.append(features[i:(i + sequence_length)])
        y.append(features[i + sequence_length])
    
    return np.array(X), np.array(y)

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """
    Train sequence prediction model
    """
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history
'''
    
    def _create_transformer_template(self) -> str:
        return '''
import tensorflow as tf
import numpy as np
from tensorflow.keras import layers, models

class TransformerBlock(layers.Layer):
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
        super(TransformerBlock, self).__init__()
        self.att = layers.MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim)
        self.ffn = tf.keras.Sequential([
            layers.Dense(ff_dim, activation="relu"),
            layers.Dense(embed_dim),
        ])
        self.layernorm1 = layers.LayerNormalization(epsilon=1e-6)
        self.layernorm2 = layers.LayerNormalization(epsilon=1e-6)
        self.dropout1 = layers.Dropout(rate)
        self.dropout2 = layers.Dropout(rate)

    def call(self, inputs, training):
        attn_output = self.att(inputs, inputs)
        attn_output = self.dropout1(attn_output, training=training)
        out1 = self.layernorm1(inputs + attn_output)
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output, training=training)
        return self.layernorm2(out1 + ffn_output)

def create_model(input_shape, output_shape, hyperparameters):
    """
    Create Transformer model for magnetic field analysis
    """
    
    embed_dim = hyperparameters.get('embed_dim', 64)
    num_heads = hyperparameters.get('num_heads', 4)
    ff_dim = hyperparameters.get('ff_dim', 128)
    num_layers = hyperparameters.get('num_layers', 2)
    
    inputs = layers.Input(shape=input_shape)
    
    # Position encoding could be added here
    x = inputs
    
    # Transformer blocks
    for _ in range(num_layers):
        x = TransformerBlock(embed_dim, num_heads, ff_dim)(x)
    
    # Global average pooling
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dropout(0.1)(x)
    
    # Output layer
    outputs = layers.Dense(output_shape[0], activation="softmax")(x)
    
    model = models.Model(inputs, outputs)
    
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    return model

def preprocess_data(data, labels, hyperparameters):
    """
    Preprocess data for transformer
    """
    features = np.array(data)
    labels = np.array(labels)
    
    return features, labels

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """
    Train transformer model
    """
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history
'''
    
    def _create_custom_template(self) -> str:
        return '''
import tensorflow as tf
import numpy as np
from tensorflow.keras import layers, models

def create_model(input_shape, output_shape, hyperparameters):
    """
    Create your custom TensorFlow model
    
    Args:
        input_shape: Shape of input data
        output_shape: Shape of output data  
        hyperparameters: Dictionary of hyperparameters
    
    Returns:
        tf.keras.Model: Your compiled model
    """
    
    # Example: Simple neural network
    model = models.Sequential([
        layers.Input(shape=input_shape),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(64, activation='relu'),
        layers.Dense(output_shape[0], activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def preprocess_data(data, labels, hyperparameters):
    """
    Preprocess your data for training
    
    Args:
        data: Raw magnetometer data
        labels: Corresponding labels
        hyperparameters: Preprocessing parameters
    
    Returns:
        Tuple[np.ndarray, np.ndarray]: Processed features and labels
    """
    
    # Convert to numpy arrays
    features = np.array(data)
    labels = np.array(labels)
    
    # Add your preprocessing here
    # Example: normalization
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    features = scaler.fit_transform(features)
    
    return features, labels

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """
    Train your model
    
    Args:
        model: tf.keras.Model to train
        train_data, train_labels: Training data
        val_data, val_labels: Validation data
        training_config: Training configuration
    
    Returns:
        History object from training
    """
    
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history

def predict(model, data, hyperparameters):
    """
    Make predictions with your trained model
    
    Args:
        model: Trained tf.keras.Model
        data: Input data for prediction
        hyperparameters: Any parameters needed for prediction
    
    Returns:
        np.ndarray: Model predictions
    """
    
    # Preprocess data if needed
    processed_data = np.array(data)
    
    # Make predictions
    predictions = model.predict(processed_data)
    
    return predictions
'''
    
    def _create_sklearn_template(self, model_type: str) -> str:
        return '''
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

def create_model(input_shape, output_shape, hyperparameters):
    """
    Create sklearn model (TensorFlow not available)
    """
    
    model_type = hyperparameters.get('model_type', 'classification')
    
    if model_type == 'classification':
        model = RandomForestClassifier(
            n_estimators=hyperparameters.get('n_estimators', 100),
            max_depth=hyperparameters.get('max_depth', 10),
            random_state=42
        )
    else:  # anomaly detection
        model = IsolationForest(
            contamination=hyperparameters.get('contamination', 0.1),
            random_state=42
        )
    
    return model

def preprocess_data(data, labels, hyperparameters):
    """
    Preprocess data for sklearn models
    """
    features = np.array(data)
    labels = np.array(labels) if labels is not None else None
    
    # Normalize features
    scaler = StandardScaler()
    features = scaler.fit_transform(features)
    
    return features, labels

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """
    Train sklearn model
    """
    model.fit(train_data, train_labels)
    
    # Simple validation
    if val_data is not None and val_labels is not None:
        val_pred = model.predict(val_data)
        accuracy = accuracy_score(val_labels, val_pred)
        print(f"Validation Accuracy: {accuracy:.4f}")
    
    return {"accuracy": accuracy if 'accuracy' in locals() else 0.0}
'''
    
    def execute_script(
        self, 
        script_content: str, 
        data: np.ndarray, 
        labels: Optional[np.ndarray],
        hyperparameters: Dict[str, Any],
        training_config: Dict[str, Any],
        function_name: str = 'create_model'
    ) -> Tuple[bool, Any, str]:
        """
        Safely execute user script in controlled environment
        """
        
        try:
            # Validate script first
            is_valid, message = self.validate_script(script_content)
            if not is_valid:
                return False, None, message
            
            # Create safe execution environment
            safe_globals = {
                '__builtins__': {
                    'len': len, 'range': range, 'enumerate': enumerate,
                    'zip': zip, 'map': map, 'filter': filter,
                    'abs': abs, 'min': max, 'max': max, 'sum': sum,
                    'print': print, 'str': str, 'int': int, 'float': float,
                    'list': list, 'dict': dict, 'tuple': tuple, 'set': set,
                    'bool': bool, 'type': type, 'isinstance': isinstance
                },
                'np': np,
                'numpy': np,
            }
            
            # Add TensorFlow if available
            if self.tf_available:
                safe_globals['tf'] = tf
                safe_globals['tensorflow'] = tf
            
            # Execute script
            exec(script_content, safe_globals)
            
            # Get the requested function
            if function_name not in safe_globals:
                return False, None, f"Function '{function_name}' not found in script"
            
            func = safe_globals[function_name]
            
            # Execute function based on type
            if function_name == 'create_model':
                input_shape = hyperparameters.get('input_shape', data.shape[1:])
                output_shape = hyperparameters.get('output_shape', [1])
                result = func(input_shape, output_shape, hyperparameters)
            elif function_name == 'preprocess_data':
                result = func(data, labels, hyperparameters)
            elif function_name == 'train_model':
                # This would be called with a model instance
                return True, None, "train_model function validated"
            else:
                result = func(data, hyperparameters)
            
            return True, result, "Script executed successfully"
            
        except Exception as e:
            error_msg = f"Script execution error: {str(e)}\n{traceback.format_exc()}"
            return False, None, error_msg
    
    def get_script_requirements(self, script_content: str) -> list:
        """
        Analyze script to determine required packages
        """
        requirements = []
        
        import_patterns = [
            'import tensorflow', 'import tf', 'from tensorflow',
            'import keras', 'from keras',
            'import numpy', 'import np', 'from numpy',
            'import pandas', 'import pd', 'from pandas',
            'import sklearn', 'from sklearn',
            'import matplotlib', 'from matplotlib',
            'import scipy', 'from scipy'
        ]
        
        for pattern in import_patterns:
            if pattern in script_content:
                package = pattern.split()[-1].split('.')[0]
                if package not in requirements:
                    requirements.append(package)
        
        return requirements


user_script_service = UserScriptService()