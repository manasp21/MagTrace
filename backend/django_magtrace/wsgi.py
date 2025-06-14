"""
WSGI config for django_magtrace project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_magtrace.settings')

application = get_wsgi_application()