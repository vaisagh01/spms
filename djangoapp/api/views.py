# Django Core Imports
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
from django.contrib.auth import login, get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
from django.core import serializers
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Student, Club, Event, ClubMembers, Subject, Semester, Teacher, 
    Assignment, Topic, Chapter, AssignmentSubmission, StudentMarks, Assessment, Attendance,
    EventParticipation)
from .serializers import (
    StudentSerializer, ClubSerializer, EventSerializer, SubjectSerializer, 
    AssignmentSerializer, TopicSerializer, ChapterSerializer, ClubMemberSerializer, 
    AttendanceSerializer, StudentMarksSerializer
)
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from .models import StudentMarks
from .serializers import StudentMarksSerializer
User = get_user_model()
# @staff_member_required
# def admin_dashboard(request):
#     """Redirects admin to Django's built-in management pages."""
#     return redirect(reverse("admin:index")) 

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

# api login
@csrf_exempt
def api_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            # Get custom User model
            User = get_user_model()

            user = User.objects.filter(username=username).first()

            if user and user.check_password(password):
                login(request, user)
                return JsonResponse({
                    "message": "Login successful",
                    "user": user.username,
                    "role": user.role
                })
            return JsonResponse({"error": "Invalid credentials"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"message": "Use POST method to login."})

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

def get_student_details(request, student_id):
    student = get_object_or_404(Student, pk=student_id)
    student_data = {
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "enrollment_number": student.enrollment_number,
        "year_of_study": student.year_of_study,
        "semester": student.semester,  # Directly use the integer value
        "course": student.course.course_name,
    }
    return JsonResponse({"student": student_data})

def get_subjects_by_student(request, student_id):
    try:
        student = get_object_or_404(Student, pk=student_id)
        course = student.course
        course_name = course.course_name
        current_semester = student.semester
        if not course:
            return JsonResponse({"error": "No course assigned to this student"}, status=404)
        
        subjects = Subject.objects.filter(course=course).select_related("teacher", "course")
        subjects_data = [
            {
                "semester": subject.semester,
                "subject_id": subject.subject_id,
                "subject_name": subject.subject_name,
                "subject_code": subject.subject_code,
                "teacher_name": f"{subject.teacher.first_name} {subject.teacher.last_name}" if subject.teacher else "No teacher assigned",
                "course": subject.course.course_name if subject.course else "No course assigned",
            }
            for subject in subjects
        ]
        
        return JsonResponse({"subjects": subjects_data, "course_name": course_name, "current_semester": current_semester})
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    
def get_assignments_by_student(request, student_id):
    try:
        # Fetch student details
        student = Student.objects.get(student_id=student_id)
        course_id = student.course_id
        semester_no = student.semester

        # Fetch assignments based on extracted course and semester
        assignments = Assignment.objects.filter(
            semester=semester_no,
            subject__course_id=course_id
        ).select_related("subject").values(
            "assignment_id", "title", "description", "due_date", "due_time", "max_marks",
            "subject__subject_name", "subject__subject_code"
        )

        # Determine submission details for each assignment
        assignments_data = []
        for assignment in assignments:
            submission = AssignmentSubmission.objects.filter(
                assignment_id=assignment["assignment_id"],
                student_id=student_id
            ).first()  # Get the first submission if exists

            assignments_data.append({
                "assignment_id": assignment["assignment_id"],
                "title": assignment["title"],
                "description": assignment["description"],
                "due_date": assignment["due_date"].strftime("%Y-%m-%d"),  # Convert date to string
                "due_time": assignment["due_time"].strftime("%H:%M:%S") if assignment["due_time"] else None,  # Convert time to string if exists
                "max_marks": assignment["max_marks"],
                "subject_name": assignment["subject__subject_name"],
                "subject_code": assignment["subject__subject_code"],
                "is_completed": submission is not None,  # True if submission exists
                "submission_date": submission.submission_date.strftime("%Y-%m-%d") if submission else None,
                "marks_obtained": submission.marks_obtained if submission else None,
                "feedback": submission.feedback if submission else None,
            })

        return JsonResponse({"assignments": assignments_data}, safe=False)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_topics_by_subject(request, subject_id):
    topics = Topic.objects.filter(subject_id=subject_id)
    topics_data = [{
        "topic_name": topic.topic_name,
        "is_completed": topic.is_completed
    } for topic in topics]
    return JsonResponse({"topics": topics_data})
def get_chapters_by_topic(request, topic_id):
    chapters = Chapter.objects.filter(topic_id=topic_id)
    chapters_data = [{
        "chapter_name": chapter.chapter_name,
        "is_completed": chapter.is_completed,
        "description": chapter.description
    } for chapter in chapters]
    return JsonResponse({"chapters": chapters_data})
def get_assessments_and_marks_by_student(request, student_id):
    # Get the student and their course & semester
    student = get_object_or_404(Student, student_id=student_id)
    course_id = student.course_id
    semester_no = student.semester
    assessments = Assessment.objects.filter(
        subject__course_id=course_id,
    ).select_related("subject")

    # Fetch marks for the student related to assessments
    student_marks = StudentMarks.objects.filter(student=student).select_related("assessment")

    # Organize assessment data
    assessments_data = [{
        "assessment_id": assessment.assessment_id,
        "assessment_type": assessment.assessment_type,
        "total_marks": assessment.total_marks,
        "date_conducted": assessment.date_conducted.strftime("%Y-%m-%d"),
        "subject_name": assessment.subject.subject_name,
        "subject_code": assessment.subject.subject_code,
    } for assessment in assessments]

    # Organize marks data
    marks_data = [{
        "assessment_id": mark.assessment.assessment_id,
        "assessment_type": mark.assessment.assessment_type,
        "marks_obtained": mark.marks_obtained,
        "total_marks": mark.assessment.total_marks
    } for mark in student_marks]

    return JsonResponse({
        "student_id": student_id,
        "student_name": f"{student.first_name} {student.last_name}",
        "course_name": student.course.course_name,
        "semester": semester_no,
        "assessments": assessments_data,
        "marks": marks_data
    })

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

# === EVENT VIEWSET ===
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

# now for teachers to add assignment
@csrf_exempt
def post_assignment(request, teacher_id):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)
    try:
        data = json.loads(request.body)
        subject_id = data.get("subject_id")
        title = data.get("title")
        description = data.get("description")
        due_date = data.get("due_date")
        due_time = data.get("due_time")
        max_marks = data.get("max_marks")
        
        # Fetch teacher and their related courses
        teacher = Teacher.objects.get(teacher_id=teacher_id)
        subjects = Subject.objects.filter(course__in=teacher.courses.all())
        
        # Check if the selected subject is among the teacher's courses
        if not subjects.filter(subject_id=subject_id).exists():
            return JsonResponse({"error": "Unauthorized subject selection"}, status=403)

        subject = Subject.objects.get(subject_id=subject_id)
        
        # Create assignment
        assignment = Assignment.objects.create(
            subject=subject,
            semester=subject.semester,
            title=title,
            description=description,
            due_date=due_date,
            due_time=due_time,
            max_marks=max_marks,
        )
        return JsonResponse({
            "message": "Assignment created successfully",
            "assignment_id": assignment.assignment_id,
        }, status=201)
    
    except Teacher.DoesNotExist:
        return JsonResponse({"error": "Teacher not found"}, status=404)
    
    except Subject.DoesNotExist:
        return JsonResponse({"error": "Subject not found"}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
def get_student_marks_by_assessment_id(request, assessment_id):
    try:
        # Fetch all student marks related to the given assessment_id
        student_marks = StudentMarks.objects.filter(assessment_id=assessment_id).select_related("student", "assessment")

        if not student_marks.exists():
            return JsonResponse({"error": "No student marks found for this assessment"}, status=404)

        # Dictionary to store student data
        student_marks_data = {}

        for mark in student_marks:
            student_id = mark.student.student_id
            student_name = f"{mark.student.first_name} {mark.student.last_name}"

            # If student_id not already in dictionary, initialize entry
            if student_id not in student_marks_data:
                student_marks_data[student_id] = {
                    "student_name": student_name,
                    "marks": []
                }

            # Append marks obtained for this assessment
            student_marks_data[student_id]["marks"].append({
                "assessment_id": mark.assessment_id,
                "marks_obtained": mark.marks_obtained,
                "total_marks": mark.assessment.total_marks,
                "subject_name": mark.assessment.subject.subject_name,
                "subject_code": mark.assessment.subject.subject_code,
                "assessment_type": mark.assessment.assessment_type,
            })

        # Convert dictionary to list format for JSON response
        response_data = {
            "assessment_id": assessment_id,
            "students": list(student_marks_data.values())
        }

        return JsonResponse(response_data, safe=False)

    except Assessment.DoesNotExist:
        return JsonResponse({"error": "Assessment not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

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

from django.http import JsonResponse
from .models import ClubMembers, EventParticipation
from django.core.exceptions import ObjectDoesNotExist

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
@csrf_exempt
def create_student_marks(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            serializer = StudentMarksSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({'message': 'Student marks created successfully', 'data': serializer.data}, status=201)
            return JsonResponse({'error': serializer.errors}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def update_student_marks(request, student_marks_id):
    if request.method == 'PUT':
        try:
            student_marks = StudentMarks.objects.get(pk=student_marks_id)
            data = JSONParser().parse(request)
            serializer = StudentMarksSerializer(student_marks, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({'message': 'Student marks updated successfully', 'data': serializer.data}, status=200)
            return JsonResponse({'error': serializer.errors}, status=400)
        except StudentMarks.DoesNotExist:
            return JsonResponse({'error': 'StudentMarks not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)