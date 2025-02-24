from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Notification, Course  # Ensure Course is imported
import pusher

pusher_client = pusher.Pusher(
    app_id='1946154',
    key='d35d4c488b32e53913fd',
    secret='fb7aef8774c48414ad22',
    cluster='ap2',
    ssl=True
)

def send_course_notification(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)

        course_id = data.get("course_id")
        message = data.get("message")

        if not course_id or not message:
            return JsonResponse({"status": "error", "message": "Missing course_id or message"}, status=400)
        # ✅ Get the Course instance
        course = get_object_or_404(Course, course_id=course_id)
        # ✅ Save notification in the database
        notification = Notification.objects.create(course=course, message=message)
        # ✅ Send real-time notification via Pusher
        pusher_client.trigger(f'course-{course_id}', 'new-notification', {
            "id": notification.id,
            "message": notification.message,
            "created_at": notification.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
        return JsonResponse({"status": "success", "message": "Notification sent successfully!"})

    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)
