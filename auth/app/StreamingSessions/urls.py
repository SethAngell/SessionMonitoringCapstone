from django.urls import include, path

from . import views

urlpatterns = [
    path("get-session-room/", views.RoomRetrievalView.as_view()),
    path("ping/", views.HealthCheckView.as_view()),
]
