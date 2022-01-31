from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio
import os

def debug_print(str_to_print):
    if os.environ.get("DEBUG", False):
        print(str_to_print)


@socketio.on('connect')
def notify_of_connection():
    debug_print("A connection attempt was made")

@socketio.on('joined')
def joined(message):
    debug_print("New member has joined!")
    debug_print(f'{message = }') 

    if 'headless' in message.keys():
        debug_print('headless message')
        name = message['name']
        room = message['room']
    else:
        debug_print('browser session')
        room = session.get('room')
        name = session.get('name')

    join_room(room)
    emit('status', {'msg' : f'{name.upper()} has joined the chat!'}, broadcast=True)

@socketio.on('text')
def text(message):

    debug_print("New message! - " + str(message))
    try:
        debug_print("Went looking for a name in session")
        name = session.get('name')
    except:
        debug_print("Went looking for a name in message")
        name = message['name']

    msg = message['msg']
    emit('message', {'msg' : f'{name.upper()}: {msg}'}, broadcast=True)

@socketio.on('left')
def left(message):
    debug_print("A member has left the chat")

    try:
        debug_print("Went looking for a name in session")
        name = session.get('name')
    except:
        debug_print("Went looking for a name in message")
        name = message['name']

    emit('status', {'msg': f'{name.upper()} has left the chat :('}, broadcast = True)
