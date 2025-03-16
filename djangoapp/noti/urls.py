from django.urls import path
from .views import GetEventChat, SendChatMessage, send_course_notification, get_course_notifications

urlpatterns = [
    path('send-course-notification/', send_course_notification, name='send-course-notification'),
    path('course-notifications/<int:course_id>/', get_course_notifications, name='get-course-notifications'),
    
    path("event/<int:event_id>/chat/", GetEventChat.as_view(), name="get_event_chat"),
    path("event/chat/send/", SendChatMessage.as_view(), name="send_chat_message"),
]
