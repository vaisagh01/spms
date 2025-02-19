from rest_framework import serializers
from .models import Alumni, AlumniEvent, Donation, DepartmentRequirement

class AlumniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumni
        fields = '__all__'

class AlumniEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniEvent
        fields = '__all__'

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'

class DepartmentRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentRequirement
        fields = '__all__'
