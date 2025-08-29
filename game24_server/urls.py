from django.urls import path
from . import views

urlpatterns = [
    path("solve/<str:numbers_str>/", views.solve_game24, name="solve"),
]
