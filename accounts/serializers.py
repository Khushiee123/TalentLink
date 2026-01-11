from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Project, Proposal, Contract, Message , Skill

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
    skills = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Skill.objects.all() # Make sure to import your Skill model
    )

    class Meta:
        model = Project
        fields = ['id', 'client', 'client_username','freelancer_username', 'title', 'description', 'budget', 'duration', 'created_at','skills']
        read_only_fields = ['client']

# --- ADDED FOR TASK 4 ---
class ProposalSerializer(serializers.ModelSerializer):
    client_username = serializers.ReadOnlyField(source='client.username')
    project_title = serializers.CharField(source='project.title', read_only=True)
    freelancer_username = serializers.ReadOnlyField(source='freelancer.username')

    class Meta:
        model = Proposal
        # Change 'created_at' to 'submitted_at' to match your Model
        fields = [
            'id', 'project', 'project_title', 'freelancer', 
            'client_username', 'cover_letter', 'bid_amount', 
            'submitted_at', 'status','freelancer_username','deadline'
        ]
        read_only_fields = ['freelancer']

class ContractSerializer(serializers.ModelSerializer):
    # These helper fields help the frontend show names instead of just IDs
    project_title = serializers.ReadOnlyField(source='project.title')
    client_username = serializers.ReadOnlyField(source='client.username')
    freelancer_username = serializers.ReadOnlyField(source='freelancer.username')

    class Meta:
        model = Contract
        fields = [
            'id', 'project', 'project_title', 'client', 'client_username', 
            'freelancer', 'freelancer_username', 'proposal', 'status', 'created_at', 'total_amount'
        ]

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = Message
        fields = ['id', 'contract', 'sender', 'sender_username', 'content', 'timestamp']
        # Add this line to stop the "sender is required" error
        read_only_fields = ['sender']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['name']