from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DatasetViewSet, MagnetometerReadingViewSet, LabelViewSet,
    MLModelViewSet, InferenceResultViewSet, ActiveLearningSuggestionViewSet,
    ProjectViewSet, LabelCategoryViewSet, AnnotationViewSet,
    UserDefinedModelViewSet, TrainingSessionViewSet, PredictionViewSet
)

router = DefaultRouter()
# Legacy endpoints (for backwards compatibility)
router.register(r'datasets', DatasetViewSet)
router.register(r'readings', MagnetometerReadingViewSet)
router.register(r'labels', LabelViewSet)
router.register(r'models', MLModelViewSet)
router.register(r'inference', InferenceResultViewSet)
router.register(r'suggestions', ActiveLearningSuggestionViewSet)

# Enhanced model endpoints
router.register(r'projects', ProjectViewSet)
router.register(r'label-categories', LabelCategoryViewSet)
router.register(r'annotations', AnnotationViewSet)
router.register(r'user-models', UserDefinedModelViewSet)
router.register(r'training-sessions', TrainingSessionViewSet)
router.register(r'predictions', PredictionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]