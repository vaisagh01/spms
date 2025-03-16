from django.contrib import admin
from .models import Internship, Certification, Project
# Register your models here.
admin.site.register(Internship)
admin.site.register(Certification)
admin.site.register(Project)