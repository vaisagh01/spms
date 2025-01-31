from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import StudentViewSet, ClubViewSet, EventViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'clubs', ClubViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('clubs', views.get_clubs, name='get_clubs'),
    path('club/<int:club_id>/', views.get_club_by_id, name='get_club_by_id'),
    
]