from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from curricular.models import Student, Course  # Import relevant models
from extracurricular.models import ClubMembers, EventParticipation

def generate_resume(request, student_id):
    # Fetch student data
    student = get_object_or_404(Student, student_id=student_id)

    course = student.course

    # Fetch clubs and extracurricular activities
    clubs = ClubMembers.objects.filter(student=student)

    # Fetch event participations
    events = EventParticipation.objects.filter(club_member__student=student)

    # Prepare context for the template
    context = {
        'student': student,
        'course': course,
        'clubs': clubs,
        'events': events,
    }

    # Load the resume template
    template = get_template('resume/resume_template.html')
    html = template.render(context)

    # Generate PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'filename="{student.student_id}_resume.pdf"'
    
    # Convert HTML to PDF
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse("Error generating PDF", status=500)

    return response
