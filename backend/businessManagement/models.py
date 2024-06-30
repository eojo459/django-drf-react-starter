import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
import qrcode 
from PIL import Image
from io import BytesIO
from django.core.files import File

class Waitlist(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    email = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True)

class ContactMessage(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    name = models.CharField(max_length=50)
    company = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=50)
    subject = models.TextField()
    message = models.TextField()
    date = models.DateField(auto_now_add=True)

class InviteCodes(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    uses = models.IntegerField(default=0) # usage/signup count
    enabled = models.BooleanField(default=True)
    expires = models.TimeField(null=True, blank=True)
    qr_code = models.ForeignKey('QRCode', on_delete=models.CASCADE)
    invite_code = models.CharField(max_length=6)

# save on external storage - https://www.digitalocean.com/products/spaces
# https://supabase.com/docs/guides/storage
class QRCode(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    invite_code = models.CharField(max_length=6)
    url = models.CharField(max_length=255, null=True, blank=True)

class NotificationMessage(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    to_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE)
    from_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE, related_name='sender_uid', null=True, blank=True)
    message = models.TextField()
    message_type = models.ForeignKey('NotificationMessageType', on_delete=models.CASCADE)

class Report(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    business_id = models.ForeignKey('BusinessProfile', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    regular_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    overtime_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vacation_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    holiday_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unpaid_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    other_paid_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    regular_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    overtime_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vacation_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    holiday_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_gross_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_net_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # total pay after deductions & taxes
    total_fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_net_fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # total fees after deductions & taxes
    notes = models.CharField(max_length=255, null=True, blank=True)
    attendance_record_ids = ArrayField(models.UUIDField(), default=list)
    date_modified = models.DateTimeField(auto_now=True) # last modified
    pdf_url = models.CharField(max_length=255, null=True, blank=True)

class NewUsers(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    user_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE)
    business_id = models.ForeignKey('BusinessProfile', on_delete=models.CASCADE)
    date_registered = models.DateTimeField(auto_now_add=True)

# NOTIFICATION TYPES
# 1 = SUCCESS
# 2 = ERROR 
# 3 = WARNING
# 4 = UPDATE
# 5 = GENERAL NOTIFICATION
class NotificationMessageType(models.Model):
    id = models.AutoField(primary_key=True, editable=False, unique=True)
    name = models.CharField(max_length=20) 

class SubscriptionPlan(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    name = models.CharField(max_length=50)
    # other subscription plan details

class Subscriptions(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    item_price_id = models.CharField(max_length=50)
    user_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE)
    customer_id = models.CharField(max_length=50)
    subscription_id = models.CharField(max_length=50)
    invoice_id = models.CharField(max_length=50)
    item_type = models.CharField(max_length=50)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    activated_at = models.DateTimeField()
    billing_period = models.IntegerField(default=1)
    billing_period_unit = models.CharField(max_length=50) # monthly | yearly
    expires_at = models.DateTimeField(null=True, blank=True)
    currency_code = models.CharField(max_length=50)
    current_term_start = models.DateTimeField()
    current_term_end = models.DateTimeField()
    next_billing_at = models.DateTimeField()
    cancelled_at = models.DateTimeField(null=True, blank=True)
    remaining_billing_cycles = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50)
    total_dues = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    archived = models.BooleanField(default=False)
    
class Payments(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    subscription_id = models.ForeignKey('Subscriptions', on_delete=models.CASCADE, null=True, blank=True)
    customer_id = models.CharField(max_length=100)
    txn_id = models.CharField(max_length=100)
    payment_type = models.CharField(max_length=50) # card, paypal, apple pay, etc
    gateway = models.CharField(max_length=50)
    issuing_country = models.CharField(max_length=50)
    card_last4 = models.CharField(max_length=4, null=True, blank=True)
    card_brand = models.CharField(max_length=50, null=True, blank=True)
    card_funding_type = models.CharField(max_length=50, null=True, blank=True) # debit, credit, prepaid
    card_expiry_month = models.CharField(max_length=50, null=True, blank=True)
    card_expiry_year = models.CharField(max_length=50, null=True, blank=True)
    paypal_email = models.CharField(max_length=50, null=True, blank=True)
    bank_last4 = models.CharField(max_length=4, null=True, blank=True)
    bank_person_name_on_account = models.CharField(max_length=50, null=True, blank=True)
    bank_name = models.CharField(max_length=50, null=True, blank=True)
    bank_account_type = models.CharField(max_length=50, null=True, blank=True)
    archived = models.BooleanField(default=False)
    txn_date = models.DateField(null=True, blank=True)
    txn_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    txn_timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ChargebeeWebhooks(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    event_id = models.CharField(max_length=100)
    occurred_at = models.DateTimeField()
    event_type = models.CharField(max_length=50)
    user_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE, null=True, blank=True)
    customer_id = models.CharField(max_length=100)

class EmailTokenVerify(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    token = models.CharField(max_length=255)
    user_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE, null=True, blank=True)
    expires_at = models.DateTimeField()

class Cookies(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False, unique=True)
    user_uid = models.ForeignKey('user.User', to_field='uid', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=255)
    expires_at = models.DateTimeField()