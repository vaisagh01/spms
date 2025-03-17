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

@api_view(['POST'])
def add_internship(request, student_id):
    """Add an internship for a student with auto-assigned class teacher."""
    student = get_object_or_404(Student, student_id=student_id)

    # Auto-assign the teacher from the student's course
    if not student.course.class_teacher:
        return JsonResponse({"error": "No class teacher assigned for this course."}, status=400)

    data = request.data.copy()
    data['student'] = student_id
    data['assigned_teacher'] = student.course.class_teacher.teacher_id  # Auto-assign teacher
    data['status'] = 'Pending'  # Default status

    serializer = InternshipSerializer(data=data)

    if serializer.is_valid():
        internship = serializer.save()

        return JsonResponse({
            "message": "Internship added successfully, waiting for approval.",
            "assigned_teacher": internship.assigned_teacher.username  # Return teacher name
        }, status=201)

    return JsonResponse(serializer.errors, status=400)

def get_internships(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    internships = Internship.objects.filter(student=student).select_related('assigned_teacher')
    serializer = InternshipSerializer(internships, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['PUT'])
def update_internship(request, student_id, internship_id):
    """Update an existing internship."""
    internship = get_object_or_404(Internship, id=internship_id, student__student_id=student_id)
    serializer = InternshipSerializer(internship, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Internship updated successfully."}, status=200)

    return JsonResponse(serializer.errors, status=400)


@api_view(['DELETE'])
def delete_internship(request, student_id, internship_id):
    """Delete an internship."""
    internship = get_object_or_404(Internship, id=internship_id, student__student_id=student_id)
    internship.delete()
    return JsonResponse({"message": "Internship deleted successfully."}, status=204)


@csrf_exempt
@api_view(['GET'])
def get_pending_internships(request):
    internships = Internship.objects.filter(status="Pending")
    serializer = InternshipSerializer(internships, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
def get_internships_for_teacher(request, teacher_id):
    """Get all internships related to the courses taught by the teacher."""
    teacher = get_object_or_404(Teacher, teacher_id=teacher_id)
    
    # Get all courses taught by the teacher
    courses = Course.objects.filter(class_teacher=teacher)

    # Get all students enrolled in those courses
    students = Student.objects.filter(course__in=courses)

    # Get all internships of these students
    internships = Internship.objects.filter(student__in=students).select_related('student')

    serializer = InternshipSerializer(internships, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['PUT'])
def change_internship_status(request, internship_id, teacher_id):
    """Approve or Reject internship by teacher."""
    internship = get_object_or_404(Internship, id=internship_id)

    # Ensure the teacher is assigned to the internship's student's course
    if internship.student.course.class_teacher_id != teacher_id:
        return JsonResponse({"error": "You are not the assigned class teacher!"}, status=403)

    status = request.data.get('status')
    if status not in ['Approved', 'Rejected']:
        return JsonResponse({"error": "Invalid status."}, status=400)

    internship.status = status
    internship.save()
    return JsonResponse({"message": f"Internship {status.lower()} successfully."})


@csrf_exempt
@api_view(['POST'])
def approve_internship(request, student_id, internship_id, teacher_id):
    student = get_object_or_404(Student, student_id=student_id)
    teacher = get_object_or_404(Teacher, teacher_id=teacher_id)
    print(student, teacher)
    # Check if the teacher is assigned to the student's course
    if student.course.class_teacher != teacher:
        return JsonResponse({"error": "You are not the assigned class teacher!"}, status=403)

    internship = get_object_or_404(Internship, id=internship_id)
    print(internship)
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

@api_view(['PUT'])
def edit_project(request, student_id, project_id):
    """
    Edit an existing project by project_id and student_id.
    """
    project = get_object_or_404(Project, id=project_id, student_id=student_id)
    serializer = ProjectSerializer(project, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_project(request, student_id, project_id):
    """
    Delete a project by project_id and student_id.
    """
    project = get_object_or_404(Project, id=project_id, student_id=student_id)
    project.delete()
    return Response({"message": "Project deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


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

import pandas as pd
from django.http import HttpResponse
from .models import Internship

def download_internships_excel(request, teacher_id):
    internships = Internship.objects.filter(assigned_teacher_id=teacher_id).select_related('student')
    data = [
        {
            'Company Name': i.company_name,
            'Position': i.position,
            'Student': i.student.username,
            'Start Date': i.start_date,
            'End Date': i.end_date,
            'Status': i.status
        }
        for i in internships
    ]
    
    df = pd.DataFrame(data)
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=internships.xlsx'
    df.to_excel(response, index=False, engine='openpyxl')
    return response
