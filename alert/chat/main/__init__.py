from flask import Blueprint

main = Blueprint('alert_v1', __name__)

from . import routes, events