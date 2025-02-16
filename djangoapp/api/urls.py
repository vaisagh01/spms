from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import StudentViewSet, ClubViewSet, EventViewSet, ClubMembersViewSet, get_clubs_by_student, get_events_by_student
from rest_framework_simplejwt.views import TokenRefreshView
from .views import admin_dashboard, teacher_dashboard, student_dashboard, alumni_dashboard
from api.views import api_login
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'clubs', ClubViewSet, basename='club')
router.register(r'club-members', ClubMembersViewSet, basename='club-members')
router.register(r'events', EventViewSet, basename='event')


urlpatterns = [
    path('api', include(router.urls)),
    path("login/", api_login, name="api_login"),  # ✅ Login endpoint
    path('clubs/', views.get_clubs, name='get_clubs'),
    path('student/clubs/', get_clubs_by_student, name='get_clubs_by_student'),
    path('student/events/', get_events_by_student, name='get_events_by_student'),
    path("admin-dashboard/", admin_dashboard, name="admin_dashboard"),
    path("teacher-dashboard/", teacher_dashboard, name="teacher_dashboard"),
    path("alumni-dashboard/", alumni_dashboard, name="alumni_dashboard"),  
    path('club/<int:club_id>/', views.get_club_profile, name='get_club_profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
  
]


    
    
