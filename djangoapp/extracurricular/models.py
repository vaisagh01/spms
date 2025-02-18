from django.utils import timezone  
from django.conf import settings
from django.db import models
from curricular.models import Student  # Replace 'yourapp' with the actual app name where the Student model is defined

# Create your models here.
class Club(models.Model):
    club_id = models.AutoField(primary_key=True)
    club_name = models.CharField(max_length=255, unique=True)
    club_category = models.CharField(max_length=255)
    club_description = models.TextField(blank=True, null=True)
    faculty_incharge = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="clubs_incharge")
    created_date = models.DateField(auto_now_add=True)
    leader = models.ForeignKey(Student, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.club_name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.leader:
            ClubMembers.objects.get_or_create(student=self.leader, club=self, defaults={"role_in_club": "Leader"})

class ClubMembers(models.Model):
    member_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name="club_memberships")
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="members", null=True, blank=True)
    role_in_club = models.CharField(max_length=10, choices=[("Leader", "Leader"), ("Member", "Member")], default="Member")
    date_joined = models.DateField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Club Member"
        verbose_name_plural = "Club Members"
        unique_together = ("student", "club")  # Prevent duplicate memberships

    def __str__(self):
        return f"{self.student.username} - {self.club.club_name}"

class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=100)
    description = models.TextField()
    event_date = models.DateTimeField(default=timezone.now)
    club = models.ForeignKey(Club, related_name="events", on_delete=models.CASCADE)

    def __str__(self):
        return self.event_name

class EventParticipation(models.Model):
    participation_id = models.AutoField(primary_key=True)
    club_member = models.ForeignKey(ClubMembers, on_delete=models.CASCADE, related_name="event_participations")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="participants")
    role_in_event = models.CharField(max_length=50, blank=True, null=True)  # Example: Speaker, Volunteer, Participant
    achievement = models.CharField(max_length=255, blank=True, null=True)  # Example: "Winner", "Best Speaker"
    
    class Meta:
        unique_together = ("club_member", "event")  # Ensure a member isn't added twice for the same event
    
    def __str__(self):
        return f"{self.club_member.student.username} participated in {self.event.event_name}"