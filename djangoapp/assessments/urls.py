from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import create_assessment, create_student_marks, get_all_assessments, get_assessments_and_marks_by_student, get_or_update_student_marks, get_student_marks_by_assessment_id, update_student_marks
from . import views
router = DefaultRouter()


urlpatterns = [
    path('student/<int:student_id>/assignments-marks/', get_assessments_and_marks_by_student, name='student_assignments_marks'),
    path('get_student_marks_by_assessment_id/<int:assessment_id>/', get_student_marks_by_assessment_id, name='get_student_marks'),
    path('create_student_marks/', create_student_marks, name='create_student_marks'),
    path('update_student_marks/<int:student_marks_id>/', update_student_marks, name='update_student_marks'),
    path("create/", create_assessment, name="create_assessment"),
    path("<int:teacher_id>/", get_all_assessments, name="get_all_assessments"),
    path("<int:assessment_id>/marks/", get_or_update_student_marks, name="get_or_update_student_marks"),
]