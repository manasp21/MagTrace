from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .routes import projects, datasets, annotations, models
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Register blueprints
app.register_blueprint(projects.projects_bp)
app.register_blueprint(datasets.datasets_bp)
app.register_blueprint(annotations.annotations_bp)
app.register_blueprint(models.models_bp)

if __name__ == '__main__':
    # Create models directory if it doesn't exist
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
        
    app.run(debug=True)