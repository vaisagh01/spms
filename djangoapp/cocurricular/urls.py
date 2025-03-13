from django.urls import path
from .views import add_internship, get_internships, get_pending_internships, approve_internship, reject_internship, add_project,  get_projects, get_certifications, upload_certification
from .views import create_co_curricular_event
from . import views

urlpatterns = [
    path('internships/<int:student_id>/add/', views.add_internship, name='add_internship'),
    path('internships/<int:student_id>/', views.get_internships, name='get_internships'),
    path('internships/pending/', views.get_pending_internships, name='get_pending_internships'),
    path('approve-internship/<int:student_id>/<int:internship_id>/<int:teacher_id>/', views.approve_internship, name='approve_internship'),
    path('internships/<int:student_id>/<int:internship_id>/reject/', views.reject_internship, name='reject_internship'),
    path('add-project/<int:student_id>/', add_project, name='add_project'),
    path('get-projects/<int:student_id>/', get_projects, name='get_projects'),
    path('students/<int:student_id>/certifications/upload/', upload_certification, name='upload-certification'),
    path('students/<int:student_id>/certifications/', get_certifications, name='get-certifications'),
    path('student/<int:student_id>/co-curricular-participations/', views.get_student_co_curricular_participations, name='student_co_curricular_participations'),
    path('co-curricular-events/', views.get_all_co_curricular_events, name='all_co_curricular_events'),
    path('create-co-curricular-event/', create_co_curricular_event, name='create_co_curricular_event')

]
