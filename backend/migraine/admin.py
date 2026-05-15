from django.contrib import admin

from .models import Medication, MigraineEpisode, MigraineEpisodeMedication, Symptom, Trigger


class MigraineEpisodeMedicationInline(admin.TabularInline):
    model = MigraineEpisodeMedication
    extra = 0
    fields = ["medication", "taken_offset_minutes", "dose", "effectiveness"]


@admin.register(MigraineEpisode)
class MigraineEpisodeAdmin(admin.ModelAdmin):
    list_display = [
        "id", "user", "started_at", "ended_at",
        "migraine_type", "pain_level", "disability_level", "has_aura",
    ]
    list_filter = ["migraine_type", "pain_level", "disability_level", "has_aura", "user"]
    search_fields = ["user__username", "notes"]
    readonly_fields = ["created_at", "updated_at", "duration_hours_display"]
    inlines = [MigraineEpisodeMedicationInline]
    filter_horizontal = ["triggers", "symptoms"]
    date_hierarchy = "started_at"

    @admin.display(description="Duration (h)")
    def duration_hours_display(self, obj):
        return obj.duration_hours


@admin.register(Trigger)
class TriggerAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "name", "category", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "user__username"]


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "name", "type", "is_active"]
    list_filter = ["type", "is_active"]
    search_fields = ["name", "user__username"]


@admin.register(Symptom)
class SymptomAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "name", "category", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "user__username"]
