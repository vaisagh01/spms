# Django & DRF Imports
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Project-specific Views Imports
from . import views
from .views import (
    StudentViewSet, ClubViewSet, EventViewSet, ClubMembersViewSet,
    get_student_details, get_topics_by_subject, get_chapters_by_topic,
    get_subjects_by_student, get_assignments_by_student, get_assessments_and_marks_by_student,
    post_assignment, get_student_clubs, get_events_by_student,
    admin_dashboard, teacher_dashboard, student_dashboard, alumni_dashboard,
    api_login, get_student_event_participations, get_club_profile
)

# Setting up DRF Default Router
router = DefaultRouter()
router.register(r'clubs', ClubViewSet, basename='club')
router.register(r'club-members', ClubMembersViewSet, basename='club-members')
router.register(r'events', EventViewSet, basename='event')

# URL Patterns
urlpatterns = [
    # DRF Router URLs
    path('', include(router.urls)),

    # Views for Clubs
    # path('clubs/', views.get_clubs, name='get_clubs'),
    # path('club/<int:club_id>/', views.get_club_by_id, name='get_club_by_id'),
    path('clubs/<int:club_id>/profile/', get_club_profile, name='club-profile'),
    # path('clubs/student/<int:student_id>/', get_clubs_by_student, name='get_clubs_by_student'),
    path('student/<int:student_id>/clubs/', get_student_clubs, name='student_clubs'),

    # Views for Students
    path('student/<int:student_id>/', get_student_details, name='get_student_details'),
    path('subjects/student/<int:student_id>/', get_subjects_by_student, name='get_subjects_by_student'),
    path('assignments/student/<int:student_id>/', get_assignments_by_student, name='get_assignments_by_subject'),
    path('student/<int:student_id>/assignments-marks/', get_assessments_and_marks_by_student, name='student-assignments-marks'),

    # Views for Topics & Chapters
    path('topics/subject/<int:subject_id>/', get_topics_by_subject, name='get_topics_by_subject'),
    path('chapters/topic/<int:topic_id>/', get_chapters_by_topic, name='get_chapters_by_topic'),

    # Post Assignment (Teacher)
    path("assignments/post/<int:teacher_id>/", post_assignment, name="post_assignment"),

    # Authentication & Token Management
    path("login/", api_login, name="api_login"),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dashboards
    path("admin-dashboard/", admin_dashboard, name="admin_dashboard"),
    path("teacher-dashboard/", teacher_dashboard, name="teacher_dashboard"),
    path("alumni-dashboard/", alumni_dashboard, name="alumni_dashboard"),

    # Event-related Views
    path('student/events/', get_events_by_student, name='get_events_by_student'),
    path('student/<int:student_id>/events/', views.get_student_event_participations, name='student_events'),
]
