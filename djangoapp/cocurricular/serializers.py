from rest_framework import serializers
from .models import Internship, Project, Teacher, Certification, CoCurricularEvent, CoCurricularEventParticipation

class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = '__all__'


    def validate(self, data):
        """Custom validation for internship dates"""
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("Start date must be before the end date.")
        return data


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'


class CoCurricularEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoCurricularEvent
        fields = ['event_id', 'event_name', 'event_type', 'description', 'event_date', 'location', 'organizer']

class CoCurricularEventParticipationSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()  # Show the student's username
    co_curricular_event = CoCurricularEventSerializer()  # Show event details

    class Meta:
        model = CoCurricularEventParticipation
        fields = ['participation_id', 'student', 'co_curricular_event', 'role_in_event', 'achievement']