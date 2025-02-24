from django.db import models
from django.utils.timezone import now
from curricular.models import Course

class Notification(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="notificat", null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(default=now)  # Ensure this field exists

    def __str__(self):
        return f"Notification for {self.course.name if self.course else 'General'}: {self.message}"

class Notimodel(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="noti", null=True, blank=True)
    message = models.TextField()
    time_created = models.DateTimeField(default=now)  # Ensure this field exists

    def __str__(self):
        return f"Notification for {self.course.name if self.course else 'General'}: {self.message}"

