from django.db import models
from curricular.models import Course
from django.utils.timezone import now
from extracurricular.models import Event, Club
from curricular.models import User
# Create your models here.
class Noti(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="notif")
    message = models.TextField()
    created_at = models.DateTimeField(default=now)

class EventChat(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="chats")
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="event_chats")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]  # Ensure messages are retrieved in order

    def __str__(self):
        return f"{self.sender.username} - {self.message[:30]}"  # Show first 30 chars of the message