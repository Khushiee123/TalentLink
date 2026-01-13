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
from .models import Project, Profile, Proposal, Contract, Message , Review 
from .serializers import ProjectSerializer, ProfileSerializer , ProposalSerializer, ContractSerializer, MessageSerializer , ReviewSerializer
from .serializers import RegisterSerializer
from rest_framework import viewsets, status , permissions
from rest_framework.decorators import action
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer

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
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['budget', 'duration']
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        try:
            role = user.profile.role
        except Profile.DoesNotExist:
            role = 'freelancer' # Default fallback

        if role == 'client':
            # Clients see ONLY the projects they created
            # This ensures they can see their assigned projects in the filter
            return Project.objects.filter(client=user).order_by('-created_at')
        
        # Freelancers see open projects OR projects they are hired for
        return Project.objects.filter(
            Q(freelancer__isnull=True) | Q(freelancer=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

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

class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users see contracts where they are either the client or the freelancer
        user = self.request.user
        return Contract.objects.filter(client=user) | Contract.objects.filter(freelancer=user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        contract = self.get_object()
        new_status = request.data.get("status")
        if new_status in ['active', 'completed', 'cancelled']:
            contract.status = new_status
            contract.save()
            return Response({"message": f"Contract marked as {new_status}"})
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
    
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        contract_id = self.request.query_params.get('contract')
        
        # Filter for messages relevant to the user
        queryset = Message.objects.filter(
            Q(sender=user) | 
            Q(contract__client=user) | 
            Q(contract__freelancer=user)
        )

        if contract_id:
            return queryset.filter(contract_id=contract_id).order_by('timestamp')
        
        return queryset.order_by('timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # This will trigger the 'created' signal in models.py 
        # (Notifying the Client)
        serializer.save(freelancer=self.request.user)
    
    def get_queryset(self):
        user = self.request.user
        received = Proposal.objects.filter(project__client=user)
        sent = Proposal.objects.filter(freelancer=user)
        return (received | sent).distinct().order_by('-submitted_at')

    def perform_update(self, serializer):
        # We simply save. The Signal in models.py handles 
        # Contract creation, Project linking, and Notifications.
        serializer.save()

    @action(detail=True, methods=['post'])
    def accept_proposal(self, request, pk=None):
        """
        Custom action to accept a proposal.
        Triggered when the Client clicks the 'Hire' button.
        """
        proposal = self.get_object()
        
        # Security check: Only the client who owns the project can hire
        if proposal.project.client != request.user:
            return Response({"error": "You do not have permission to accept this proposal."}, 
                            status=status.HTTP_403_FORBIDDEN)

        # Update the status
        proposal.status = 'accepted'
        proposal.save()  # <--- This save() triggers the notification signal in models.py

        return Response({
            "status": "success",
            "message": f"Proposal accepted! {proposal.freelancer.username} has been hired."
        }, status=status.HTTP_200_OK)
    

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Only show notifications for the logged-in user
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marks all notifications for the current user as read."""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all notifications marked as read'}, status=status.HTTP_200_OK)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Shows reviews where the user is either the one giving or receiving
        user = self.request.user
        return Review.objects.filter(
            Q(reviewer=user) | Q(reviewed_user=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        # 1. Frontend sends 'contract' (the ID) in the JSON body
        contract_id = self.request.data.get('contract')
        
        if not contract_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"contract": "Contract ID is required to post a review."})

        try:
            # 2. Fetch the contract to link it to the review
            contract = Contract.objects.get(id=contract_id)
            
            # 3. The freelancer is found via the contract's proposal
            freelancer = contract.proposal.freelancer

            # 4. Save the review with all necessary links
            serializer.save(
                reviewer=self.request.user,
                reviewed_user=freelancer,
                contract=contract
            )
        except Contract.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"contract": "The specified contract does not exist."})