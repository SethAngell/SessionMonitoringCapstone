import os

from flask import Flask, render_template, redirect
from flask_socketio import SocketIO
from flask_socketio import emit

socketio = SocketIO()

def create_app(test_config=None):
    

    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        #DATABASE=os.path.join(app.instance_path, "NounExtraction.sqlite"),
    )

    from .main import main as alert_bp
    app.register_blueprint(alert_bp, url_prefix="/v1")

    socketio.init_app(app, engineio_logger=True, logger=True, cors_allowed_origins=["http://chat.capstone.com", "http://chat.capstone.doublel.studio"])

    return app