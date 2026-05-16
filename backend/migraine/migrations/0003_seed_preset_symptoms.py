from django.db import migrations

PRESET_SYMPTOMS = [
    {"name": "Nausea", "category": "gi"},
    {"name": "Vomiting", "category": "gi"},
    {"name": "Photophobia (light sensitivity)", "category": "sensory"},
    {"name": "Phonophobia (noise sensitivity)", "category": "sensory"},
]


def seed_preset_symptoms(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    Symptom = apps.get_model("migraine", "Symptom")

    for user in User.objects.all():
        for preset in PRESET_SYMPTOMS:
            Symptom.objects.get_or_create(
                user=user,
                name=preset["name"],
                defaults={"category": preset["category"]},
            )


class Migration(migrations.Migration):

    dependencies = [
        ("migraine", "0002_split_headache_location"),
        ("authentication", "0002_create_default_admin"),
    ]

    operations = [
        migrations.RunPython(seed_preset_symptoms, migrations.RunPython.noop),
    ]
