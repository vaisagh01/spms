from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.utils import timezone
from django.conf import settings
SEMESTER_CHOICES = [
    (1, "Semester 1"),
    (2, "Semester 2"),
    (3, "Semester 3"),
    (4, "Semester 4"),
    (5, "Semester 5"),
    (6, "Semester 6"),
]
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", 'Admin'
        TEACHER = "TEACHER", "Teacher"
        STUDENT = "STUDENT", "Student"
        ALUMNI = "ALUMNI", "Alumni"

    # default role can be assigned, but it can also be changed
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)

    def save(self, *args, **kwargs):
        # If role is not set, assign the default one
        if not self.pk and not self.role:
            self.role = self.Role.STUDENT
        return super().save(*args, **kwargs)
    
class StudentManager(BaseUserManager):
    def query_set(self, args, **kwargs):
        results=super().query_set(*args, **kwargs)
        return results.filter(role=User.Role.STUDENT)

    def create_user(self, username, email, password=None,date_of_birth=None, **extra_fields):
        """Creates and returns a student user."""
        if not email:
            raise ValueError("The Email field must be set")

        
        
        email = self.normalize_email(email)
        extra_fields.setdefault('role', User.Role.STUDENT)
        
        user = self.model(username=username, email=email, date_of_birth=date_of_birth, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None,date_of_birth=None, **extra_fields):
        """Creates and returns a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password,date_of_birth, **extra_fields)
   
class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    course_name = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    credits = models.IntegerField()

    def __str__(self):
        return self.course_name
    
class Student(User):
    base_role = User.Role.STUDENT
    objects=StudentManager()
    student_id = models.AutoField(primary_key=True) 
    # username = models.CharField(max_length=100)
   # Primary Key
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # Optional field
    date_of_birth = models.DateField(null=True, blank=True)  # Allow null values
    enrollment_number = models.CharField(max_length=20, unique=True)  # Unique enrollment number
    course = models.ForeignKey(Course, on_delete=models.CASCADE, default=1)  # Course name
    year_of_study = models.IntegerField(null=True, blank=True)  # Year of study (e.g., 1, 2, 3, 4)
    semester = models.IntegerField(choices=SEMESTER_CHOICES, default=1) 


    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

class TeacherManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.TEACHER)
    
    def create_user(self, username, email, password=None, **extra_fields):
        """Creates and returns a teacher user."""
        if not email:
            raise ValueError("The Email field must be set")
        
        email = self.normalize_email(email)
        extra_fields.setdefault('role', User.Role.TEACHER)
        
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Creates and returns a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)
class AlumniManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.ALUMNI)

    def create_user(self, username, email, password=None, **extra_fields):
        """Creates and returns an alumni user."""
        if not email:
            raise ValueError("The Email field must be set")
        
        email = self.normalize_email(email)
        extra_fields.setdefault('role', User.Role.ALUMNI)
        
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Creates and returns a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)

class Alumni(User):
    # username = models.CharField(max_length=100)
    base_role = User.Role.ALUMNI
    alumni_id = models.AutoField(primary_key=True)
    graduation_year = models.IntegerField()  # Year of graduation
    current_job = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    objects = AlumniManager()

    class Meta:
        verbose_name = "Alumni"
        verbose_name_plural = "Alumni"



# === CLUB MODEL ===

    
class Attendance(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField(default=now)
    status = models.CharField(max_length=10, choices=[("Present", "Present"), ("Absent", "Absent")], default="Present")

    def __str__(self):
        return f"{self.student.username} - {self.date} - {self.status}"


class Teacher(models.Model):
    base_role = User.Role.TEACHER
    teacher_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    is_staff = models.BooleanField(default=False)
    department = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    hire_date = models.DateField()

    # Temporarily allow null values
    # course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name="teachers")

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.designation})"


class Subject(models.Model):
    subject_id = models.AutoField(primary_key=True)
    subject_name = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="subjects")
    semester = models.IntegerField(choices=SEMESTER_CHOICES, default=1) 
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="subjects_taught"
    )  # Changed related_name
    subject_code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.subject_name


class Topic(models.Model):
    topic_id = models.AutoField(primary_key=True)
    topic_name = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="topics")
    completion_time = models.DurationField()

    def __str__(self):
        return self.topic_name

class Chapter(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="chapters")
    chapter_name = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    description = models.TextField()

    def __str__(self):
        return self.chapter_name

from django.db import models

class Assessment(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    subject = models.ForeignKey("Subject", on_delete=models.CASCADE, related_name="assessments")
    assessment_type = models.CharField(max_length=255)
    total_marks = models.IntegerField()
    date_conducted = models.DateField()

    def __str__(self):
        return f"{self.assessment_type} - {self.subject.subject_name}"

class StudentMarks(models.Model):
    marks_id = models.AutoField(primary_key=True)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="student_marks")
    student = models.ForeignKey("Student", on_delete=models.CASCADE, related_name="marks")
    marks_obtained = models.IntegerField()

    class Meta:
        unique_together = ("assessment", "student")  # Ensures one student has only one mark per assessment

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.marks_obtained} marks"

class Assignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assignments")
    semester = models.IntegerField(choices=SEMESTER_CHOICES, default=1) 
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    due_time = models.TimeField(null=True, blank=True)  # ⏰ Added due_time field
    max_marks = models.IntegerField()

    def __str__(self):
        return self.title
    
class AssignmentSubmission(models.Model):
    submission_id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="assignments_submitted")
    submission_date = models.DateField()
    marks_obtained = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.assignment.title}"

class Semester(models.Model):
    semester_id = models.AutoField(primary_key=True)
    semester_no = models.IntegerField(unique=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Semester {self.semester_no}"


class Club(models.Model):
    club_id = models.AutoField(primary_key=True)
    club_name = models.CharField(max_length=255, unique=True)
    club_category = models.CharField(max_length=255)
    club_description = models.TextField(blank=True, null=True)
    faculty_incharge = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="clubs_incharge")
    created_date = models.DateField(auto_now_add=True)
    leader = models.OneToOneField("Student", on_delete=models.SET_NULL, null=True, blank=True, related_name="club_leader")

    def __str__(self):
        return self.club_name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.leader:
            ClubMembers.objects.get_or_create(student=self.leader, club=self, defaults={"role_in_club": "Leader"})

class ClubMembers(models.Model):
    member_id = models.AutoField(primary_key=True)
    student = models.ForeignKey("Student", on_delete=models.CASCADE, null=True, blank=True, related_name="club_memberships")
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