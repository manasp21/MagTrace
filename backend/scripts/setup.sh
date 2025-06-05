#!/bin/bash
echo "Setting up MagTrace backend on Linux/macOS..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Apply database migrations
python ../manage.py makemigrations
python ../manage.py migrate

echo "Setup complete. Run with: python ../manage.py runserver"