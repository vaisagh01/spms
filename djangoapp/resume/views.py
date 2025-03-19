from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.db.models import Avg
from cocurricular.models import Internship, Project, Certification
from curricular.models import Student, Subject, Assessment, StudentMarks, AssessmentType
from extracurricular.models import ClubMembers, EventParticipation  # Assuming correct app structure

# Function to calculate GPA from total marks
def calculate_gpa(total_marks_obtained, total_max_marks):
    if total_max_marks == 0:
        return 0
    percentage = (total_marks_obtained / total_max_marks) * 100
    if percentage >= 90:
        return 10
    elif percentage >= 80:
        return 9
    elif percentage >= 70:
        return 8
    elif percentage >= 60:
        return 7
    elif percentage >= 50:
        return 6
    else:
        return 5  # Minimum GPA assumption

# Function to fetch overall results
def get_semester_wise_results(student):
    semesters = Assessment.objects.filter(
        student_marks__student=student
    ).values_list('semester', flat=True).distinct()
    
    semester_results = {}
    total_marks_obtained = 0  # Aggregate marks
    total_max_marks = 0  # Aggregate maximum marks

    for semester in semesters:
        subjects = Assessment.objects.filter(
            semester=semester, student_marks__student=student
        ).values_list('subject', flat=True).distinct()
        
        subject_results = {}
        semester_marks_obtained = 0
        semester_max_marks = 0
        end_sem_exists = StudentMarks.objects.filter(
            assessment__semester=semester,
            assessment__assessment_type=AssessmentType.END_SEMESTER,
            student=student
        ).exists()
        
        if not end_sem_exists:
            continue  # Skip semesters without a final exam
        
        for subject in subjects:
            subject_name = Subject.objects.get(pk=subject).subject_name
            mid_sem = Assessment.objects.filter(
                semester=semester, subject_id=subject, assessment_type=AssessmentType.MID_SEMESTER
            ).first()
            end_sem = Assessment.objects.filter(
                semester=semester, subject_id=subject, assessment_type=AssessmentType.END_SEMESTER
            ).first()

            mid_sem_marks = 0
            end_sem_marks = 0

            if mid_sem:
                mid_sem_marks = StudentMarks.objects.filter(
                    assessment=mid_sem, student=student
                ).aggregate(total=Avg("marks_obtained"))["total"] or 0

            if end_sem:
                end_sem_marks = StudentMarks.objects.filter(
                    assessment=end_sem, student=student
                ).aggregate(total=Avg("marks_obtained"))["total"] or 0

            # Scale mid-semester marks to 50 and end-semester marks to 50
            mid_sem_weighted = (mid_sem_marks / (mid_sem.total_marks if mid_sem and mid_sem.total_marks else 50)) * 50
            end_sem_weighted = (end_sem_marks / (end_sem.total_marks if end_sem and end_sem.total_marks else 100)) * 50
            
            subject_total_marks = mid_sem_weighted + end_sem_weighted

            semester_marks_obtained += subject_total_marks
            semester_max_marks += 100  # Each subject contributes 100 to the semester total

            subject_results[subject_name] = {
                "mid_sem_marks": mid_sem_marks,
                "end_sem_marks": end_sem_marks,
                "total_marks": subject_total_marks,
                "percentage": (subject_total_marks / 100) * 100,  # Since each subject max = 100
                "grade": calculate_gpa(subject_total_marks, 100),
            }


        semester_gpa = calculate_gpa(semester_marks_obtained, semester_max_marks)
        semester_results[f"Semester {semester}"] = {
            "subjects": subject_results,
            "total_marks_obtained": semester_marks_obtained,
            "total_max_marks": semester_max_marks,
            "percentage": (semester_marks_obtained / semester_max_marks) * 100 if semester_max_marks > 0 else 0,
            "gpa": semester_gpa,
        }
        
        # Aggregate the overall marks across semesters
        total_marks_obtained += semester_marks_obtained
        total_max_marks += semester_max_marks

    # Calculate overall GPA & percentage
    overall_percentage = (total_marks_obtained / total_max_marks) * 100 if total_max_marks > 0 else 0
    overall_gpa = calculate_gpa(total_marks_obtained, total_max_marks)

    return {
        "semesters": semester_results,
        "overall": {
            "total_marks_obtained": total_marks_obtained,
            "total_max_marks": total_max_marks,
            "percentage": overall_percentage,
            "gpa": overall_gpa,
        }
    }
# Function to generate resume PDF
def generate_resume(request, student_id):
    # Fetch the Student instance (Ensure Student model is correctly related to User)
    student = get_object_or_404(Student, pk=student_id)

    # Fetch semester-wise results
    semester_results = get_semester_wise_results(student)
    print(semester_results.get("overall"))  # Debugging
    # Fetch Internships
    internships = Internship.objects.filter(student=student)

    # Fetch projects and related certifications
    projects = Project.objects.filter(student=student.student_id)  # ✅ `student.user` (User model)
    project_data = []
    certifications = Certification.objects.filter(student=student)
    print(certifications)
    for project in projects:
        # certs = project.certifications.all()  # ✅ Access related_name "certifications"
        # print(f"Project: {project.title}, Certifications: {certs}")  # Debugging
        
        project_data.append({
            "title": project.title,
            "start_date": project.start_date,
            "end_date": project.end_date,
        })

    # Fetch Co-Curricular Activities (Clubs & Events)
    clubs = ClubMembers.objects.filter(member_id=student_id)
    events = EventParticipation.objects.filter(club_member__member_id=student_id)
    
    # Prepare context for template
    context = {
        "student": student,
        "semesters": semester_results,  # Semester-wise GPA & subjects
        "internships": internships,
        "projects": project_data,  # ✅ Corrected Project & Certification data
        "clubs": clubs,
        "events": events,
        "certifications": certifications
    }

    # Load template & generate PDF
    template = get_template("resume/resume_template.html")
    html = template.render(context)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'filename="{student.username}_resume.pdf"'
    
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse("Error generating PDF", status=500)

    return response


    