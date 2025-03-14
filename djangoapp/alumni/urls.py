from django.urls import path
from .views import AlumniDetailView, AlumniEventCreateView, AlumniEventListView, AlumniListView, DonationCreateView, DepartmentRequirementListView, delete_event, get_all_donations, get_alumni_profile, manage_alumni_event, update_alumni, update_event

urlpatterns = [
    path("alumni/", AlumniListView.as_view(), name="alumni-list"),
    path('profile/', AlumniDetailView.as_view(), name='alumni-profile'),
    path('events/', AlumniEventListView.as_view(), name='alumni-events'),
    path("alumni-events/create/", AlumniEventCreateView.as_view(), name="create-alumni-event"),
    path('donate/', DonationCreateView.as_view(), name='alumni-donate'),
    path('requirements/', DepartmentRequirementListView.as_view(), name='department-requirements'),
    path('donations/', get_all_donations, name="get_all_donations"),
    
    path('alumni-events/update/<int:event_id>/', update_event, name="update_event"),
    path('alumni-events/delete/<int:event_id>/', delete_event, name="delete_event"),
    
    path('alumni/<int:alumni_id>/', get_alumni_profile, name='get_alumni_profile'),
    path('alumni/<int:alumni_id>/update/', update_alumni, name='update_alumni'),
   
]
