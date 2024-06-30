from django.contrib import admin
from django.urls import include, path
from .views import ApproveSubmittedTimesheet, ArchivedTimesheets, BusinessGroupDetail, BusinessGroupRelationshipDetail, BusinessHoursInfo, BusinessInfo, BusinessOwnerId, BusinessOwnerPlanDetail, BusinessProfilePlanDetail, BusinessSeeding, BusinessTypeInfo, BusinessV2, CancelChargebeeSubscription, ChargebeeWebhookListen, CreateEmailVerifyToken, EmploymentPositionType, GenerateChargebeeUpdatePaymentMethodCheckoutUrl, GenerateChargebeeUpdateSubscriptionCheckoutUrl, GenerateNewChargebeeCheckoutUrl, GetChargebeeCheckoutUrl, GetChargebeeInvoiceData, GetChargebeeInvoicePDF, GetChargebeeSubscription, GetOwnersPayment, GetOwnersSubscription, MonthlyTotalStats, NotificationMessagesInfo, DenySubmittedTimesheet, EmploymentPositionModify, GetEmploymentTypes, GetUserBusinessInfo, GroupMemberDetail, HolidayModify, InviteCodeManagement, LocationDetail, EmergencyContactDetail, EmergencyContactInfo, MonthlyTotalHoursCalc, NotSubmittedTimesheets, OwnerWorkingHoursInfo, PayrollInformationModify, SendNewOwnerEmail, StaffActivityLogStatus, StaffActivityStatus, StaffLimitStatus, SubmitTimesheet, SubmittedTimesheetsList, TimesheetInfo, TimesheetModify, TimesheetReport, Timesheets, UnassignedUsersManagement, UpdateCookies, UserActivityStatus, ValidateInviteCode, VerifyChargebeeSubscription, VerifyUserEmail, Waitlists

urlpatterns = [
    path('', BusinessV2, name='business'),
    path('seeding/', BusinessSeeding, name='seeding'),

    # subscriptions info
    path('plans/', BusinessProfilePlanDetail, name='businessProfilePlans'),
    path('plans/<str:plan_id>', BusinessProfilePlanDetail, name='businessProfilePlanId'),
    path('plans/plan-name/<str:plan_name>', BusinessProfilePlanDetail, name='businessProfilePlanName'),
    path('plans/owner/id/<str:owner_uid>', BusinessOwnerPlanDetail, name='businessOwnerPlanOwnerUid'),
    path('subscriptions/user/<str:owner_uid>', GetOwnersSubscription, name='getOwnerSubscription'),
    path('payments/user/<str:owner_uid>', GetOwnersPayment, name='getOwnerPayment'),

    # notifications
    path('notifications/staffs/<str:staff_uid>', NotificationMessagesInfo, name='Messages'),
    path('notifications/users/<str:user_uid>', NotificationMessagesInfo, name='Messages'),
    
    # validation
    path('validate-code/', ValidateInviteCode, name='validateCode'),
    path('verify/user/<str:user_uid>', VerifyUserEmail, name='VerifyUserEmail'),

    # cookies
    path('cookies/', UpdateCookies, name='UpdateCookies'),
    path('cookies/<str:user_uid>', UpdateCookies, name='UpdateCookies'),

    # emails
    path('verify/email/token/', CreateEmailVerifyToken, name='EmailVerifyToken'),

    # PDF reports
    path('<str:business_id>/reports/', TimesheetReport, name='TimesheetReport'),

    # other
    path('waitlist/', Waitlists, name='Waitlists'),
    path('messages/', NotificationMessagesInfo, name='Messages'),
    
    # chargebee endpoints
    path('verify/subscriptions/subscription/<str:subscription_id>', VerifyChargebeeSubscription, name='verifyChargebeeSubscription'),
    path('subscriptions/checkout/create/', GenerateNewChargebeeCheckoutUrl, name='chargebeeNewCheckoutUrl'),
    path('subscriptions/checkout/get/<str:hosted_page_id>', GetChargebeeCheckoutUrl, name='chargebeeGetCheckoutUrl'),
    path('subscriptions/cancel/owners/owner/<str:owner_uid>', CancelChargebeeSubscription, name='chargebeeCancelSubscription'),
    path('subscriptions/checkout/update/owners/owner/<str:owner_uid>', GenerateChargebeeUpdateSubscriptionCheckoutUrl, name='chargebeeUpdateSubscription'),
    path('subscriptions/payments/checkout/update/owners/owner/<str:owner_uid>', GenerateChargebeeUpdatePaymentMethodCheckoutUrl, name='chargebeeUpdatePayment'),
    path('subscriptions/invoices/owners/owner/<str:owner_uid>', GetChargebeeInvoiceData, name='chargebeeInvoice'),
    path('subscriptions/invoices/pdf/owners/owner/<str:owner_uid>', GetChargebeeInvoicePDF, name='chargebeeInvoice'),
    path('subscriptions/owners/owner/<str:owner_uid>', GetChargebeeSubscription, name='chargebeeSubscription'),
    path('chargbee-webhooks/', ChargebeeWebhookListen, name='chargebeeWebhookListen'),
]