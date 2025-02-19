from django.contrib import admin
from .models import Alumni, AlumniEvent, Donation, DepartmentRequirement

admin.site.register(Alumni)
admin.site.register(AlumniEvent)
admin.site.register(Donation)
admin.site.register(DepartmentRequirement)
