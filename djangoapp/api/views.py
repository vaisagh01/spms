from django.http import JsonResponse
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from .models import Student, Club, Event, ClubMembers, Subject, Semester, Teacher, Assignment, Topic, Chapter, AssignmentSubmission
from .serializers import StudentSerializer, ClubSerializer, EventSerializer, SubjectSerializer, AssignmentSerializer, TopicSerializer, ChapterSerializer

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

def get_subject_by_semester(request, semester_no):
    subjects = Subject.objects.filter(semester=semester_no).select_related("teacher")
    subjects_data = [{
        "subject_name": subject.subject_name,
        "subject_code": subject.subject_code,
        "teacher_name":  f"{subject.teacher.first_name} {subject.teacher.last_name}",
        "course": subject.course.course_name if subject.course else "No course assigned"

    } for subject in subjects]
    return JsonResponse({"subjects": subjects_data})
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

# def get_subjects_by_student(request, student_id):
#     student = get_object_or_404(Student, pk=student_id)
#     subjects = Subject.objects.filter(course=student.course, semester=student.semester).select_related("teacher")

#     subjects_data = [{
#         "subject_id": subject.subject_id,
#         "subject_name": subject.subject_name,
#         "subject_code": subject.subject_code,
#         "teacher_name": f"{subject.teacher.first_name} {subject.teacher.last_name}",
#     } for subject in subjects]

#     return JsonResponse({
#         "student": {
#             "first_name": student.first_name,
#             "last_name": student.last_name,
#             "enrollment_number": student.enrollment_number,
#             "course": student.course.course_name,
#             "semester": student.semester,
#         },
#         "subjects": subjects_data
#     })
    
def get_assignments_by_subject(request, subject_id):
    assignments = Assignment.objects.filter(subject_id=subject_id)
    assignments_data = [{
        "assignment_id": assignment.assignment_id,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date,
        "max_marks": assignment.max_marks
    } for assignment in assignments]
    return JsonResponse({"assignments": assignments_data})

from django.http import JsonResponse
from django.db.models import Prefetch
from datetime import datetime
from .models import Student, Assignment, AssignmentSubmission

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

def get_assignments_by_semester_and_course(request, semester_no, course_id):
    assignments = Assignment.objects.filter(
        semester=semester_no,
        subject__course_id=course_id  # Filtering by course_id via Subject model
    ).select_related("subject")

    assignments_data = [{
        "assignment_id": assignment.assignment_id,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date.strftime("%Y-%m-%d"),  # Convert date to string
        "max_marks": assignment.max_marks,
        "subject_name": assignment.subject.subject_name,  # Include subject name
        "subject_code": assignment.subject.subject_code,
    } for assignment in assignments]

    return JsonResponse({"assignments": assignments_data})

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
    clubs = Club.objects.all()
    clubs_data = [{"club_name": club.club_name, "club_category": club.club_category} for club in clubs]
    return JsonResponse({"clubs": clubs_data}, safe=False)

def get_club_by_id(request, club_id):
    try:
        club = Club.objects.get(club_id=club_id)
        club_data = {
            "club_name": club.club_name,
            "club_category": club.club_category,
            "faculty_incharge": club.faculty_incharge,
            "created_date": club.created_date
        }
        return JsonResponse({"club": club_data})
    except Club.DoesNotExist:
        return JsonResponse({"error": "Club not found"}, status=404)

def get_clubs_by_student(request, student_id):
    student = get_object_or_404(Student, pk=student_id)
    clubs = Club.objects.filter(club_members__student=student).values(
        "club_id", "club_name", "club_category", "faculty_incharge", "created_date"
    )
    return JsonResponse({"clubs": list(clubs)}, safe=False)
