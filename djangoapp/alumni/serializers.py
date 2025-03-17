from rest_framework import serializers
from .models import AlumniEvent, Donation, DepartmentRequirement
from curricular.models import Alumni

class AlumniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumni
        fields = ["alumni_id", "username", "first_name", "last_name", "email", "graduation_year", "current_job", "phone_number"]

class AlumniEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniEvent
        fields = ["id","department", "title", "description", "date", "event_type"]


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'

class DepartmentRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentRequirement
        fields = '__all__'

class AlumniUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumni
        fields = ["alumni_id", "first_name", "last_name", "email", "graduation_year", "current_job", "phone_number", "department"]