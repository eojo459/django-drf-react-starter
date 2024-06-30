import jwt
import os
from supabase import create_client, Client
from requests import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework import authentication, status
from rest_framework.exceptions import AuthenticationFailed
from user.models import User
from decouple import config

# supabase setup
#url: str = os.environ.get("SUPABASE_URL")
#key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(config('SUPABASE_URL'), config('SUPABASE_KEY'))

class CustomJWTAuthentication(JWTAuthentication):
    def decode_handler(self, token):
        # Customize the decoding logic here
        untyped_token = UntypedToken(token)
        claims = {'token_type': untyped_token['token_type']}
        
        # You might want to check for 'uid' instead of 'user_id'
        if 'uid' in untyped_token:
            claims['user_id'] = untyped_token['uid']
        
        return claims

class SupabaseTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # if we are registering a new user | join waitlist | send message | validate code => skip the authentication
        if 'request_type' in request.data:
            request_type = request.data['request_type']
            if request_type == 'Register' or request_type == 'no-auth':
                return (request.data, None)
        elif 'object' in request.data:
            # if we have a chargebee webhook result, skip authentication
            object = request.data['object']
            if object == 'event':
                return (request.data, None)
        
        # get the access token from the request headers
        #token_string = request.headers.get('X-JWT', '').split('Bearer ')
        token_string = request.headers.get('X-JWT', '')
        print(request.headers)
        if len(token_string) <= 0:
            raise AuthenticationFailed("User not found.")
            #return Response( {"message":"User not found."}, status=status.HTTP_401_UNAUTHORIZED)
        
        #access_token = token_string[1].strip()
        access_token = token_string

        # find user who owns the access token
        user = supabase.auth.get_user(access_token)
        if user.user is not None:
            if user.user.role == 'authenticated':
                # retrieve the user object from Django database
                try:
                    django_user = User.objects.get(uid=user.user.id)
                    return (django_user, None)  # Return the user
                except User.DoesNotExist:
                    return Response( {"message":"User not found."}, status=status.HTTP_401_UNAUTHORIZED)
            
        return Response( {"message":"User not found."}, status=status.HTTP_401_UNAUTHORIZED)
        


        

        