# Generated by Django 5.1.5 on 2025-02-17 12:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_rename_course_teacher_courses'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teacher',
            name='courses',
            field=models.ManyToManyField(blank=True, related_name='assigned_teachers', to='api.course'),
        ),
    ]
