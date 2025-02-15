from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.utils import timezone

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN",'Admin'
        TEACHER = "TEACHER","Teacher"
        STUDENT = "STUDENT","Student"
        ALUMNI = "ALUMNI","Alumni"

    base_role=Role.ADMIN

    role = models.CharField(max_length=10, choices=Role.choices)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = self.base_role
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
   


class Student(User):
    base_role = User.Role.STUDENT
    objects=StudentManager()
    student_id = models.AutoField(primary_key=True) 
   # Primary Key
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # Optional field
    date_of_birth = models.DateField(null=True, blank=True)  # Allow null values
    enrollment_number = models.CharField(max_length=20, unique=True)  # Unique enrollment number
    course = models.CharField(max_length=100)  # Course name
    year_of_study = models.IntegerField(null=True, blank=True)  # Year of study (e.g., 1, 2, 3, 4)

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
    
class Teacher(User):
    base_role = User.Role.TEACHER
    teacher_id = models.AutoField(primary_key=True)
    department = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    objects = TeacherManager()

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"

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

class Subject(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

class StudentMarks(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="marks")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="subject_marks")
    semester = models.IntegerField()
    marks = models.FloatField()

    class Meta:
        unique_together = ("student", "subject", "semester")  # Prevent duplicate entries

class Assignment(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    assigned_to = models.ManyToManyField(User, related_name="assignments")

    def __str__(self):
        return self.title

class Club(models.Model):
    club_id = models.AutoField(primary_key=True)
    club_name = models.CharField(max_length=255, unique=True)
    club_category = models.CharField(max_length=255)
    club_description = models.TextField(blank=True, null=True)  # ✅ Added description
    faculty_incharge = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="clubs_incharge")  # ✅ Better structure
    created_date = models.DateField(auto_now_add=True)
    leader = models.OneToOneField("Student", on_delete=models.SET_NULL, null=True, blank=True, related_name="club_leader")  # Only one leader per club

    def __str__(self):
        return self.club_name


# === CLUB MEMBERS MODEL ===
class ClubMembers(models.Model):
    member_id = models.AutoField(primary_key=True)
    student = models.ForeignKey("Student", on_delete=models.CASCADE, null=True, blank=True,related_name="club_members")
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="members",null=True, blank=True)
    role_in_club = models.CharField(max_length=10, choices=[("Leader", "Leader"), ("Member", "Member")], default="Member")
    date_joined = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Club Member"
        verbose_name_plural = "Club Members" 
        unique_together = ("student", "club")  # Prevent duplicate memberships

    def __str__(self):
        return f"{self.student.username} - {self.club.club_name}"


# === EVENT MODEL ===
class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=100)
    description = models.TextField()
    event_date = models.DateTimeField(default=timezone.now)
    club = models.ForeignKey(Club, related_name="events", on_delete=models.CASCADE)
    attendees = models.ManyToManyField("Student", related_name="events_attending", blank=True)

    def __str__(self):
        return self.event_name




