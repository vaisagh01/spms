from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Alumni

@receiver(post_save, sender=Alumni)
def convert_to_alumni(sender, instance, **kwargs):
    if instance.course_completed:
        instance.user.is_active = False
        instance.user.save()
