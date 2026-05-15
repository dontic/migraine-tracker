from rest_framework.routers import DefaultRouter

from .views import MedicationViewSet, MigraineEpisodeViewSet, SymptomViewSet, TriggerViewSet

router = DefaultRouter()
router.register(r"episodes", MigraineEpisodeViewSet, basename="migraine-episode")
router.register(r"triggers", TriggerViewSet, basename="migraine-trigger")
router.register(r"medications", MedicationViewSet, basename="migraine-medication")
router.register(r"symptoms", SymptomViewSet, basename="migraine-symptom")

urlpatterns = router.urls
