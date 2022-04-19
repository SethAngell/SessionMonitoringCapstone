python manage.py collectstatic --noinput
python manage.py migrate
gunicorn SessionMonitoringAuth.wsgi:application --bind 0.0.0.0:8001