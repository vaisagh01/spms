from django.urls import path
from .views import AlumniDetailView, AlumniEventListView, DonationCreateView, DepartmentRequirementListView

urlpatterns = [
    path('profile/', AlumniDetailView.as_view(), name='alumni-profile'),
    path('events/', AlumniEventListView.as_view(), name='alumni-events'),
    path('donate/', DonationCreateView.as_view(), name='alumni-donate'),
    path('requirements/', DepartmentRequirementListView.as_view(), name='department-requirements'),
]
