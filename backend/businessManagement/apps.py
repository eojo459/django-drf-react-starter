from django.apps import AppConfig

class BusinessmanagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'businessManagement'

    def ready(self):
        from businessManagement.scheduler import scheduler
        scheduler.start_scheduler()
