# Generated by Django 5.1.5 on 2025-02-15 11:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_assignment_due_time'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='assignment',
            name='is_completed',
        ),
    ]
