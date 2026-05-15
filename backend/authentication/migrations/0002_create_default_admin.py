from django.db import migrations


def create_default_admin(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser(username="admin", password="admin", email="")


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_default_admin, migrations.RunPython.noop),
    ]
