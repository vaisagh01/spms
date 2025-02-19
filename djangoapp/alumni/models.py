from django.db import models
from django.contrib.auth.models import User
from datetime import date
from django.conf import settings
from django.conf import settings
from django.db import models

class Alumni(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="alumni_profile"  # Add a unique related_name
    )
    graduation_year = models.IntegerField()
    course_completed = models.BooleanField(default=False)
    convocation_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.course_completed:
            self.user.is_active = False  # Disable normal student login
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} ({self.graduation_year})"

class AlumniEvent(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    event_type = models.CharField(max_length=50, choices=[
        ('Meetup', 'Meetup'),
        ('Convocation', 'Convocation'),
        ('Talk', 'Talk'),
        ('Other', 'Other')
    ])

    def __str__(self):
        return self.title

class Donation(models.Model):
    alumni = models.ForeignKey(Alumni, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alumni.user.username} - {self.amount}"

class DepartmentRequirement(models.Model):
    department = models.CharField(max_length=255)
    description = models.TextField()
    required_for = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.department} - {self.required_for}"
