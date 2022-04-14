from pydoc import Helper
from django.contrib import admin
from .models import *
from rest_framework_api_key.admin import APIKeyModelAdmin

# Register your models here.

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    pass

@admin.register(ProjectAPIKey)
class ProjectAPIKeyAdmin(APIKeyModelAdmin):
    pass

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    pass

@admin.register(HealthCheck)
class HealthCheckAdmin(admin.ModelAdmin):
    pass

@admin.register(ActiveProjects)
class ActiveProjectsAdmin(admin.ModelAdmin):
    pass

