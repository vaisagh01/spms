# Generated by Django 5.1.5 on 2025-02-17 10:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_remove_teacher_courses_teacher_course'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teacher',
            name='course',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teachers', to='api.course'),
        ),
    ]
