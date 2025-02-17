from django.http import JsonResponse
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from .models import Student, Club, Event, ClubMembers, Subject, Semester, Teacher, Assignment, Topic, Chapter, AssignmentSubmission, StudentMarks, Assessment
from .serializers import StudentSerializer, ClubSerializer, EventSerializer, SubjectSerializer, AssignmentSerializer, TopicSerializer, ChapterSerializer
from django.views.decorators.csrf import csrf_exempt
import json


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

    # Fetch assessments for the student's course and semester
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
