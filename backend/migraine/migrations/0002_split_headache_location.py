import django.contrib.postgres.fields
from django.db import migrations, models


def migrate_headache_location(apps, schema_editor):
    MigraineEpisode = apps.get_model("migraine", "MigraineEpisode")
    SIDE_MAP = {
        "unilateral_left": ("left", []),
        "unilateral_right": ("right", []),
        "bilateral": ("both", []),
    }
    REGION_MAP = {
        "frontal": ("", ["frontal"]),
        "temporal": ("", ["temporal"]),
        "occipital": ("", ["occipital"]),
        "vertex": ("", ["vertex"]),
        "retro_orbital": ("", ["retro_orbital"]),
    }
    for episode in MigraineEpisode.objects.exclude(headache_location=""):
        loc = episode.headache_location
        if loc in SIDE_MAP:
            episode.headache_side, episode.headache_regions = SIDE_MAP[loc]
        elif loc in REGION_MAP:
            episode.headache_side, episode.headache_regions = REGION_MAP[loc]
        episode.save(update_fields=["headache_side", "headache_regions"])


class Migration(migrations.Migration):
    dependencies = [
        ("migraine", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="migraineepisode",
            name="headache_side",
            field=models.CharField(
                blank=True,
                choices=[("left", "Left"), ("right", "Right"), ("both", "Both")],
                default="",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="migraineepisode",
            name="headache_regions",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=20),
                blank=True,
                default=list,
                size=None,
            ),
        ),
        migrations.RunPython(migrate_headache_location, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="migraineepisode",
            name="headache_location",
        ),
    ]
