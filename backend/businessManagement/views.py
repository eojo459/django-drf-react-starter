from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from io import BytesIO
import json
from sys import stdout
import tempfile
from django.http import FileResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from pydantic import ValidationError
import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status
import chargebee
from backend.utils.chargebee_util import cancel_subscription, generate_checkout_new_url, generate_update_payment_method_checkout_new_url, generate_update_subscription_checkout_new_url, get_hosted_page, get_invoice_data, get_invoice_data_pdf, get_subscription
from staff.serializers import StaffAttendanceSerializer, StaffRelationshipSerializer
from staff.models import StaffAttendance, StaffRelationship, StaffWorkingHours
from child.models import ChildAttendance, ChildRelationship
from child.serializers import ChildIdSerializer, ChildRelationshipSerializer, ChildSerializer
from businessManagement.models import BusinessGroup, BusinessGroupRelationship, InviteCodes, BusinessProfile, BusinessSchedule, BusinessType, ChargebeeWebhooks, ContactMessage, Cookies, EmailTokenVerify, EmergencyContact, BusinessProfilePlan, SubscriptionPlan, EmploymentType, Holiday, HolidayRelationship, Location, MonthlyTotalStaffHours, MonthlyTotalUserHours, MonthlyTotalWages, NotificationMessage, OwnerWorkingHours, Payments, PayrollInformation, Position, QRCode, Report, StaffActivity, StaffActivityLog, SubmittedTimesheets, Subscriptions, Timesheet, TimesheetStatus, UnassignedUsers, UserActivity, Waitlist
from backend.utils.helper import BusinessProfilePlanType, CalculateMonthlyTotalHours, ChargebeeSubscriptionPlan, NotificationMessageType, TimesheetCalculate, Status, UTC_to_local_time, auto_clock_out_triggered, calculate_monthly_total_wages, calculate_time_duration, check_plan, convert_time, convert_unix_timestamp, convert_unix_timestamp_date, convert_utc_to_local_time, day_of_week_to_int, download_pdf, format_business_working_hours, format_owner_working_hours, format_timestamp_time, generate_invite_code, generate_null_uuid, generate_qr_code, get_day_of_week, get_working_schedule_end, month_int_to_str_short, start_of_week, TimeStatus
from backend.utils.backend_auth import SupabaseTokenAuthentication
from backend.utils.report_templates.html_reports import create_overall_report, create_timesheet_report
from .serializers import BusinessGroupRelationshipSerializer, BusinessGroupSerializer, BusinessInviteCodesSerializer, BusinessProfileGetSerializer, BusinessProfilePlanGetSerializer, BusinessProfileSerializer, BusinessScheduleSerializer, BusinessTypeGetSerializer, BusinessTypeSerializer, ChargebeeWebhooksSerializer, ContactMessageSerializer, CookiesSerializer, DayOfWeekSerializer, EmailTokenVerifySerializer, EmergencyContactSerializer, BusinessOwnerPlanSerializer, BusinessProfilePlanSerializer, EmploymentTypeSerializer, HolidayRelationshipSerializer, HolidaySerializer, LocationSerializer, MonthlyTotalStaffHoursSerializer, MonthlyTotalUserHoursSerializer, MonthlyTotalWagesSerializer, NotificationMessageSerializer, NotificationMessageTypeSerializer, OwnerWorkingHoursSerializer, PayrollInformationSerializer, PositionSerializer, QRCodeSerializer, ReportFrequencySerializer, ReportSerializer, StaffActivityLogSerializer, StaffActivitySerializer, SubmittedTimesheetsSerializer, TimesheetSerializer, TimesheetStatusSerializer, UnassignedUsersSerializer, UserActivityLogSerializer, UserActivitySerializer, UserStatusSerializer, WaitlistSerializer, SubscriptionSerializer, PaymentSerializer
from django.shortcuts import get_object_or_404
from tkinter import ALL
#import requests
from user.models import BusinessOwner, Parent, Staff, User, Child
from user.serializers import BusinessOwnerSerializer, BusinessOwnerSerializerCreate, StaffSerializer, UserSerializer
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticated
import os
import boto3
from supabase import create_client, Client
from backend.utils.config import qr_code_path
from decouple import config
from dateutil import tz
from django.db.models import Max, Q
from django.views.decorators.csrf import csrf_exempt
from backend.utils.email_templates.email import confirm_verify_email, new_owner_signup_email, new_pending_user_email, new_staff_signup_email, new_subscription_email, subscription_cancelled_email, subscription_renewal_email, timesheet_new_submission_email

url = config("SUPABASE_URL")
key = config("SUPABASE_KEY")
#url = 'https://cmkoomcgbmueihzpvtck.supabase.co'
#key = supabaseKey
supabase: Client = create_client(url, key)

session = boto3.session.Session()
client = session.client('s3',
                        region_name='sfo3',
                        endpoint_url='https://sfo3.digitaloceanspaces.com',
                        aws_access_key_id=config('VH_SPACES_KEY'),
                        aws_secret_access_key=config('VH_SPACES_SECRET'))

# populate the database with data
# GET => /api/businesses/seeding
@api_view(['GET'])
def BusinessSeeding(request):
    if request.method == 'GET':
        # populate the fields that should be created on database setup
        data = []
        serializer = Serializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Item could not be created with received data.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

# POST => api/businesses/validate-code/
# validate an invite code
@api_view(['POST'])
def ValidateInviteCode(request):
    if request.method == 'POST':
        # check if the invite code exists
        invite_codes = InviteCodes.objects.filter(invite_code=request.data['code']).first()
        if invite_codes is None:
            return Response(status=status.HTTP_404_NOT_FOUND) 
        else:
            return Response(status=status.HTTP_200_OK) 
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

#####################
## Report generation
#####################
    
# GET | POST => api/businesses/<business_id>/reports/
# get/create new reports
# Query: ?type={timesheet}&period_start=YYYY-MM-DD}&period_end={YYYY-MM-DD}&data={all/staffs/users}&overtime={T/F}&sick={T/F}&vacation={T/F}&holidays={T/F}&unpaid={T/F}&other_paid={T/F}
@api_view(['GET','POST'])
def TimesheetReport(request, business_id=None):
    if business_id is None:
        return Response(sstatus=status.HTTP_400_BAD_REQUEST) 
    
    # GET previously created reports
    if request.method == 'GET':
        # get all reports for a business
        reports = Report.objects.filter(business_id=business_id)

        # format reports
        report_list = []
        for report in reports:
            new_report = {
                'id': report.id,
                'start_date': report.start_date,
                'end_date': report.end_date,
                'regular_hours': report.regular_hours,
                'total_hours': report.total_hours,
                'date_modified': report.date_modified,
                'pdf_url': report.pdf_url,
                'type': "Timesheet",
            }
            report_list.append(new_report)
        return Response(report_list, status=status.HTTP_200_OK) 
    
    # POST new report
    if request.method == 'POST':
        # initialize query options
        data_option = ""
        overtime = False
        sick = False
        vacation = False
        holiday = False
        unpaid = False
        other_paid = False
        
        # get query parmeters from request
        query_params = request.query_params

        # figure out which type of report to create
        report_type = query_params.get('type')
        if report_type.lower() == "timesheet":
            # create timesheet report
            
            # check query options
            if 'overtime' in query_params:
                overtime = True
            
            if 'sick' in query_params:
                sick = True

            if 'vacation' in query_params:
                vacation = True

            if 'holiday' in query_params:
                holiday = True

            if 'unpaid' in query_params:
                unpaid = True

            if 'other_paid' in query_params:
                other_paid = True
                
            # get report period (start and end) dates
            report_start_date = query_params.get('period_start')
            report_end_date = query_params.get('period_end')

            # convert date strings to datetime objects
            report_start_datetime = datetime.strptime(report_start_date, "%Y-%m-%d")
            report_end_datetime = datetime.strptime(report_end_date, "%Y-%m-%d")
            day_count = abs(report_end_datetime - report_start_datetime)
            start_day = report_start_datetime.day
            current_day = start_day

            # initialize total counters
            total_regular_hours_count = 0
            total_hours_count = 0
            total_overtime_hours_count = 0
            total_vacation_hours_count = 0
            total_holiday_hours_count = 0
            total_unpaid_hours_count = 0
            total_other_paid_hours_count = 0
            total_regular_pay_amount = 0
            total_overtime_pay_amount = 0
            total_vacation_pay_amount = 0
            total_holiday_pay_amount = 0
            total_gross_pay_amount = 0
            total_net_pay_amount = 0
            total_fees = 0
            total_net_fees = 0
            attendance_record_ids = []

            # create header based on report period and query options
            # [ Name | Days X-Y | Total hours | (Optional: Overtime | Vacation | Holiday | Unpaid | Paid other) ]
            header = []
            header.append('Name')
            for i in range(day_count.days + 1): # inclusive
                # create header col for each day within the start and end date
                header.append(current_day)
                current_day += 1
            
            # total hours for the period duration
            header.append('Total hours') 

            # check if we need extra optional columns
            if overtime:
                header.append('Overtime')

            if sick:
                header.append('Sick')

            if vacation:
                header.append('Vacation')

            if holiday:
                header.append('Holiday')

            if unpaid:
                header.append('Unpaid')

            if other_paid:
                header.append('Other paid')

            # create data rows for report
            table_rows = []
            if query_params.get('data').lower() == "employee":
                # create report with list of staffs
                people_relationships = StaffRelationship.objects.filter(business_id=business_id)
                for relationship in people_relationships:
                    # get person data
                    person = get_object_or_404(Staff, uid=relationship.staff_uid.uid)

                    # new row per person
                    new_row = {
                        'name': "",
                        'days': {},
                        'total_hours': 0,
                    }
                    new_row['name'] = person.first_name + " " + person.last_name

                    # total hours for the row
                    row_total_regular_hours = 0

                    # get all attendance records for each staff within period date range
                    records = StaffAttendance.objects.filter(
                        uid=person.uid.uid,
                        business_id=business_id,
                        attendance_date__lte=report_end_date,
                        attendance_date__gte=report_start_date,
                    )
                    
                    # append days within the period and their total hours for the day
                    found = False
                    current_day = start_day
                    for i in range(day_count.days + 1): # inclusive
                        for record in records:
                            if record.attendance_date.day == current_day:
                                # get total regular hours for the day
                                new_row['days'][current_day] = record.regular_hours
                                row_total_regular_hours += record.regular_hours
                                total_regular_hours_count += record.regular_hours
                                found = True
                                attendance_record_ids.append(record.id)
                        
                        if not found:
                            new_row['days'][current_day] = "0"

                        found = False # reset found flag
                        current_day += 1
                            
                    # append total regular hours
                    new_row['total_hours'] = row_total_regular_hours

                    # TODO: append overtime, holiday, vacation, sick hours

                    # calculate total hours
                    total_hours_count += (Decimal(total_regular_hours_count) + Decimal(total_overtime_hours_count) + Decimal(total_vacation_hours_count) + Decimal(total_holiday_hours_count) + Decimal(total_other_paid_hours_count) + Decimal(total_unpaid_hours_count))

                    table_rows.append(new_row)

            elif query_params.get('data').lower() == "users":
                # TODO: create report with list of users
                #data_option = "users"
                #people = Child.objects.filter(business_id=business_id)
                pass

            elif query_params.get('data').lower() == "all":
                # TODO: format report for all users and staffs
                # data_option = "all"
                # staffs = Staff.objects.filter(business_id=business_id)
                # users = Child.objects.filter(business_id=business_id)

                # people_dict = {
                #     'staff': staffs,
                #     'users': users,
                # }
                pass
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
            # check if report already exists
            report = None
            reports = Report.objects.filter(
                business_id=business_id,
                start_date__gte=report_start_date,
                end_date__lte=report_end_date,
            )
            if len(reports) <= 0:
                # save new report data to database
                new_report_id = ""
                new_report = {
                    'business_id': business_id,
                    'start_date': report_start_date,
                    'end_date': report_end_date,
                    'regular_hours': total_regular_hours_count,
                    'total_hours': total_hours_count,
                    'overtime_hours': total_overtime_hours_count,
                    'vacation_hours': total_vacation_hours_count,
                    'holiday_hours': total_holiday_hours_count,
                    'total_gross_pay': total_gross_pay_amount,
                    'total_net_pay': total_net_pay_amount,
                    'total_fees': total_fees,
                    'total_net_fees': total_net_fees,
                    'attendance_record_ids': attendance_record_ids,
                }
                report_serializer = ReportSerializer(data=new_report)
                if report_serializer.is_valid():
                    report_serializer.save()
                    new_report_id = report_serializer.data['id']
                    report = get_object_or_404(Report, id=new_report_id)
                else:
                    return Response({
                        'status': 'Bad Request',
                        'message': 'Report could not be created with received data.',
                        'errors': report_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # get existing report to overwrite
                report = reports[0]
                
            # get business info
            business = get_object_or_404(BusinessProfile, id=business_id)

            # setup report info
            report_info = {
                'report_start_date': report_start_date,
                'report_end_date': report_end_date,
                'day_count': day_count.days,
                'start_day': start_day,
                'report_id': report.id,
            }

            # s3 bucket storage settings
            bucket_name = 'vh-storage'
            file_name = f"{report_type}_Report_{report_start_date}_to_{report_end_date}.pdf"
            file_location = f"{config('ENV')}/reports/timesheets/{business_id}/{file_name}"

            # Generate the pdf report
            create_overall_report(file_name, business, report_info, header, table_rows)
            print("Report was created")

            # upload pdf file to digital ocean bucket spaces - https://cloud.digitalocean.com/spaces/vh-storage
            # return url link to pdf file (if we have a list, return a list of urls)
            # load the urls on the frontend for the pdfs

            try:
                # check if file already exists 
                response = client.get_object(
                    Bucket=bucket_name,
                    Key=file_location,
                    ResponseContentType='application/pdf',
                )

                # delete existing file
                response = client.delete_object(
                    Bucket=bucket_name,
                    Key=file_location,
                )

                # upload new file
                response = client.upload_file(
                    file_name, 
                    bucket_name, 
                    file_location, 
                    ExtraArgs={'ACL': 'public-read', 
                            "ContentType": 'application/pdf', 
                            'ContentDisposition': f'inline; filename={file_name}'}
                )
            except:
                # object not found, upload it as inline pdf
                print("File not found in bucket") 
                response = client.upload_file(
                    file_name, 
                    bucket_name, 
                    file_location, 
                    ExtraArgs={'ACL': 'public-read', 
                            "ContentType": 'application/pdf', 
                            'ContentDisposition': f'inline; filename={file_name}'}
                )

            #print(response)

            # get location of new file we created
            base_url = config('VH_STORAGE_URL')
            existing_pdf = base_url + f"/{config('ENV')}/reports/timesheets/{business_id}/{file_name}"

            # delete file from server 
            os.remove(file_name)

            # update pdf url for report
            updated_report = vars(report) # convert to dictionary
            updated_report['pdf_url'] = existing_pdf
            report_serializer = ReportSerializer(report, data=updated_report, partial=True)
            if report_serializer.is_valid():
                report_serializer.save()
            else:
                return Response({
                    'status': 'Bad Request',
                    'message': 'Report could not be updated with received data.',
                    'errors': report_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(status=status.HTTP_201_CREATED)
        else:
            # TODO: allow other type of reports to be created
            return Response({'message': 'Report type is not supported.'},status=status.HTTP_400_BAD_REQUEST) 
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED) 
    

#######################
# NOTIFICATION MESSAGE
#######################
    
# GET => /api/businesses/notifications/staffs/<staff_uid>
# GET => /api/businesses/notifications/users/<user_uid>
# get notification messages for a person
@api_view(['GET'])
def NotificationMessagesInfo(request, staff_uid=None, user_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if staff_uid is not None:
        # get all notification messages for staff
        notifications = NotificationMessage.objects.filter(to_uid=staff_uid)
    elif user_uid is not None:
        # get all notification messages for user
        notifications = NotificationMessage.objects.filter(to_uid=user_uid)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    notification_list = []
    for message in notifications:
        # get staff from from_uid
        staff = get_object_or_404(User, uid=message.from_uid.uid)
        data = {
            'id': message.id,
            'to_uid': message.to_uid.uid,
            'from_uid': message.from_uid.uid,
            'message': message.message,
            'message_type': message.message_type.id,
            'first_name': staff.first_name,
            'last_name': staff.last_name,
        }
        notification_list.append(data)
    
    #serializer = NotificationMessageSerializer(notification_list, many=True)
    return Response(notification_list, status=status.HTTP_200_OK)
        
    # elif request.method == 'POST':
    #     # post new notification
    #     serializer = NotificationMessageSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(status=status.HTTP_201_CREATED)
    #     else:
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 


###########################
## CHARGEBEE API
###########################
# POST => /api/businesses/subscriptions/checkout/create/
@api_view(['POST'])
def GenerateNewChargebeeCheckoutUrl(request):
  if request.method != 'POST':
      return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
  
  # create new hosted checkout url
  hosted_page = generate_checkout_new_url(request.data)
  formatted_data = {
      'id': hosted_page['id'],
      'url': hosted_page['url'],
  }
  return Response(formatted_data, status=status.HTTP_200_OK)

# POST => /api/businesses/subscriptions/checkout/get/<hosted_page_id>
# we are also sending data to this endpoint hence why we are doing a POST not GET
@api_view(['POST'])
def GetChargebeeCheckoutUrl(request, hosted_page_id=None):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
  
    if hosted_page_id is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
  
    user_uid = request.data['user_uid']
  
    # get the chargebee hosted page checkout info
    hosted_page = get_hosted_page(hosted_page_id)

    # check invoice status 
    invoice = hosted_page.content.invoice
    if invoice.status != 'paid':
        return Response({'status':'Invoice is not paid'})

    # check subscription status 
    subscription = hosted_page.content.subscription
    if subscription.status != 'active':
        return Response({'status':'Subscription status is not active'})
    
    # get subscription info
    subscription_plan = subscription.subscription_items[0].item_price_id
    subscription_plan = subscription_plan.split('-')[0]
    subscription_plan = subscription_plan.split('_')[1]
    
    formatted_expiry_date = convert_unix_timestamp(subscription.current_term_end)

    # save customer & subscription info from chargebee
    new_subscription = {
        'item_price_id': subscription_plan,
        'user_uid': user_uid,
        'customer_id': hosted_page.content.customer.id,
        'subscription_id': subscription.id,
        'invoice_id': invoice.id,
        'quantity': subscription.subscription_items[0].quantity,
        'unit_price': subscription.subscription_items[0].unit_price_in_decimal,
        'item_type': 'Subscription',
        'activated_at': convert_unix_timestamp(subscription.activated_at),
        'billing_period': subscription.billing_period,
        'billing_period_unit': subscription.billing_period_unit,
        'expires_at': formatted_expiry_date,
        'currency_code': subscription.currency_code,
        'current_term_start': convert_unix_timestamp(subscription.current_term_start),
        'current_term_end': convert_unix_timestamp(subscription.current_term_end),
        'next_billing_at': convert_unix_timestamp(subscription.next_billing_at),
        'remaining_billing_cycles': subscription.remaining_billing_cycles,
        'status': subscription.status,
        'total_dues': subscription.total_dues,
    }
    
    new_subscription_id = ""
    subscription_serializer = SubscriptionSerializer(data=new_subscription)
    if subscription_serializer.is_valid():
        subscription_serializer.save()
        new_subscription_id = subscription_serializer.data['id']
    else:
        return Response({
            'status': 'Bad Request',
            'message': 'Subscription could not be created with received data.',
            'errors': subscription_serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # save payment info
    payment_method = hosted_page.content.customer.values['payment_method']
    if payment_method['type'] == "card":
        # get card information
        card = hosted_page.content.card
        new_payment = {
            'subscription_id': new_subscription_id,
            'txn_id': invoice.linked_payments[0].txn_id,
            'payment_type': 'card',
            'gateway': card.gateway,
            'issuing_country': card.issuing_country,
            'card_last4': card.last4,
            'card_brand': card.card_type.upper(), # visa, mastercard etc
            'card_funding_type': card.funding_type,
            'card_expiry_month': card.expiry_month,
            'card_expiry_year': card.expiry_year,
            'txn_date': convert_unix_timestamp_date(invoice.linked_payments[0].txn_date),
            'txn_amount': "{:.2f}".format(invoice.amount_paid / 100),
        }
    elif payment_method['type'] == "paypal_express_checkout":
        # get paypal information
        paypal = hosted_page.content.paypal
        new_payment = {
            'subscription_id': new_subscription_id,
            'txn_id': invoice.linked_payments[0].txn_id,
            'payment_type': 'paypal',
            'paypal_email': paypal.email,
            'txn_date': convert_unix_timestamp_date(invoice.linked_payments[0].txn_date),
            'txn_amount': "{:.2f}".format(invoice.amount_paid / 100),
        }
    else:
        return Response({'message': 'Unknown payment type'}, status=status.HTTP_400_BAD_REQUEST)

    payment_serializer = PaymentSerializer(data=new_payment)
    if payment_serializer.is_valid():
        payment_serializer.save()
    else:
        return Response({
            'status': 'Bad Request',
            'message': 'Payment could not be created with received data.',
            'errors': payment_serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # get business owner profile
    business_owner_profile = get_object_or_404(BusinessOwner, uid=user_uid)
    
    if subscription_plan == ChargebeeSubscriptionPlan.BASIC.value:
        # upgrade user to basic features 
        owner_basic_plan = get_object_or_404(SubscriptionPlan, name="Basic")
        data = {
            'plan_id': owner_basic_plan.id,
        }
    elif subscription_plan == ChargebeeSubscriptionPlan.PRO.value:
        # upgrade user to pro features
        owner_pro_plan = get_object_or_404(SubscriptionPlan, name="Pro")
        data = {
            'plan_id': owner_pro_plan.id,
        }
    elif subscription_plan == ChargebeeSubscriptionPlan.ENTERPRISE.value:
        # upgrade user to enterprise features
        owner_enterprise_plan = get_object_or_404(SubscriptionPlan, name="Enterprise")
        data = {
            'plan_id': owner_enterprise_plan.id,
            'active': True,
        }
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # upgrade business owner profile
    business_owner_serializer = BusinessOwnerSerializer(business_owner_profile, data=data, partial=True)
    if business_owner_serializer.is_valid():
        business_owner_serializer.save()
    else:
        return Response({
            'status': 'Bad Request',
            'message': 'Business owner could not be updated with received data.',
            'errors': business_owner_serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)
        
    # get the subscription with the most recent updated_at field
    latest_subscription = Subscriptions.objects.filter(user_uid=user_uid).aggregate(latest_updated_at=Max('updated_at'))
    latest_updated_at = latest_subscription['latest_updated_at']
    subscription = Subscriptions.objects.filter(user_uid=user_uid, updated_at=latest_updated_at).first()
    if subscription is None:
        return Response({'message':'There is no subscription to retrieve'}, status=status.HTTP_404_NOT_FOUND)
    
    # get any other subscriptions that are active if any
    old_subscriptions = Subscriptions.objects.filter(Q(status='active') | Q(status='non_renewing'), user_uid=user_uid, archived=False).exclude(updated_at=latest_updated_at)
    for subscription in old_subscriptions:
        # subscription id and immediate cancellation
        data = {
            'subscription_id': subscription.subscription_id,
            'cancellation_time': False, # immediate cancellation
        }
        
        # cancel the subscription
        subscription_status = cancel_subscription(data)
        if subscription_status == 'cancelled' or subscription_status == 'non_renewing':
            # update subscription status = cancelled and archive = true
            updated_data = {
                'status': subscription_status,
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
                
            #return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
    # get user information
    person_info = get_object_or_404(User, uid=user_uid)
    formatted_person_info = {
        'first_name': person_info.first_name,
        'email': person_info.email,
        #'email': 'jamopakg3@gmail.com',
    }

    billing_period_type = 'Monthly'
    if subscription.billing_period_unit == 'year':
        billing_period_type = 'Yearly'

    formatted_subscription_info = {
        'plan': subscription_plan,
        'start_date': subscription.current_term_start,
        'renewal_date': convert_unix_timestamp_date(subscription.next_billing_at),
        'subscription_type': billing_period_type,
    }

    # get invoice data as pdf
    new_invoice = get_invoice_data_pdf(invoice['id'])
    pdf_content = download_pdf(new_invoice.download_url)
        
    # send subscription created email notification to user
    # new_subscription_email('jamopakg3@gmail.com', formatted_person_info, formatted_subscription_info, pdf_content)
    new_subscription_email(formatted_person_info['email'], formatted_person_info, formatted_subscription_info, pdf_content)


    return Response(status=status.HTTP_200_OK)

# GET => /api/businesses/subscriptions/owners/owner/<owner_uid>
@api_view(['GET'])
def GetOwnersSubscription(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
  
    if owner_uid is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get the subscription with the most recent updated_at field
    latest_subscription = Subscriptions.objects.filter(user_uid=owner_uid).aggregate(latest_activated_at=Max('activated_at'))
    latest_activated_at = latest_subscription['latest_activated_at']
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, activated_at=latest_activated_at).first()
    if subscription is None:
        return Response({'message':'There is no subscription to retrieve'}, status=status.HTTP_404_NOT_FOUND)
    
    formatted_data = {
        'item_price_id': subscription.item_price_id,
        'activated_at': subscription.activated_at,
        'expires_at': subscription.expires_at,
        'currency_code': subscription.currency_code,
        'current_term_start': subscription.current_term_start,
        'current_term_end': subscription.current_term_end,
        'next_billing_at': subscription.next_billing_at,
        'status': subscription.status,
    }

    return Response(formatted_data, status=status.HTTP_200_OK)

# GET => /api/businesses/subscriptions/payments/owners/owner/<owner_uid>
@api_view(['GET'])
def GetOwnersPayment(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
  
    if owner_uid is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get the subscription with the most recent updated_at field
    latest_subscription = Subscriptions.objects.filter(user_uid=owner_uid).aggregate(latest_activated_at=Max('activated_at'))
    latest_activated_at = latest_subscription['latest_activated_at']
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, activated_at=latest_activated_at).first()
    if subscription is None:
        return Response({'message':'There is no subscription to retrieve'}, status=status.HTTP_404_NOT_FOUND)
    
    # get the most recent payments if any
    latest_payment = Payments.objects.filter(subscription_id=subscription.id).aggregate(latest_txn_timestamp=Max('txn_timestamp'))
    latest_txn_timestamp = latest_payment['latest_txn_timestamp']
    payment = Payments.objects.filter(subscription_id=subscription.id, txn_timestamp=latest_txn_timestamp).first()
    if payment is None:
        return Response({'message':'There is no payment to retrieve'}, status=status.HTTP_404_NOT_FOUND)
    
    formatted_data = {
        'payment_type': payment.payment_type,
        'card_last4': payment.card_last4,
        'card_brand': payment.card_brand,
        'card_funding_type': payment.card_funding_type,
        'card_expiry_month': payment.card_expiry_month,
        'card_expiry_year': payment.card_expiry_year,
        'paypal_email': payment.paypal_email,
        'txn_date': payment.txn_date,
        'txn_amount': payment.txn_amount,
    }

    return Response(formatted_data, status=status.HTTP_200_OK)


# POST => /api/businesses/subscriptions/cancel/owners/owner/<owner_uid>
@api_view(['POST'])
def CancelChargebeeSubscription(request, owner_uid=None):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
  
    if owner_uid is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get the subscription with the most recent updated_at field
    latest_subscription = Subscriptions.objects.filter(user_uid=owner_uid, archived=False, status="active").aggregate(latest_updated_at=Max('updated_at'))
    latest_updated_at = latest_subscription['latest_updated_at']
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, updated_at=latest_updated_at, archived=False, status="active").first()
    if subscription is None:
        return Response({'message':'There is no subscription to cancel'}, status=status.HTTP_404_NOT_FOUND)
    
    # subscription id and time to cancel (immediate or at term end)
    data = {
        'subscription_id': subscription.subscription_id,
        'cancellation_time': request.data['end_of_term'],
    }
    
    # cancel the subscription
    cancel_subscription = CancelSubscriptionHelper(subscription, data, owner_uid)
    if cancel_subscription:
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
# cancel the subscription
def CancelSubscriptionHelper(subscription, data, owner_uid):
    cancelled_subscription = cancel_subscription(data)
    if cancelled_subscription.status == 'cancelled' or cancelled_subscription.status == 'non_renewing':
        # update subscription status = cancelled and archive = true
        updated_data = {
            'status': cancelled_subscription.status,
            'archived': cancelled_subscription.status == 'cancelled',
            'cancelled_at': convert_unix_timestamp(cancelled_subscription.cancelled_at),
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
            
        # update payment status related to this subscription
        payment = Payments.objects.filter(subscription_id=subscription.id).first()
        updated_payment_data = {
            'archived': True
        }
        payment_serializer = PaymentSerializer(payment, data=updated_payment_data, partial=True)
        if payment_serializer.is_valid():
            payment_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Payment could not be updated with received data.',
                'errors': payment_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        # update owner plan
        owner = BusinessOwner.objects.filter(uid=owner_uid).first()
        updated_owner_data = {
            'plan_id': None if cancelled_subscription.status == 'cancelled' else owner.plan_id,
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
            
        return True
    
# GET => /api/businesses/subscriptions/checkout/update/owners/owner/<owner_uid>
@api_view(['GET'])
def GenerateChargebeeUpdateSubscriptionCheckoutUrl(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if owner_uid == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get the subscription with the most recent updated_at field
    latest_subscription = Subscriptions.objects.filter(user_uid=owner_uid).aggregate(latest_updated_at=Max('updated_at'))
    latest_updated_at = latest_subscription['latest_updated_at']
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, updated_at=latest_updated_at).first()
    if subscription is None:
        return Response({'message':'There is no subscription to cancel'}, status=status.HTTP_404_NOT_FOUND)
    
    # generate hosted page to update subscription
    hosted_page = generate_update_subscription_checkout_new_url(subscription.subscription_id)
    formatted_data = {
        'id': hosted_page['id'],
        'url': hosted_page['url'],
    }
    return Response(formatted_data, status=status.HTTP_200_OK)

# GET => /api/businesses/subscriptions/payments/checkout/update/owners/owner/<owner_uid>
@api_view(['GET'])
def GenerateChargebeeUpdatePaymentMethodCheckoutUrl(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if owner_uid == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get subscription information
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, status='active', archived=False)
    if len(subscription) <= 0:
        return Response({'message':'Subscription does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    # generate hosted page to update payment method
    hosted_page = generate_update_payment_method_checkout_new_url(subscription[0].customer_id)
    formatted_data = {
        'id': hosted_page['id'],
        'url': hosted_page['url'],
    }
    return Response(formatted_data, status=status.HTTP_200_OK)


# GET => /api/businesses/subscriptions/invoices/owners/owner/<owner_id>
@api_view(['GET'])
def GetChargebeeInvoiceData(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if owner_uid == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get subscription information
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, status='active', archived=False)
    if len(subscription) <= 0:
        return Response({'message':'Subscription does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    # get invoice data
    invoice = get_invoice_data(subscription[0].invoice_id)
    formatted_data = {
        'amount_due': invoice.amount_due,
        'amount_paid': invoice.amount_paid,
        'currency_code': invoice.currency_code,
        'date': invoice.date,
        'due_date': invoice.due_date,
        'status': invoice.status,
        'paid_at': invoice.paid_at,
        'updated_at': invoice.updated_at,
    }
    return Response(formatted_data, status=status.HTTP_200_OK)

# GET => /api/businesses/subscriptions/invoices/pdf/owners/owner/<owner_id>
# get invoice to download as PDF
@api_view(['GET'])
def GetChargebeeInvoicePDF(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if owner_uid == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get subscription information
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, status='active', archived=False)
    if len(subscription) <= 0:
        return Response({'message':'Subscription does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    # get invoice data as pdf
    invoice = get_invoice_data_pdf(subscription[0].invoice_id)
    formatted_data = {
        'download_url': invoice.download_url,
        'valid_till': invoice.valid_till, # url expires in 60 mins
    }
    return Response(formatted_data, status=status.HTTP_200_OK)

# GET => /api/businesses/subscriptions/owners/owner/<owners_uid>
@api_view(['GET'])
def GetChargebeeSubscription(request, owner_uid=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if owner_uid == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get subscription information
    subscription = Subscriptions.objects.filter(user_uid=owner_uid, status='active', archived=False)
    if len(subscription) <= 0:
        return Response({'message':'Subscription does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    # get subscription data from chargebee
    chargebee_subscription = get_subscription(subscription[0].subscription_id)
    formatted_data = {
        'item_price_id': chargebee_subscription.subscription_items[0].item_price_id,
        'activated_at': chargebee_subscription.activated_at,
        'expires_at': chargebee_subscription.expires_at,
        'currency_code': chargebee_subscription.currency_code,
        'current_term_start': chargebee_subscription.current_term_start,
        'current_term_end': chargebee_subscription.current_term_end,
        'next_billing_at': chargebee_subscription.next_billing_at,
        'status': chargebee_subscription.status,
    }
    return Response(formatted_data, status=status.HTTP_200_OK)

# GET => /api/businesses/chargebee-webhook/
@api_view(['POST'])
@csrf_exempt
def ChargebeeWebhookListen(request):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    # remote_ip = request.META.get('REMOTE_ADDR', None)
    # if remote_ip not in config('ALLOWED_IPS'):
    #     return Response(status=status.HTTP_401_UNAUTHORIZED)

    # check if we have already fufilled this webhook request 
    # they get resent multiple times, so just return OK if it already exists
    existing_event = ChargebeeWebhooks.objects.filter(event_id=request.data['id']).first()
    if existing_event is not None:
        return Response(status=status.HTTP_200_OK)

    # format occured_at date
    dt_object = convert_unix_timestamp(request.data['occurred_at'])

    # get content from webhook request
    content = request.data['content']

    # get invoice
    if 'invoice' in content:
        invoice = content['invoice']

    # get subscription
    if 'subscription' in content:
        chargebee_subscription = content['subscription']
        
        # get existing subscription if we are not creating a new subscription
        if request.data['event_type'] != 'subscription_created':
            subscription = Subscriptions.objects.filter(subscription_id=chargebee_subscription['id']).first()
            # if len(subscription) <= 0:
            #     return Response({'message':'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
            
    # get customer 
    if 'customer' in content:
        customer = content['customer']

    # get card
    if 'card' in content:
        card = content['card']

    # handle subscription creation
    if request.data['event_type'] == 'subscription_created':
        
        # get subscription info
        subscription_plan = chargebee_subscription['subscription_items'][0]['item_price_id']
        subscription_plan = subscription_plan.split('-')[0]
        subscription_plan = subscription_plan.split('_')[1]
        
        formatted_expiry_date = convert_unix_timestamp(chargebee_subscription['current_term_end'])

        # find user_uid using email
        person_info = get_object_or_404(User, email=customer['email'])

        # save customer & subscription info from chargebee
        new_subscription = {
            'item_price_id': subscription_plan,
            'user_uid': person_info.uid,
            'customer_id': customer['id'],
            'subscription_id': chargebee_subscription['id'],
            'invoice_id': invoice['id'],
            'quantity': chargebee_subscription['subscription_items'][0]['quantity'],
            'unit_price': chargebee_subscription['subscription_items'][0]['unit_price'],
            'item_type': 'Subscription',
            'activated_at': convert_unix_timestamp(chargebee_subscription['activated_at']),
            'billing_period': chargebee_subscription['billing_period'],
            'billing_period_unit': chargebee_subscription['billing_period_unit'],
            'expires_at': formatted_expiry_date,
            'currency_code': chargebee_subscription['currency_code'],
            'current_term_start': convert_unix_timestamp(chargebee_subscription['current_term_start']),
            'current_term_end': convert_unix_timestamp(chargebee_subscription['current_term_end']),
            'next_billing_at': convert_unix_timestamp(chargebee_subscription['next_billing_at']),
            'remaining_billing_cycles': None,
            'status': chargebee_subscription['status'],
            'total_dues': chargebee_subscription['subscription_items'][0]['amount'],
        }

        existing_subscription = Subscriptions.objects.filter(invoice_id=invoice['id']).first()
        if existing_subscription is None:   
            subscription_serializer = SubscriptionSerializer(data=new_subscription)
        else:
            # update existing subscription
            subscription_serializer = SubscriptionSerializer(existing_subscription, data=new_subscription)

        new_subscription_id = ""
        if subscription_serializer.is_valid():
            subscription_serializer.save()
            new_subscription_id = subscription_serializer.data['id']
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Subscription could not be created with received data.',
                'errors': subscription_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # save payment info
        payment_method = customer['payment_method']
        if payment_method['type'] == "card":
            # get card information
            new_payment = {
                'subscription_id': new_subscription_id,
                'customer_id': customer['id'],
                'txn_id': invoice['linked_payments'][0]['txn_id'],
                'payment_type': 'card',
                'gateway': card['gateway'],
                'issuing_country': card['issuing_country'],
                'card_last4': card['last4'],
                'card_brand': card['card_type'].upper(), # visa, mastercard etc
                'card_funding_type': card['funding_type'],
                'card_expiry_month': card['expiry_month'],
                'card_expiry_year': card['expiry_year'],
                'txn_date': convert_unix_timestamp_date(invoice['linked_payments'][0]['txn_date']),
                'txn_amount': "{:.2f}".format(invoice['amount_paid'] / 100),
            }
        elif payment_method['type'] == "paypal_express_checkout":
            if 'paypal' not in content:
                return Response({'message': 'Unknown payment type'}, status=status.HTTP_400_BAD_REQUEST)
            
            # get paypal information
            new_payment = {
                'subscription_id': new_subscription_id,
                'customer_id': customer['id'],
                'txn_id': invoice['linked_payments'][0]['txn_id'],
                'payment_type': 'paypal',
                'paypal_email': paypal['email'],
                'txn_date': convert_unix_timestamp_date(invoice['linked_payments'][0]['txn_date']),
                'txn_amount': "{:.2f}".format(invoice['amount_paid'] / 100),
            }
        else:
            return Response({'message': 'Unknown payment type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # check if a payment object already exists
        existing_payment = Payments.objects.filter(customer_id=customer['id']).first()
        if existing_payment is None:
            # create new payment
            payment_serializer = PaymentSerializer(data=new_payment, partial=True)
        else:
            # update existing payment
            payment_serializer = PaymentSerializer(existing_payment, data=new_payment, partial=True)

        if payment_serializer.is_valid():
            payment_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Payment could not be created with received data.',
                'errors': payment_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # get business owner profile
        business_owner_profile = get_object_or_404(BusinessOwner, uid=person_info.uid)
        
        if subscription_plan == ChargebeeSubscriptionPlan.BASIC.value:
            # upgrade user to basic features 
            owner_basic_plan = get_object_or_404(SubscriptionPlan, name="Basic")
            data = {
                'plan_id': owner_basic_plan.id,
            }
        elif subscription_plan == ChargebeeSubscriptionPlan.PRO.value:
            # upgrade user to pro features
            owner_pro_plan = get_object_or_404(SubscriptionPlan, name="Pro")
            data = {
                'plan_id': owner_pro_plan.id,
            }  
        elif subscription_plan == ChargebeeSubscriptionPlan.ENTERPRISE.value:
            # upgrade user to enterprise features
            owner_enterprise_plan = get_object_or_404(SubscriptionPlan, name="Enterprise")
            data = {
                'plan_id': owner_enterprise_plan.id,
                'active': True,
            }
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        # upgrade business owner profile
        business_owner_serializer = BusinessOwnerSerializer(business_owner_profile, data=data, partial=True)
        if business_owner_serializer.is_valid():
            business_owner_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Business owner could not be updated with received data.',
                'errors': business_owner_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # get the subscription with the most recent updated_at field
        latest_subscription = Subscriptions.objects.filter(user_uid=person_info.uid).aggregate(latest_updated_at=Max('updated_at'))
        latest_updated_at = latest_subscription['latest_updated_at']
        subscription = Subscriptions.objects.filter(user_uid=person_info.uid, updated_at=latest_updated_at).first()
        if subscription is None:
            return Response({'message':'There is no subscription to retrieve'}, status=status.HTTP_404_NOT_FOUND)
        
        # get any other subscriptions that are active if any
        old_subscriptions = Subscriptions.objects.filter(Q(status='active') | Q(status='non_renewing'), user_uid=person_info.uid, archived=False).exclude(updated_at=latest_updated_at)
        for old_subscription in old_subscriptions:
            # subscription id and immediate cancellation
            data = {
                'subscription_id': old_subscription.subscription_id,
                'cancellation_time': False, # immediate cancellation
            }
            
            try: 
                # cancel the subscription
                chargebee_subscription = cancel_subscription(data)
                subscription_status = chargebee_subscription.status
            except:
                subscription_status = 'cancelled' # already cancelled

            if subscription_status == 'cancelled' or subscription_status == 'non_renewing':
                # update subscription status = cancelled and archive = true
                updated_data = {
                    'status': subscription_status,
                    'archived': True,
                }
                subscription_serializer = SubscriptionSerializer(old_subscription, data=updated_data, partial=True)
                if subscription_serializer.is_valid():
                    subscription_serializer.save()
                else:
                    return Response({
                        'status': 'Bad Request',
                        'message': 'Subscription could not be updated with received data.',
                        'errors': subscription_serializer.errors,
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                    
                # update payment status related to this subscription
                payment = Payments.objects.filter(subscription_id=old_subscription.id).first()
                updated_payment_data = {
                    'archived': True
                }
                payment_serializer = PaymentSerializer(payment, data=updated_payment_data, partial=True)
                if payment_serializer.is_valid():
                    payment_serializer.save()
                else:
                    return Response({
                        'status': 'Bad Request',
                        'message': 'Payment could not be updated with received data.',
                        'errors': payment_serializer.errors,
                    }, status=status.HTTP_400_BAD_REQUEST)

        # get user information
        formatted_person_info = {
            'first_name': person_info.first_name,
            'email': person_info.email,
            #'email': 'jamopakg3@gmail.com',
        }

        billing_period_type = 'Monthly'
        if subscription.billing_period_unit == 'year':
            billing_period_type = 'Yearly'

        formatted_subscription_info = {
            'plan': subscription_plan,
            'start_date': subscription.current_term_start,
            'renewal_date': subscription.next_billing_at,
            'subscription_type': billing_period_type,
        }

        # get invoice data as pdf
        new_invoice = get_invoice_data_pdf(invoice['id'])
        pdf_content = download_pdf(new_invoice.download_url)
            
        # send subscription created email notification to user
        #new_subscription_email('jamopakg3@gmail.com', formatted_person_info, formatted_subscription_info, pdf_content)
        new_subscription_email(formatted_person_info['email'], formatted_person_info, formatted_subscription_info, pdf_content)
        
    # handle subscription cancellation
    elif request.data['event_type'] == 'subscription_cancelled' or request.data['event_type'] == 'subscription_cancellation_scheduled':
        cancellation_time = True # default to cancel at end of term

        # handle subscription cancelled immediately
        if request.data['event_type'] == 'subscription_cancelled':
            cancellation_time = False

        # subscription id and time to cancel (immediate or at term end)
        data = {
            'subscription_id': subscription.subscription_id,
            'cancellation_time': cancellation_time,
        }

        # get user information
        person_info = get_object_or_404(User, uid=subscription.user_uid.uid)
        formatted_person_info = {
            'first_name': person_info.first_name,
            'email': person_info.email,
            #'email': 'jamopakg3@gmail.com',
        }

        # get subscription info
        subscription_plan = chargebee_subscription['subscription_items'][0]['item_price_id']
        subscription_plan = subscription_plan.split('-')[0]
        subscription_plan = subscription_plan.split('_')[1]

        billing_period_type = 'Monthly'
        if chargebee_subscription['billing_period_unit'] == 'year':
            billing_period_type = 'Yearly'

        formatted_subscription_info = {
            'plan': subscription_plan,
            'cancel_date': subscription.cancelled_at,
            'term_end_date': convert_unix_timestamp_date(chargebee_subscription['current_term_end']),
        }

        if request.data['event_type'] == 'subscription_cancelled':
            # send email to notify user that the subscription was cancelled
            subscription_cancelled_email(formatted_person_info['email'], formatted_person_info, formatted_subscription_info)
        
    # handle subscription renewals
    elif request.data['event_type'] == 'subscription_renewed':
        # update subscription
        subscription = Subscriptions.objects.filter(subscription_id=chargebee_subscription['id']).first()
        if subscription is None:
            return Response({'message':'There is no subscription to update'}, status=status.HTTP_404_NOT_FOUND)

        updated_subscription = {
            'billing_period': chargebee_subscription['billing_period'],
            'next_billing_at': convert_unix_timestamp(chargebee_subscription['next_billing_at']),
            'expires_at': convert_unix_timestamp(chargebee_subscription['current_term_end']),
            'invoice_id': invoice['id'],
        } 
        subscription_serializer = SubscriptionSerializer(subscription, data=updated_subscription, partial=True)
        if subscription_serializer.is_valid():
            subscription_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Subscription could not be created with received data.',
                'errors': subscription_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # get old payment and archive
        old_payments = Payments.objects.filter(subscription_id=subscription.id, archived=False)
        if len(old_payments) > 0:
            for payment in old_payments:
                updated_payment = {
                    'archived': True,
                }
                payment_serializer = PaymentSerializer(payment, data=updated_payment, partial=True)
                if payment_serializer.is_valid():
                    payment_serializer.save()
                else:
                    return Response({
                        'status': 'Bad Request',
                        'message': 'Payment could not be created with received data.',
                        'errors': payment_serializer.errors,
                    }, status=status.HTTP_400_BAD_REQUEST)

        # create new payment
        if "card" in content:
            # get card information and link to subscription
            card = content['card']
            new_payment = {
                'subscription_id': subscription.id,
                'customer_id': customer['id'],
                'txn_id': invoice['linked_payments'][0]['txn_id'],
                #'txn_id': 'dsjkfh47825782389',
                'payment_type': 'card',
                'gateway': card['gateway'],
                'issuing_country': card['issuing_country'],
                #'issuing_country': '123',
                'card_last4': card['last4'],
                'card_brand': card['card_type'].upper(), # visa, mastercard etc
                'card_funding_type': card['funding_type'],
                'card_expiry_month': card['expiry_month'],
                'card_expiry_year': card['expiry_year'],
                'txn_date': convert_unix_timestamp_date(invoice['linked_payments'][0]['txn_date']),
                #'txn_date': convert_unix_timestamp_date(1715888051),
                'txn_amount': "{:.2f}".format(invoice['amount_paid'] / 100),
            }
        elif "paypal_express_checkout" in content:
            # get paypal information and link to subsscription
            paypal = content['paypal']
            new_payment = {
                'subscription_id': subscription.id,
                'customer_id': customer['id'],
                'txn_id': invoice['linked_payments'][0]['txn_id'],
                #'txn_id': 'dsjkfh47825782389',
                'payment_type': 'paypal',
                'paypal_email': paypal['email'],
                'txn_date': convert_unix_timestamp_date(invoice['linked_payments'][0]['txn_date']),
                #'txn_date': convert_unix_timestamp_date(1715888051),
                'txn_amount': "{:.2f}".format(invoice['amount_paid'] / 100),
            }
        else:
            return Response({'message': 'Unknown payment type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # check if a payment object already exists
        existing_payment = Payments.objects.filter(Q(customer_id=customer['id']) | Q(subscription_id=subscription.id), archived=False).first()
        if existing_payment is None:
            # create new payment
            payment_serializer = PaymentSerializer(data=new_payment, partial=True)
        else:
            # update existing payment
            payment_serializer = PaymentSerializer(existing_payment, data=new_payment, partial=True)

        if payment_serializer.is_valid():
            payment_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Payment could not be created with received data.',
                'errors': payment_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if payment_serializer.is_valid():
            payment_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Payment could not be created with received data.',
                'errors': payment_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # get user information
        person_info = get_object_or_404(User, uid=subscription.user_uid.uid)
        formatted_person_info = {
            'first_name': person_info.first_name,
            'email': person_info.email,
            #'email': 'jamopakg3@gmail.com',
        }

        # get subscription info
        subscription_plan = chargebee_subscription['subscription_items'][0]['item_price_id']
        subscription_plan = subscription_plan.split('-')[0]
        subscription_plan = subscription_plan.split('_')[1]

        billing_period_type = 'Monthly'
        if chargebee_subscription['billing_period_unit'] == 'year':
            billing_period_type = 'Yearly'

        formatted_subscription_info = {
            'plan': subscription_plan,
            'renewal_date': convert_unix_timestamp_date(chargebee_subscription['next_billing_at']),
            'subscription_type': billing_period_type,
        }
        
        # get invoice data as pdf
        new_invoice = get_invoice_data_pdf(invoice['id'])
        pdf_content = download_pdf(new_invoice.download_url)

        # send email to notify user of subscription renewed
        if existing_event is None:
            subscription_renewal_email(formatted_person_info['email'], formatted_person_info, formatted_subscription_info, pdf_content)

    # handle when customer information is updated/changed
    elif request.data['event_type'] == 'customer_changed':

        # handle any changes to payment method
        if "card" in content:
            # get card information and link to subscription
            card = content['card']
            
            updated_payment = {
                'customer_id': customer['id'],
                'payment_type': 'card',
                'gateway': card['gateway'],
                'card_last4': card['last4'],
                'card_brand': card['card_type'].upper(), # visa, mastercard etc
                'card_funding_type': card['funding_type'],
                'card_expiry_month': card['expiry_month'],
                'card_expiry_year': card['expiry_year'],
            }

            # get current subscription
            subscription = Subscriptions.objects.filter(customer_id=customer['id'], archived=False).first()
            if subscription is None:
                # create a new payment source, link to null subscription for now
                payment_serializer = PaymentSerializer(data=updated_payment, partial=True)
            else:
                # get payment for subscription
                payment_source = get_object_or_404(Payments, subscription_id=subscription.id, archived=False)
                
                # update payment information
                payment_serializer = PaymentSerializer(payment_source, data=updated_payment, partial=True)
            
            if payment_serializer.is_valid():
                payment_serializer.save()
            else:
                return Response({
                    'status': 'Bad Request',
                    'message': 'Payment could not be updated with received data.',
                    'errors': payment_serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)

    else:
        return Response({'message':'Unknown event type'}, status=status.HTTP_200_OK)
    
    if existing_event is None:
        # create new webhook event item
        new_webhook_event = {
            'event_id': request.data['id'],
            'occurred_at': dt_object,
            'event_type': request.data['event_type'],
            'customer_id': customer['id'],
        }
        webhook_serializer = ChargebeeWebhooksSerializer(data=new_webhook_event, partial=True)
        if webhook_serializer.is_valid():
            webhook_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Webhook event could not be created with received data.',
                'errors': webhook_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        # calculate the date and time 7 days ago from now
        seven_days_ago = datetime.now() - timedelta(days=7)

    # delete any webhook entries that are older than 7 days
    old_webhook_entries = ChargebeeWebhooks.objects.filter(occurred_at__lte=seven_days_ago)
    for entry in old_webhook_entries:
        entry.delete()
    
    #if request.data['event_type'] == 'subscription_created':
        #return redirect('some-view-name')
        #return redirect('https://verifiedhours.com/success?sub_id=' + chargebee_subscription['id'])
    
    return Response(status=status.HTTP_200_OK)

# GET => /api/businesses/verify/subscriptions/subscription/<subscription_id>
# verify and check the status of a chargebee subscription
@api_view(['GET'])
def VerifyChargebeeSubscription(request, subscription_id=None):
    if request.method != 'GET':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if subscription_id == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    subscription = get_subscription(subscription_id)

    return Response({'status':subscription.status}, status=status.HTTP_200_OK) 
    

#################
# VERIFY EMAIL
#################

# POST => /api/businesses/verify/users/user/<user_id>
# verify and confirm a user
@api_view(['POST'])
def VerifyUserEmail(request, user_uid=None):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if user_uid == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # get user information
    user = get_object_or_404(User, uid=user_uid)

    # check if token exists
    current_time = datetime.now()
    existing_token = EmailTokenVerify.objects.filter(user_uid=user_uid, token=request.data['token']).first()
    if existing_token is None:
        # return no token found
        return Response(status=status.HTTP_404_NOT_FOUND) 
        
    if existing_token.expires_at < current_time.replace(tzinfo=timezone.utc):
        # expired token - delete it
        existing_token.delete()
        return Response({'status': 'Expired token'}, status=status.HTTP_400_BAD_REQUEST) 

    if existing_token.expires_at > current_time.replace(tzinfo=timezone.utc):
        # token exists, try to verify it
        token_verified = existing_token.token == request.data['token']
        if token_verified is False:
            existing_token.delete()
            return Response({'status': 'Token is not valid'}, status=status.HTTP_400_BAD_REQUEST)  
        
        # update user, set confirm email TRUE
        updated_user = {
            'confirm_email': True,
        }
        user_serializer = UserSerializer(user, data=updated_user, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'User could not be created with received data.',
                'errors': user_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # delete all old tokens
        old_tokens = EmailTokenVerify.objects.filter(user_uid=user_uid)
        for token in old_tokens:
            token.delete()
        
    return Response(status=status.HTTP_200_OK) 

# POST => /api/businesses/verify/email/token/
# create a new email verify token
@api_view(['POST'])
def CreateEmailVerifyToken(request):
    if request.method != 'POST':
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    # get user uid
    user_uid = request.data['user_uid']
    user = get_object_or_404(User, uid=user_uid)

    # check if token already exists
    current_time = datetime.now()
    existing_token = EmailTokenVerify.objects.filter(user_uid=user_uid, expires_at__gt=current_time.replace(tzinfo=timezone.utc)).first()
    if existing_token is None or existing_token.expires_at < current_time.replace(tzinfo=timezone.utc):
        # delete all old tokens
        old_tokens = EmailTokenVerify.objects.filter(user_uid=user_uid)
        for token in old_tokens:
            token.delete()

        # create new token 
        ten_minutes_from_now = current_time + timedelta(minutes=10)
        new_token = {
            'token': request.data['hashed_token'],
            'user_uid': request.data['user_uid'],
            'expires_at': ten_minutes_from_now,
        }
        token_serializer = EmailTokenVerifySerializer(data=new_token)
        if token_serializer.is_valid():
            token_serializer.save()
        else:
            return Response({
                'status': 'Bad Request',
                'message': 'Email token verify could not be created with received data.',
                'errors': token_serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
    # get token
    if existing_token is None:
        token = request.data['hashed_token']
    else:
        token = existing_token.token

    # person
    person = {
        'first_name': user.first_name,
        'last_name': user.last_name,
    }
            
    # send email verification to user
    confirm_verify_email(user.email, person, token, request.data['redirect'])

    return Response(status=status.HTTP_200_OK) 

################
# COOKIES
################

# PATCH | DELETE => /api/businesses/cookies/
# GET => /api/businesses/cookies/<user_uid>
# create/update a cookie 
@api_view(['PATCH', 'GET', 'DELETE'])
def UpdateCookies(request, user_uid=None):
    if user_uid is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # cookie fields
    cookie_name = ''
    cookie_value = ''

    if request.method == 'PATCH': 
        expires_at = request.data['expires_at']
        user_uid = request.data['user_uid']

        cookies = request.COOKIES
        cookie_names = ['countdownStartTime', 'overtimeCountdownStartTime', 'autoClockOutCountdownStartTime']

        for cookie_name in cookie_names:
            if cookie_name in cookies:
                cookie_value = cookies[cookie_name]

                # check if cookie already exists and is not expired
                current_time = datetime.now()
                existing_cookies = Cookies.objects.filter(user_uid=user_uid, name=cookie_name, expires_at__gt=current_time.replace(tzinfo=timezone.utc)).first()
                if existing_cookies is None or existing_cookies.expires_at < current_time.replace(tzinfo=timezone.utc):
                    # delete old cookies
                    old_cookies = Cookies.objects.filter(user_uid=user_uid, name=cookie_name)
                    for cookie in old_cookies:
                        cookie.delete()

                    # create new cookie 
                    date_format = "%a, %d %b %Y %H:%M:%S GMT"
                    expires_at_datetime = datetime.strptime(expires_at, date_format)

                    new_cookie = {
                        'name': cookie_name,
                        'value': cookie_value,
                        'user_uid': user_uid,
                        'expires_at': expires_at_datetime,
                    }
                    cookie_serializer = CookiesSerializer(data=new_cookie)
                    if cookie_serializer.is_valid():
                        cookie_serializer.save()
                    else:
                        return Response({
                            'status': 'Bad Request',
                            'message': f'Cookie {cookie_name} could not be created with received data.',
                            'errors': cookie_serializer.errors,
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # update cookie
                    date_format = "%a, %d %b %Y %H:%M:%S GMT"
                    expires_at_datetime = datetime.strptime(expires_at, date_format)

                    new_cookie = {
                        'name': cookie_name,
                        'value': cookie_value,
                        'user_uid': user_uid,
                        'expires_at': expires_at_datetime,
                    }
                    cookie_serializer = CookiesSerializer(existing_cookies, data=new_cookie, partial=True)
                    if cookie_serializer.is_valid():
                        cookie_serializer.save()
                    else:
                        return Response({
                            'status': 'Bad Request',
                            'message': f'Cookie {cookie_name} could not be updated with received data.',
                            'errors': cookie_serializer.errors,
                        }, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)
    
    elif request.method == 'GET':
        # get all cookies for user
        current_time = datetime.now()
        query_params = request.query_params
        response = Response(status=status.HTTP_200_OK)
        existing_cookies = Cookies.objects.filter(user_uid=user_uid)
        for cookie in existing_cookies:
            if cookie.expires_at < current_time.replace(tzinfo=timezone.utc):
                # delete expired/old cookie
                cookie.delete()
                continue # onto the next

            if query_params['httponly'] == 'false':
                http_only = False
            else:
                http_only = True

            # create new cookie
            response.set_cookie(
                key=cookie.name,
                value=cookie.value,
                httponly=http_only,
                #httponly=False,
                secure=False,    # be sent only over HTTPS
                samesite='lax', 
                expires=cookie.expires_at
            )

        return response
    
    elif request.method == 'DELETE':
        cookie_name = request.data['cookie_name']
        cookie = Cookies.objects.filter(user_uid=user_uid, name=cookie_name).first()
        if cookie is not None:
            cookie.delete()
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)