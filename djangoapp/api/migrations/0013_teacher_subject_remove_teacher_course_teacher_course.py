# Generated by Django 5.1.5 on 2025-02-17 11:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_alter_teacher_course'),
    ]

    operations = [
        migrations.AddField(
            model_name='teacher',
            name='subject',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_teachers', to='api.subject'),
        ),
        migrations.RemoveField(
            model_name='teacher',
            name='course',
        ),
        migrations.AddField(
            model_name='teacher',
            name='course',
            field=models.ManyToManyField(blank=True, related_name='teacher', to='api.course'),
        ),
    ]
