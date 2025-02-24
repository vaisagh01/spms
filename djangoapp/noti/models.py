from django.db import models
from curricular.models import Course
from django.utils.timezone import now

# Create your models here.
class Noti(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="notif")
    message = models.TextField()
    created_at = models.DateTimeField(default=now)
