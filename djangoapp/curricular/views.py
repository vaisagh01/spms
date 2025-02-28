import datetime
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model,login,logout
from rest_framework.parsers import JSONParser
from .models import Assessment, Assignment, AssignmentSubmission, Chapter, Student, StudentMarks, Subject, Teacher, Topic,Course
from .serializers import StudentMarksSerializer
# from djangoapp.extracurricular.models import Club, ClubMembers, Event, EventParticipation
import json
import datetime
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .models import Attendance, Student, Subject, Teacher, Course
from .serializers import AttendanceSerializer

User = get_user_model()

def api_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            # Check if the user exists
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid credentials"}, status=400)

            # Secure password check
            if user.password == password:
                login(request, user)

                response_data = {
                    "message": "Login successful",
                    "user": user.username,
                    "id": user.pk,
                    "role": user.role,
                    "email": user.email,
                    "name": f"{user.first_name} {user.last_name}"
                }

                # Check if user is a student
                student = Student.objects.filter(id=user.id).first()
                if student:
                    response_data["student_id"] = student.student_id
                    response_data["course_id"] = student.course.course_id

                # Check if user is a teacher
                teacher = Teacher.objects.filter(id=user.id).first()
                if teacher:
                    response_data["teacher_id"] = teacher.teacher_id
                    response_data["course_id"] = list(teacher.courses.values_list('course_id', flat=True))  # Fetch all course IDs

                return JsonResponse(response_data)
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"message": "Use POST method to login."})

def api_logout(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("id")  # Correctly using the User model ID
            role = data.get("role")

            # Check if the user exists in the User model
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({"error": "User not found"}, status=400)

            logout(request)  # Logs out the user

            return JsonResponse({"message": "Logout successful", "user_id": user_id, "role": role})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"message": "Use POST method to logout."})

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

from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.core.files.storage import default_storage
from django.views.decorators.http import require_POST

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
        "course_id" : student.course.course_id
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
                "submitted_file": settings.MEDIA_URL + submission.file.name if submission and submission.file else None,  # Include file URL
                
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
    
@csrf_exempt
def get_assignment_submissions(request, course_id):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        course = Course.objects.get(course_id=course_id)
        submissions = AssignmentSubmission.objects.filter(assignment__subject__course=course)

        submission_data = [
            {
                "submission_id": submission.submission_id,
                "student": submission.student.student_id,
                "assignment": submission.assignment.assignment_id,
                "marks_obtained": submission.marks_obtained,
                #"submitted_at": submission.submitted_at.strftime("%Y-%m-%d %H:%M:%S"),
                "file_url": request.build_absolute_uri(submission.file.url) if submission.file else None,
            }
            for submission in submissions
        ]

        return JsonResponse({"submissions": submission_data}, status=200)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_submissions(request, assignment_id):
    submissions = AssignmentSubmission.objects.filter(assignment_id=assignment_id).select_related('student')
    data = [
        {
            "submission_id": sub.submission_id,
            "student_name": f"{sub.student.first_name} {sub.student.last_name}",
            "submission_date": sub.submission_date,
            "marks_obtained": sub.marks_obtained,
            "feedback": sub.feedback,
        }
        for sub in submissions
    ]
    return JsonResponse({"submissions": data})
@csrf_exempt  # If using frontend without CSRF token handling
def delete_assignment(request, assignment_id):
    if request.method == "DELETE":
        assignment = get_object_or_404(Assignment, assignment_id=assignment_id)
        assignment.delete()
        return JsonResponse({"status": "success", "message": "Assignment deleted successfully!"})
    
    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=400)
@csrf_exempt
def update_assignment(request, teacher_id, assignment_id):
    if request.method != "PUT":
        return JsonResponse({"error": "Invalid request method"}, status=405)
    
    try:
        data = json.loads(request.body)

        # Extract fields
        subject_id = data.get("subject_id")
        title = data.get("title")
        description = data.get("description")
        due_date = data.get("due_date")
        due_time = data.get("due_time")
        max_marks = data.get("max_marks")

        # Validate required fields
        if not all([subject_id, title, description, due_date, due_time, max_marks]):
            return JsonResponse({"error": "All fields are required"}, status=400)

        # Validate max_marks
        if not isinstance(max_marks, int) or max_marks <= 0:
            return JsonResponse({"error": "max_marks must be a positive integer"}, status=400)

        # Validate due_date format
        try:
            due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        # Validate due_time format
        try:
            due_time = datetime.strptime(due_time, "%H:%M").time()
        except ValueError:
            return JsonResponse({"error": "Invalid time format. Use HH:MM (24-hour format)"}, status=400)

        # Fetch teacher and their subjects
        teacher = Teacher.objects.get(teacher_id=teacher_id)
        subjects = Subject.objects.filter(course__in=teacher.courses.all())

        # Check if the selected subject is valid for this teacher
        if not subjects.filter(subject_id=subject_id).exists():
            return JsonResponse({"error": "Unauthorized subject selection"}, status=403)

        # Fetch the assignment
        assignment = Assignment.objects.get(assignment_id=assignment_id)

        # Ensure the assignment belongs to the teacher’s subject
        if assignment.subject.subject_id != subject_id:
            return JsonResponse({"error": "You are not authorized to update this assignment"}, status=403)

        # Update assignment details
        assignment.title = title
        assignment.description = description
        assignment.due_date = due_date
        assignment.due_time = due_time
        assignment.max_marks = max_marks
        assignment.save()

        return JsonResponse({"message": "Assignment updated successfully"}, status=200)

    except Teacher.DoesNotExist:
        return JsonResponse({"error": "Teacher not found"}, status=404)

    except Subject.DoesNotExist:
        return JsonResponse({"error": "Subject not found"}, status=404)

    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
 
@csrf_exempt
def update_submission(request, submission_id):
    if request.method == "PUT":
        try:
            submission = get_object_or_404(AssignmentSubmission, submission_id=submission_id)
            data = json.loads(request.body)

            submission.marks_obtained = data.get("marks_obtained", submission.marks_obtained)
            submission.feedback = data.get("feedback", submission.feedback)
            submission.save()

            return JsonResponse({"message": "Submission updated successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def upload_assignment_submission(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        student_id = request.POST.get("student")
        assignment_id = request.POST.get("assignment")
        file = request.FILES.get("file")
        date=request.POST.get("submission_date")
        if not student_id or not assignment_id or not file:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        student = Student.objects.get(pk=student_id)
        assignment = Assignment.objects.get(pk=assignment_id)

        # Save file
        file_name = default_storage.save(f"submissions/{file.name}", file)

        submission = AssignmentSubmission.objects.create(
            student=student,
            assignment=assignment,
            file=file_name,
            submission_date=date
        )

        return JsonResponse({
            "message": "Submission uploaded successfully",
            "submission_id": submission.submission_id,
            "file_url": request.build_absolute_uri(submission.file.url),
        }, status=201)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def mark_attendance(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = JSONParser().parse(request)
        student_id = data.get("student_id")
        subject_id = data.get("subject_id")
        date = data.get("date")
        status = data.get("status")  # Present, Absent, Late

        if not all([student_id, subject_id, date, status]):
            return JsonResponse({"error": "All fields are required"}, status=400)

        student = Student.objects.get(pk=student_id)
        subject = Subject.objects.get(pk=subject_id)

        attendance, created = Attendance.objects.update_or_create(
            student=student,
            subject=subject,
            date=date,
            defaults={"status": status}
        )

        return JsonResponse({
            "message": "Attendance marked successfully",
            "attendance_id": attendance.attendance_id,
            "status": attendance.status,
            "date": attendance.date.strftime("%Y-%m-%d"),
        }, status=201)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except Subject.DoesNotExist:
        return JsonResponse({"error": "Subject not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_attendance(request, attendance_id):
    if request.method != "PUT":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = JSONParser().parse(request)
        status = data.get("status")

        if not status:
            return JsonResponse({"error": "Status field is required"}, status=400)

        attendance = Attendance.objects.get(pk=attendance_id)
        attendance.status = status
        attendance.save()

        return JsonResponse({"message": "Attendance updated successfully"}, status=200)

    except Attendance.DoesNotExist:
        return JsonResponse({"error": "Attendance record not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_attendance_by_student(request, student_id):
    try:
        student = get_object_or_404(Student, pk=student_id)
        attendance_records = Attendance.objects.filter(student=student).select_related("subject")

        attendance_data = [
            {
                "attendance_id": record.attendance_id,
                "subject_name": record.subject.subject_name,
                "subject_code": record.subject.subject_code,
                "date": record.date.strftime("%Y-%m-%d"),
                "status": record.status,
            }
            for record in attendance_records
        ]

        return JsonResponse({
            "student_id": student_id,
            "student_name": f"{student.first_name} {student.last_name}",
            "attendance": attendance_data,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)  # ✅ Fixed

def get_attendance_by_subject(request, subject_id):
    try:
        subject = get_object_or_404(Subject, pk=subject_id)
        attendance_records = Attendance.objects.filter(subject=subject).select_related("student")

        attendance_data = [
            {
                "attendance_id": record.attendance_id,
                "student_id": record.student.student_id,
                "student_name": f"{record.student.first_name} {record.student.last_name}",
                "date": record.date.strftime("%Y-%m-%d"),
                "status": record.status,
            }
            for record in attendance_records
        ]

        return JsonResponse({
            "subject_id": subject_id,
            "subject_name": subject.subject_name,
            "attendance": attendance_data,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)  # ✅ Fixed

@csrf_exempt
def get_attendance_summary(request, student_id):
    try:
        student = get_object_or_404(Student, pk=student_id)
        attendance_records = Attendance.objects.filter(student=student)

        total_classes = attendance_records.count()
        present_classes = attendance_records.filter(status="Present").count()
        absent_classes = attendance_records.filter(status="Absent").count()
        late_classes = attendance_records.filter(status="Late").count()

        attendance_percentage = (
            (present_classes / total_classes) * 100 if total_classes > 0 else 0
        )

        return JsonResponse({
            "student_id": student_id,
            "student_name": f"{student.first_name} {student.last_name}",
            "total_classes": total_classes,
            "present_classes": present_classes,
            "absent_classes": absent_classes,
            "late_classes": late_classes,
            "attendance_percentage": round(attendance_percentage, 2),
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)  # ✅ Fixed
    
def get_attendance_by_course(request, course_id):
    try:
        course = get_object_or_404(Course, pk=course_id)
        subjects = Subject.objects.filter(course=course)
        attendance_records = Attendance.objects.filter(subject__in=subjects).select_related("student", "subject")

        attendance_data = [
            {
                "attendance_id": record.attendance_id,
                "student_id": record.student.student_id,
                "student_name": f"{record.student.first_name} {record.student.last_name}",
                "subject_name": record.subject.subject_name,
                "date": record.date.strftime("%Y-%m-%d"),
                "status": record.status,
            }
            for record in attendance_records
        ]

        return JsonResponse({
            "course_id": course_id,
            "course_name": course.course_name,
            "attendance": attendance_data,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_teacher(request, teacher_id):
    if request.method == "GET":
        try:
            teacher = Teacher.objects.get(teacher_id=teacher_id)
            teacher_data = {
                "teacher_id": teacher.teacher_id,
                "username": teacher.username,
                "first_name": teacher.first_name,  # Fetching from User model
                "last_name": teacher.last_name,  # Fetching from User model
                "email": teacher.email,
                "department": teacher.department,
                "designation": teacher.designation,
                "hire_date": teacher.hire_date.strftime("%Y-%m-%d"),
            }
            return JsonResponse(teacher_data)
        except Teacher.DoesNotExist:
            return JsonResponse({"error": "Teacher not found"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=400)

from django.http import JsonResponse
from .models import Teacher, Subject, Topic

def get_teacher_subjects(request, teacher_id):
    try:
        teacher = Teacher.objects.get(pk=teacher_id)
        subjects = Subject.objects.filter(teacher=teacher).values(
            "subject_id", "subject_name", "subject_code", "semester", "course__course_name","course__course_id"
        )

        # Fetch topics for each subject
        subjects_with_topics = []
        for subject in subjects:
            topics = Topic.objects.filter(subject_id=subject["subject_id"]).values(
                "topic_id", "topic_name","is_completed","completion_time"
            )
            subject["topics"] = list(topics)
            subjects_with_topics.append(subject)

        return JsonResponse(
            {
                "teacher": f"{teacher.first_name} {teacher.last_name}",
                "subjects": subjects_with_topics,
            },
            safe=False,
        )
    except Teacher.DoesNotExist:
        return JsonResponse({"error": "Teacher not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def edit_subject(request, subject_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            subject = Subject.objects.get(pk=subject_id)

            # Updating fields based on request data
            if "subject_name" in data:
                subject.subject_name = data["subject_name"]
            if "subject_code" in data:
                subject.subject_code = data["subject_code"]
            if "semester" in data:
                subject.semester = data["semester"]
            if "course_id" in data:
                course = Course.objects.get(pk=data["course_id"])
                subject.course = course
            if "teacher_id" in data:
                teacher = Teacher.objects.get(pk=data["teacher_id"])
                subject.teacher = teacher

            subject.save()
            return JsonResponse({"message": "Subject updated successfully!"})

        except Subject.DoesNotExist:
            return JsonResponse({"error": "Subject not found"}, status=404)
        except Course.DoesNotExist:
            return JsonResponse({"error": "Course not found"}, status=404)
        except Teacher.DoesNotExist:
            return JsonResponse({"error": "Teacher not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)
@csrf_exempt
def edit_topic(request, subject_id):
    try:
        data = json.loads(request.body)

        # Validate topic_id
        topic_id = data.get("topic_id")
        if not topic_id:
            return JsonResponse({"error": "topic_id is required"}, status=400)

        # Fetch the topic ensuring it belongs to the correct subject
        topic = Topic.objects.get(pk=topic_id, subject__subject_id=subject_id)

        # Update fields only if they are provided in the request
        if "topic_name" in data:
            topic.topic_name = data["topic_name"]
        if "is_completed" in data:
            topic.is_completed = data["is_completed"] in [True, "true", "True", 1]  # Ensure boolean
        if "completion_time" in data and data["completion_time"] is not None:
            topic.completion_time = data["completion_time"]
        topic.save()
        print("is_completed")
        
        return JsonResponse({"message": "Topic updated successfully!", "updated_topic": {
            "topic_id": topic.pk,
            "topic_name": topic.topic_name,
            "is_completed": topic.is_completed,
            "completion_time": topic.completion_time
        }})

    except Topic.DoesNotExist:
        return JsonResponse({"error": "Topic not found for the given subject"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    

@csrf_exempt
def get_assignments(request, teacher_id):
    try:
        subjects = Subject.objects.filter(teacher_id=teacher_id)  # Get subjects taught by the teacher
        print(subjects)
        # Filter by subject_id if provided
        subject_id = request.GET.get("subject_id")
        if subject_id:
            subjects = subjects.filter(subject_id=subject_id)

        assignments = Assignment.objects.filter(subject__in=subjects).values(
            "assignment_id", "title", "description", "due_date", "due_time", "max_marks", "subject__subject_name"
        )

        return JsonResponse({"assignments": list(assignments)}, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
def get_all_assessments(request, teacher_id):
    try:
        # Fetch all subjects taught by the teacher
        subjects = Subject.objects.filter(teacher_id=teacher_id)

        # Fetch all assessments related to those subjects
        assessments = Assessment.objects.filter(subject__in=subjects).select_related("subject")

        # Prepare response data
        assessments_data = []
        for assessment in assessments:
            # Get marks for each assessment
            marks = StudentMarks.objects.filter(assessment=assessment).select_related("student")
            marks_data = [
                {
                    "student_id": mark.student.student_id,
                    "student_name": f"{mark.student.first_name} {mark.student.last_name}",
                    "marks_obtained": mark.marks_obtained
                }
                for mark in marks
            ]

            # Get course_id associated with the subject
            course_id = Course.objects.filter(subjects=assessment.subject).values_list("course_id", flat=True).first()

            assessments_data.append({
                "assessment_id": assessment.assessment_id,
                "assessment_type": assessment.assessment_type,
                "total_marks": assessment.total_marks,
                "date_conducted": assessment.date_conducted.strftime("%Y-%m-%d"),
                "subject_id": assessment.subject.subject_id,
                "subject_name": assessment.subject.subject_name,
                "subject_code": assessment.subject.subject_code,
                "marks": marks_data,
                "course_id": course_id  # ✅ Now correctly fetched
            })

        return JsonResponse({"assessments": assessments_data}, safe=False)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "Teacher not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt  # Disable CSRF for testing (use proper authentication in production)
def create_assessment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            teacher_id = data.get("teacher_id")
            subject_id = data.get("subject_id")
            assessment_type = data.get("assessment_type")
            total_marks = data.get("total_marks")
            date_conducted = data.get("date_conducted")

            # Validate teacher ownership of the subject
            subject = Subject.objects.filter(subject_id=subject_id, teacher_id=teacher_id).first()
            if not subject:
                return JsonResponse({"error": "Unauthorized or invalid subject"}, status=403)

            # Create assessment
            assessment = Assessment.objects.create(
                subject=subject,
                assessment_type=assessment_type,
                total_marks=total_marks,
                date_conducted=date_conducted
            )

            # Fetch all students enrolled in the subject's course
            students = Student.objects.filter(course=subject.course)

            # Create blank marks for each student
            for student in students:
                StudentMarks.objects.create(
                    assessment=assessment,
                    student=student,
                    marks_obtained=None  # No marks yet
                )

            return JsonResponse({"message": "Assessment created successfully, student marks initialized", "assessment_id": assessment.assessment_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_students_by_subject(request, subject_id):
    try:
        subject = Subject.objects.get(pk=subject_id)
        course = subject.course  # Get course of the subject
        students = Student.objects.filter(course=course).values(
            "student_id", "first_name", "last_name"
        )
        return JsonResponse({"students": list(students)}, safe=False)

    except Subject.DoesNotExist:
        return JsonResponse({"error": "Subject not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_or_update_student_marks(request, assessment_id):
    try:
        assessment = Assessment.objects.get(assessment_id=assessment_id)

        if request.method == "GET":
            # Fetch marks
            marks = StudentMarks.objects.filter(assessment=assessment).select_related("student")
            marks_data = [
                {
                    "student_id": mark.student.student_id,
                    "student_name": f"{mark.student.first_name} {mark.student.last_name}",
                    "marks_obtained": mark.marks_obtained if mark.marks_obtained is not None else "",
                }
                for mark in marks
            ]
            return JsonResponse({"marks": marks_data}, safe=False)

        elif request.method == "POST":
            data = json.loads(request.body)
            marks_list = data.get("marks", [])

            for mark_entry in marks_list:
                student_id = mark_entry.get("student_id")
                marks_obtained = mark_entry.get("marks_obtained")

                student = Student.objects.get(student_id=student_id)
                student_mark, created = StudentMarks.objects.get_or_create(assessment=assessment, student=student)
                student_mark.marks_obtained = marks_obtained
                student_mark.save()

            return JsonResponse({"message": "Marks updated successfully"}, status=200)

        return JsonResponse({"error": "Method not allowed"}, status=405)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "Assessment not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
 
def get_all_students(request):
    students = Student.objects.select_related("course").all().values(
        "student_id", "username", "phone_number", "date_of_birth", 
        "enrollment_number", "course__name", "year_of_study", "semester"
    )
    return JsonResponse(list(students), safe=False)
