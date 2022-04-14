from rest_framework_api_key.permissions import BaseHasAPIKey
from .models import ProjectAPIKey

class HasProjectAPIKey(BaseHasAPIKey):
    model = ProjectAPIKey