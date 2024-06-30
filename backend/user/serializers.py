from backend.businessManagement.models import InviteCodes
from rest_framework import serializers
from .models import User

# AUTH USER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'username': {'required': False},
            'cell_number': {'required': False},
            'email': {'required': False},
            'uid': {'required': False},
            'password': {'required': False},
        }

class UserGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uid','first_name','last_name','street','street_2','city','country','province',
                  'postal_code','email','cell_number','work_number','home_number','role','notes']
        

class BusinessInviteCodesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InviteCodes
        fields = '__all__'