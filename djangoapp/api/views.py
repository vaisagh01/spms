from django.http import JsonResponse
from rest_framework import viewsets, permissions, status, generics
from .models import Student, Attendance, StudentMarks, Assignment, Event, Club, ClubMembers
from django.core import serializers
from django.views.decorators.http import require_http_methods
from .serializers import StudentSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import reverse
from .serializers import AttendanceSerializer, StudentMarksSerializer, AssignmentSerializer, ClubMemberSerializer, EventSerializer, ClubSerializer, ClubMemberSerializer
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from django.db import transaction  # Import transaction
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()


@staff_member_required
def admin_dashboard(request):
    """Redirects admin to Django's built-in management pages."""
    return redirect(reverse("admin:index")) 

@login_required
def admin_dashboard(request):
    return HttpResponse("Welcome, Admin!")

@login_required
def teacher_dashboard(request):
    return HttpResponse("Welcome, Teacher!")

@login_required
def student_dashboard(request):
    return HttpResponse("Welcome, Student!")

def alumni_dashboard(request):
    return HttpResponse("Welcome, Alumni!")



@csrf_exempt
def api_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                return JsonResponse({
                    "message": "Login successful",
                    "user": user.username,
                    "role": user.role  # Now supports Alumni too!
                })            
            return JsonResponse({"error": "Invalid credentials"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    # Add this for GET request handling
    return JsonResponse({"message": "Use POST method to login."})

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


# === EVENT VIEWSET ===


    
class  ClubViewSet(viewsets.ModelViewSet):
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
    permission_classes = [permissions.IsAuthenticated]

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
    # Fetch all clubs
    clubs = Club.objects.all()
    
    # Create a list of dictionaries containing club name and category
    clubs_data = [{'club_name': club.club_name, 'club_category': club.club_category} for club in clubs]
    
    # Return the club data as a JSON response
    return JsonResponse({'clubs': clubs_data}, safe=False)


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
@login_required
def get_events_by_student(request):
    student = request.user
    memberships = ClubMembers.objects.filter(student=student)

    events = Event.objects.filter(club__in=[membership.club for membership in memberships])

    events_data = [{'event_name': event.event_name, 'event_date': event.event_date, 'club_name': event.club.club_name} for event in events]

    return JsonResponse({'student_events': events_data}, safe=False)

def get_club_profile(request, club_id):
    """Fetch club details, members, and events"""
    club = get_object_or_404(Club, pk=club_id)

    # Get members
    members = ClubMembers.objects.filter(club=club)
    members_data = [
        {
            "student_id": member.student.id,
            "name": member.student.username,
            "email": member.student.email,
            "role_in_club": member.role_in_club,
        }
        for member in members
    ]

    # Get club events
    events = Event.objects.filter(club=club)
    events_data = [
        {
            "event_id": event.id,
            "event_name": event.name,
            "event_date": event.date,
            "description": event.description,
        }
        for event in events
    ]

    club_data = {
        "club_name": club.club_name,
        "club_category": club.club_category,
        "faculty_incharge": club.faculty_incharge.username,
        "leader": club.leader.username,
        "description": club.club_description,  # Make sure the model has a 'description' field
        "members": members_data,
        "events": events_data,
    }

    return JsonResponse({"club_profile": club_data}, safe=False)
 
