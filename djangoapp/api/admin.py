from django.contrib import admin
from .models import Teacher, User, Student, Alumni, Club, ClubMembers, Event

class ClubAdmin(admin.ModelAdmin):
    list_display = ("club_name", "club_category", "faculty_incharge", "leader")
    search_fields = ("club_name", "club_category", "leader__username")
    list_filter = ("club_category",)
    ordering = ("club_name",)

# Custom ClubMembers Admin
class ClubMembersAdmin(admin.ModelAdmin):
    list_display = ("student", "club", "role_in_club")
    search_fields = ("student__username", "club__club_name")
    list_filter = ("role_in_club",)
    ordering = ("club",)

# Custom Event Admin
class EventAdmin(admin.ModelAdmin):
    list_display = ("event_name", "club", "event_date")  # 🔥 Corrected names
    search_fields = ("event_name", "club__club_name")  
    list_filter = ("event_date", "club")  # 🔥 Corrected 'date' → 'event_date'
    ordering = ("event_date",)  # 🔥 Corrected 'date' → 'event_date'


# Custom Student Admin
class StudentAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "phone_number")
    search_fields = ("username", "email")
    list_filter = ("is_active",)
    ordering = ("username",)

# Custom Alumni Admin
class AlumniAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "graduation_year")
    search_fields = ("username", "email", "graduation_year")
    list_filter = ("graduation_year",)
    ordering = ("graduation_year",)

# Custom Teacher Admin (Already Good)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "department", "phone_number", "is_staff")
    search_fields = ("username", "email", "department")
    list_filter = ("department", "is_staff")
    ordering = ("username",)





admin.site.register(Club, ClubAdmin)
admin.site.register(ClubMembers, ClubMembersAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(Alumni, AlumniAdmin)
admin.site.register(Teacher, TeacherAdmin)

admin.site.site_header = "Admin Dashboard"
admin.site.site_title = "Admin Dashboard"
admin.site.index_title = "Welcome to the Admin Dashboard"

