from django.db import models

SEMESTER_CHOICES = [
    (1, "Semester 1"),
    (2, "Semester 2"),
    (3, "Semester 3"),
    (4, "Semester 4"),
    (5, "Semester 5"),
    (6, "Semester 6"),
]
class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    course_name = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    credits = models.IntegerField()

    def __str__(self):
        return self.course_name
class Student(models.Model):
    student_id = models.AutoField(primary_key=True)  # Primary Key
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # Optional field
    date_of_birth = models.DateField()
    enrollment_number = models.CharField(max_length=20, unique=True)  # Unique enrollment number
    course = models.ForeignKey(Course, on_delete=models.CASCADE, default=1)  # Course name
    year_of_study = models.IntegerField()  # Year of study (e.g., 1, 2, 3, 4)
    semester = models.IntegerField(choices=SEMESTER_CHOICES, default=1) 

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.enrollment_number}) - Semester {self.semester}"

class Club(models.Model):
    club_id = models.AutoField(primary_key=True)
    club_name = models.CharField(max_length=255)
    club_category = models.CharField(max_length=255)
    faculty_incharge = models.CharField(max_length=255)
    created_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.club_name

class ClubMembers(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="club_memberships")
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="club_members", default=1)  # Set a default club
    role_in_club = models.CharField(max_length=255)
    date_joined = models.DateField(auto_now_add=True)
    class Meta:
        unique_together = ('student', 'club')  # Ensure a student cannot join the same club twice
    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.club.club_name}"

class Event(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField()
    club = models.ForeignKey(Club, related_name='events', on_delete=models.CASCADE)
    attendees = models.ManyToManyField(Student, related_name='events_attending')

    def __str__(self):
        return self.name

class Teacher(models.Model):
    teacher_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=15, blank=True, null=True)
    department = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    subject = models.ForeignKey(
        'Subject', on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_teachers"
    )  # Changed related_name
    courses = models.ManyToManyField(Course, blank=True, related_name="assigned_teachers")

    hire_date = models.DateField()

<<<<<<< HEAD
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.designation}"
=======
    # Temporarily allow null values
    # course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name="teachers")

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.designation})"
>>>>>>> refs/remotes/origin/main

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
<<<<<<< HEAD
=======

# def_topic_is_completed
# def_ get_students_by_course
# 
>>>>>>> refs/remotes/origin/main
