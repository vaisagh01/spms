from rest_framework import serializers
from .models import Internship, Project, Certification, Teacher

class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = '__all__'


    def validate(self, data):
        """Custom validation for internship dates"""
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("Start date must be before the end date.")
        return data

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'file', 'uploaded_at']

class ProjectSerializer(serializers.ModelSerializer):
    certifications = CertificationSerializer(many=True, read_only=True)  # Show certifications under a project

    class Meta:
        model = Project
        fields = ['id', 'student', 'title', 'description', 'start_date', 'end_date', 'certifications']
        read_only_fields = ['student']
