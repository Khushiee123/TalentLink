from django.urls import path
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (RegisterView, LoginView, ProfileView , 
                    ProjectListCreateView, ProjectDetailView,
                    ProposalCreateView, ProjectProposalsView ,
                    ProposalViewSet, ContractViewSet, MessageViewSet, NotificationViewSet, ReviewViewSet)

router = DefaultRouter()
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [

    path('', include(router.urls)),

    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),

    # Project Endpoints (Task 2 & 3)
    path('projects/', ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    
    # Proposal Endpoints (Task 4)
    path('proposals/', ProposalCreateView.as_view(), name='submit-proposal'),
    path('projects/<int:project_id>/proposals/', ProjectProposalsView.as_view(), name='project-proposals'),
]
