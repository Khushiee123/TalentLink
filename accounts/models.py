from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver



class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    skills = models.ManyToManyField(Skill, related_name="projects")

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
        # ADDED 'submitted' to choices below
        choices=[
            ('pending', 'Pending'), 
            ('accepted', 'Accepted'), 
            ('submitted', 'Submitted'), 
            ('rejected', 'Rejected')
        ],
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
    content = models.TextField(blank=True, null=True) 
    file = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender}"



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
    # --- NEW AVATAR FIELDS ---
    bio = models.TextField(blank=True, null=True)
    useAvatar = models.BooleanField(default=False)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


# 2. Proposal & Contract Notifications
@receiver(post_save, sender=Proposal)
def handle_proposal_actions(sender, instance, created, **kwargs):
    # This print helps you debug in your terminal
    print("\n" + "="*30)
    print("DEBUG: SIGNAL EXECUTING!")
    print(f"DEBUG: Status is -> {instance.status}")
    print("="*30 + "\n") 

    # 1. ACTION: Notify Client about a NEW Proposal
    if created:
        Notification.objects.create(
            recipient=instance.project.client,
            sender=instance.freelancer,
            n_type='PROPOSAL',
            message=f"New proposal for '{instance.project.title}' from {instance.freelancer.username}."
        )

    # 2. ACTION: Handle Acceptance
    # 2. ACTION: Handle Acceptance
    if instance.status.lower() == 'accepted':
        contract, created_now = Contract.objects.get_or_create(
            proposal=instance,
            defaults={
                'project': instance.project,
                'client': instance.project.client,
                'freelancer': instance.freelancer,
                'total_amount': instance.bid_amount,
                'status': 'active'
            }
        )
        
        # Move notifications OUTSIDE of 'if created_now' for testing
        # Use get_or_create for the notification itself to avoid duplicates
        Notification.objects.get_or_create(
            recipient=instance.freelancer,
            n_type='SYSTEM',
            message=f"Your proposal for '{instance.project.title}' was accepted!",
            # Defaults ensures we don't create it twice if we refresh
            defaults={'sender': instance.project.client}
        )
        print(f"DEBUG: Notification sent to {instance.freelancer.username}")
        
        # We only want to create these notifications if the contract was JUST created
        if created_now:
            # A. Update Project to show assigned freelancer
            project = instance.project
            project.freelancer = instance.freelancer
            project.save()

            # B. Notify Freelancer (The person being hired)
            n = Notification.objects.create(
                recipient=instance.freelancer,
                sender=instance.project.client,
                n_type='SYSTEM',
                message=f"Your proposal for '{instance.project.title}' was accepted! Contract is now active."
            )
            print(f"NOTIFICATION CREATED for ID: {n.recipient.id}")

            # C. Notify Client (The person who clicked Hire - YOU)
            Notification.objects.create(
                recipient=instance.project.client,
                sender=None,
                n_type='SYSTEM',
                message=f"Success! You have hired {instance.freelancer.username} for '{instance.project.title}'."
            )

# 3. Message Notifications
@receiver(post_save, sender=Message)
def handle_message_notification(sender, instance, created, **kwargs):

    if created:
        # We need to find the recipient. If it's a contract chat, 
        # the recipient is whoever DID NOT send the message.
        recipient = None
        if instance.contract:
            if instance.sender == instance.contract.client:
                recipient = instance.contract.freelancer
            else:
                recipient = instance.contract.client
        
        if recipient:
            Notification.objects.create(
                recipient=recipient,
                sender=instance.sender,
                n_type='MESSAGE',
                message=f"You have a new message from {instance.sender.username}."
            )

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('PROPOSAL', 'Proposal Update'),
        ('MESSAGE', 'New Message'),
        ('SYSTEM', 'System Alert'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    n_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='SYSTEM')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message[:20]}"
    

class Review(models.Model):
    # Links the review to a specific project for verification
    contract = models.OneToOneField(Contract, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)]) # 1-5 Stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} stars for {self.reviewed_user.username}" 