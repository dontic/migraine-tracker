from rest_framework import serializers

from .models import Medication, MigraineEpisode, MigraineEpisodeMedication, Symptom, Trigger


# ---------------------------------------------------------------------------- #
# Helpers
# ---------------------------------------------------------------------------- #

def _make_array_choices_validator(allowed: list[str]):
    def validate(value):
        invalid = set(value) - set(allowed)
        if invalid:
            raise serializers.ValidationError(
                f"Invalid choices: {sorted(invalid)}. Allowed: {sorted(allowed)}"
            )
    return validate


# ---------------------------------------------------------------------------- #
# Lookup serializers
# ---------------------------------------------------------------------------- #

class TriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trigger
        fields = ["id", "name", "category", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "name", "type", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = ["id", "name", "category", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


# ---------------------------------------------------------------------------- #
# Through table serializers
# ---------------------------------------------------------------------------- #

class MigraineEpisodeMedicationReadSerializer(serializers.ModelSerializer):
    medication = MedicationSerializer(read_only=True)

    class Meta:
        model = MigraineEpisodeMedication
        fields = ["id", "medication", "taken_offset_minutes", "dose", "effectiveness"]


class MigraineEpisodeMedicationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MigraineEpisodeMedication
        fields = ["medication", "taken_offset_minutes", "dose", "effectiveness"]


# ---------------------------------------------------------------------------- #
# Episode serializers
# ---------------------------------------------------------------------------- #

class MigraineEpisodeHeatmapSerializer(serializers.ModelSerializer):
    date = serializers.DateField(source="started_at", read_only=True)

    class Meta:
        model = MigraineEpisode
        fields = ["id", "date", "pain_level"]
        read_only_fields = fields


class MigraineEpisodeListSerializer(serializers.ModelSerializer):
    duration_hours = serializers.FloatField(read_only=True)

    class Meta:
        model = MigraineEpisode
        fields = [
            "id", "started_at", "ended_at", "duration_hours",
            "migraine_type", "pain_level", "disability_level",
            "has_aura", "created_at", "updated_at",
        ]
        read_only_fields = fields


class MigraineEpisodeDetailSerializer(serializers.ModelSerializer):
    duration_hours = serializers.FloatField(read_only=True)
    triggers = TriggerSerializer(many=True, read_only=True)
    symptoms = SymptomSerializer(many=True, read_only=True)
    episode_medications = MigraineEpisodeMedicationReadSerializer(many=True, read_only=True)

    class Meta:
        model = MigraineEpisode
        fields = [
            "id", "started_at", "ended_at", "duration_hours",
            "migraine_type",
            "pain_level", "headache_location", "headache_quality",
            "disability_level",
            "has_aura", "aura_types", "visual_aura_locations", "aura_duration_minutes",
            "sleep_hours_before", "stress_level", "menstrual_related",
            "notes",
            "triggers", "symptoms", "episode_medications",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "duration_hours", "created_at", "updated_at"]


class MigraineEpisodeWriteSerializer(serializers.ModelSerializer):
    triggers = serializers.PrimaryKeyRelatedField(
        queryset=Trigger.objects.none(), many=True, required=False
    )
    symptoms = serializers.PrimaryKeyRelatedField(
        queryset=Symptom.objects.none(), many=True, required=False
    )
    episode_medications = MigraineEpisodeMedicationWriteSerializer(many=True, required=False)

    pain_level = serializers.IntegerField(min_value=0, max_value=5)
    stress_level = serializers.IntegerField(min_value=0, max_value=5, allow_null=True, required=False)

    class Meta:
        model = MigraineEpisode
        fields = [
            "started_at", "ended_at",
            "migraine_type",
            "pain_level", "headache_location", "headache_quality",
            "disability_level",
            "has_aura", "aura_types", "visual_aura_locations", "aura_duration_minutes",
            "sleep_hours_before", "stress_level", "menstrual_related",
            "notes",
            "triggers", "symptoms", "episode_medications",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["triggers"].child_relation.queryset = Trigger.objects.filter(
                user=request.user
            )
            self.fields["symptoms"].child_relation.queryset = Symptom.objects.filter(
                user=request.user
            )

    def validate_aura_types(self, value):
        _make_array_choices_validator(MigraineEpisode.AURA_TYPE_CHOICES)(value)
        return value

    def validate_visual_aura_locations(self, value):
        _make_array_choices_validator(MigraineEpisode.VISUAL_AURA_LOCATION_CHOICES)(value)
        return value

    def validate(self, data):
        started = data.get("started_at", getattr(self.instance, "started_at", None))
        ended = data.get("ended_at", getattr(self.instance, "ended_at", None))
        if ended and started and ended <= started:
            raise serializers.ValidationError({"ended_at": "ended_at must be after started_at."})
        return data

    def create(self, validated_data):
        medications_data = validated_data.pop("episode_medications", [])
        triggers = validated_data.pop("triggers", [])
        symptoms = validated_data.pop("symptoms", [])
        episode = MigraineEpisode.objects.create(**validated_data)
        episode.triggers.set(triggers)
        episode.symptoms.set(symptoms)
        for med_data in medications_data:
            MigraineEpisodeMedication.objects.create(episode=episode, **med_data)
        return episode

    def update(self, instance, validated_data):
        medications_data = validated_data.pop("episode_medications", None)
        triggers = validated_data.pop("triggers", None)
        symptoms = validated_data.pop("symptoms", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if triggers is not None:
            instance.triggers.set(triggers)
        if symptoms is not None:
            instance.symptoms.set(symptoms)
        if medications_data is not None:
            instance.episode_medications.all().delete()
            for med_data in medications_data:
                MigraineEpisodeMedication.objects.create(episode=instance, **med_data)
        return instance
