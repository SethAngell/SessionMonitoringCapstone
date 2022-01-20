from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

@socketio.on('connect')
def notify_of_connection():
    print("A connection attempt was made")

@socketio.on('joined')
def joined(message):
    print("New member has joined!")
    print(f'{message = }')

    if 'headless' in message.keys():
        print('headless message')
        name = message['name']
        room = message['room']
    else:
        print('browser session')
        room = session.get('room')
        name = session.get('name')

    join_room(room)
    emit('status', {'msg' : f'{name.upper()} has joined the chat!'}, broadcast=True)

@socketio.on('text')
def text(message):

    print("New message! - ", message)

    try:
        print("Went looking for a name in session")
        name = session.get('name')
    except:
        print("Went looking for a name in message")
        name = message['name']

    msg = message['msg']

    emit('message', {'msg' : f'{name.upper()}: {msg}'}, broadcast=True)

@socketio.on('left')
def left(message):
    print("A member has left the chat")

    try:
        print("Went looking for a name in session")
        name = session.get('name')
    except:
        print("Went looking for a name in message")
        name = message['name']

    emit('status', {'msg': f'{name.upper()} has left the chat :('}, broadcast = True)


# @socketio.on('joined', namespace='/chat')
# def joined(message):
#     """
#     This is a message sent automatically by clients when they enter the room
#     The message is broadcast to all connected users
#     """

#     # TODO: Look into 'room', may be a way to seperate by session
#     try:
#         print("Went looking for a room in session")
#         room = session.get('room')
#     except:
#         print("Went looking for a room in message")
#         room = message['room']

#     try:
#         print("Went looking for a name in session")
#         user = session.get('name')
#     except:
#         print("Went looking for a name in message")
#         user = message['name']
    
#     print('New Connection')
#     join_room(room)
#     emit('status', {'msg': f'{user} has entered the room.' }, room=room)

# @socketio.on('text', namespace='/chat')
# def text(message):
#     """
#     Sent by the client when new messages are sent
#     """

#     print(f'New Message: {message["msg"]}')
#     room = session.get('room')
#     emit('message', {'msg' : f'{session.get("name")}: {message["msg"]}'}, room=room)

# @socketio.on('left', namespace='/chat')
# def left(message):
#     """
#     Sent by clients when they leave the room
#     """

#     room = session.get('room')
#     leave_room(room)
#     emit('status', {'msg': f'{session.get("name")} has left the room'}, room=room)
