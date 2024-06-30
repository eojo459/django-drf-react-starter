# File for various helper functions separated from api

import calendar
import datetime
from datetime import timedelta, datetime, timezone
from decimal import Decimal
from dateutil import tz
from enum import Enum
from io import BytesIO
import secrets
import string
import time
import uuid
from django.shortcuts import get_object_or_404
import qrcode
import requests
from staff.models import StaffRelationship, StaffWorkingHours
from child.models import ChildRelationship
from child.serializers import ChildSerializer
from user.models import Staff, Child, User
from user.serializers import StaffSerializer
from businessManagement.models import InviteCodes, PayrollInformation, QRCode, Subscriptions
from decouple import config

class Status(Enum):
    NOT_SUBMITTED = 1
    SUBMITTED = 2
    APPROVED = 3
    PENDING_CHANGES = 4
    DENIED = 5

class NotificationMessageType(Enum):
    SUCCESS = 1
    ERROR = 2
    WARNING = 3
    UPDATE = 4
    GENERAL = 5

class BusinessProfilePlanType(Enum):
    FREE = 1
    TRIAL = 2
    BASIC = 3
    PRO = 4
    ENTERPRISE = 5

class OwnerProfilePlanType(Enum):
    FREE = 1
    TRIAL = 2
    BASIC = 3
    PRO = 4
    ENTERPRISE = 5

class ChargebeeSubscriptionPlan(Enum):
    BASIC = 'Basic'
    PRO = 'Pro'
    ENTERPRISE = 'Enterprise'

class TimeStatus(Enum):
    CLOCKED_OUT = 1
    CLOCKED_IN = 2
    BREAK_START = 3
    BREAK_END = 4
    UNKNOWN = 5
    OVERTIME_START = 6
    OVERTIME_END = 7


def format_time(input_time):
    # Parse the input string into a datetime object
    input_datetime = datetime.strptime(input_time, "%H:%M:%S")

    # convert from 24 hour to 12 hours
    if input_datetime.hour > 12:
        new_hour = input_datetime.hour - 12
        new_time = str(new_hour) + ":"  + str(input_datetime.minute).rjust(2, '0') + " PM"
        return new_time

    # Format the datetime object into the desired output format
    output_time = input_datetime.strftime("%H:%M %p")
    return output_time

# convert times from "HH:MM A" => "HH:MM:SS"
def convert_time(input_time):
    # Parse the input string into a datetime object
    input_datetime = datetime.strptime(input_time, "%H:%M %p")
    input_split = input_time.split(" ")
    input_period = input_split[1]
    if input_period == "PM":
        # add 12 to hour
        new_hour = input_datetime.hour + 12
        new_time = str(new_hour) + ":"  + str(input_datetime.minute).rjust(2, '0') + ":00"
    else:
        new_time = str(input_datetime.hour) + ":"  + str(input_datetime.minute).rjust(2, '0') + ":00"
    return new_time


# get the daily attendance status for the staff and users
def get_attendance_status(business_id, attendance_list, attendance_type):
    result_list = []
    people_list = []
    if attendance_type == "USER":
        user_relationships = ChildRelationship.objects.filter(business_id=business_id)
        if len(user_relationships) > 0:
            for relationship in user_relationships:
                # get user
                user = get_object_or_404(Child, uid=relationship.child_uid_id)
                people_list.append(user)
    elif attendance_type == "STAFF":
        staff_relationships = StaffRelationship.objects.filter(business_id=business_id)
        if len(staff_relationships) > 0:
            for relationship in staff_relationships:
                # get staff
                staffs = get_object_or_404(Staff, uid=relationship.staff_uid)
                people_list.append(staffs)

    for attendance in attendance_list:
        has_check_in = False
        has_check_out = False
        check_in = attendance.get("check_in_time")
        check_out = attendance.get("check_out_time")
        check_in_2 = attendance.get("check_in_time_2")
        check_out_2 = attendance.get("check_out_time_2")
        check_in_3 = attendance.get("check_in_time_3")
        check_out_3 = attendance.get("check_out_time_3")
        # TODO: add break times?
        value = "-"

        if check_out_3 is not None:
            has_check_out = True
            value = attendance.get("check_out_time_3")
        elif check_in_3 is not None:
            has_check_in = True
            value = attendance.get("check_in_time_3")
        elif check_out_2 is not None:
            has_check_out = True
            value = attendance.get("check_out_time_2")
        elif check_in_2 is not None:
            has_check_in = True
            value = attendance.get("check_in_time_2")
        elif check_out is not None:
            has_check_out = True
            value = attendance.get("check_out_time")
        elif check_in is not None:
            has_check_in = True
            value = attendance.get("check_in_time")
        else:
            has_check_in = False
            has_check_out = False

        if attendance_type == "USER":
            user_uid = attendance.get("child_uid")
            if user_uid is not None:
                child = get_object_or_404(Child, uid=user_uid)
                uid = child.uid
                user_full_name = child.first_name + " " + child.last_name
        elif attendance_type == "STAFF":
            user_uid = attendance.get("staff_uid")
            if user_uid is not None:
                staff = get_object_or_404(Staff, uid=user_uid)
                uid = staff.uid
                user_full_name = staff.first_name + " " + staff.last_name

        if has_check_out == True:
            status_id = 0
        elif has_check_in == True:
            status_id = 1
        else:
            status_id = "-"

        # return the name and status of the user
        result_list.append({
            "uid": uid,
            "name": user_full_name,  
            "status": status_id,
            "value": format_time(value),
        })

    uid_list = []
    for user in result_list:
        uid_list.append(user.get("uid"))

    # go through all users and set the ones with no status
    if attendance_type == "USER" or attendance_type == "STAFF":
        for person in people_list:
            if person.uid not in uid_list:
                result_list.append({
                    "uid": person.uid,
                    "name": person.first_name + " " + person.last_name,  
                    "status": "-",
                    "value": "-",
                })

    return result_list


# get the attendance counts for the staff and users
def get_attendance_count(business_id, attendance_list, attendance_type, count_type, time_range):
    result_list = []
    people_list = []
    people_dict = {}
    user_uid = None

    # get all the users & attendances
    if attendance_type == "USER":
        users = Child.objects.filter(business_id=business_id)
        if len(users) > 0:
            #users_serializer = ChildSerializer(users, many=True)
            for user in users:
                people_dict[user.uid] = 0
                people_list.append(user)
    elif attendance_type == "STAFF":
        staffs = Staff.objects.filter(business_id=business_id)
        if len(staffs) > 0:
            for staff in staffs:
                people_dict[staff.uid] = 0
                people_list.append(staff)

    # for each attendance, check who owns it and increase their count
    for attendance in attendance_list:
        if attendance_type == "USER":
            user_uid = attendance.get("child_uid")
        elif attendance_type == "STAFF":
            user_uid = attendance.get("staff_uid")

        # check who owns this attendance
        if user_uid is not None:
            if user_uid in people_dict:
                people_dict[user_uid] += 1 # increase count

    # create the results with name and absent/attendance count
    for key, value in people_dict.items():
        uid = 0
        user_full_name = ""
        if attendance_type == "USER":
            child = get_object_or_404(Child, uid=key)
            serializer = ChildSerializer(child)
            uid = serializer.data.get("uid")
            user_full_name = serializer.data.get("first_name") + " " + serializer.data.get("last_name")
        elif attendance_type == "STAFF":
            staff = get_object_or_404(Staff, uid=key)
            serializer = StaffSerializer(staff)
            uid = serializer.data.get("uid")
            user_full_name = serializer.data.get("first_name") + " " + serializer.data.get("last_name")
        
        # get attendance or absent count
        value_count = 0
        if count_type == 0:
            # absent count
            current_date = datetime.today()
            current_day = current_date.day
            if time_range == "week":
                value_count = 7 - value
            else:
                total_days_in_month = calendar.monthrange(current_date.year, current_date.month)[1]
                if current_day < total_days_in_month:
                    value_count = current_day - value
                else:
                    value_count = total_days_in_month - value
        elif count_type == 1:
            # attendance count
            value_count = value

        # return the name and count of the user
        result_list.append({
            "uid": uid,
            "name": user_full_name,
            "value": value_count,
        })

    return result_list


def CalculateMonthlyTotalHours(attendance_records):
    # Initialize a dictionary to store total hours for each month
    total_hours_per_month = {}

    # Iterate through attendance records
    for record in attendance_records:
        # Parse the date string to a datetime object
        month = record.attendance_date.month

        # Initialize the total hours for the month if it's not already present
        if month not in total_hours_per_month:
            total_hours_per_month[month] = 0
            
        total_hours_per_month[month] += record.total_time

    return total_hours_per_month

def calculate_monthly_total_wages(attendance_records):
    # Initialize a dictionary to store total wages for each month
    total_wages_per_month = {}

    # Iterate through attendance records
    for record in attendance_records:
        # get staff working hours for the person
        staff_working_hours = get_object_or_404(StaffWorkingHours, staff_uid=record.uid)
        
        # Parse the date string to a datetime object
        month = record.attendance_date.month

        # Initialize the total wages for the month if it's not already present
        if month not in total_wages_per_month:
            total_wages_per_month[month] = 0
            
        # calculate total wage 
        total_wages = Decimal(record.total_time) * Decimal(staff_working_hours.pay_rate)
        total_wages_per_month[month] += total_wages

    return total_wages_per_month

# calulate time duration between check in and check out time
def calculate_time_duration(start_time, end_time, type):
    if start_time is not None and end_time is not None:
        if type == 'str':
            start_time = datetime.strptime(start_time, "%H:%M:%S").time()
            end_time = datetime.strptime(end_time, "%H:%M:%S").time()
        else:
            # if we have date time objects instead of strings
            start_time_str = start_time.strftime("%H:%M:%S")  # convert to string
            end_time_str = end_time.strftime("%H:%M:%S")  # convert to string

            # convert the string representations to datetime objects
            start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
            end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()

        # calculate time duration
        start_datetime = datetime.combine(datetime.today(), start_time)
        end_datetime = datetime.combine(datetime.today(), end_time)
        duration = end_datetime - start_datetime
        return duration.seconds / 3600  # Duration in fractional hours
    return 0

def round_to_nearest_quarter(number):
    # Multiply the number by 4 to scale it to quarters
    scaled_number = number * 4
    # Round to the nearest integer
    rounded_number = round(scaled_number)
    # Divide by 4 to get the rounded number in terms of quarters
    rounded_quarters = rounded_number / 4
    # Round to two decimal places
    rounded_decimal = round(rounded_quarters, 2)
    return rounded_decimal

# create a new timesheet and populate with the first attendance record info
def TimesheetCreation(record, payroll_information, person_user, person_role):
    # calculate hours from the records
    regular_hours = 0
    total_hours = 0
    overtime_hours = 0
    vacation_hours = 0
    holiday_hours = 0
    unpaid_hours = 0
    other_paid_hours = 0
    regular_pay_rate = 0
    overtime_pay_rate = 0
    vacation_pay_rate = 0
    holiday_pay_rate = 0
    days_worked = 1
    regular_pay = 0
    overtime_pay = 0
    vacation_pay = 0
    holiday_pay = 0
    total_gross_pay = 0
    total_net_pay = 0
    total_fees = 0
    total_net_fees = 0
    deductions = 0
    
    if person_role == "STAFF":
        regular_pay_rate = person_user.pay_rate
        #overtime_pay_rate = Decimal(regular_pay_rate) * Decimal(payroll_information.overtime_rate) # pay /hr * 1.5x+
        #vacation_pay_rate = Decimal(regular_pay_rate) * Decimal(payroll_information.vacation_rate)
        #holiday_pay_rate = Decimal(regular_pay_rate) * Decimal(payroll_information.holiday_rate) 
    elif person_role == "USER":
        total_fees = person_user.fee_rate # TODO ADD ON MORE FEES??

    # calculate start_date and end_date from attendance record date
    date_obj = datetime.strptime(record['attendance_date'], "%Y-%m-%d")
    start_date = date_obj - timedelta(days=date_obj.weekday())
    end_date = start_date + timedelta(days=7) # calculate the end date by adding 7 days to the start of the week
    
    # format the dates
    formatted_start_date = start_date.strftime("%Y-%m-%d")
    formatted_end_date = end_date.strftime("%Y-%m-%d")

    # add record id to list
    attendance_record_ids = []
    attendance_record_ids.append(record['id'])
    
    # calculate regular hours
    regular_hours += calculate_time_duration(record['check_in_time'], record['check_out_time'],'str')
    regular_hours += calculate_time_duration(record['check_in_time_2'], record['check_out_time_2'],'str')
    regular_hours += calculate_time_duration(record['check_in_time_3'], record['check_out_time_3'],'str')
    regular_hours -= calculate_time_duration(record['break_in_time'], record['break_out_time'],'str')
    regular_hours -= calculate_time_duration(record['break_in_time_2'], record['break_out_time_2'],'str')
    regular_hours -= calculate_time_duration(record['break_in_time_3'], record['break_out_time_3'],'str')

    # calculate total hours paid
    overtime_hours += getattr(record, 'overtime_hours', 0)
    vacation_hours += getattr(record, 'vacation_hours', 0)
    holiday_hours += getattr(record, 'holiday_hours', 0)
    other_paid_hours += getattr(record, 'other_paid_hours', 0)
    
    # total hours unpaid
    unpaid_hours += getattr(record, 'unpaid_hours', 0)

    # total hours
    total_hours = Decimal(regular_hours) + Decimal(overtime_hours) + Decimal(vacation_hours) + Decimal(holiday_hours) + Decimal(unpaid_hours) + Decimal(other_paid_hours)

    # calculate gross pay
    if regular_pay_rate is not None:
        regular_pay = Decimal(regular_hours) * Decimal(regular_pay_rate)

    if overtime_pay_rate is not None:
        overtime_pay = Decimal(overtime_hours) * Decimal(overtime_pay_rate)
    
    if vacation_pay_rate is not None:
        vacation_pay = Decimal(vacation_hours) * Decimal(vacation_pay_rate)

    if holiday_pay_rate is not None:
        holiday_pay = Decimal(holiday_hours) * Decimal(holiday_pay_rate)

    total_gross_pay = Decimal(regular_pay) + Decimal(overtime_pay) + Decimal(vacation_pay) + Decimal(holiday_pay)

    # TODO calculate benefits if any

    # calculate deductions if any
    federal_income_tax_rate = payroll_information.federal_tax
    state_income_tax_rate = payroll_information.province_tax
    federal_income_tax = Decimal(total_gross_pay) * Decimal(federal_income_tax_rate) # federal tax
    state_income_tax = Decimal(total_gross_pay) * Decimal(state_income_tax_rate) # state/province tax
    deductions = Decimal(federal_income_tax) + Decimal(state_income_tax)
    total_net_pay = Decimal(total_gross_pay) - Decimal(deductions)

    # new timesheet data
    new_timesheet = {
        'business_id': record['business_id'],
        'user_uid': record['uid'],
        'start_date': formatted_start_date,
        'end_date': formatted_end_date,
        'regular_hours': round_to_nearest_quarter(total_hours),
        'total_hours': round_to_nearest_quarter(total_hours),
        'overtime_hours': round_to_nearest_quarter(overtime_hours),
        'vacation_hours': round_to_nearest_quarter(vacation_hours),
        'holiday_hours': round_to_nearest_quarter(holiday_hours),
        'unpaid_hours': round_to_nearest_quarter(unpaid_hours),
        'other_paid_hours': round_to_nearest_quarter(other_paid_hours),
        'days_worked': days_worked,
        'regular_pay': round(regular_pay, 2),
        'overtime_pay': round(overtime_pay, 2),
        'holiday_pay': round(holiday_pay, 2),
        'vacation_pay': round(vacation_pay, 2),
        'total_pay': round(total_gross_pay, 2),
        'total_net_pay': round(total_net_pay, 2),
        'total_fees': round(total_fees, 2),
        'total_net_fees': round(total_net_fees, 2),
        'deductions': round(deductions, 2),
        'attendance_record_ids': attendance_record_ids,
        'date_modified': datetime.now(),
        #'modified_by': modified_by,
    }
    return new_timesheet

# Calculate the timesheet data from the given attendance records and payroll information
def TimesheetCalculate(attendance_record_list, working_hours, person_role, timesheet=None, payroll_information=None):
    # calculate hours from the records
    regular_hours = 0
    total_hours = 0
    overtime_hours = 0
    vacation_hours = 0
    holiday_hours = 0
    unpaid_hours = 0
    other_paid_hours = 0
    regular_pay_rate = 0
    overtime_pay_rate = 0
    vacation_pay_rate = 0
    holiday_pay_rate = 0
    days_worked = len(attendance_record_list)
    regular_pay = 0
    overtime_pay = 0
    vacation_pay = 0
    holiday_pay = 0
    total_gross_pay = 0
    total_net_pay = 0
    total_fees = 0
    total_net_fees = 0
    deductions = 0
    attendance_record_ids_list = []

    if person_role == "STAFF":
        regular_pay_rate = working_hours.pay_rate
        overtime_pay_rate = Decimal(regular_pay_rate) * Decimal(payroll_information.overtime_rate) # pay /hr * 1.5x+ MINIMUM
        vacation_pay_rate = Decimal(regular_pay_rate) * Decimal(payroll_information.vacation_rate)
        holiday_pay_rate = Decimal(regular_pay_rate) * Decimal(payroll_information.holiday_rate) 
    # elif person_role == "USER":
    #     total_fees = person_user.fee_rate # TODO ADD ON MORE FEES??


    # sum up counts for all records
    for record in attendance_record_list:
        # calculate regular hours
        regular_hours += calculate_time_duration(record['check_in_time'], record['check_out_time'],'str')
        regular_hours += calculate_time_duration(record['check_in_time_2'], record['check_out_time_2'],'str')
        regular_hours += calculate_time_duration(record['check_in_time_3'], record['check_out_time_3'],'str')

        if person_role == "STAFF":
            # calculate break hours
            regular_hours -= calculate_time_duration(record['break_in_time'], record['break_out_time'],'str')
            regular_hours -= calculate_time_duration(record['break_in_time_2'], record['break_out_time_2'],'str')
            regular_hours -= calculate_time_duration(record['break_in_time_3'], record['break_out_time_3'],'str')

        # calculate total paid hours
        overtime_hours += getattr(record, 'overtime_hours', 0)
        vacation_hours += getattr(record, 'vacation_hours', 0)
        holiday_hours += getattr(record, 'holiday_hours', 0)
        other_paid_hours += getattr(record, 'other_paid_hours', 0)
        
        # total unpaid hours
        unpaid_hours += getattr(record, 'unpaid_hours', 0)

        # total hours
        total_hours = Decimal(regular_hours) + Decimal(overtime_hours) + Decimal(vacation_hours) + Decimal(holiday_hours) + Decimal(unpaid_hours) + Decimal(other_paid_hours)
        attendance_record_ids_list.append(record['id'])

    timezone = attendance_record_list[0]['timezone']

    # calculate gross pay
    if regular_pay_rate is not None:
        regular_pay = Decimal(regular_hours) * Decimal(regular_pay_rate)

    if overtime_pay_rate is not None:
        overtime_pay = Decimal(overtime_hours) * Decimal(overtime_pay_rate)
    
    if vacation_pay_rate is not None:
        vacation_pay = Decimal(vacation_hours) * Decimal(vacation_pay_rate)

    if holiday_pay_rate is not None:
        holiday_pay = Decimal(holiday_hours) * Decimal(holiday_pay_rate)

    total_gross_pay = Decimal(regular_pay) + Decimal(overtime_pay) + Decimal(vacation_pay) + Decimal(holiday_pay)

    # TODO calculate benefits if any

    # calculate deductions if any
    if payroll_information is not None:
        federal_income_tax_rate = payroll_information.federal_tax
        state_income_tax_rate = payroll_information.province_tax
        federal_income_tax = Decimal(total_gross_pay) * Decimal(federal_income_tax_rate) # federal tax
        state_income_tax = Decimal(total_gross_pay) * Decimal(state_income_tax_rate) # state/province tax
        deductions = Decimal(federal_income_tax) + Decimal(state_income_tax)
        total_net_pay = Decimal(total_gross_pay) - Decimal(deductions)

    # calculate start_date and end_date from first attendance record date
    date_obj = datetime.strptime(attendance_record_list[0]['attendance_date'], "%Y-%m-%d")
    #start_date = date_obj - timedelta(days=date_obj.weekday())
    start_date = start_of_week(date_obj)
    end_date = start_date + timedelta(days=6) # calculate the end date by adding 7 days to the start of the week
    
    # format the dates
    formatted_start_date = start_date.strftime("%Y-%m-%d")
    formatted_end_date = end_date.strftime("%Y-%m-%d")

    # updated timesheet data
    updated_timesheet = {
        'id': timesheet.id if timesheet is not None else "",
        'business_id': timesheet.business_id_id if timesheet is not None else attendance_record_list[0]['business_id'],
        'user_uid': working_hours.staff_uid_id,
        'regular_hours': round_to_nearest_quarter(total_hours),
        'total_hours': round_to_nearest_quarter(total_hours),
        'overtime_hours': round_to_nearest_quarter(overtime_hours),
        'vacation_hours': round_to_nearest_quarter(vacation_hours),
        'holiday_hours': round_to_nearest_quarter(holiday_hours),
        'unpaid_hours': round_to_nearest_quarter(unpaid_hours),
        'other_paid_hours': round_to_nearest_quarter(other_paid_hours),
        'days_worked': days_worked,
        'regular_pay': round(regular_pay, 2) if regular_pay is not None else 0,
        'overtime_pay': round(overtime_pay, 2) if overtime_pay is not None else 0,
        'holiday_pay': round(holiday_pay, 2) if holiday_pay is not None else 0,
        'vacation_pay': round(vacation_pay, 2) if vacation_pay is not None else 0,
        'total_pay': round(total_gross_pay, 2) if total_gross_pay is not None else 0,
        'total_net_pay': round(total_net_pay, 2) if total_net_pay is not None else 0,
        'total_fees': round(total_fees, 2) if total_fees is not None else 0,
        'total_net_fees': round(total_net_fees, 2) if total_net_fees is not None else 0,
        'deductions': round(deductions, 2) if total_net_fees is not None else 0,
        'attendance_record_ids': attendance_record_ids_list,
        'date_modified': datetime.now(),
        'start_date': formatted_start_date,
        'end_date': formatted_end_date,
        'timezone': timezone,
        #'modified_by': modified_by,
    }
    return updated_timesheet
    
# generate random invite codes to be used to join the website
def generate_invite_code():
    while True:
        code = ''.join(secrets.choice(string.ascii_letters + string.digits).upper() for _ in range(6))
        if not QRCode.objects.filter(invite_code=code).exists():
            return code

# generate qr code for invite links   
def generate_qr_code(invite_code):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f'https://verifiedhours.com/invite/?code={invite_code}')
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    # Convert QR code image to binary data
    img_buffer = BytesIO()
    qr_img.save(img_buffer, format='PNG')
    img_binary = img_buffer.getvalue()

    # Save the QR code image to a file or database
    #file_path = f'qr_codes/{invite_code}.png'
    #qr_img.save(file_path)

    # formatted data
    formatted_data = {
        #'qr_code_url': file_path,
        'image_binary': img_binary,
    }

    # Return the file path or URL to qr code
    return formatted_data

# generate random uuids
def generate_uuid():
    # Get current time
    d = int(time.time() * 1000)
    # Generate a UUID based on current time
    uuid_string = str(uuid.UUID('00000000-0000-4000-8000-000000000000'))
    uuid_list = list(uuid_string)
    
    # Replace 'x' and 'y' with random hexadecimal digits
    for i in range(len(uuid_list)):
        if uuid_list[i] == 'x':
            uuid_list[i] = format(d % 16, 'x')
            d = d // 16
        elif uuid_list[i] == 'y':
            uuid_list[i] = format((d % 4 + 8), 'x')  # ensure the uuid is type 4 (random)
            d = d // 4
    return ''.join(uuid_list)

# generate random invalid uuids
def generate_null_uuid():
    # Get current time
    d = int(time.time() * 1000)
    # Generate a UUID based on current time
    uuid_string = str(uuid.UUID('00000000-0000-4000-8000-000000000000'))
    uuid_list = list(uuid_string)
    
    # Replace 'x' and 'y' with random hexadecimal digits
    for i in range(len(uuid_list)):
        if uuid_list[i] == 'x':
            uuid_list[i] = format(d % 16, 'x')
            d = d // 16
        elif uuid_list[i] == 'y':
            uuid_list[i] = format((d % 4 + 8), 'x')  # ensure the uuid is type 4 (random)
            d = d // 4
    return '#' + ''.join(uuid_list)

# get the start of the week from a date
def start_of_week(date):
    if date.weekday() == 6:
        return date
    # For other days of the week, we subtract the weekday from the input date
    else:
        start_of_week_date = date - timedelta(days=date.weekday() + 1)
        return start_of_week_date

# format a list of attendance records
def formatAttendanceDataList(attendanceList):
    formatted_list = []
    for attendance in attendanceList:
        formatted_data = {
            'id': attendance.id,
            'business_id': attendance.business_id_id,
            'uid': attendance.uid_id,
            'attendance_date': attendance.attendance_date,
            'is_holiday': attendance.is_holiday,
            'check_in_time': attendance.check_in_time,
            'check_out_time': attendance.check_out_time,
            'check_in_time_2': attendance.check_in_time_2,
            'check_out_time_2': attendance.check_out_time_2,
            'check_in_time_3': attendance.check_in_time_3,
            'check_out_time_3': attendance.check_out_time_3,
            'break_in_time': attendance.break_in_time,
            'break_out_time': attendance.break_out_time,
            'break_in_time_2': attendance.break_in_time_2,
            'break_out_time_2': attendance.break_out_time_2,
            'break_in_time_3': attendance.break_in_time_3,
            'break_out_time_3': attendance.break_out_time_3,
            'regular_hours': attendance.regular_hours,
            'overtime_hours': attendance.overtime_hours,
            'vacation_hours': attendance.vacation_hours,
            'holiday_hours': attendance.holiday_hours,
            'unpaid_hours': attendance.unpaid_hours,
            'other_paid_hours': attendance.other_paid_hours,
            'signed_by': attendance.signed_by_id,
            'total_time': attendance.total_time,
            'timezone': attendance.timezone,
        }
        formatted_list.append(formatted_data)

    return formatted_list

# format a list of default attendance records for the specified duration
def formatAttendanceDefaultData(start_date, end_date):
    total = (end_date - start_date).days
    current_date = start_date

    formatted_list = []
    for i in range(0, total):
        formatted_data = {
            'id': '-1',
            'business_id': '-1',
            'uid': '-1',
            'attendance_date': current_date.strftime('%Y-%m-%d'), # format as YYYY-MM-DD
            'is_holiday': False,
            'check_in_time': None,
            'check_out_time': None,
            'check_in_time_2': None,
            'check_out_time_2': None,
            'check_in_time_3': None,
            'check_out_time_3': None,
            'break_in_time': None,
            'break_out_time': None,
            'break_in_time_2': None,
            'break_out_time_2': None,
            'break_in_time_3': None,
            'break_out_time_3': None,
            'regular_hours': 0,
            'overtime_hours': 0,
            'vacation_hours': 0,
            'holiday_hours': 0,
            'unpaid_hours': 0,
            'other_paid_hours': 0,
            'signed_by': '-1',
            'total_time': 0,
            'timezone': '',
        }
        formatted_list.append(formatted_data)
        current_date = current_date + timedelta(days=1) # add 1 to current_date

    return formatted_list


def format_owner_working_hours(working_hours):
    formatted_data = {
        'id': working_hours.id,
        'business_id': working_hours.business_id_id,
        'owner_uid': working_hours.owner_uid_id,
        'monday_start': working_hours.monday_start,
        'monday_break_start_time': working_hours.monday_break_start_time,
        'monday_break_end_time': working_hours.monday_break_end_time,
        'monday_break_start_time_2': working_hours.monday_break_start_time_2,
        'monday_break_end_time_2': working_hours.monday_break_end_time_2,
        'monday_break_start_time_3': working_hours.monday_break_start_time_3,
        'monday_break_end_time_3': working_hours.monday_break_end_time_3,
        'monday_end': working_hours.monday_end,
        'tuesday_start': working_hours.tuesday_start,
        'tuesday_break_start_time': working_hours.tuesday_break_start_time,
        'tuesday_break_end_time': working_hours.tuesday_break_end_time,
        'tuesday_break_start_time_2': working_hours.tuesday_break_start_time_2,
        'tuesday_break_end_time_2': working_hours.tuesday_break_end_time_2,
        'tuesday_break_start_time_3': working_hours.tuesday_break_start_time_3,
        'tuesday_break_end_time_3': working_hours.tuesday_break_end_time_3,
        'tuesday_end': working_hours.tuesday_end,
        'wednesday_start': working_hours.wednesday_start,
        'wednesday_break_start_time': working_hours.wednesday_break_start_time,
        'wednesday_break_end_time': working_hours.wednesday_break_end_time,
        'wednesday_break_start_time_2': working_hours.wednesday_break_start_time_2,
        'wednesday_break_end_time_2': working_hours.wednesday_break_end_time_2,
        'wednesday_break_start_time_3': working_hours.wednesday_break_start_time_3,
        'wednesday_break_end_time_3': working_hours.wednesday_break_end_time_3,
        'wednesday_end': working_hours.wednesday_end,
        'thursday_start': working_hours.thursday_start,
        'thursday_break_start_time': working_hours.thursday_break_start_time,
        'thursday_break_end_time': working_hours.thursday_break_end_time,
        'thursday_break_start_time_2': working_hours.thursday_break_start_time_2,
        'thursday_break_end_time_2': working_hours.thursday_break_end_time_2,
        'thursday_break_start_time_3': working_hours.thursday_break_start_time_3,
        'thursday_break_end_time_3': working_hours.thursday_break_end_time_3,
        'thursday_end': working_hours.thursday_end,
        'friday_start': working_hours.friday_start,
        'friday_break_start_time': working_hours.friday_break_start_time,
        'friday_break_end_time': working_hours.friday_break_end_time,
        'friday_break_start_time_2': working_hours.friday_break_start_time_2,
        'friday_break_end_time_2': working_hours.friday_break_end_time_2,
        'friday_break_start_time_3': working_hours.friday_break_start_time_3,
        'friday_break_end_time_3': working_hours.friday_break_end_time_3,
        'friday_end': working_hours.friday_end,
        'saturday_start': working_hours.saturday_start,
        'saturday_break_start_time': working_hours.saturday_break_start_time,
        'saturday_break_end_time': working_hours.saturday_break_end_time,
        'saturday_break_start_time_2': working_hours.saturday_break_start_time_2,
        'saturday_break_end_time_2': working_hours.saturday_break_end_time_2,
        'saturday_break_start_time_3': working_hours.saturday_break_start_time_3,
        'saturday_break_end_time_3': working_hours.saturday_break_end_time_3,
        'saturday_end': working_hours.saturday_end,
        'sunday_start': working_hours.sunday_start,
        'sunday_end': working_hours.sunday_end,
        'sunday_break_start_time': working_hours.sunday_break_start_time,
        'sunday_break_end_time': working_hours.sunday_break_end_time,
        'sunday_break_start_time_2': working_hours.sunday_break_start_time_2,
        'sunday_break_end_time_2': working_hours.sunday_break_end_time_2,
        'sunday_break_start_time_3': working_hours.sunday_break_start_time_3,
        'sunday_break_end_time_3': working_hours.sunday_break_end_time_3,
        'holiday_allowed': working_hours.holiday_allowed,
        'overtime_allowed': working_hours.overtime_allowed,
        'vacation_allowed': working_hours.vacation_allowed,
        'sick_allowed': working_hours.sick_allowed,
        'full_time': working_hours.full_time,
        'salaried': working_hours.salaried,
        'pay_rate': working_hours.pay_rate,
        'start_date': working_hours.start_date,
        'end_date': working_hours.end_date,
        'onboarding': working_hours.onboarding,
        'active': working_hours.active,
        'is_new_user': working_hours.is_new_user,
        'is_manager': working_hours.is_manager,
        'level': working_hours.level,
        'timezone': working_hours.timezone,
    }
    return formatted_data

def format_staff_working_hours(staff_working_hours):
    formatted_data = {
        'id': staff_working_hours.id,
        'business_id': staff_working_hours.business_id_id,
        'staff_uid': staff_working_hours.staff_uid_id,
        'monday_start': staff_working_hours.monday_start,
        'monday_break_start_time': staff_working_hours.monday_break_start_time,
        'monday_break_end_time': staff_working_hours.monday_break_end_time,
        'monday_break_start_time_2': staff_working_hours.monday_break_start_time_2,
        'monday_break_end_time_2': staff_working_hours.monday_break_end_time_2,
        'monday_break_start_time_3': staff_working_hours.monday_break_start_time_3,
        'monday_break_end_time_3': staff_working_hours.monday_break_end_time_3,
        'monday_end': staff_working_hours.monday_end,
        'tuesday_start': staff_working_hours.tuesday_start,
        'tuesday_break_start_time': staff_working_hours.tuesday_break_start_time,
        'tuesday_break_end_time': staff_working_hours.tuesday_break_end_time,
        'tuesday_break_start_time_2': staff_working_hours.tuesday_break_start_time_2,
        'tuesday_break_end_time_2': staff_working_hours.tuesday_break_end_time_2,
        'tuesday_break_start_time_3': staff_working_hours.tuesday_break_start_time_3,
        'tuesday_break_end_time_3': staff_working_hours.tuesday_break_end_time_3,
        'tuesday_end': staff_working_hours.tuesday_end,
        'wednesday_start': staff_working_hours.wednesday_start,
        'wednesday_break_start_time': staff_working_hours.wednesday_break_start_time,
        'wednesday_break_end_time': staff_working_hours.wednesday_break_end_time,
        'wednesday_break_start_time_2': staff_working_hours.wednesday_break_start_time_2,
        'wednesday_break_end_time_2': staff_working_hours.wednesday_break_end_time_2,
        'wednesday_break_start_time_3': staff_working_hours.wednesday_break_start_time_3,
        'wednesday_break_end_time_3': staff_working_hours.wednesday_break_end_time_3,
        'wednesday_end': staff_working_hours.wednesday_end,
        'thursday_start': staff_working_hours.thursday_start,
        'thursday_break_start_time': staff_working_hours.thursday_break_start_time,
        'thursday_break_end_time': staff_working_hours.thursday_break_end_time,
        'thursday_break_start_time_2': staff_working_hours.thursday_break_start_time_2,
        'thursday_break_end_time_2': staff_working_hours.thursday_break_end_time_2,
        'thursday_break_start_time_3': staff_working_hours.thursday_break_start_time_3,
        'thursday_break_end_time_3': staff_working_hours.thursday_break_end_time_3,
        'thursday_end': staff_working_hours.thursday_end,
        'friday_start': staff_working_hours.friday_start,
        'friday_break_start_time': staff_working_hours.friday_break_start_time,
        'friday_break_end_time': staff_working_hours.friday_break_end_time,
        'friday_break_start_time_2': staff_working_hours.friday_break_start_time_2,
        'friday_break_end_time_2': staff_working_hours.friday_break_end_time_2,
        'friday_break_start_time_3': staff_working_hours.friday_break_start_time_3,
        'friday_break_end_time_3': staff_working_hours.friday_break_end_time_3,
        'friday_end': staff_working_hours.friday_end,
        'saturday_start': staff_working_hours.saturday_start,
        'saturday_break_start_time': staff_working_hours.saturday_break_start_time,
        'saturday_break_end_time': staff_working_hours.saturday_break_end_time,
        'saturday_break_start_time_2': staff_working_hours.saturday_break_start_time_2,
        'saturday_break_end_time_2': staff_working_hours.saturday_break_end_time_2,
        'saturday_break_start_time_3': staff_working_hours.saturday_break_start_time_3,
        'saturday_break_end_time_3': staff_working_hours.saturday_break_end_time_3,
        'saturday_end': staff_working_hours.saturday_end,
        'sunday_start': staff_working_hours.sunday_start,
        'sunday_end': staff_working_hours.sunday_end,
        'sunday_break_start_time': staff_working_hours.sunday_break_start_time,
        'sunday_break_end_time': staff_working_hours.sunday_break_end_time,
        'sunday_break_start_time_2': staff_working_hours.sunday_break_start_time_2,
        'sunday_break_end_time_2': staff_working_hours.sunday_break_end_time_2,
        'sunday_break_start_time_3': staff_working_hours.sunday_break_start_time_3,
        'sunday_break_end_time_3': staff_working_hours.sunday_break_end_time_3,
        'holiday_allowed': staff_working_hours.holiday_allowed,
        'overtime_allowed': staff_working_hours.overtime_allowed,
        'vacation_allowed': staff_working_hours.vacation_allowed,
        'sick_allowed': staff_working_hours.sick_allowed,
        'full_time': staff_working_hours.full_time,
        'salaried': staff_working_hours.salaried,
        'pay_rate': staff_working_hours.pay_rate,
        'start_date': staff_working_hours.start_date,
        'end_date': staff_working_hours.end_date,
        'onboarding': staff_working_hours.onboarding,
        'active': staff_working_hours.active,
        'is_new_user': staff_working_hours.is_new_user,
        'is_manager': staff_working_hours.is_manager,
        'level': staff_working_hours.level,
        'timezone': staff_working_hours.timezone,
    }
    return formatted_data

def format_business_working_hours(working_hours):
    working_hours_formatted = {
        'id': working_hours.id,
        'business_id': working_hours.business_id_id,
        'monday_start': working_hours.monday_start,
        'monday_end': working_hours.monday_end,
        'tuesday_start': working_hours.tuesday_start,
        'tuesday_end': working_hours.tuesday_end,
        'wednesday_start': working_hours.wednesday_start,
        'wednesday_end': working_hours.wednesday_end,
        'thursday_start': working_hours.thursday_start,
        'thursday_end': working_hours.thursday_end,
        'friday_start': working_hours.friday_start,
        'friday_end': working_hours.friday_end,
        'saturday_start': working_hours.saturday_start,
        'saturday_end': working_hours.saturday_end,
        'sunday_start': working_hours.sunday_start,
        'sunday_end': working_hours.sunday_end,
    }
    return working_hours_formatted

def month_int_to_str(month_int):
    if month_int == 1: 
        return "January"
    elif month_int == 2:
        return "February"
    elif month_int == 3:
        return "March"
    elif month_int == 4:
        return "April"
    elif month_int == 5:
        return "May"
    elif month_int == 6:
        return "June"
    elif month_int == 7:
        return "July"
    elif month_int == 8:
        return "August"
    elif month_int == 9:
        return "September"
    elif month_int == 10:
        return "October"
    elif month_int == 11:
        return "November"
    elif month_int == 12:
        return "December"
    
def month_int_to_str_short(month_int):
    if month_int == 1: 
        return "Jan"
    elif month_int == 2:
        return "Feb"
    elif month_int == 3:
        return "Mar"
    elif month_int == 4:
        return "Apr"
    elif month_int == 5:
        return "May"
    elif month_int == 6:
        return "Jun"
    elif month_int == 7:
        return "Jul"
    elif month_int == 8:
        return "Aug"
    elif month_int == 9:
        return "Sep"
    elif month_int == 10:
        return "Oct"
    elif month_int == 11:
        return "Nov"
    elif month_int == 12:
        return "Dec"
    
def day_of_week_to_int(day_of_week):
    if day_of_week.lower() == 'monday': 
        return 0
    elif day_of_week.lower() == 'tuesday':
        return 1
    elif day_of_week.lower() == 'wednesday':
        return 2
    elif day_of_week.lower() == 'thursday':
        return 3
    elif day_of_week.lower() == 'friday':
        return 4
    elif day_of_week.lower() == 'saturday':
        return 5
    elif day_of_week.lower() == 'sunday':
        return 6
    else:
        return 0
    
def UTC_to_local_time():
    # define the timezones
    from_zone = tz.tzutc()  # UTC timezone
    to_zone = tz.tzlocal()  # local timezone

    # get the current UTC time
    utc_time = datetime.utcnow()

    # convert UTC time to local time
    utc_time = utc_time.replace(tzinfo=from_zone)
    local_time = utc_time.astimezone(to_zone)

    # format the local time as a string with microseconds and UTC offset
    local_time_str = local_time.strftime("%Y-%m-%d %H:%M:%S.%f") + local_time.strftime("%z")
    
    return local_time_str

# convert a utc timestamp to local time
def convert_utc_to_local_time(timestamp_utc_datetime, timestamp_with_offset):
    # parse the offset from the timestamp_with_offset
    offset_str = timestamp_with_offset[-6:]
    offset_hours = int(offset_str[:3])
    offset_minutes = int(offset_str[4:6])

    # get timezones
    from_zone = tz.tzutc()
    to_zone = tz.tzoffset(None, offset_hours * 3600 + offset_minutes * 60)

    # convert utc to local time with the same offset
    timestamp_utc = timestamp_utc_datetime.replace(tzinfo=from_zone)
    timestamp_local = timestamp_utc.astimezone(to_zone)
    str_timestamp = str(timestamp_local)
    return str_timestamp

# check the plan name and return the plan type id
def check_plan(plan_name):
    if plan_name.lower() == "free":
        return BusinessProfilePlanType.FREE.value
    elif plan_name.lower() == "trial":
        return BusinessProfilePlanType.TRIAL.value
    elif plan_name.lower() == "basic":
        return BusinessProfilePlanType.BASIC.value
    elif plan_name.lower() == "pro":
        return BusinessProfilePlanType.PRO.value
    elif plan_name.lower() == "enterprise":
        return BusinessProfilePlanType.ENTERPRISE.value
    else:
        return BusinessProfilePlanType.FREE.value
    

# generate new qr code png w/ invite code
def generate_qr_code(invite_code):
    #qr_image = qrcode.make(f'https://verifiedhours.com/invite/{self.invite_code}')
    env = config('ENV')
    file_name = f'invite_{invite_code}.png'

    # check environment
    if env == 'prod':
        file_location = config('QR_CODE_PATH') + "/" + file_name
        qr_code_data = f'https://verifiedhours.com/invite/?code={invite_code}'
    elif env == 'dev':
        file_location = config('QR_CODE_PATH_DEV') + "/" + file_name
        qr_code_data = f'http://dev.verifiedhours.com/invite/?code={invite_code}'
    elif env == 'local':
        file_location = config('QR_CODE_PATH_LOCAL') + "/" + file_name
        qr_code_data = f'localhost:3000/invite/?code={invite_code}'
    else:
        return

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_code_data) # embed the invite link w/ code
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()

    #qr_img.save(buffer, format='PNG')
    qr_img.save(file_location)
    buffer.seek(0)
    return

# convert a unix timestamp like 12378457214 => YYYY-MM-DD HH:MM:SS
def convert_unix_timestamp(timestamp):
    date = datetime.fromtimestamp(timestamp)
    formatted_date = date.strftime('%Y-%m-%d %H:%M:%S')
    return formatted_date

# convert a unix timestamp like 12378457214 => YYYY-MM-DD
def convert_unix_timestamp_date(timestamp):
    date = datetime.fromtimestamp(timestamp)
    formatted_date = date.strftime('%Y-%m-%d')
    return formatted_date

# check if user subscription is valid
def check_subscription(user_uid):
    subscription = Subscriptions.objects.filter(user_uid=user_uid, status="active", archived=False)
    if len(subscription) > 0:
        return True
    else:
        return False

# download pdf from url and return content
def download_pdf(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.content

# convert YYYY-MM-DD HH:MM:SS TIMEZONE => MONTH DAY YEAR
def format_timestamp_time(timestamp_str):
    if timestamp_str is None: 
        return
    
    # Parse the timestamp string into a datetime object
    timestamp = datetime.fromisoformat(str(timestamp_str))

    # Format the datetime object into the desired string format
    formatted_date = timestamp.strftime("%B %d %Y")
    return formatted_date

# get the staff working hours or business schedule hours for the specified day
def get_working_schedule_end(day, working_hours):
    if day == 0:
        shift_end = working_hours.monday_end
    elif day == 1:
        shift_end = working_hours.tuesday_end
    elif day == 2:
        shift_end = working_hours.wednesday_end
    elif day == 3:
        shift_end = working_hours.thursday_end
    elif day == 4:
        shift_end = working_hours.friday_end
    elif day == 5:
        shift_end = working_hours.saturday_end
    elif day == 6:
        shift_end = working_hours.sunday_end
    else:
        return None
    
    return shift_end

# convert a datetime like YYYY-MM-DD HH:MM:SS => HH:MM:SS
def convert_datetime_time(datetime_obj):
    time_string = datetime_obj.strftime("%H:%M:%S")
    return time_string

# get the day of week based on the date
def get_day_of_week(date_obj):
    #date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    # Get the day of the week with Monday as 0 and Sunday as 6
    day_of_week = date_obj.weekday()
    # day_of_week_adjusted = (day_of_week + 1) % 7 # sunday is 0
    #day_of_week_adjusted = (day_of_week + 6) % 7 # monday is 0
    return day_of_week

# check if auto clock out should be triggered comparing current time and scheduled shift end time
def auto_clock_out_triggered(scheduled_clock_out_time, auto_clock_out_duration, date, timezone_offset):
    scheduled_clock_out_datetime_utc = convert_to_utc(date, scheduled_clock_out_time, timezone_offset)
    scheduled_clock_out_after_countdown = scheduled_clock_out_datetime_utc + timedelta(minutes=float(auto_clock_out_duration))
    current_time = datetime.now(timezone.utc)

    # check if current time >= scheduled_clock_out_time + auto_clock_out_duration
    return current_time > scheduled_clock_out_after_countdown
        

# get timezone offset from timestamp string
def get_timezone_offset_from_timestamp(timestamp=None):
    if timestamp is None:
        timestamp = datetime.now().timestamp()
    else:
        dt = datetime.fromisoformat(timestamp)

    tz_offset = dt.utcoffset() / timedelta(hours=1)
    offset_sign = '+' if tz_offset >= 0 else '-'
    offset_hours = str(int(abs(tz_offset))).zfill(2)
    offset_minutes = str(int((abs(tz_offset) % 1) * 60)).zfill(2)

    return f"{offset_sign}{offset_hours}:{offset_minutes}"

# convert date YYYY-MM-DD to "Month day year" in words string
def convert_date(date_str):
    # Parse the input date string
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    
    # Format the day with appropriate suffix
    day = date_obj.day
    if 11 <= day <= 13:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    
    # Format the final date string
    formatted_date = date_obj.strftime(f"%B {day}{suffix}, %Y")
    return formatted_date

# calculate current time based on timezone offset
def calculate_time_with_offset(timezone_offset):
    offset_sign = timezone_offset[0]
    offset_hours = int(timezone_offset[1:3])
    offset_minutes = int(timezone_offset[4:])

    if offset_sign == '-':
        timezone_delta = -timedelta(hours=offset_hours, minutes=offset_minutes)
    else:
        timezone_delta = timedelta(hours=offset_hours, minutes=offset_minutes)

    # calculate current time with timezone offset
    current_time_local = datetime.now(timezone.utc) + timezone_delta

    formatted_time = current_time_local.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]  # Removing the last 3 digits of microseconds to get milliseconds
    formatted_offset = f"{offset_sign}{offset_hours:02}:{offset_minutes:02}"

    return f"{formatted_time}{formatted_offset}"

# convert a local time like HH:MM:SS with timezone offset -HH:MM to UTC time
def convert_to_utc(date_str, time_str, timezone_offset):
    offset_sign = timezone_offset[0]
    offset_hours = int(timezone_offset[1:3])
    offset_minutes = int(timezone_offset[4:])

    if offset_sign == '-':
        # behind UTC, so add offset hours
        timezone_delta = timedelta(hours=offset_hours, minutes=offset_minutes)
    else:
        # ahead of UTC, so subtract offset hours
        timezone_delta = -timedelta(hours=offset_hours, minutes=offset_minutes)

    # combine date and time to datetime
    combined_datetime = datetime.combine(date_str, time_str)

    # Parse the original time string
    #time_obj = datetime.strptime(time_str, "%H:%M:%S")

    # Add the offset to the original time
    converted_time = combined_datetime + timezone_delta

    # Format the converted time back to string
    converted_time_str = converted_time.strftime("%H:%M:%S")

    print(converted_time_str)
    
    return converted_time.replace(tzinfo=tz.tzutc())

def is_bi_weekly_day(reference_date, target_weekday):
    """
    Check if today is a bi-weekly day based on a reference date.
    
    :param reference_date: The date when the bi-weekly period starts.
    :param target_weekday: The target weekday (0 = Monday, 6 = Sunday).
    :return: True if today is the bi-weekly day, False otherwise.
    """
    today = datetime.today()
    
    # Check if today is the target weekday
    if today.weekday() != target_weekday:
        return False
    
    # Calculate the number of days since the reference date
    days_since_reference = (today - reference_date).days
    
    # Calculate the number of weeks since the reference date
    weeks_since_reference = days_since_reference // 7
    
    # Check if the number of weeks is even
    return weeks_since_reference % 2 == 0

# get the start of the week (monday) from a date of reference
def start_of_week(date):
    # Find the date of the most recent Monday
    start = date - timedelta(days=date.weekday())
    return start

# get the end of the week (sunday) from a date of reference
def end_of_week(date):
    # Find the date of the upcoming Sunday
    end = date + timedelta(days=(6 - date.weekday()))
    return end

# get start of month for any date
def get_start_of_month(date):
    return datetime(date.year, date.month, 1)

# get end of month for any date
def get_end_of_month(date):
    _, last_day = calendar.monthrange(date.year, date.month)
    return datetime(date.year, date.month, last_day)

# get the start of the previous week
def start_of_previous_week():
    today = datetime.today()
    start_of_current_week = today - timedelta(days=today.weekday())
    start_of_previous_week = start_of_current_week - timedelta(weeks=1)
    return start_of_previous_week

# Use dictionary comprehension to filter out keys with empty string values
def remove_empty_fields(obj):
    return {key: value for key, value in obj.items() if value != ''}

# convert date string to datetime object
def date_str_to_datetime(date_str):
    return datetime.strptime(date_str, "%Y-%m-%d")

def time_to_timestamp(time_str, date_str):
    # combine date and time
    date_time_str = f"{date_str} {time_str}"

    # convert to datetime object
    datetime_obj = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S')
    print(datetime_obj.time())
    return datetime_obj

# convert time datetime object to time string
def datetime_to_time_str(datetime_obj):
    return datetime_obj.strftime("%H:%M:%S")