from django.urls import path
from .views import add_participant, get_events, ClubMembersViewSet, ClubViewSet, EventViewSet, delete_event_view, delete_member_view, get_club_profile, get_events_by_student, add_event_view, add_member_view, get_student_clubs, get_student_event_participations, get_event_poster, create_event_poster
from django.urls import path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'clubs', ClubViewSet, basename='club')
router.register(r'club-members', ClubMembersViewSet, basename='club-members')
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('clubs/<int:club_id>/profile/', get_club_profile, name='club_profile'),
    path("events/", get_events, name="get_all_events"),
    path("event/add_participant/", add_participant, name="add_participant"),

    path('add_member/<int:club_id>/', add_member_view, name='add_member'),
    path('add_event/<int:club_id>/', add_event_view, name='add_event'),
    path('clubs/<int:club_id>/delete_event/', delete_event_view, name='delete_event'),
    path('clubs/<int:club_id>/delete_member/', delete_member_view, name='delete_member'),
    path('student/events/', get_events_by_student, name='get_events_by_student'),
    path('student/<int:student_id>/clubs/', get_student_clubs, name='student_clubs'),
    path('student/<int:student_id>/events/', get_student_event_participations, name='student_events'),
    path('posters/<int:event_id>/', get_event_poster, name='get-event-poster'),  
    path('posters/<int:event_id>/create/', create_event_poster, name='create-event-poster'),  


]
