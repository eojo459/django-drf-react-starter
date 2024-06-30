from django.shortcuts import render
import jwt
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import authentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth import get_user_model
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from backend.utils.helper import BusinessProfilePlanType, format_owner_working_hours, format_staff_working_hours, remove_empty_fields
from businessManagement.serializers import BusinessInviteCodesSerializer, EmergencyContactIdSerializer, NewUsersSerializer, OwnerWorkingHoursSerializer, PositionSerializer, UnassignedUsersSerializer
from businessManagement.models import InviteCodes, SubscriptionPlan, BusinessProfile, BusinessProfilePlan, EmergencyContact, EmploymentType, NewUsers, NotificationMessage, OwnerWorkingHours, Position
from backend.utils.backend_auth import SupabaseTokenAuthentication
from .models import BusinessOwner, Parent, Staff, User, Child
from .serializers import BusinessOwnerGetSerializer, BusinessOwnerSerializer, BusinessOwnerSerializerCreate, IdSerializer, ParentGetSerializer, ParentSerializer, ParentSerializerCreate, StaffCountSerializer, StaffGetSerializer, StaffSerializer, StaffSerializerCreate, UserGetSerializer, UserSerializer
from supabase import create_client, Client
from decouple import config
from backend.utils.email_templates.email import new_owner_signup_email, new_pending_user_email, new_staff_signup_email

url = config("SUPABASE_URL")
key = config("SUPABASE_KEY")
#url = 'https://cmkoomcgbmueihzpvtck.supabase.co'
#key = supabaseKey
supabase: Client = create_client(url, key)

# token authentication
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Remove user_id from the token
        if 'user_id' in token:
            del token['user_id']

        # Add custom claims
        token['role'] = user.role
        token['uid'] = str(user.uuid)
        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

###############
## USER
###############

# POST => /api/register
@api_view(['POST'])
def PostUser(request):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    # POST a new auth user
    if request.data['role'] == "STAFF_INVITE":
        temp = request.data.copy()
        temp['role'] = "STAFF"
        serializer = UserSerializer(data=temp)
    else:
        serializer = UserSerializer(data=request.data)

    if serializer.is_valid():  
        serializer.save() # get data from supabase via request body and save to database
        new_auth_user = serializer.data
    else:
    # Handle invalid serializer data
        return Response({
            'status': 'Bad Request',
            'message': 'User could not be created with received data.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # add staff to new users table
    new_user = {
        'user_uid': request.data['uid'],
        'business_id': request.data['business_id'],
    }
    new_user_serializer = NewUsersSerializer(data=new_user)
    if new_user_serializer.is_valid():
        new_user_serializer.save()
    else:
        return Response({
            'status': 'Bad Request',
            'message': 'New user could not be added to new users with received data.',
            'errors': new_user_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    if request.data['role'] == 'STAFF_INVITE':
        # increment use count for invite code
        invite_code = get_object_or_404(InviteCodes, invite_code=request.data['invite_code']) 
        invite_code.uses = invite_code.uses + 1
        invite_code.save()
        return Response(status=status.HTTP_201_CREATED)

# GET => /api/users/<user_uid>
@api_view(['GET', 'PATCH', 'DELETE'])
def Users(request, user_uid):
    if user_uid is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # GET a user by id from user table
    if request.method == 'GET':
        user = get_object_or_404(User, uid=user_uid)
                
        # return user data
        formatted_user = {  
            'uid': user.uid,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'street': user.street,
            'street_2': user.street_2,
            'city': user.city,
            'province': user.province,
            'country': user.country,
            'postal_code': user.postal_code,
            'gender': user.gender,
            'cell_number': user.cell_number,
            'home_number': user.home_number,
            'work_number': user.work_number,
            'date_joined': user.date_joined,
            'role': user.role,
            'active': user.active,
            'plan_id': user.plan_id,
            'confirm_email': user.confirm_email,
        }
        #serializer = UserGetSerializer(user)
        return Response(formatted_user, status=status.HTTP_200_OK)

    elif request.method == 'PATCH':
        # get user to be updated 
        user = get_object_or_404(User, uid=user_uid)
        
        # clean object
        cleaned_user = remove_empty_fields(request.data)

        serializer = UserSerializer(user, data=cleaned_user, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            # Handle invalid serializer data
            return Response({
                'status': 'Bad Request',
                'message': 'Base user could not be updated with received data.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # check for email | password | cell number | pin code
        if 'email' in request.data and request.data['email'] != '':
            # update email in supabase
            data, count = supabase.table('users').update({'email': request.data['email'] }).eq('id', user_uid).execute()
        
        if 'new_password' in request.data and request.data['new_password'] != '': 
            # update password in supabase
            #session = supabase.auth.refresh_session()
            #supabase.auth.access_token = session['access_token']
            supabase.auth.sign_in_with_password({"email": request.data['email'], "password": request.data['old_password']})
            supabase.auth.update_user({ 'password': request.data['new_password'] })

            # get new encrypted password
            #response = supabase.table('users').select('encrypted_password').eq('id', user_uid).execute()
            #print(response)

        if 'cell_number' in request.data and request.data['cell_number'] != '':
            # update cell number in supabase
            data, count = supabase.table('users').update({'cell_number': request.data['cell_number'] }).eq('id', user_uid).execute()

        if 'pin_code' in request.data and request.data['pin_code'] != '':
            # TODO update pin code in supabase
            #print('pin code')
            pass

        return Response({"message":"User was modified"}, status=status.HTTP_200_OK)
           
    elif request.method == "DELETE":
        # get user
        auth_user = get_object_or_404(User, uid=user_uid)
        
        # clean up new user records if any
        new_user = NewUsers.objects.filter(user_uid=user_uid).first()
        if new_user is not None:
            new_user.delete()
            auth_user.delete()
            return Response({"message":"User was deleted"}, status=status.HTTP_200_OK)

        # delete auth user by setting to archived
        auth_user.archived = True
        auth_user.active = False
        auth_user.save()

        return Response({"message":"User was deleted"}, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

# GET => /api/persons/id/<person_uid>
# GET => /api/persons/username/<username>
@api_view(['GET'])
def GetAuthUserInfo(request, person_uid=None, username=None):
    # GET user with specific id
    if request.method == 'GET':
        if person_uid is not None:
            # try to get user by uid
            user = get_object_or_404(User, uid=person_uid)
        elif username is not None:
            # try to get user by username
            user = get_object_or_404(User, username=username)
        else:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        formatted_data = {
            'uid': user.uid,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'cell_number': user.cell_number,
            'notes': user.notes,
        }

        return Response(formatted_data, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    
# GET => /api/persons/id/<person_uid>/email/
# GET => /api/persons/username/<username>/email/
@api_view(['POST'])
def GetAuthUserEmail(request, person_uid=None, username=None):
    # GET user with specific id
    if request.method == 'POST':
        if person_uid is not None:
            # try to get user by uid
            user = get_object_or_404(User, uid=person_uid)
        if username is not None:
            # try to get user by username
            user = get_object_or_404(User, username=username)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'email' : user.email}, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

###############
## OWNER
###############

# GET|POST => /api/owners
@api_view(['GET', 'POST'])
def Owner(request):
    # POST new owner
    if request.method == 'POST':
        # get data from supabase via request body
        serializer = BusinessOwnerSerializerCreate(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
        # Handle invalid serializer data
            return Response({
                'status': 'Bad Request',
                'message': 'Owner could not be created with received data.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        # GET list of owners
        businessOwnerList = BusinessOwner.objects.all()
        serializer = BusinessOwnerGetSerializer(businessOwnerList, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
# GET|DELETE|PATCH => /api/owners/id/<owner_id>
@api_view(['GET', 'DELETE', 'PATCH'])
def OwnerById(request, owner_uid):
    # GET owner by id
    if request.method == 'GET':
        if owner_uid is not None:
            user = get_object_or_404(BusinessOwner, uid=owner_uid)
            serializer = BusinessOwnerGetSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
        # Handle invalid serializer data
            return Response({
                'status': 'Bad Request',
                'message': 'Owner could not be found with received data.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE owner by id
    elif request.method == 'DELETE':
        if owner_uid is not None:
            user = get_object_or_404(BusinessOwner, uid=owner_uid)
            user.delete()
            return Response(status=status.HTTP_200_OK)
        else:
            # Handle invalid serializer data
            return Response({
                'status': 'Bad Request',
                'message': 'Owner could not be found with received data.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
    # PATCH (partially or fully) update an owner
    elif request.method == 'PATCH':
        if owner_uid is not None:
            owner = get_object_or_404(BusinessOwner, uid=owner_uid)
            serializer = BusinessOwnerSerializer(owner, data=request.data)
            if serializer.is_valid():
                serializer.save()

                # also update user in user table
                user = get_object_or_404(User, uid=owner_uid)
                user_serializer = UserSerializer(user, data=request.data)
                if user_serializer.is_valid():
                    user_serializer.save()
                    return Response({"message":"Owner modified"}, status=status.HTTP_200_OK)
                else:
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Owner could not be updated with received data.',
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
# GET => /api/owners/username/<username>
@api_view(['GET'])
def GetOwnerByUsername(request, username):
    # GET owner by username
    if request.method == 'GET':
        if username is not None:
            user = get_object_or_404(BusinessOwner, username=username)
            serializer = BusinessOwnerGetSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
        # Handle invalid serializer data
            return Response({
                'status': 'Bad Request',
                'message': 'Owner could not be found with received data.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

#####################
# APPROVE NEW USERS
#####################
    
# POST /api/people/approve/user/<user_uid>
@api_view(['POST'])
def ApproveNewUser(request, user_uid=None):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if user_uid is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    # update user set active
    user = get_object_or_404(User, uid=user_uid)
    data = {
        'active': True,
    }
    new_user_serializer = UserSerializer(user, data=data, partial=True)
    if new_user_serializer.is_valid():
        new_user_serializer.save()
    else:
        return Response({
            'status': 'Bad Request',
            'message': 'Staff user could not be updated with received data.',
            'errors': new_user_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # delete new_user record
    new_user = NewUsers.objects.filter(user_uid=user_uid).first()
    if new_user is not None:
        new_user.delete()
    
    # delete any notification messages related to this
    notifications = NotificationMessage.objects.filter(id=request.data['notification_id'])
    for notification in notifications:
        notification.delete()
    
    return Response(status=status.HTTP_201_CREATED)

###############
## USER CHECK
###############

# POST => /api/users?username={x}&email={x}&cell_number={x}
@api_view(['POST'])
def CheckUsers(request):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    query_params = request.query_params

    if 'username' in query_params:
        # GET and check if a user exists by username
        username_count = User.objects.filter(username=query_params['username']).count()
        return Response(username_count > 0, status=status.HTTP_200_OK)
    elif 'email' in query_params:
        # GET and check if a user exists by email
        email_count = User.objects.filter(email=query_params['email']).count()
        return Response(email_count > 0, status=status.HTTP_200_OK)
    elif 'cell_number' in query_params:
        if query_params['cell_number'] == '':
            return Response(False, status=status.HTTP_200_OK)
        
        # GET and check if a user exists by cell number
        cell_count = User.objects.filter(cell_number=query_params['cell_number']).count()
        return Response(cell_count > 0, status=status.HTTP_200_OK)
    
    return Response(status=status.HTTP_200_OK)