from django.contrib.auth.models import User
from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.forms import ValidationError
from django.utils.timezone import now
from django.db import models
from django.apps import apps  # Import for cross-app relations


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
    
class Department(models.Model):
    dept_id = models.AutoField(primary_key=True)
    dept_name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    hod = models.OneToOneField('Teacher', on_delete=models.SET_NULL, null=True, blank=True, related_name="head_of_department")

    def __str__(self):
        return self.dept_name

class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    course_name = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="courses")
    credits = models.IntegerField()
    total_semesters = models.IntegerField(default=6)  # Default semester count
    year = models.IntegerField()  # Added Year field
    class_teacher = models.ForeignKey(
        'Teacher',  # Links to Teacher model
        on_delete=models.SET_NULL,
        null=True,
        related_name='class_courses'  # For tracking class teacher role
    )    
    def __str__(self):
        return self.course_name


class Teacher(User):
    class Designation(models.TextChoices):
        HOD = "HOD", "Head of Department"
        ASSISTANT_PROFESSOR = "Assistant Professor", "Assistant Professor"
        ASSOCIATE_PROFESSOR = "Associate Professor", "Associate Professor"
        PROFESSOR = "Professor", "Professor"
        DOCTOR = "Doctor", "Doctor"
        LECTURER = "Lecturer", "Lecturer"

    base_role = User.Role.TEACHER
    teacher_id = models.AutoField(primary_key=True)
    phone_number = models.CharField(max_length=15)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="teachers")
    designation = models.CharField(max_length=50, choices=Designation.choices)
    hire_date = models.DateField()
    courses = models.ManyToManyField(Course, related_name="teachers", blank=True)

    class Meta:
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'

    def __str__(self):
        return self.username
    
class Student(User):
    base_role = User.Role.STUDENT
    objects = StudentManager()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="student")  # Add department
    student_id = models.AutoField(primary_key=True) 
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    enrollment_number = models.CharField(max_length=20, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, default=1)
    year_of_study = models.IntegerField(null=True, blank=True)
    semester = models.IntegerField(default=6)

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def save(self, *args, **kwargs):
        """
        Automatically move student to alumni if semester exceeds the course's total semesters.
        """
        if self.semester > self.course.total_semesters:
            Alumni = apps.get_model('alumni', 'Alumni')  # Get Alumni model dynamically
            Alumni.objects.create(
                user=self,
                graduation_year=self.year_of_study,  # Assuming last year of study as graduation year
                course_completed=True
            )
            self.delete()  # Remove student entry
        else:
            super().save(*args, **kwargs)

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
    base_role = User.Role.ALUMNI
    alumni_id = models.AutoField(primary_key=True)
    graduation_year = models.IntegerField()
    current_job = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="alumni")  # Add department
    objects = AlumniManager()

    class Meta:
        verbose_name = "Alumni"
        verbose_name_plural = "Alumni"

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

class AssessmentType(models.TextChoices):
    MID_SEMESTER = "Mid Semester", ("Mid Semester")
    END_SEMESTER = "End Semester", ("End Semester")
    LAB = "Lab", ("Lab")
    OTHER = "Other", ("Other")

class Assessment(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    subject = models.ForeignKey("Subject", on_delete=models.CASCADE, related_name="assessments")
    semester = models.IntegerField(choices=SEMESTER_CHOICES, default=1)
    assessment_name = models.CharField(max_length=100)
    assessment_type = models.CharField(
        max_length=20,
        choices=AssessmentType.choices,
        default=AssessmentType.OTHER
    )
    total_marks = models.IntegerField()
    date_conducted = models.DateField()

    def clean(self):
        # Rule 2: Only one Mid Semester assessment per student per semester
        if self.assessment_type == AssessmentType.MID_SEMESTER:
            existing_midsem = Assessment.objects.filter(
                subject=self.subject,
                semester=self.semester,
                assessment_type=AssessmentType.MID_SEMESTER
            ).exclude(pk=self.pk)

            if existing_midsem.exists():
                raise ValidationError("Only one Mid Semester assessment is allowed per subject per semester.")

    def save(self, *args, **kwargs):
        self.clean()  # Validate before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.assessment_name} - {self.assessment_type} - {self.subject.subject_name}"

    
class StudentMarks(models.Model):
    marks_id = models.AutoField(primary_key=True)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="student_marks")
    student = models.ForeignKey("Student", on_delete=models.CASCADE, related_name="marks")
    marks_obtained = models.IntegerField(null=True, blank=True)
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
    file = models.FileField(upload_to="submissions/",null=True, blank=True)

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.assignment.title}"

class Semester(models.Model):
    semester_id = models.AutoField(primary_key=True)
    semester_no = models.IntegerField(unique=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Semester {self.semester_no}"

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendance_records")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, default=1)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="marked_attendance", default=1)
    date = models.DateField(default=now)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    HOUR_CHOICES = [
        (1, "9-10"), (2, "10-11"), (3, "11-12"),
        (4, "12-1"), (5, "2-3"), (6, "3-4"), (7, "4-5")
    ]
    hour = models.IntegerField(choices=HOUR_CHOICES, null=True, blank=True, default=1)
    status = models.CharField(max_length=10, choices=[("Present", "Present"), ("Absent", "Absent")], default="Present")

    class Meta:
        unique_together = ('student', 'date', 'hour')  # ✅ Ensures only one subject per hour

    def __str__(self):
        return f"{self.student.username} - {self.course} - {self.date} - {self.get_hour_display()} - {self.status} ({self.teacher.username})"
