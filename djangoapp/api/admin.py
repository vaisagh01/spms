from django.contrib import admin
from .models import Student, Club, ClubMembers  # Import models

admin.site.register(Student)
admin.site.register(Club)
admin.site.register(ClubMembers)
