import pusher
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from curricular.models import Subject
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
            subject_id = data.get('subject_id')
            message = data.get('message', 'New notification!')

            if not subject_id:
                return JsonResponse({'status': 'error', 'message': 'subject_id is required'}, status=400)

            # Ensure subject exists
            subject = Subject.objects.filter(subject_id=subject_id).first()
            if not subject:
                return JsonResponse({'status': 'error', 'message': 'Invalid subject_id'}, status=404)

            # Get the related course from the subject
            course = subject.course

            # Save the notification in the database
            notification = Noti.objects.create(course=course, message=message)

            # Define a unique Pusher channel for this course
            channel_name = f'course-{course.course_id}'

            # Trigger Pusher event
            pusher_client.trigger(channel_name, 'new-notification', {
                'id': notification.id,
                'message': message,
                'created_at': notification.created_at.isoformat()
            })

            return JsonResponse({'status': 'success', 'message': 'Notification sent successfully!'});
        
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def get_course_notifications(request, course_id):
    try:
        course = Course.objects.filter(course_id=course_id).first()
        if not course:
            return JsonResponse({'status': 'error', 'message': 'Invalid course_id'}, status=404)

        notifications = Noti.objects.filter(course=course).order_by('-created_at')
        return JsonResponse({'status': 'success', 'notifications': list(notifications.values())})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
