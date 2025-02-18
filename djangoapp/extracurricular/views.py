import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from curricular.models import Student
from .models import Club, ClubMembers, Event, EventParticipation
from .serializers import ClubMemberSerializer, ClubSerializer, EventSerializer
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Create your views here.
class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

    def get_permissions(self):
        """Allow all users to view clubs, but only admins can create/edit"""
        if self.action in ['list', 'retrieve']:  # View clubs
            return [permissions.AllowAny()]  # Or use IsAuthenticated if login is required
        return [permissions.IsAdminUser()]  # Create/Edit/Delete only for Admins

    def create(self, request, *args, **kwargs):
        """Admin Creates a Club & Assigns a Leader"""
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to create a club."},
                status=status.HTTP_403_FORBIDDEN,
            )

        leader_id = request.data.get("leader")
        leader = get_object_or_404(Student, pk=leader_id)
        print(f"Leader found: {leader}")

        try:
            with transaction.atomic():  # Ensure both Club and ClubMembers are created together
                club = Club.objects.create(
                    club_name=request.data["club_name"],
                    club_category=request.data["club_category"],
                    faculty_incharge=request.data["faculty_incharge"],
                    leader=leader,
                )
                print(f"Club Created: {club}")

                # ✅ Ensure leader is added as a member immediately
                member = ClubMembers.objects.create(student=leader, club=club, role_in_club="Leader")
                print(f"Leader added to ClubMembers: {member}")

            return Response({"message": "Club created successfully"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"❌ Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def retrieve(self, request, pk=None):
        """Fetch the club profile with details, members, and events."""
        club = get_object_or_404(Club, pk=pk)
        serializer = ClubSerializer(club)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ClubMembersViewSet(viewsets.ModelViewSet):
    queryset = ClubMembers.objects.all()
    serializer_class = ClubMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["POST"], permission_classes=[permissions.IsAuthenticated])
    def approve_member(self, request, pk=None):
        """Leader Approves Membership Requests"""
        member_request = get_object_or_404(ClubMembers, pk=pk)
        
        # Ensure only the leader of the club can approve
        if member_request.club.leader != request.user:
            return Response({"message": "Only club leaders can approve requests"}, status=status.HTTP_403_FORBIDDEN)

        if member_request.role_in_club == "Pending":
            member_request.role_in_club = "Member"
            member_request.save()
            return Response({"message": "Membership approved"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["DELETE"], permission_classes=[permissions.IsAuthenticated])
    def reject_member(self, request, pk=None):
        """Leader Rejects Membership Requests"""
        member_request = get_object_or_404(ClubMembers, pk=pk)

        # Ensure only the leader of the club can reject
        if member_request.club.leader != request.user:
            return Response({"message": "Only club leaders can reject requests"}, status=status.HTTP_403_FORBIDDEN)

        if member_request.role_in_club == "Pending":
            member_request.delete()
            return Response({"message": "Membership request rejected"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def create(self, request, *args, **kwargs):
        """Leader Creates an Event for Their Club"""
        student = request.user
        club_id = request.data.get("club_id")
        club = get_object_or_404(Club, pk=club_id)

        # Ensure only the leader can create events
        if club.leader != student:
            return Response({"message": "Only the club leader can create events"}, status=status.HTTP_403_FORBIDDEN)

        event = Event.objects.create(
            name=request.data["name"],
            description=request.data["description"],
            date=request.data["date"],
            club=club,
        )
        return Response({"message": "Event created successfully"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["POST"])
    def join_event(self, request, pk=None):
        """Student Joins an Event"""
        student = request.user
        event = get_object_or_404(Event, pk=pk)

        if event.attendees.filter(pk=student.pk).exists():
            return Response({"message": "Already joined this event"}, status=status.HTTP_400_BAD_REQUEST)

        event.attendees.add(student)
        return Response({"message": "Successfully joined the event"}, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # <-- Restrict access to authenticated users
def get_clubs(request):
    clubs = Club.objects.all()
    clubs_data = [{"club_name": club.club_name, "club_category": club.club_category} for club in clubs]
    return JsonResponse({"clubs": clubs_data}, safe=False)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])  
@permission_classes([IsAuthenticated])  
def get_clubs_by_student(request):
    # 🔥 Manually authenticate user
    auth = JWTAuthentication()
    user, token = auth.authenticate(request)  
    
    if user is None:
        return JsonResponse({"error": "Invalid or missing token"}, status=401)

    print("🔥 DEBUGGING START 🔥")
    print(f"👉 Headers: {request.headers}")  
    print(f"👉 Authorization: {request.headers.get('Authorization')}")  
    print(f"👉 User from JWT: {user} (ID: {getattr(user, 'id', None)})")  
    print(f"👉 Is Authenticated: {user.is_authenticated}")  

    # 🔍 Try fetching the user manually to avoid mismatches
    try:
        student = Student.objects.get(id=user.id)
        print(f"✅ Matched Student: {student}")
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    # Fetch the clubs for the authenticated student
    memberships = ClubMembers.objects.filter(student=student)
    clubs_data = [{"club_name": m.club.club_name, "club_category": m.club.club_category} for m in memberships]

    print(f"🎯 Clubs for {student}: {clubs_data}")  
    return JsonResponse({"student_clubs": clubs_data}, safe=False)

# @login_required
def get_events_by_student(request):
    student = request.user
    memberships = ClubMembers.objects.filter(student=student)
    events = Event.objects.filter(club__in=[membership.club for membership in memberships])
    events_data = [{'event_name': event.event_name, 'event_date': event.event_date, 'club_name': event.club.club_name} for event in events]
    return JsonResponse({'student_events': events_data}, safe=False)

def get_club_profile(request, club_id):
    """Fetch club details, members, events, and event participants"""
    club = get_object_or_404(Club, pk=club_id)

    # Get members
    members = ClubMembers.objects.filter(club=club)
    members_data = [
        {
            "member_id": member.member_id,
            "student_id": member.student.student_id,
            "name": member.student.username,
            "email": member.student.email,
            "role_in_club": member.role_in_club,
        }
        for member in members
    ]

    # Get club events
    events = Event.objects.filter(club=club)
    events_data = []
    for event in events:
        # Get participants for each event
        event_participations = EventParticipation.objects.filter(event=event)
        participants_data = [
            {
                "participant_name": participation.club_member.student.username,
                "role_in_event": participation.role_in_event,
                "achievement": participation.achievement,
            }
            for participation in event_participations
        ]
        
        events_data.append({
            "event_id": event.event_id,
            "event_name": event.event_name,
            "event_date": event.event_date,
            "description": event.description,
            "participants": participants_data,
        })

    club_data = {
        "club_name": club.club_name,
        "club_category": club.club_category,
        "faculty_incharge": club.faculty_incharge.username,
        "leader": club.leader.username,
        "leader_id": club.leader.student_id,  # Include leader_id
        "description": club.club_description,  # Ensure this field exists in the model
        "members": members_data,
        "events": events_data,
    }

    return JsonResponse({"club_profile": club_data}, safe=False)

# now for teachers to add assignment

@csrf_exempt
@require_http_methods(["POST"])
def add_member_view(request, club_id):
    try:
        # Parse the JSON body
        data = json.loads(request.body)
        
        # Extract username and role from the body
        username = data.get("username")
        role = data.get("role", "Member")  # Default role is "Member"

        # Check if username is provided
        if not username:
            return JsonResponse({"status": "error", "message": "Username is required."}, status=400)
        
        # Get the club instance by club_id
        try:
            club = Club.objects.get(club_id=club_id)
        except Club.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Club not found."}, status=404)
        
        # Get the student instance by username
        try:
            student = Student.objects.get(username=username)
        except Student.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Student not found."}, status=404)
        
        # Check if the student is already a member of the club
        if ClubMembers.objects.filter(student=student, club=club).exists():
            return JsonResponse({"status": "error", "message": "Student is already a member of the club."}, status=400)

        # Add the student as a club member
        member = ClubMembers.objects.create(
            student=student,
            club=club,
            role_in_club=role
        )

        return JsonResponse({
            "status": "success",
            "message": f"Member {student.username} added to club {club.club_name} as {role}"
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON format."}, status=400)

from datetime import datetime  # Correct import of datetime class

@csrf_exempt
@require_http_methods(["POST"])
def add_event_view(request, club_id):
    try:
        # Parse the JSON body
        data = json.loads(request.body)
        
        # Extract event details from the body
        event_name = data.get("event_name")
        description = data.get("description", "")
        event_date_str = data.get("event_date")

        # Check if event_date is provided
        if not event_date_str:
            return JsonResponse({"status": "error", "message": "Event date is required."}, status=400)
        
        # Convert the event date from string to date (without time)
        try:
            event_date = datetime.strptime(event_date_str, "%Y-%m-%d").date()  # Using the datetime class here
        except ValueError:
            return JsonResponse({"status": "error", "message": "Invalid date format. Please use 'YYYY-MM-DD'."}, status=400)
        
        # Get the club instance by club_id (using club_id, not id)
        try:
            club = Club.objects.get(club_id=club_id)  # Using club_id instead of id
        except Club.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Club not found."}, status=404)

        # Create the new event
        event = Event.objects.create(
            club=club,
            event_name=event_name,
            description=description,
            event_date=event_date
        )

        return JsonResponse({
            "status": "success",
            "message": f"Event {event.event_name} added to club {club.club_name}",
            "event_id": event.event_id,
            "event_name": event.event_name,
            "event_date": event.event_date
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON format."}, status=400)

@csrf_exempt
def delete_event_view(request, club_id):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            event_id = data.get("event_id")

            if not event_id:
                return JsonResponse({"error": "Event ID is required"}, status=400)

            event = Event.objects.filter(club_id=club_id, event_id=event_id).first()

            if not event:
                return JsonResponse({"error": "Event not found"}, status=404)

            event.delete()
            return JsonResponse({"message": "Event deleted successfully"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def delete_member_view(request, club_id):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            member_id = data.get("member_id")

            if not member_id:
                return JsonResponse({"error": "Member ID is required"}, status=400)

            membership = ClubMembers.objects.filter(club_id=club_id, member_id=member_id).first()

            if not membership:
                return JsonResponse({"error": "Member not found in this club"}, status=404)

            membership.delete()
            return JsonResponse({"message": "Member removed successfully"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)

def get_student_event_participations(request, student_id):
    # Fetch the student object, raising 404 error if not found
    student = get_object_or_404(Student, pk=student_id)

    # Get all the club memberships of the student
    club_memberships = student.club_memberships.all()

    # Collect all the events the student has participated in
    participations = EventParticipation.objects.filter(
        club_member__in=club_memberships
    ).select_related('event', 'club_member')

    # Prepare a list of event details
    event_details = []
    for participation in participations:
        event_details.append({
            'event_name': participation.event.event_name,
            'event_date': participation.event.event_date,
            'role_in_event': participation.role_in_event,
            'achievement': participation.achievement,
            'club_name': participation.club_member.club.club_name
        })

    # Return the event details as JSON response
    return JsonResponse({'events': event_details})
def get_student_clubs(request, student_id):
    try:
        # Fetch all ClubMembers for the given student_id
        club_memberships = ClubMembers.objects.filter(student_id=student_id)
        
        # Create a list of club details
        clubs = []
        for club_member in club_memberships:
            club = club_member.club
            events_participated = []
            # Fetch events that the student is participating in for this club
            event_participations = EventParticipation.objects.filter(
                club_member=club_member
            )
            
            for participation in event_participations:
                event = participation.event
                events_participated.append({
                    "event_id": event.event_id,
                    "event_name": event.event_name,
                    "event_date": event.event_date,
                    "role_in_event": participation.role_in_event,
                    "achievement": participation.achievement,
                })
            
            clubs.append({
                "club_id": club.club_id,
                "club_name": club.club_name,
                "club_category": club.club_category,
                "club_description": club.club_description,
                "faculty_incharge": club.faculty_incharge.username if club.faculty_incharge else None,
                "created_date": club.created_date,
                "events_participated": events_participated,  # Include the events the student is part of
            })
        
        # Return the clubs and events data as JSON
        return JsonResponse({"clubs": clubs}, safe=False)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

