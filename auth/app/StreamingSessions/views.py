from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import authentication, permissions
from django.contrib.auth.models import User
from .permissions import HasProjectAPIKey
from .session_management import check_if_active_session_exists, generate_new_session
import json
from .models import ActiveProjects, HealthCheck, Session, ProjectAPIKey


# Create your views here.


# Endpoint for Getting a session Room
class RoomRetrievalView(APIView):
    permission_classes = [HasProjectAPIKey]

    def get(self, request):
        # Grab our API Key
        raw_key = request.META["HTTP_AUTHORIZATION"].split()[1]
        api_key = ProjectAPIKey.objects.get_from_key(raw_key)

        if check_if_active_session_exists(api_key):
            session = ActiveProjects.objects.get(project = api_key.project).session
        else:
            session = generate_new_session(api_key)

        session_to_return = {
            "RoomName" : session.session_room,
            "SessionID" : session.id
        }

        new_health_check = HealthCheck.objects.create(related_api_key=api_key, session_room=session)

        return Response(json.dumps(session_to_return), status.HTTP_200_OK)

# Endpoint for ping healthchecks
class HealthCheckView(APIView):
    permission_classes = [HasProjectAPIKey]

    def post(self, request):
        raw_key = request.META["HTTP_AUTHORIZATION"].split()[1]
        api_key = ProjectAPIKey.objects.get_from_key(raw_key)

        session_id = request.data["SessionID"]
        if session_id is None:
            return Response(json.dumps({"Error" : "Health Checks must include a SessionID"}), status.HTTP_400_BAD_REQUEST)
        

        session = None

        try:
            session_id = int(session_id)
            session = Session.objects.get(id=session_id)
        except ValueError:
            return Response(json.dumps({"Error" : "SessionID must be an integer"}), status.HTTP_400_BAD_REQUEST)
        except Session.DoesNotExist:
            return Response(json.dumps({"Error" : "No session exists with this ID"}), status.HTTP_400_BAD_REQUEST)


        new_health_check = HealthCheck.objects.create(related_api_key=api_key, session_room=session)
        return Response("{}", status.HTTP_200_OK)