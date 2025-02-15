from django.http import JsonResponse
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from .models import Student, Club, Event, ClubMembers, Subject, Semester, Teacher, Assignment, Topic, Chapter
from .serializers import StudentSerializer, ClubSerializer, EventSerializer, SubjectSerializer, AssignmentSerializer, TopicSerializer, ChapterSerializer

def get_student_details(request, student_id):
    student = get_object_or_404(Student, pk=student_id)
    student_data = {
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "enrollment_number": student.enrollment_number,
        "course": student.course,
        "year_of_study": student.year_of_study
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

def get_assignments_by_subject(request, subject_id):
    assignments = Assignment.objects.filter(subject_id=subject_id)
    assignments_data = [{
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date,
        "max_marks": assignment.max_marks
    } for assignment in assignments]
    return JsonResponse({"assignments": assignments_data})

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
