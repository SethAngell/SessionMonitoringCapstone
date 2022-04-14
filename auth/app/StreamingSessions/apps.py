from django.apps import AppConfig
import os

class StreamingsessionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'StreamingSessions'
    print("Upper Level Sanity Check")

    def ready(self):
        from . import jobs
        print("Sanity Check")

        if os.environ.get('RUN_MAIN', None) != 'true':
            print("Starting Scheduler")
            jobs.start_scheduler()
