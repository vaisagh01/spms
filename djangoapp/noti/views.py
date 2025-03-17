from django.views import View
import pusher
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from curricular.models import Subject
from extracurricular.models import ClubMembers, Event
from .models import Course, EventChat, Noti

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

@csrf_exempt
def get_course_notifications(request, course_id):
    try:
        course = Course.objects.filter(course_id=course_id).first()
        if not course:
            return JsonResponse({'status': 'error', 'message': 'Invalid course_id'}, status=404)

        notifications = Noti.objects.filter(course=course).order_by('-created_at')
        return JsonResponse({'status': 'success', 'notifications': list(notifications.values())})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


# Store messages in-memory for now (replace with database model if needed)
event_chat_messages = {}

class GetEventChat(View):
    """Retrieve all chat messages for a specific event."""
    def get(self, request, event_id, *args, **kwargs):
        event = get_object_or_404(Event, event_id=event_id)
        messages = EventChat.objects.filter(event=event).order_by("timestamp")

        chat_data = [
            {
                "sender_name": msg.sender.username,  
                "message": msg.message,
                "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M"),
            }
            for msg in messages
        ]

        return JsonResponse({"messages": chat_data}, safe=False, status=200)


class SendChatMessage(View):
    """Allow only club leaders to send messages in event chat."""
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            club_id = data.get("club_id")
            event_id = data.get("event_id")
            sender_id = data.get("sender_id")
            message = data.get("message")

            # Validate required fields
            if not all([club_id, event_id, sender_id, message]):
                return JsonResponse({"error": "Missing required fields."}, status=400)

            # Check if sender is the club leader
            try:
                club_member = ClubMembers.objects.get(student_id=sender_id, club_id=club_id, role_in_club="Leader")
            except ClubMembers.DoesNotExist:
                return JsonResponse({"error": "Only the club leader can send messages."}, status=403)

            sender = club_member.student  # Access the Student instance
            event = get_object_or_404(Event, event_id=event_id)

            # Store message in the database
            chat_message = EventChat.objects.create(
                event=event,
                club=club_member.club,
                sender=sender,
                message=message
            )

            # Prepare message data
            message_data = {
                "sender_name": sender.username,
                "message": message,
                "timestamp": chat_message.timestamp.strftime("%Y-%m-%d %H:%M"),
            }

            # Send real-time update via Pusher
            pusher_client.trigger(f"event_{event_id}_chat", "new-message", message_data)

            return JsonResponse({"success": True, "message": message_data}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data."}, status=400)