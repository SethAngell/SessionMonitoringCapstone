from flask import session, redirect, url_for, render_template, request
from . import main


@main.route('/', methods=['GET', 'POST'])
def index():
    """Login form to enter a room."""
    return render_template('index.html')


