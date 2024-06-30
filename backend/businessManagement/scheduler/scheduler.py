import os
from apscheduler.schedulers.background import BackgroundScheduler
from django.shortcuts import get_object_or_404
from django_apscheduler.jobstores import DjangoJobStore, register_events
from django.utils import timezone
from django_apscheduler.models import DjangoJobExecution
import sys
from datetime import datetime, timedelta
from requests import Response
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status
from backend.utils.report_templates.html_reports import create_timesheet_report
from staff.models import StaffAttendance, StaffWorkingHours
from staff.serializers import StaffAttendanceSerializer
from backend.utils.email_templates.email import auto_clocked_out_email, auto_clocked_out_staff_email
from backend.utils.helper import Status, TimeStatus, TimesheetCalculate, auto_clock_out_triggered, calculate_time_with_offset, convert_date, convert_datetime_time, convert_to_utc, datetime_to_time_str, end_of_week, format_time, get_day_of_week, get_end_of_month, get_start_of_month, get_timezone_offset_from_timestamp, get_working_schedule_end, is_bi_weekly_day, start_of_previous_week, start_of_week, time_to_timestamp
from user.models import BusinessOwner, User
from user.serializers import BusinessOwnerSerializer
from businessManagement.models import BusinessProfile, BusinessSchedule, Cookies, Payments, PayrollInformation, StaffActivity, SubmittedTimesheets, Subscriptions, Timesheet, TimesheetStatus
from businessManagement.serializers import BusinessProfileSerializer, StaffActivityLogSerializer, StaffActivitySerializer, SubmittedTimesheetsSerializer, SubscriptionSerializer, TimesheetSerializer
from backend.utils.chargebee_util import cancel_subscription
from django.db.models import Q, F
from django_apscheduler import util
from apscheduler.triggers.cron import CronTrigger
from decouple import config
import boto3

session = boto3.session.Session()
client = session.client('s3',
                        region_name='sfo3',
                        endpoint_url='https://sfo3.digitaloceanspaces.com',
                        aws_access_key_id=config('VH_SPACES_KEY'),
                        aws_secret_access_key=config('VH_SPACES_SECRET'))

@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
  """
  This job deletes APScheduler job execution entries older than `max_age` from the database.
  It helps to prevent the database from filling up with old historical records that are no
  longer useful.
  
  :param max_age: The maximum length of time to retain historical job execution records.
                  Defaults to 7 days.
  """
  DjangoJobExecution.objects.delete_old_job_executions(max_age)

def cron_test():
    with open(f'C:\\Users\\jamo\\Desktop\\test\\test.txt', "a") as file:
        # Append some text to the file
        file.write("Appending a new line.\n")

# check and cancel any expired subscriptions
def check_expired_subscriptions():
    today = datetime.now().date()

    # get the subscriptions expiring and cancel the subscription
    expired_subscriptions = Subscriptions.objects.filter(Q(status='active') | Q(status='non_renewing'), expires_at__lt=today)

    for subscription in expired_subscriptions:
        data = {
            'subscription_id': subscription.subscription_id,
            'cancellation_time': False,
        }
        chargebee_subscription = cancel_subscription(data)
        if chargebee_subscription.status == 'cancelled':
            # update subscription status = cancelled and archive = true
            updated_data = {
                'status': 'cancelled',
                'archived': True,
            }
            subscription_serializer = SubscriptionSerializer(subscription, data=updated_data, partial=True)
            if subscription_serializer.is_valid():
                subscription_serializer.save()
            else:
                return Response({
                    'status': 'Bad Request',
                    'message': 'Subscription could not be updated with received data.',
                    'errors': subscription_serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # update business active status = false
            business_profiles = BusinessProfile.objects.filter(business_owner=subscription.user_uid.uid)
            updated_business_data = {
                'active': False,
                'plan_id': None,
            }
            for business in business_profiles:
                business_profile_serializer = BusinessProfileSerializer(business, data=updated_business_data, partial=True)
                if business_profile_serializer.is_valid():
                    business_profile_serializer.save()
                else:
                    return Response({
                        'status': 'Bad Request',
                        'message': 'Business profile could not be updated with received data.',
                        'errors': business_profile_serializer.errors,
                    }, status=status.HTTP_400_BAD_REQUEST)
                
            # update payment status related to this subscription
            payment = Payments.objects.filter(subscription_id=subscription.id)
            updated_payment_data = {
                'archived': True
            }
            payment_serializer = BusinessProfileSerializer(payment[0], data=updated_payment_data, partial=True)
            if payment_serializer.is_valid():
                payment_serializer.save()
            else:
                return Response({
                    'status': 'Bad Request',
                    'message': 'Payment could not be updated with received data.',
                    'errors': payment_serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # update owner plan
            owner = BusinessOwner.objects.filter(uid=subscription.user_uid.uid)
            updated_owner_data = {
                'plan_id': None,
            }
            owner_serializer = BusinessOwnerSerializer(owner, data=updated_owner_data, partial=True)
            if owner_serializer.is_valid():
                owner_serializer.save()
            else:
                return Response({
                    'status': 'Bad Request',
                    'message': 'Business owner could not be updated with received data.',
                    'errors': owner_serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)

# update user profiles based on end dates and restrict access      
def check_expired_auth_accounts():
    current_date = datetime.now().date()

    # get all users
    all_users = User.objects.filter(archived=False)

    for user in all_users:
        if user.role != 'STAFF':
            continue

        # get working hours
        working_hours = StaffWorkingHours.objects.filter(staff_uid=user.uid).first()
        if working_hours is None:
            continue
        
        if working_hours.end_date is None:
            continue

        if working_hours.end_date < current_date and user.active:
            # end date has passed, set active to false
            working_hours.active = False
            working_hours.save()

            user.active = False
            user.save()

    return Response(status=status.HTTP_200_OK)

            

# start the scheduler
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")
    
    # check for expired subscriptions every 24 hours
    scheduler.add_job(
        check_expired_subscriptions, 
        'interval', 
        hours=24, 
        id='check_expired_subscriptions', 
        max_instances=1,
        replace_existing=True,
    )

    # check for expired auth accounts everyday
    scheduler.add_job(
        check_expired_auth_accounts, 
        'cron', 
        day_of_week='mon-sun',
        hour='1', 
        # 'interval',
        # minutes=2,
        id='check_expired_auth_accounts', 
        max_instances=1,
        replace_existing=True,
    )
 
    # clear and delete old job executions
    scheduler.add_job(
        delete_old_job_executions,
        trigger=CronTrigger(
            day_of_week="mon", hour="00", minute="00"
        ),  # Midnight on Monday, before start of the next work week.
        id="delete_old_job_executions",
        max_instances=1,
        replace_existing=True,
    )
    register_events(scheduler)
    scheduler.start()
    print("Scheduler started...", file=sys.stdout)