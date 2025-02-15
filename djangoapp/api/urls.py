from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    StudentViewSet, ClubViewSet, EventViewSet,
    get_student_details, get_subject_by_semester,
    get_assignments_by_subject, get_topics_by_subject,
    get_chapters_by_topic, 
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'clubs', ClubViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('clubs/', views.get_clubs, name='get_clubs'),
    path('club/<int:club_id>/', views.get_club_by_id, name='get_club_by_id'),
    path('clubs/student/<int:student_id>/', views.get_clubs_by_student, name='get_clubs_by_student'),
    path('student/<int:student_id>/', get_student_details, name='get_student_details'),
    path('subjects/semester/<int:semester_no>/', get_subject_by_semester, name='get_subject_by_semester'),
    path('assignments/subject/<int:subject_id>/', get_assignments_by_subject, name='get_assignments_by_subject'),
    path('topics/subject/<int:subject_id>/', get_topics_by_subject, name='get_topics_by_subject'),
    path('chapters/topic/<int:topic_id>/', get_chapters_by_topic, name='get_chapters_by_topic'),
    
]
