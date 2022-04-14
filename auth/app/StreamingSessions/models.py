from django.db import models
from rest_framework_api_key.models import AbstractAPIKey
from users.models import CustomUser
import uuid

device_types = [
    ("H", "Headset"),
    ("C", "Client")
]

class Project(models.Model):
    project_name = models.CharField(max_length=128, null=True, blank=False)
    developer = models.ForeignKey(
        CustomUser,
        on_delete=models.DO_NOTHING,
    )
    friendly_room_prefix = models.CharField(max_length=36, null=False, blank=True)

    def __str__(self):
        return self.project_name


class ProjectAPIKey(AbstractAPIKey):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="api_keys",
    )
    device_type = models.CharField(max_length=1, choices=device_types, null=True)

    def __str__(self):
        return f'{self.name}'


class Session(models.Model):
    creation_date = models.DateTimeField(auto_now_add=True)
    conclusion_date = models.DateTimeField()
    triggering_api_key = models.ForeignKey(ProjectAPIKey, on_delete=models.DO_NOTHING) # The API Key associated with the first device to connect
    session_room = models.CharField(max_length=73)

    def generate_session_room_name(self):
        if self.triggering_api_key.project.friendly_room_prefix is not None:
            return(f'{self.triggering_api_key.project.friendly_room_prefix}-{uuid.uuid4()}')
        else:
            return(str(uuid.uuid4()))

    def save(self, *args, **kwargs):
        self.session_room = self.generate_session_room_name()
        super(Session, self).save(*args, **kwargs)

    def __str__(self):
        return self.session_room

class HealthCheck(models.Model):
    related_api_key = models.ForeignKey(
        ProjectAPIKey,
        on_delete=models.CASCADE
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    session_room = models.ForeignKey(Session, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.session_room} - {self.related_api_key} - {self.timestamp}'

class ActiveProjects(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )
    session = models.ForeignKey(
        Session,
        on_delete=models.DO_NOTHING
    )

    def __str__(self):
        return self.project






