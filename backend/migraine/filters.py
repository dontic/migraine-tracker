import django_filters

from .models import MigraineEpisode


class MigraineEpisodeFilter(django_filters.FilterSet):
    started_after = django_filters.DateTimeFilter(field_name="started_at", lookup_expr="gte")
    started_before = django_filters.DateTimeFilter(field_name="started_at", lookup_expr="lte")
    migraine_type = django_filters.MultipleChoiceFilter(choices=MigraineEpisode.MigraineType.choices)
    pain_level_min = django_filters.NumberFilter(field_name="pain_level", lookup_expr="gte")
    pain_level_max = django_filters.NumberFilter(field_name="pain_level", lookup_expr="lte")
    has_aura = django_filters.BooleanFilter()
    disability_level = django_filters.MultipleChoiceFilter(choices=MigraineEpisode.DisabilityLevel.choices)

    class Meta:
        model = MigraineEpisode
        fields = [
            "migraine_type", "pain_level_min", "pain_level_max",
            "has_aura", "disability_level",
        ]
