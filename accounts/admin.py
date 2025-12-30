from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Project, Proposal, Contract, Message, Review, Skill, Profile



admin.site.register(Contract)
admin.site.register(Message)
admin.site.register(Review)
admin.site.register(Skill)


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    # This creates a separate "Profiles" section in Admin
    list_display = ('user', 'role', 'hourly_rate', 'availability')
    list_filter = ('role', 'availability')
    search_fields = ('user__username', 'skills')

# --- CUSTOM PROJECT ADMIN (Task 2 & 3) ---
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    # Projects show title and the client who posted it
    list_display = ('title', 'client', 'budget', 'duration') 
    list_filter = ('budget', 'duration')
    search_fields = ('title', 'description')

# --- CUSTOM PROPOSAL ADMIN ---
@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    # Proposals show the project they belong to and the freelancer bidding
    list_display = ('project', 'freelancer', 'bid_amount', 'submitted_at') 
    # The comma at the end of ('submitted_at',) is required for a single-item tuple
    list_filter = ('submitted_at',) 
    search_fields = ('cover_letter',)

class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)

# Safe unregister
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, CustomUserAdmin)
