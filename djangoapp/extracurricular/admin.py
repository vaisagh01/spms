from django.contrib import admin
from .models import Club, ClubMembers, Event, EventParticipation

# Register your models here.
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


admin.site.register(Club, ClubAdmin)
admin.site.register(ClubMembers, ClubMembersAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(EventParticipation)
