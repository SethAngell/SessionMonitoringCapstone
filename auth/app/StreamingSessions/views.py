from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions
from django.contrib.auth.models import User
from rest_framework_api_key.permissions import HasAPIKey
from session_management import check_if_active_session_exists, generate_new_session


# Create your views here.


# Endpoint for Getting a session Room
class RoomRetrieval(APIView):
    permission_classes = [HasAPIKey]

    def get(self, request):
        


# Endpoint for ping healthchecks
