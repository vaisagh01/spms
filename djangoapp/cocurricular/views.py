from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Internship, Project, Certification
from .serializers import InternshipSerializer, ProjectSerializer, CertificationSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from curricular.models import Student,Teacher, Course  
import json
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

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
def add_project(request):
    """
    Endpoint for students to add a project.
    """
    data = request.data.copy()
    data['student'] = request.user.id  # Assign the logged-in user as the student

    serializer = ProjectSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Project added successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_certification(request, project_id):
    """
    Endpoint to upload a certification for a specific project.
    """
    try:
        project = Project.objects.get(id=project_id, student=request.user)
    except Project.DoesNotExist:
        return Response({"error": "Project not found or you do not have permission."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CertificationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(project=project)
        return Response({"message": "Certification uploaded successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projects(request):
    """
    Retrieve all projects for the logged-in student.
    """
    projects = Project.objects.filter(student=request.user)
    serializer = ProjectSerializer(projects, many=True)
    return Response({"projects": serializer.data})

