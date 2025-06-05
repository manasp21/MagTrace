@echo off
echo Setting up MagTrace backend on Windows...

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
pip install -r ..\requirements.txt

REM Apply database migrations
python ..\manage.py makemigrations
python ..\manage.py migrate

echo Setup complete. Run with: python ..\manage.py runserver