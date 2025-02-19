from rest_framework import generics
from django.contrib.auth.models import User
from .models import Alumni, AlumniEvent, Donation, DepartmentRequirement
from .serializers import AlumniSerializer, AlumniEventSerializer, DonationSerializer, DepartmentRequirementSerializer
from rest_framework.permissions import IsAuthenticated

# Alumni Profile View
class AlumniDetailView(generics.RetrieveAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.alumni

# Alumni Events
class AlumniEventListView(generics.ListAPIView):
    queryset = AlumniEvent.objects.all()
    serializer_class = AlumniEventSerializer
    permission_classes = [IsAuthenticated]

# Donations
class DonationCreateView(generics.CreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(alumni=self.request.user.alumni)

# Department Requirements
class DepartmentRequirementListView(generics.ListAPIView):
    queryset = DepartmentRequirement.objects.all()
    serializer_class = DepartmentRequirementSerializer
    permission_classes = [IsAuthenticated]
