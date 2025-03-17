"""
URL configuration for djangoapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("login/", auth_views.LoginView.as_view(), name="login"),
    path('curricular/', include('curricular.urls')),
    path('assessments/', include('assessments.urls')),
    path('cocurricular/', include('cocurricular.urls')),
    path('extracurricular/', include('extracurricular.urls')),
    path('alumni/', include('alumni.urls')),
    path('notification/', include('notifications.urls')),
    path('noti/', include('noti.urls')),
<<<<<<< HEAD
    path('resume/', include('resume.urls')),

=======
    path('profilepage/', include('profilepage.urls')),
>>>>>>> 4869833ecb786a5300c15373d9243aea5459178f
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
