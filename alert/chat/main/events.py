from flask import session
from flask_socketio import emit, join_room, leave_room, rooms
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

    name = message['name']
    room = message['room']

    join_room(room)
    emit('status', {'state' : "joined", 'name': name}, to=rooms())

@socketio.on('text')
def text(message):

    debug_print("New message! - " + str(message))

    name = message['name']
    msg = message['msg']
    emit('message', {'msg' : msg, 'name': name}, to=rooms())

@socketio.on('left')
def left(message):
    debug_print("A member has left the chat")

    debug_print("Went looking for a name in message")
    name = message['name']

    emit('status', {'state': 'left', 'name': name}, to=rooms())
