from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Logic: The Client is the "Owner/Creator"
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_projects'
    )
    
    # Logic: The Freelancer is the "Viewer/Recipient" (can be null if not yet assigned)
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='hired_projects'
    )

    def __str__(self):
        return self.title


class Proposal(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='proposals')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposals_sent')
    cover_letter = models.TextField()
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"Proposal for {self.project.title} by {self.freelancer.username}"

class Contract(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    client = models.ForeignKey(User, related_name='contracts_as_client', on_delete=models.CASCADE)
    freelancer = models.ForeignKey(User, related_name='contracts_as_freelancer', on_delete=models.CASCADE)
    proposal = models.OneToOneField(Proposal, on_delete=models.CASCADE)
    
    # ADD THIS LINE: to store the money amount
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) 
    
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contract: {self.project.title} (${self.total_amount})"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    contract = models.ForeignKey(Contract, related_name='messages', on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender}"

class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"Review by {self.reviewer}"

class Skill(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Profile(models.Model):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    portfolio = models.TextField(blank=True, null=True)
    skills = models.CharField(max_length=255, blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    availability = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(post_save, sender=Proposal)
def create_contract_on_proposal_acceptance(sender, instance, created, **kwargs):
    if instance.status == 'accepted':
        contract, created_now = Contract.objects.get_or_create(
            proposal=instance,
            defaults={
                'project': instance.project,
                'client': instance.project.client,
                'freelancer': instance.freelancer,
                'total_amount': instance.bid_amount,  # ADD THIS: Copies price from proposal
                'status': 'active'
            }
        )
        
        if created_now:
            # Link the freelancer to the project
            project = instance.project
            project.freelancer = instance.freelancer
            project.save()