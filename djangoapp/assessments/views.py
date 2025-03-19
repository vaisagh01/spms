import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from curricular.models import Assessment, Course, Student, StudentMarks, Subject
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.core.exceptions import ObjectDoesNotExist

from curricular.serializers import StudentMarksSerializer

# Create your views here.
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
        "assessment_name":assessment.assessment_name,
        "assessment_type": assessment.assessment_type,
        "total_marks": assessment.total_marks,
        "date_conducted": assessment.date_conducted.strftime("%Y-%m-%d"),
        "subject_name": assessment.subject.subject_name,
        "subject_code": assessment.subject.subject_code,
        "semester":assessment.semester
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
                "assessment_name": assessment.assessment_name,
                "total_marks": assessment.total_marks,
                "semester":assessment.subject.semester,
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
            assessment_name = data.get("assessment_name")
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
                assessment_name=assessment_name,
                total_marks=total_marks,
                date_conducted=date_conducted,
                semester=subject.semester
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
