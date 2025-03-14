from django.shortcuts import get_object_or_404
from requests import Response
from rest_framework import generics
from django.contrib.auth.models import User
from curricular.models import Teacher
from .models import Alumni, AlumniEvent, Donation, DepartmentRequirement
from .serializers import AlumniSerializer, AlumniEventSerializer, AlumniUpdateSerializer, DonationSerializer, DepartmentRequirementSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

# Alumni Profile View
class AlumniDetailView(generics.RetrieveAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return self.request.user.alumni
    
class AlumniListView(generics.ListAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    permission_classes = [AllowAny] 
    
class AlumniEventListView(generics.ListAPIView):
    serializer_class = AlumniEventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        department_id = self.request.query_params.get('department_id', None)
        if department_id:
            return AlumniEvent.objects.filter(department_id=department_id)
        return AlumniEvent.objects.all()
    

class AlumniEventCreateView(generics.CreateAPIView):
    queryset = AlumniEvent.objects.all()
    serializer_class = AlumniEventSerializer
    permission_classes = [AllowAny]  # No authentication required

    def create(self, request, *args, **kwargs):
        teacher_id = request.data.get("teacher_id")  # Expecting teacher_id in request
        department_id = request.data.get("department_id")  # Expecting department_id in request

        if not teacher_id:
            return JsonResponse({"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not department_id:
            return JsonResponse({"error": "department_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher = Teacher.objects.get(teacher_id=teacher_id, designation="HOD")  # Only allow HODs
        except Teacher.DoesNotExist:
            return JsonResponse({"error": "Only HODs can create events."}, status=status.HTTP_403_FORBIDDEN)

        # Ensure department is assigned before saving
        data = request.data.copy()
        data["department"] = department_id  # Assigning department correctly

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Donations
class DonationCreateView(generics.CreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(alumni=self.request.user.alumni)

# Department Requirements
class DepartmentRequirementListView(generics.ListAPIView):
    queryset = DepartmentRequirement.objects.all()
    serializer_class = DepartmentRequirementSerializer
    permission_classes = [IsAuthenticated]


def get_all_donations(request):
    """Fetch all donations"""
    donations = Donation.objects.select_related('alumni__user').values(
        'alumni__user__username', 'amount', 'message', 'date'
    )
    return JsonResponse(list(donations), safe=False)

from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes

@csrf_exempt
@require_http_methods(["POST", "PUT", "DELETE"])
def manage_alumni_event(request, event_id=None):
    """Create, update, delete alumni events (HOD only)"""
    user = request.user
    if not user.is_authenticated or user.designation != "HOD":
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if request.method == "POST":
        if event_id:
            return JsonResponse({"error": "Event ID not required for creation"}, status=400)

        required_fields = ["title", "description", "date", "event_type"]
        if not all(field in data for field in required_fields):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        event = AlumniEvent.objects.create(
            title=data["title"],
            description=data["description"],
            date=data["date"],
            event_type=data["event_type"],
        )
        return JsonResponse({"message": "Event created", "event_id": event.id}, status=201)

    if request.method == "PUT":
        if not event_id:
            return JsonResponse({"error": "Event ID required for update"}, status=400)

        event = get_object_or_404(AlumniEvent, id=event_id)
        event.title = data.get("title", event.title)
        event.description = data.get("description", event.description)
        event.date = data.get("date", event.date)
        event.event_type = data.get("event_type", event.event_type)
        event.save()
        return JsonResponse({"message": "Event updated"})

    if request.method == "DELETE":
        if not event_id:
            return JsonResponse({"error": "Event ID required for deletion"}, status=400)

        event = get_object_or_404(AlumniEvent, id=event_id)
        event.delete()
        return JsonResponse({"message": "Event deleted"})

    return JsonResponse({"error": "Invalid request"}, status=400)

from django.http import JsonResponse
import json
from .models import AlumniEvent

@csrf_exempt
def update_event(request, event_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            event = AlumniEvent.objects.get(id=event_id)
            event.title = data.get("title", event.title)
            event.description = data.get("description", event.description)
            event.date = data.get("date", event.date)
            event.event_type = data.get("event_type", event.event_type)
            event.save()
            return JsonResponse({"message": "Event updated successfully", "event": {
                "id": event.id, "title": event.title, "description": event.description,
                "date": event.date, "event_type": event.event_type
            }})
        except AlumniEvent.DoesNotExist:
            return JsonResponse({"error": "Event not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def delete_event(request, event_id):
    if request.method == "DELETE":
        try:
            event = AlumniEvent.objects.get(id=event_id)
            event.delete()
            return JsonResponse({"message": "Event deleted successfully"})
        except AlumniEvent.DoesNotExist:
            return JsonResponse({"error": "Event not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@api_view(['PATCH'])
@permission_classes([AllowAny])  # ✅ Allows public access
def update_alumni(request, alumni_id):
    alumni = get_object_or_404(Alumni, pk=alumni_id)
    
    serializer = AlumniUpdateSerializer(alumni, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return JsonResponse(serializer.errors)

@api_view(['GET'])
@permission_classes([AllowAny])  # ✅ Allows public access
def get_alumni_profile(request, alumni_id):
    alumni = get_object_or_404(Alumni, pk=alumni_id)
    serializer = AlumniUpdateSerializer(alumni)
    return JsonResponse(serializer.data)