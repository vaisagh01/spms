# Generated by Django 5.1.5 on 2025-02-17 16:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_student_course'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='course',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='api.course'),
        ),
    ]
