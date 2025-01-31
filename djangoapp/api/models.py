from django.db import models

class Student(models.Model):
    student_id = models.AutoField(primary_key=True)  # Primary Key
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # Optional field
    date_of_birth = models.DateField()
    enrollment_number = models.CharField(max_length=20, unique=True)  # Unique enrollment number
    course = models.CharField(max_length=100)  # Course name
    year_of_study = models.IntegerField()  # Year of study (e.g., 1, 2, 3, 4)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.enrollment_number})"

class Club(models.Model):
    club_id = models.AutoField(primary_key=True)
    club_name = models.CharField(max_length=255)
    club_category = models.CharField(max_length=255)
    faculty_incharge = models.CharField(max_length=255)
    created_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.club_name
    
class ClubMembers(models.Model):
    member_id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()  # Assuming Student model exists elsewhere
    club_id = models.ForeignKey(Club, on_delete=models.CASCADE)
    role_in_club = models.CharField(max_length=255)
    date_joined = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_id} - {self.club_id}"
class Event(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField()
    club = models.ForeignKey(Club, related_name='events', on_delete=models.CASCADE)
    attendees = models.ManyToManyField(Student, related_name='events_attending')

    def __str__(self):
        return self.name