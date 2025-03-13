from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Internship, Project, Certification, CoCurricularEventParticipation, CoCurricularEvent
from .serializers import InternshipSerializer, ProjectSerializer, CertificationSerializer, CoCurricularEventParticipationSerializer, CoCurricularEventSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from curricular.models import Student,Teacher, Course
import json
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import status


@csrf_exempt
@api_view(['POST'])
def add_internship(request, student_id):
    """Add an internship for a student with auto-assigned class teacher."""
    student = get_object_or_404(Student, student_id=student_id)

    # Ensure student’s course has a class teacher
    if not student.course.class_teacher:
        return JsonResponse({"error": "No class teacher assigned for this course."}, status=400)

    data = request.data.copy()
    data['student'] = student_id
    data['status'] = 'Pending'  # Default status

    serializer = InternshipSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Internship added successfully, waiting for approval."}, status=201)

    return JsonResponse(serializer.errors, status=400)


def get_internships(request, student_id):
    internships = Internship.objects.filter(student_id=student_id)
    serializer = InternshipSerializer(internships, many=True)
    return JsonResponse(serializer.data, safe=False)


@csrf_exempt
@api_view(['GET'])
def get_pending_internships(request):
    internships = Internship.objects.filter(status="Pending")
    serializer = InternshipSerializer(internships, many=True)
    return JsonResponse(serializer.data, safe=False)


@csrf_exempt
@api_view(['POST'])
def approve_internship(request, student_id, internship_id, teacher_id):
    student = get_object_or_404(Student, student_id=student_id)
    teacher = get_object_or_404(Teacher, teacher_id=teacher_id)

    # Check if the teacher is assigned to the student's course
    if student.course.class_teacher != teacher:
        return JsonResponse({"error": "You are not the assigned class teacher!"}, status=403)

    internship = get_object_or_404(Internship, id=internship_id, student_id=student_id)
    internship.status = "Approved"
    internship.assigned_teacher = teacher
    internship.save()

    return JsonResponse({"message": "Internship approved successfully."})
@csrf_exempt
@api_view(['POST'])
def reject_internship(request, student_id, internship_id):
    internship = get_object_or_404(Internship, id=internship_id, student_id=student_id)
    internship.status = "Rejected"
    internship.save()
    return JsonResponse({"message": "Internship rejected."})

@api_view(['POST'])
def add_project(request, student_id):
    """
    Endpoint for students to add a project via student_id in the URL.
    """
    # Ensure the student exists
    student = get_object_or_404(Student, student_id=student_id)

    # Copy data and assign the verified student ID
    data = request.data.copy()
    data['student'] = student_id  
    print("Data being sent to serializer:", data) 
    serializer = ProjectSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Project added successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def get_projects(request,student_id):
    """
    Retrieve all projects for the logged-in student.
    """
    projects = Project.objects.filter(student_id=student_id)
    serializer = ProjectSerializer(projects, many=True)
    return Response({"projects": serializer.data})


@api_view(['POST'])
def upload_certification(request, student_id):
    """
    Endpoint for students to upload a certification.
    """
    student = get_object_or_404(Student, student_id=student_id)

    data = request.data.copy()
    data['student'] = student_id

    serializer = CertificationSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Certification uploaded successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_certifications(request, student_id):
    """
    Endpoint to retrieve all certifications for a specific student.
    """
    student = get_object_or_404(Student, student_id=student_id)
    certifications = Certification.objects.filter(student_id=student_id)

    serializer = CertificationSerializer(certifications, many=True)
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)

def get_student_co_curricular_participations(request, student_id):
    # Fetch the student object, raising 404 error if not found
    student = get_object_or_404(Student, pk=student_id)

    # Get all the co-curricular event participations for the student
    participations = CoCurricularEventParticipation.objects.filter(student=student)

    # Serialize the participations
    serialized_participations = CoCurricularEventParticipationSerializer(participations, many=True)

    # Return the serialized data as a JSON response
    return JsonResponse({'co_curricular_participations': serialized_participations.data})


def get_all_co_curricular_events(request):
    # Fetch all co-curricular events from the database
    events = CoCurricularEvent.objects.all()

    # Serialize the events, including related participants
    event_data = []
    for event in events:
        event_participants = event.participants.all()  # Get all participants for the event
        participants_data = []

        for participation in event_participants:
            participants_data.append({
                'student': participation.student.username,
                'role_in_event': participation.role_in_event,
                'achievement': participation.achievement
            })

        event_data.append({
            'event_name': event.event_name,
            'event_type': event.event_type,
            'description': event.description,
            'event_date': event.event_date,
            'location': event.location,
            'organizer': event.organizer,
            'participants': participants_data
        })

    # Return the serialized event data as a JSON response
    return JsonResponse({'co_curricular_events': event_data})

@api_view(['POST'])
def create_co_curricular_event(request):
    """
    Endpoint to create a new co-curricular event.
    """
    serializer = CoCurricularEventSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Co-Curricular Event created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)