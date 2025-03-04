from django.db import models
from django.conf import settings  # Use AUTH_USER_MODEL for flexibility
from django.core.exceptions import ValidationError

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

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
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
    
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name="approved_internships", 
        on_delete=models.SET_NULL, 
        null=True, blank=True
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')

    def clean(self):
        """Validate start and end dates."""
        if self.start_date >= self.end_date:
            raise ValidationError("Start date must be before the end date.")

    def __str__(self):
        return f"{self.company_name} - {self.position} ({self.student.username}) - {self.status}"

class ClassTeacher(models.Model):
    teacher = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="class_teacher"
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="assigned_teacher"
    )
    class_name = models.CharField(max_length=100, default="Unknown")  # Optional field for class identification

    def __str__(self):
        return f"Class Teacher: {self.teacher.username} (Class: {self.class_name})"


class Project(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.title} ({self.student.username})"

class Certification(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="certifications")
    file = models.FileField(upload_to='projects/certifications/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Certification for {self.project.title}"

