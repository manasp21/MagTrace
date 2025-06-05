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
    # New endpoints for active learning workflow
    path('api/data', views.upload_data, name='upload_data'),
    path('api/labels', views.save_labels, name='save_labels'),
    path('api/models/train', views.train_model, name='train_model'),
    path('api/models/predict', views.run_inference, name='run_inference'),
]