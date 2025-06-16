from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


def landing_page(request):
    """Landing page for MagTrace application"""
    context = {
        'title': 'MagTrace - Magnetic Field Analysis Platform',
        'description': 'Complete ML workflow for magnetic field data analysis'
    }
    return render(request, 'landing.html', context)


def main_app(request):
    """Main MagTrace application interface"""
    context = {
        'title': 'MagTrace Pro - Magnetic Field Analysis'
    }
    return render(request, 'magtrace_pro.html', context)


def health_check(request):
    """Simple health check endpoint"""
    return HttpResponse("MagTrace Backend is running", content_type="text/plain")