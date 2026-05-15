from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from health_check.views import HealthCheckView
from redis.asyncio import Redis as RedisClient
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf.urls.static import static

urlpatterns = [
    path(
        "health/",
        HealthCheckView.as_view(
            checks=[
                "health_check.Cache",
                "health_check.DNS",
                "health_check.Database",
                "health_check.Storage",
                # 3rd party checks
                (
                    "health_check.contrib.redis.Redis",
                    {
                        "client_factory": lambda: RedisClient.from_url(
                            settings.REDIS_URL
                        )
                    },
                ),
            ],
        ),
    ),
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
    path("migraine/", include("migraine.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# Show the drf-spectacular UI in debug mode
if settings.DEBUG:
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path(
            "api/schema/swagger-ui/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
    ]
