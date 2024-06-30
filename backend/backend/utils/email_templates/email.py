from datetime import datetime
import os
import jinja2
from django.template.loader import render_to_string 
from django.core.mail import EmailMessage, send_mail
from django.template import Context
from decouple import config
from django.utils.html import strip_tags
from backend.utils.helper import format_timestamp_time

# send email when a new owner signs up
def new_owner_signup_email(to_email, person):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
    else:
        return

    # context data for template
    context = {
        'first_name': person['first_name'],
        'year': datetime.now().year,
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'owner_signup.html'
    template = template_env.get_template(html_template)

    subject = 'Welcome to [SERVICE]'
    from_email = config('DEFAULT_FROM_EMAIL')

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = 'Welcome to [SERVICE]'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.content_subtype = 'html'
    message.send()

# send email when a new staff signs up
def new_staff_signup_email(to_email, person):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
    else:
        return

    # context data for template
    context = {
        'first_name': person['user_first_name'],
        'year': datetime.now().year,
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'staff_signup.html'
    template = template_env.get_template(html_template)

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = 'Welcome to [SERVICE]'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.content_subtype = 'html'
    message.send()

# TODO: send email to reset a forgotten password
def forgot_reset_password():
    pass

# send email when a new subscription is created/purchased/started
def new_subscription_email(to_email, person, plan_info, pdf_content):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
    else:
        return

    # context data for template
    context = {
        'first_name': person['first_name'],
        'plan': plan_info['plan'],
        'start_date': format_timestamp_time(plan_info['start_date']),
        'renewal_date': format_timestamp_time(plan_info['renewal_date']),
        'subscription_type': plan_info['subscription_type'],
        'year': datetime.now().year,
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'new_subscription.html'
    template = template_env.get_template(html_template)

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = 'Subscription Activated'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.attach('[SERVICE] - Invoice', pdf_content, 'application/pdf') # attach invoice as pdf
    message.content_subtype = 'html'
    message.send()

# send email when a subscription is cancelled
def subscription_cancelled_email(to_email, person, plan_info):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
    else:
        return

    # context data for template
    context = {
        'first_name': person['first_name'],
        'plan': plan_info['plan'],
        'cancel_date': format_timestamp_time(plan_info['cancel_date']),
        'term_end_date': format_timestamp_time(plan_info['term_end_date']),
        'year': datetime.now().year,
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'subscription_cancelled.html'
    template = template_env.get_template(html_template)

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = 'Subscription Cancelled'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.content_subtype = 'html'
    message.send()

# send email when a new user is pending approval
def new_pending_user_email(to_email, person, business_info):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
    else:
        return

    # context data for template
    context = {
        'first_name': person['first_name'],
        'user_first_name': person['user_first_name'],
        'user_last_name': person['user_last_name'],
        'signup_date': format_timestamp_time(person['signup_date']),
        'user_email': person['user_email'],
        'business_name': business_info['name'],
        'year': datetime.now().year,
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'new_staff_pending_approval.html'
    template = template_env.get_template(html_template)

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = '[ACTION REQUIRED] New Employee Registration Awaiting Approval'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.content_subtype = 'html'
    message.send()

# send email when a subscription is renewed
def subscription_renewal_email(to_email, person, plan_info, pdf_content):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
    else:
        return

    # context data for template
    context = {
        'first_name': person['first_name'],
        'plan': plan_info['plan'],
        'renewal_date': format_timestamp_time(plan_info['renewal_date']),
        'subscription_type': plan_info['subscription_type'],
        'year': datetime.now().year,
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'subscription_renewed.html'
    template = template_env.get_template(html_template)

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = 'Subscription Renewed'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.attach('[SERVICE] - Invoice', pdf_content, 'application/pdf') # attach invoice as pdf
    message.content_subtype = 'html'
    message.send()

# send email to confirm & verify email
def confirm_verify_email(to_email, person, token, redirect_url):
    env = config('ENV')
    if env == "prod":
        email_template_path = config('EMAIL_TEMPLATE_PATH')
        base_url = "https://base_url.com"
    elif env == "dev":
        email_template_path = config('EMAIL_TEMPLATE_PATH_DEV')
        base_url = "http://dev.base_url.com/"
    elif env == "local":
        email_template_path = config('EMAIL_TEMPLATE_PATH_LOCAL')
        base_url = "http://localhost:3000/"
    else:
        return

    # context data for template
    context = {
        'token': token,
        'base_url': base_url,
        'url': base_url + "/?token=" + token + "&redirect=" + redirect_url,
        'first_name': person['first_name'],
    }

    # setup template loader 
    template_loader = jinja2.FileSystemLoader(email_template_path)
    template_env = jinja2.Environment(loader=template_loader)
    html_template = 'confirm_verify_email.html'
    template = template_env.get_template(html_template)

    # render and create html as string
    output_text = template.render(context)

    # setup email
    subject = 'Confirm and Verify Your Email'
    from_email = config('DEFAULT_FROM_EMAIL')
    message = EmailMessage(subject, output_text, from_email, [to_email])
    message.content_subtype = 'html'
    message.send()