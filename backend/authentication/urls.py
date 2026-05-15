from django.urls import path

from .views import LoginView, LogoutView, MeView, PasswordChangeView

urlpatterns = [
    path("me", MeView.as_view(), name="auth-me"),
    path("login", LoginView.as_view(), name="auth-login"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("password-change", PasswordChangeView.as_view(), name="auth-password-change"),
]
