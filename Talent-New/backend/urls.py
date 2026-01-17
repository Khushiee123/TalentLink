from django.contrib import admin
from django.conf import settings
from django.urls import path, include, re_path # Added re_path
from django.conf.urls.static import static
from django.views.generic import TemplateView # Added TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    
    # This links the empty path '' and ALL other front-end paths to React
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)