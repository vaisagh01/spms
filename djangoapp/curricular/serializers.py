<<<<<<< Updated upstream
from .models import Assessment, Assignment, AssignmentSubmission, Attendance, Chapter, Course, Student, StudentMarks, Subject, Topic
=======
from .models import Assessment, Assignment, AssignmentSubmission, Chapter, Course, Student, StudentMarks, Subject, Topic
>>>>>>> Stashed changes
from rest_framework import serializers

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class StudentMarksSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentMarks
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
# --- Attendance Serializers ---
class AttendanceSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.subject_name", read_only=True)
    subject_code = serializers.CharField(source="subject.subject_code", read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = '__all__'

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class StudentAttendanceSerializer(serializers.ModelSerializer):
    attendance = AttendanceSerializer(many=True, source="attendance_set", read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

class SubjectAttendanceSerializer(serializers.ModelSerializer):
    attendance = AttendanceSerializer(many=True, source="attendance_set", read_only=True)

    class Meta:
        model = Subject
        fields = '__all__'

class AttendanceSummarySerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    total_classes = serializers.IntegerField()
    present_classes = serializers.IntegerField()
    absent_classes = serializers.IntegerField()
    late_classes = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()