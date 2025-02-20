from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import create_student_marks, get_assessments_and_marks_by_student, get_assignments_by_student, get_attendance_by_course, get_chapters_by_topic, get_student_marks_by_assessment_id, get_subjects_by_student, get_student_details, get_topics_by_subject, post_assignment, update_assignment, update_student_marks,get_assignment_submissions,upload_assignment_submission # Add this import statement
from . import views
router = DefaultRouter()


urlpatterns = [
    path('', include(router.urls)),

    # Student-related URLs
    path('student/<int:student_id>/', get_student_details, name='get_student_details'),
    path('subjects/student/<int:student_id>/', get_subjects_by_student, name='get_subjects_by_student'),
    path('assignments/student/<int:student_id>/', get_assignments_by_student, name='get_assignments_by_student'),
    path('student/<int:student_id>/assignments-marks/', get_assessments_and_marks_by_student, name='student_assignments_marks'),
    path('get_student_marks_by_assessment_id/<int:assessment_id>/', get_student_marks_by_assessment_id, name='get_student_marks'),
    path('create_student_marks/', create_student_marks, name='create_student_marks'),
    path('update_student_marks/<int:student_marks_id>/', update_student_marks, name='update_student_marks'),

    # Curricular-related URLs
    path('topics/subject/<int:subject_id>/', get_topics_by_subject, name='get_topics_by_subject'),
    path('chapters/topic/<int:topic_id>/', get_chapters_by_topic, name='get_chapters_by_topic'),
    path("assignments/post/<int:teacher_id>/", post_assignment, name="post_assignment"),
    path('update_assignment/<int:teacher_id>/<int:assignment_id>/', update_assignment, name='update_assignment'),
    path("get_assignment_submissions/<int:course_id>/", get_assignment_submissions, name="get_assignment_submissions"),
    path("upload_assignment_submission/", upload_assignment_submission, name="upload_assignment_submission"),
    path("attendance/mark/", views.mark_attendance, name="mark_attendance"),
    path("attendance/update/<int:attendance_id>/", views.update_attendance, name="update_attendance"),
    path("attendance/student/<int:student_id>/", views.get_attendance_by_student, name="get_attendance_by_student"),
    path("attendance/course/<int:course_id>/", views.get_attendance_by_course, name="get_attendance_by_course"),
    path("attendance/subject/<int:subject_id>/", views.get_attendance_by_subject, name="get_attendance_by_subject"),
    path("attendance/course/<int:course_id>/", get_attendance_by_course, name="get_attendance_by_course"),


]