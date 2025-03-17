from django.urls import path
from .views import generate_resume
from .views import generate_resume 
urlpatterns = [
    path('generate/<int:student_id>/', generate_resume, name='generate_resume'),
]
