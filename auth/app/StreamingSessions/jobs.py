from schedule import Scheduler
import threading
import time
import datetime

from .models import ActiveProjects, HealthCheck

# See: https://stackoverflow.com/questions/44896618/django-run-a-function-every-x-seconds

def log(phrase_to_log):
    with open("log.txt", "a") as ifile:
        ifile.write(f'{phrase_to_log}\n')

def check_for_timed_out_room():
    log("Checkign rooms!")
    current_time = datetime.datetime.now(datetime.timezone.utc)
    active_projects = ActiveProjects.objects.all()

    projects_to_archive = []

    for project in active_projects:
        log(f'{project = }')
        last_ping = HealthCheck.objects.filter(session_room=project.session).latest('timestamp')

        log(f'{type(last_ping.timestamp)}')
        if (current_time - last_ping.timestamp).total_seconds() / 60 > 2:
            projects_to_archive.append(project)

    for project in projects_to_archive:
        project.delete()

def run_continuously(self, interval=60):
    cease_continuous_run = threading.Event()

    class ScheduleThread(threading.Thread):

        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                self.run_pending()
                time.sleep(interval)
    
    continuous_thread = ScheduleThread()
    continuous_thread.setDaemon(True)
    continuous_thread.start()

    return cease_continuous_run

Scheduler.run_continuously = run_continuously

def start_scheduler():
    scheduler = Scheduler()
    scheduler.every().minute.do(check_for_timed_out_room)
    scheduler.run_continuously()


    