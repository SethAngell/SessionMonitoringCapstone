# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    name = models.CharField(blank=True, max_length=255)

    REQUIRED_FIELDS = AbstractUser.REQUIRED_FIELDS + ["name"]

    def __str__(self):
        if self.first_name != None:
            return f"{self.first_name} {self.last_name}"
        return self.email

    def save(self, *args, **kwargs):
        if (self.name != None) and (len(self.name.split(" ")) == 2):
            split_name = self.name.split(" ")
            self.first_name = split_name[0]
            self.last_name = split_name[1]
        super(CustomUser, self).save(*args, **kwargs)
