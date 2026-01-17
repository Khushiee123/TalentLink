import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# This creates the user if it doesn't exist
if not User.objects.filter(username='KhushiSoni').exists():
    User.objects.create_superuser('KhushiSoni', 'ks@example.com', 'djkpj@123')
    print("✅ Superuser 'KhushiSoni' created successfully!")
else:
    # This resets the password if the user already exists
    user = User.objects.get(username='KhushiSoni')
    user.set_password('Khushi1224@')
    user.save()
    print("✅ Admin password reset to 'Khushi1224@'")