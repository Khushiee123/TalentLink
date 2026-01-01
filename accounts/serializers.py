from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Project, Proposal

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[('client', 'Client'), ('freelancer', 'Freelancer')],
        write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        role = validated_data.get('role',"")
        skills = self.initial_data.get('skills', "")
        portfolio = self.initial_data.get('portfolio', "")
        hourly_rate = self.initial_data.get('hourly_rate', 0.00)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )

        profile = user.profile  # Access the profile created by the signal
        profile.role = role
        profile.skills = skills
        profile.portfolio = portfolio
        profile.hourly_rate = hourly_rate
        profile.save() 

        return user

# --- ADDED FOR TASK 1 & 3 ---
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Profile
        fields = ['id', 'username', 'role', 'skills', 'portfolio', 'hourly_rate', 'availability']
    
    # Add this to handle old profiles with empty data
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # If role is None (null), return a default string so React doesn't crash
        if data.get('role') is None:
            data['role'] = "Not Specified"
        return data
# --- IMPROVED FOR TASK 2 & 3 ---
class ProjectSerializer(serializers.ModelSerializer):
    client_username = serializers.ReadOnlyField(source='client.username', read_only=True)
    freelancer_username = serializers.ReadOnlyField(source='freelancer.username', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'client', 'client_username','freelancer_username', 'title', 'description', 'budget', 'duration', 'created_at']
        read_only_fields = ['client']

# --- ADDED FOR TASK 4 ---
class ProposalSerializer(serializers.ModelSerializer):
    freelancer_username = serializers.ReadOnlyField(source='freelancer.username')

    class Meta:
        model = Proposal
        fields = ['id', 'project', 'freelancer', 'freelancer_username', 'cover_letter', 'bid_amount', 'created_at']
        read_only_fields = ['freelancer']