# Generated by Django 5.1.5 on 2025-02-21 10:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('curricular', '0002_alter_teacher_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignmentsubmission',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='submissions/'),
        ),
    ]
