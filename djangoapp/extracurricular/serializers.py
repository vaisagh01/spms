from curricular.models import Assignment, Attendance, Student, StudentMarks
from extracurricular.models import Club, ClubMembers, Event, EventPoster
from rest_framework import serializers

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"
class StudentMarksSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentMarks
        fields = "__all__"

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"

class ClubSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    events = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ["id", "club_name", "club_category", "club_description", "faculty_incharge", "leader", "members", "events"]

    def get_members(self, obj):
        """Retrieve all members of the club."""
        return [{"id": member.student.id, "name": member.student.username, "role": member.role_in_club} for member in ClubMembers.objects.filter(club=obj)]

    def get_events(self, obj):
        """Retrieve all events associated with the club."""
        return [{"id": event.id, "name": event.name, "date": event.date} for event in Event.objects.filter(club=obj)]
    
class ClubMemberSerializer(serializers.ModelSerializer):
    """Serialize club members with student details."""
    student_id = serializers.ReadOnlyField(source="student.id")
    student_name = serializers.ReadOnlyField(source="student.username")
    
    class Meta:
        model = ClubMembers
        fields = ["id", "student_id", "student_name", "club", "role_in_club", "date_joined"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'



class EventPosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPoster
        fields = ['poster_id', 'event', 'poster_image', 'location', 'time']

