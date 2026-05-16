from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


class Trigger(models.Model):
    class Category(models.TextChoices):
        FOOD = "food", "Food & Drink"
        HORMONAL = "hormonal", "Hormonal"
        STRESS = "stress", "Stress"
        SLEEP = "sleep", "Sleep"
        ENVIRONMENTAL = "environmental", "Environmental"
        PHYSICAL = "physical", "Physical Activity"
        SENSORY = "sensory", "Sensory"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="triggers",
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]
        unique_together = [["user", "name"]]
        verbose_name = "trigger"
        verbose_name_plural = "triggers"

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Medication(models.Model):
    class Type(models.TextChoices):
        TRIPTAN = "triptan", "Triptan"
        OTC_ANALGESIC = "otc_analgesic", "OTC Analgesic"
        ANTIEMETIC = "antiemetic", "Antiemetic"
        PREVENTIVE = "preventive", "Preventive"
        ERGOTAMINE = "ergotamine", "Ergotamine"
        GEPANT = "gepant", "Gepant / CGRP Antagonist"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medications",
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.OTHER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["type", "name"]
        unique_together = [["user", "name"]]
        verbose_name = "medication"
        verbose_name_plural = "medications"

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Symptom(models.Model):
    class Category(models.TextChoices):
        GI = "gi", "Gastrointestinal"
        SENSORY = "sensory", "Sensory"
        NEUROLOGICAL = "neurological", "Neurological"
        AUTONOMIC = "autonomic", "Autonomic"
        PSYCHOLOGICAL = "psychological", "Psychological"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="symptoms",
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]
        unique_together = [["user", "name"]]
        verbose_name = "symptom"
        verbose_name_plural = "symptoms"

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class MigraineEpisode(models.Model):
    class MigraineType(models.TextChoices):
        AURA_ONLY = "aura_only", "Aura only (without headache)"
        AURA_WITH_HEADACHE = "aura_with_headache", "Aura with headache"
        WITHOUT_AURA = "without_aura", "Migraine without aura"
        HEMIPLEGIC = "hemiplegic", "Hemiplegic"
        VESTIBULAR = "vestibular", "Vestibular"
        CHRONIC = "chronic", "Chronic"
        CLUSTER = "cluster", "Cluster"
        OTHER = "other", "Other"

    class HeadacheSide(models.TextChoices):
        LEFT = "left", "Left"
        RIGHT = "right", "Right"
        BOTH = "both", "Both"

    HEADACHE_REGION_CHOICES = [
        "temporal", "frontal", "occipital", "vertex",
        "retro_orbital", "orbital", "parietal",
    ]

    class HeadacheQuality(models.TextChoices):
        THROBBING = "throbbing", "Throbbing / pulsating"
        PRESSING = "pressing", "Pressing / tightening"
        STABBING = "stabbing", "Stabbing"
        BURNING = "burning", "Burning"
        DULL = "dull", "Dull / aching"

    class DisabilityLevel(models.TextChoices):
        NONE = "none", "None — normal activity"
        MILD = "mild", "Mild — reduced efficiency"
        MODERATE = "moderate", "Moderate — significant impairment"
        SEVERE = "severe", "Severe — bed rest required"

    AURA_TYPE_CHOICES = [
        "visual", "speech", "dizziness", "tingling",
        "motor", "sensory", "cognitive", "auditory",
    ]

    VISUAL_AURA_LOCATION_CHOICES = [
        "left_field", "right_field", "central",
        "peripheral", "upper_field", "lower_field", "bilateral",
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="migraine_episodes",
    )

    # Timing
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)

    # Classification
    migraine_type = models.CharField(
        max_length=20,
        choices=MigraineType.choices,
        default=MigraineType.WITHOUT_AURA,
    )

    # Pain
    pain_level = models.PositiveSmallIntegerField(
        default=0,
        help_text="0=none, 1=little, 2=discomfort, 3=can't work, 4=debilitating, 5=hospital",
    )

    # Headache character
    headache_side = models.CharField(
        max_length=10,
        choices=HeadacheSide.choices,
        blank=True,
        default="",
    )
    headache_regions = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list,
    )
    headache_quality = models.CharField(
        max_length=10,
        choices=HeadacheQuality.choices,
        blank=True,
        default="",
    )

    # Disability
    disability_level = models.CharField(
        max_length=10,
        choices=DisabilityLevel.choices,
        blank=True,
        default="",
    )

    # Aura
    has_aura = models.BooleanField(default=False)
    aura_types = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list,
    )
    visual_aura_locations = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list,
    )
    aura_duration_minutes = models.PositiveSmallIntegerField(null=True, blank=True)

    # Lifestyle / context
    sleep_hours_before = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Hours of sleep the night before onset",
    )
    stress_level = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="0=none … 5=extreme",
    )
    menstrual_related = models.BooleanField(null=True, blank=True)

    # Notes
    notes = models.TextField(blank=True, default="")

    # M2M relationships
    triggers = models.ManyToManyField(Trigger, blank=True, related_name="episodes")
    symptoms = models.ManyToManyField(Symptom, blank=True, related_name="episodes")
    medications = models.ManyToManyField(
        Medication,
        through="MigraineEpisodeMedication",
        blank=True,
        related_name="episodes",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-started_at"]
        verbose_name = "migraine episode"
        verbose_name_plural = "migraine episodes"
        indexes = [
            models.Index(fields=["user", "-started_at"]),
        ]

    def __str__(self):
        return f"{self.user} — {self.started_at:%Y-%m-%d %H:%M} ({self.get_migraine_type_display()})"

    @property
    def duration_hours(self):
        if self.ended_at is None:
            return None
        delta = self.ended_at - self.started_at
        return round(delta.total_seconds() / 3600, 2)


class MigraineEpisodeMedication(models.Model):
    episode = models.ForeignKey(
        MigraineEpisode,
        on_delete=models.CASCADE,
        related_name="episode_medications",
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.PROTECT,
        related_name="episode_usages",
    )
    taken_offset_minutes = models.IntegerField(
        null=True,
        blank=True,
        help_text="Minutes from episode start when taken (negative = taken before onset)",
    )
    dose = models.CharField(max_length=50, blank=True, default="")
    effectiveness = models.BooleanField(null=True, blank=True)

    class Meta:
        ordering = ["taken_offset_minutes"]
        unique_together = [["episode", "medication"]]
        verbose_name = "episode medication"
        verbose_name_plural = "episode medications"

    def __str__(self):
        return f"{self.medication.name} @ {self.taken_offset_minutes}min"
