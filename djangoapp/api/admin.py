from django.contrib import admin
from .models import (
    Student, Club, ClubMembers, Assignment, Subject, Teacher,  
    Assessment, Course, AssignmentSubmission, Topic, Chapter,
    StudentMarks# ✅ Added Topic
)
class TeacherAdmin(admin.ModelAdmin):
    filter_horizontal = ('courses',)  # ✅ Changes multi-select box to a better UI

admin.site.register(Teacher, TeacherAdmin)
admin.site.register(Student)
admin.site.register(Club)
admin.site.register(ClubMembers)
admin.site.register(Assignment)  # ✅ Register Assignments
admin.site.register(Subject)  # ✅ Register Subjects
#admin.site.register(Teacher)  # ✅ Register Teachers

admin.site.register(Assessment)  # ✅ Register Assessments
admin.site.register(Course)  # ✅ Register Courses
admin.site.register(AssignmentSubmission)  # ✅ Register Assignment Submissions
admin.site.register(Topic)  # ✅ Register Topics
admin.site.register(Chapter)  # ✅ Register Topics
admin.site.register(StudentMarks)  # ✅ Register Topics
