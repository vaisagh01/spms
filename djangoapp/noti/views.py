import pusher
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Course, Noti

# Initialize Pusher
pusher_client = pusher.Pusher(
    app_id='1946154',
    key='d35d4c488b32e53913fd',
    secret='fb7aef8774c48414ad22',
    cluster='ap2',
    ssl=True
)

@csrf_exempt
def send_course_notification(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            course_id = data.get('course_id')
            message = data.get('message', 'New notification!')

            if not course_id:
                return JsonResponse({'status': 'error', 'message': 'course_id is required'}, status=400)

            # Ensure course exists
            course = Course.objects.filter(course_id=course_id).first()
            if not course:
                return JsonResponse({'status': 'error', 'message': 'Invalid course_id'}, status=404)

            # Save the notification in the database
            notification = Noti.objects.create(course=course, message=message)

            # Define a unique Pusher channel for this course
            channel_name = f'course-{course_id}'

            # Trigger Pusher event
            pusher_client.trigger(channel_name, 'new-notification', {
                'id': notification.id,
                'message': message,
                'created_at': notification.created_at.isoformat()
            })

            return JsonResponse({'status': 'success', 'message': 'Notification sent successfullyyyyy0y!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

from django.core.serializers import serialize
from django.http import JsonResponse

def get_course_notifications(request, course_id):
    try:
        course = Course.objects.filter(course_id=course_id).first()
        if not course:
            return JsonResponse({'status': 'error', 'message': 'Invalid course_id'}, status=404)

        notifications = Noti.objects.filter(course=course).order_by('-created_at')
        return JsonResponse({'status': 'success', 'notifications': list(notifications.values())})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
