from django.contrib import admin
from .models import Alumni, Department, Attendance, Teacher, Student, Assignment, Subject, Assessment, Course, AssignmentSubmission, Topic, Chapter, StudentMarks, User

# Register your models here.
class TeacherAdmin(admin.ModelAdmin):
    filter_horizontal = ('courses',)  # ✅ Changes multi-select box to a better UI

admin.site.register(Teacher, TeacherAdmin)
admin.site.register(Student)
admin.site.register(Assignment)  # ✅ Register Assignments
admin.site.register(Subject)  # ✅ Register Subjects
admin.site.register(Assessment)  # ✅ Register Assessments
admin.site.register(Course)  # ✅ Register Courses
admin.site.register(AssignmentSubmission)  # ✅ Register Assignment Submissions
admin.site.register(Topic)  # ✅ Register Topics
admin.site.register(Chapter)  # ✅ Register Topics
admin.site.register(StudentMarks)  # ✅ Register Topics
admin.site.register(User)  # ✅ Register Topics
admin.site.register(Attendance)
admin.site.register(Department)
admin.site.register(Alumni)
