from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView
from curricular.models import Student, Teacher, User
from alumni.models import Alumni
from rest_framework import status

# Student Profile View

@api_view(['GET', 'PUT'])
def get_student_profile(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    user = get_object_or_404(User, id=student_id)
    if request.method == 'PUT':
        data = request.data
        student.phone_number = data.get('phone_number', student.phone_number)
        student.date_of_birth = data.get('date_of_birth', student.date_of_birth)
        student.year_of_study = data.get('year_of_study', student.year_of_study)
        student.semester = data.get('semester', student.semester)
        student.save()
        return JsonResponse({"message": "Student profile updated successfully."}, status=status.HTTP_200_OK)

    return JsonResponse({
        "student_id": student.student_id,
        "name": f"{student.first_name} {student.last_name}",
        "phone_number": student.phone_number,
        "date_of_birth": student.date_of_birth,
        "enrollment_number": student.enrollment_number,
        "course": student.course.course_name,
        "year_of_study": student.year_of_study,
        "semester": student.semester,
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
def get_teacher_profile(request, teacher_id):
    teacher = get_object_or_404(Teacher, teacher_id=teacher_id)

    if request.method == 'PUT':
        data = request.data
        teacher.phone_number = data.get('phone_number', teacher.phone_number)
        teacher.department = data.get('department', teacher.department)
        teacher.designation = data.get('designation', teacher.designation)
        teacher.save()
        return JsonResponse({"message": "Teacher profile updated successfully."}, status=status.HTTP_200_OK)

    return JsonResponse({
        "teacher_id": teacher.teacher_id,
        "name":f"{teacher.first_name} {teacher.last_name}",
        "phone_number": teacher.phone_number,
        "department": teacher.department,
        "designation": teacher.designation,
        "hire_date": teacher.hire_date,
        "courses_assigned": list(teacher.courses.values_list('course_name', flat=True)),
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
def get_alumni_profile(request, alumni_id):
    alumni = get_object_or_404(Alumni, alumni_id=alumni_id)

    if request.method == 'PUT':
        data = request.data
        alumni.graduation_year = data.get('graduation_year', alumni.graduation_year)
        alumni.course_completed = data.get('course_completed', alumni.course_completed)
        alumni.convocation_date = data.get('convocation_date', alumni.convocation_date)
        alumni.save()
        return JsonResponse({"message": "Alumni profile updated successfully."}, status=status.HTTP_200_OK)

    return JsonResponse({
        "alumni_id": alumni.id,
        "name": f"{alumni.first_name} {alumni.last_name}",
        "graduation_year": alumni.graduation_year,
        "course_completed": alumni.course_completed,
        "convocation_date": alumni.convocation_date,
    }, status=status.HTTP_200_OK)
