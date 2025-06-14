from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DatasetViewSet, MagnetometerReadingViewSet, LabelViewSet,
    MLModelViewSet, InferenceResultViewSet, ActiveLearningSuggestionViewSet
)

router = DefaultRouter()
router.register(r'datasets', DatasetViewSet)
router.register(r'readings', MagnetometerReadingViewSet)
router.register(r'labels', LabelViewSet)
router.register(r'models', MLModelViewSet)
router.register(r'inference', InferenceResultViewSet)
router.register(r'suggestions', ActiveLearningSuggestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]