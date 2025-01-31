from django.http import JsonResponse
from rest_framework import viewsets
from .models import Student, Club, Event
from django.core import serializers
from django.views.decorators.http import require_http_methods
from .serializers import StudentSerializer, ClubSerializer, EventSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    

def get_clubs(request):
    # Fetch all clubs
    clubs = Club.objects.all()
    
    # Create a list of dictionaries containing club name and category
    clubs_data = [{'club_name': club.club_name, 'club_category': club.club_category} for club in clubs]
    
    # Return the club data as a JSON response
    return JsonResponse({'clubs': clubs_data}, safe=False)

def get_club_by_id(request, club_id):
    try:
        # Fetch the club by ID
        club = Club.objects.get(club_id=club_id)
        # Serialize the club data
        club_data = {
            'club_name': club.club_name,
            'club_category': club.club_category,
            'faculty_incharge': club.faculty_incharge,
            'created_date': club.created_date
        }
        # Return the club data as JSON
        return JsonResponse({'club': club_data})
    except Club.DoesNotExist:
        return JsonResponse({'error': 'Club not found'}, status=404)