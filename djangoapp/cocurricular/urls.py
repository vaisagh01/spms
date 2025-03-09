from django.urls import path
from .views import add_internship, get_internships, get_pending_internships, approve_internship, reject_internship, add_project, upload_certification, get_projects
from . import views

urlpatterns = [
    path('internships/<int:student_id>/add/', views.add_internship, name='add_internship'),
    path('internships/<int:student_id>/', views.get_internships, name='get_internships'),
    path('internships/pending/', views.get_pending_internships, name='get_pending_internships'),
    path('approve-internship/<int:student_id>/<int:internship_id>/<int:teacher_id>/', views.approve_internship, name='approve_internship'),
    path('internships/<int:student_id>/<int:internship_id>/reject/', views.reject_internship, name='reject_internship'),
    path('add-project/', add_project, name='add_project'),
    path('get-projects/', get_projects, name='get_projects'),
    path('upload-certification/<int:project_id>/', upload_certification, name='upload_certification'),
]
