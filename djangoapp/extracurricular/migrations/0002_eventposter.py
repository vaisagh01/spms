# Generated by Django 5.0.6 on 2025-03-05 15:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("extracurricular", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="EventPoster",
            fields=[
                ("poster_id", models.AutoField(primary_key=True, serialize=False)),
                ("poster_image", models.ImageField(upload_to="event_posters/")),
                ("location", models.CharField(max_length=255)),
                ("time", models.TimeField()),
                (
                    "event",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="posters",
                        to="extracurricular.event",
                    ),
                ),
            ],
        ),
    ]
