from django.urls import include, path
from .views import ApproveNewUser, CheckUsers, GetAuthUserEmail, GetParentByUsername, GetStaffByUsername, OwnerById, GetOwnerByUsername, Users, MyTokenObtainPairView, Owner, OwnerInfo, ParentById, ParentV2, PeopleDirectory, PostUser, StaffById, StaffV2, UserInfo, UserContactInfo, GetAuthUserInfo, ParentDetail, ParentInfo, StaffDetail, StaffInfo
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from rest_framework_simplejwt.views import TokenBlacklistView

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/blacklist', TokenBlacklistView.as_view(), name='token_blacklist'),

    # users/persons
    path('register/', PostUser, name='postUser'),
    path('users/id/<str:user_uid>', Users, name='user'),
    path('persons/id/<str:person_uid>', GetAuthUserInfo, name='personUid'),
    path('persons/id/email/<str:person_uid>', GetAuthUserEmail, name='personEmail'),
    path('persons/username/<str:username>', GetAuthUserInfo, name='personUsername'),
    path('persons/username/email/<str:username>', GetAuthUserEmail, name='personEmail'),
    path('approve/staffs/<str:staff_uid>', ApproveNewUser, name='approveStaffUser'),
    path('users/', CheckUsers, name='checkUsers'),

    # owners
    path('owners/', Owner, name='Owners'),
    path('owners/id/<str:owner_uid>', OwnerById, name='OwnerById'),
    path('owners/username/<str:username>', GetOwnerByUsername, name='GetOwnerByUsername'),
]
