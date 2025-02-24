from django.urls import path
from .views import send_course_notification, get_course_notifications

urlpatterns = [
    path('send-course-notification/', send_course_notification, name='send-course-notification'),
    path('course-notifications/<int:course_id>/', get_course_notifications, name='get-course-notifications'),
]
