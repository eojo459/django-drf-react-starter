import base64
from rest_framework import serializers
from .models import BusinessGroup, BusinessGroupRelationship, InviteCodes, BusinessProfile, BusinessSchedule, BusinessType, ChargebeeWebhooks, ContactMessage, Cookies, DayOfWeek, EmailTokenVerify, EmergencyContact, EmploymentType, SubscriptionPlan, BusinessProfilePlan, Holiday, HolidayRelationship, Location, MonthlyTotalStaffHours, MonthlyTotalUserHours, MonthlyTotalWages, NewUsers, NotificationMessage, NotificationMessageType, OwnerWorkingHours, Payments, PayrollInformation, Position, QRCode, Report, ReportFrequency, StaffActivity, StaffActivityLog, SubmittedTimesheets, Subscriptions, Timesheet, TimesheetStatus, UnassignedUsers, UserActivity, UserActivityLog, UserStatus, Waitlist

class WaitlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waitlist
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        
class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = '__all__'

class NotificationMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationMessage
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

class NewUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUsers
        fields = '__all__'

class NotificationMessageTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationMessageType
        fields = '__all__'

class ChargebeeWebhooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChargebeeWebhooks
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriptions
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payments
        fields = '__all__'

class EmailTokenVerifySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTokenVerify
        fields = '__all__'

class CookiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cookies
        fields = '__all__'