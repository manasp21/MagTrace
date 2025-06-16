"""
URL configuration for django_magtrace project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from magtrace_api.frontend_views import landing_page, main_app, health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('magtrace_api.urls')),
    path('app/', main_app, name='main_app'),
    path('health/', health_check, name='health_check'),
    path('', landing_page, name='landing_page'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])