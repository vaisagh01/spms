# Generated by Django 5.1.5 on 2025-02-17 12:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_rename_courses_teacher_course'),
    ]

    operations = [
        migrations.RenameField(
            model_name='teacher',
            old_name='course',
            new_name='courses',
        ),
    ]
