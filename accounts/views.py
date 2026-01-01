from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Profile, Proposal

from .serializers import ProjectSerializer, ProfileSerializer , ProposalSerializer

from .serializers import RegisterSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role,
            "portfolio": profile.portfolio,   # Added
            "skills": profile.skills,         # Added
            "hourly_rate": profile.hourly_rate, # Added
            "availability": profile.availability # Added
        })

    def patch(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        # Update multiple fields at once
        data = request.data
        
        profile.role = data.get("role", profile.role)
        profile.portfolio = data.get("portfolio", profile.portfolio)
        profile.skills = data.get("skills", profile.skills) # Expecting a list or comma-separated string
        profile.hourly_rate = data.get("hourly_rate", profile.hourly_rate)
        profile.availability = data.get("availability", profile.availability)
        
        profile.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            # serializer.save() already creates the User AND the Profile
            user = serializer.save() 

            # Generate tokens (Optional if you just want to redirect to Login)
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User registered successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)

        # If username/email is taken, this returns a clean JSON error (no HTML)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class LoginView(APIView):
    permission_classes = [AllowAny] # Ensure anyone can try to log in

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        # Ensure a profile exists (Double-check for older users)
        from .models import Profile
        profile, created = Profile.objects.get_or_create(user=user)

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "role": profile.role  # This helps the frontend "recollect" the user
            }
        }, status=status.HTTP_200_OK)

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    
    # Task 3: Filter by budget/duration, search by title/description
    filterset_fields = ['budget', 'duration']
    search_fields = ['title', 'description']

    def perform_create(self, serializer):
        # Automatically set the current user as the client who posted the project
        serializer.save(freelancer=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

# Task 4: Proposal Submission and Management
class ProposalCreateView(generics.CreateAPIView):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the current user as the freelancer
        serializer.save(freelancer=self.request.user)

class ProjectProposalsView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Clients can see all proposals for a specific project
        project_id = self.kwargs['project_id']
        return Proposal.objects.filter(project_id=project_id)
