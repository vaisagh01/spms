from django.urls import path
from .views import get_student_profile, get_teacher_profile, get_alumni_profile

urlpatterns = [
    path('profile/student/<int:student_id>/', get_student_profile, name='student_profile'),
    path('profile/teacher/<int:teacher_id>/', get_teacher_profile, name='teacher_profile'),
    path('profile/alumni/<int:alumni_id>/', get_alumni_profile, name='alumni_profile'),
]
