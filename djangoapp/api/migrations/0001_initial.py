# Generated by Django 5.0.6 on 2025-02-13 00:39

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={
                            "unique": "A user with that username already exists."
                        },
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[
                            django.contrib.auth.validators.UnicodeUsernameValidator()
                        ],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="first name"
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="last name"
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        blank=True, max_length=254, verbose_name="email address"
                    ),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("ADMIN", "Admin"),
                            ("TEACHER", "Teacher"),
                            ("STUDENT", "Student"),
                            ("ALUMNI", "Alumni"),
                        ],
                        max_length=10,
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "verbose_name": "user",
                "verbose_name_plural": "users",
                "abstract": False,
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="Club",
            fields=[
                ("club_id", models.AutoField(primary_key=True, serialize=False)),
                ("club_name", models.CharField(max_length=255, unique=True)),
                ("club_category", models.CharField(max_length=255)),
                ("faculty_incharge", models.CharField(max_length=255)),
                ("created_date", models.DateField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Alumni",
            fields=[
                (
                    "user_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("alumni_id", models.AutoField(primary_key=True, serialize=False)),
                ("graduation_year", models.IntegerField()),
                (
                    "current_job",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                (
                    "phone_number",
                    models.CharField(blank=True, max_length=15, null=True),
                ),
            ],
            options={
                "verbose_name": "Alumni",
                "verbose_name_plural": "Alumni",
            },
            bases=("api.user",),
        ),
        migrations.CreateModel(
            name="Student",
            fields=[
                ("student_id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "user_ptr",
                    models.OneToOneField(
                        default=1,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "phone_number",
                    models.CharField(blank=True, max_length=15, null=True),
                ),
                ("date_of_birth", models.DateField(blank=True, null=True)),
                ("enrollment_number", models.CharField(max_length=20, unique=True)),
                ("course", models.CharField(max_length=100)),
                ("year_of_study", models.IntegerField()),
            ],
            options={
                "verbose_name": "Student",
                "verbose_name_plural": "Students",
            },
            bases=("api.user",),
        ),
        migrations.CreateModel(
            name="Teacher",
            fields=[
                (
                    "user_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("teacher_id", models.AutoField(primary_key=True, serialize=False)),
                ("department", models.CharField(max_length=100)),
                (
                    "phone_number",
                    models.CharField(blank=True, max_length=15, null=True),
                ),
            ],
            options={
                "verbose_name": "Teacher",
                "verbose_name_plural": "Teachers",
            },
            bases=("api.user",),
        ),
        migrations.CreateModel(
            name="Event",
            fields=[
                ("event_id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("date", models.DateTimeField()),
                (
                    "club",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="events",
                        to="api.club",
                    ),
                ),
                (
                    "attendees",
                    models.ManyToManyField(
                        blank=True, related_name="events_attending", to="api.student"
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="club",
            name="leader",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="club_leader",
                to="api.student",
            ),
        ),
        migrations.CreateModel(
            name="ClubMembers",
            fields=[
                ("member_id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "role_in_club",
                    models.CharField(
                        choices=[("Leader", "Leader"), ("Member", "Member")],
                        default="Member",
                        max_length=10,
                    ),
                ),
                ("date_joined", models.DateField(auto_now_add=True)),
                (
                    "club",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="members",
                        to="api.club",
                    ),
                ),
                (
                    "student",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="api.student",
                    ),
                ),
            ],
            options={
                "unique_together": {("student", "club")},
            },
        ),
    ]
