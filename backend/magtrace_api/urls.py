from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'datasets', views.DatasetViewSet)
router.register(r'annotations', views.AnnotationViewSet)
router.register(r'models', views.ModelViewSet)
router.register(r'model-versions', views.ModelVersionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('datasets/example/', views.load_example_data, name='load_example_data'),
    path('health/', views.health_check, name='health-check'),
]