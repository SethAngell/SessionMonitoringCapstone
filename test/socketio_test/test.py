from logging.handlers import DatagramHandler
import socketio
import time
import signal
import sys

sio = socketio.Client()

ROOM = "TestingRoom"
NAME = "Automated Client"

@sio.event
def connect():
	print('connection established')
	sio.emit('joined', {'name': NAME, 'headless': True, 'room': ROOM})

@sio.event
def connect_error(data):
	print('Failed to connect')
	print(f'output {data}, {len(data) = }, {type(data) = }')

@sio.event
def disconnect():
	sio.emit('left', {'name': NAME})
	print("Disconnected from server")

# @sio.event
# def my_message(data):
# 	print('message received with ', data)
# 	sio.emit('text', {'msg' : 'This is my automated message', 'name': NAME})

@sio.on('status')
def status_update(data):
	print(data['msg'])

@sio.on('message')
def new_message(data):
	print(data['msg'])
	sio.emit('text', {'msg' : 'This is my automated message', 'headless': True, 'name': NAME})

		
sio.connect('http://10.0.1.86:5000')

try:
	sio.wait()
except KeyboardInterrupt:
	sio.disconnect()








