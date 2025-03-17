from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings  # Use AUTH_USER_MODEL for flexibility
from django.core.exceptions import ValidationError
from curricular.models import Student, Teacher
from django.utils import timezone

def validate_file_size(file):
    """Ensure uploaded file does not exceed 2MB."""
    if file.size > 2 * 1024 * 1024:  # 2MB limit
        raise ValidationError("File size should not exceed 2MB.")

class Internship(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending Approval'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="intern")
    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField()
    certificate = models.FileField(
        upload_to='internships/certificates/', 
        blank=True, null=True, 
        validators=[validate_file_size]
    )

    # Assigned teacher is auto-linked to the student's course teacher
    assigned_teacher = models.ForeignKey(
        Teacher, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_internships",
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')

    # Timestamps for better tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate start and end dates."""
        if self.start_date >= self.end_date:
            raise ValidationError("Start date must be before the end date.")

    def __str__(self):
        return f"{self.company_name} - {self.position} ({self.student.username}) - {self.status}"

class Project(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="proj")
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    link = models.URLField(blank=True, null=True)
    document = models.FileField(upload_to='project_documents/', blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.student.username})"
class Certification(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)  
    institution = models.CharField(max_length=255)  
    file = models.FileField(upload_to='students/certifications/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} from {self.institution} (Student: {self.student.username})"
    
class CoCurricularEvent(models.Model):
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=50, choices=[('Workshop', 'Workshop'), ('Seminar', 'Seminar')])  # Specify type of co-curricular event
    description = models.TextField()
    event_date = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=255, blank=True, null=True)  # Location of the event
    organizer = models.CharField(max_length=100, blank=True, null=True)  # Event organizer (institution, organization, etc.)

    def __str__(self):
        return self.event_name
    
class CoCurricularEventParticipation(models.Model):
    participation_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="co_curricular_participations")
    co_curricular_event = models.ForeignKey(CoCurricularEvent, on_delete=models.CASCADE, related_name="participants")
    role_in_event = models.CharField(max_length=50, blank=True, null=True)  # Example: Speaker, Attendee
    achievement = models.CharField(max_length=255, blank=True, null=True)  # Example: "Certificate of Participation", "Best Speaker"

    class Meta:
        unique_together = ("student", "co_curricular_event")  # Prevent duplicate participation

    def __str__(self):
        return f"{self.student.username} participated in {self.co_curricular_event.event_name}"
