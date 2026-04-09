from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from app.api.router import api


def root(_: object) -> JsonResponse:
    return JsonResponse(
        {
            "service": "phishing-detector-backend",
            "docs": "/api/v1/docs",
            "openapi": "/api/v1/openapi.json",
        }
    )


urlpatterns = [
    path("", root),
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]
