# Generated by Django 5.1.5 on 2025-02-13 10:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Club',
            fields=[
                ('club_id', models.AutoField(primary_key=True, serialize=False)),
                ('club_name', models.CharField(max_length=255)),
                ('club_category', models.CharField(max_length=255)),
                ('faculty_incharge', models.CharField(max_length=255)),
                ('created_date', models.DateField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('student_id', models.AutoField(primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone_number', models.CharField(blank=True, max_length=15, null=True)),
                ('date_of_birth', models.DateField()),
                ('enrollment_number', models.CharField(max_length=20, unique=True)),
                ('course', models.CharField(max_length=100)),
                ('year_of_study', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('date', models.DateTimeField()),
                ('club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='api.club')),
                ('attendees', models.ManyToManyField(related_name='events_attending', to='api.student')),
            ],
        ),
        migrations.CreateModel(
            name='ClubMembers',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role_in_club', models.CharField(max_length=255)),
                ('date_joined', models.DateField(auto_now_add=True)),
                ('club', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='club_members', to='api.club')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='club_memberships', to='api.student')),
            ],
            options={
                'unique_together': {('student', 'club')},
            },
        ),
    ]
