# Generated by Django 5.1.5 on 2025-02-17 10:12

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_teacher_courses'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='teacher',
            name='courses',
        ),
        migrations.AddField(
            model_name='teacher',
            name='course',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='teacher', to='api.course'),
        ),
    ]
