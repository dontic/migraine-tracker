from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filters import MigraineEpisodeFilter
from .models import Medication, MigraineEpisode, Symptom, Trigger
from .serializers import (
    MedicationSerializer,
    MigraineEpisodeDetailSerializer,
    MigraineEpisodeHeatmapSerializer,
    MigraineEpisodeListSerializer,
    MigraineEpisodeWriteSerializer,
    SymptomSerializer,
    TriggerSerializer,
)

_tag = lambda name: dict(  # noqa: E731
    list=extend_schema(tags=[name]),
    create=extend_schema(tags=[name]),
    retrieve=extend_schema(tags=[name]),
    update=extend_schema(tags=[name]),
    destroy=extend_schema(tags=[name]),
)


@extend_schema_view(**_tag("Migraine - Triggers"))
class TriggerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "put", "delete", "head", "options"]
    serializer_class = TriggerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "category", "created_at"]
    ordering = ["category", "name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Trigger.objects.none()
        return Trigger.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(**_tag("Migraine - Medications"))
class MedicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "put", "delete", "head", "options"]
    serializer_class = MedicationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["type", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "type", "created_at"]
    ordering = ["type", "name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Medication.objects.none()
        return Medication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(**_tag("Migraine - Symptoms"))
class SymptomViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "put", "delete", "head", "options"]
    serializer_class = SymptomSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "category", "created_at"]
    ordering = ["category", "name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Symptom.objects.none()
        return Symptom.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EpisodePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema_view(**_tag("Migraine - Episodes"))
class MigraineEpisodeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = EpisodePagination
    http_method_names = ["get", "post", "put", "delete", "head", "options"]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MigraineEpisodeFilter
    ordering_fields = ["started_at", "pain_level", "created_at"]
    ordering = ["-started_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return MigraineEpisode.objects.none()
        return (
            MigraineEpisode.objects.filter(user=self.request.user)
            .prefetch_related(
                "triggers",
                "symptoms",
                "episode_medications__medication",
            )
        )

    def get_serializer_class(self):
        if self.action == "list":
            return MigraineEpisodeListSerializer
        if self.action in ("create", "update"):
            return MigraineEpisodeWriteSerializer
        return MigraineEpisodeDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=["Migraine - Episodes"],
        parameters=[
            OpenApiParameter("date_from", str, description="Start date (YYYY-MM-DD), inclusive"),
            OpenApiParameter("date_to", str, description="End date (YYYY-MM-DD), inclusive"),
        ],
        responses=MigraineEpisodeHeatmapSerializer(many=True),
    )
    @action(detail=False, methods=["get"], url_path="heatmap", pagination_class=None)
    def heatmap(self, request):
        qs = self.get_queryset().only("id", "started_at", "pain_level")
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(started_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(started_at__date__lte=date_to)
        serializer = MigraineEpisodeHeatmapSerializer(qs, many=True)
        return Response(serializer.data)
