from logging.handlers import DatagramHandler
import socketio
import time
sio = socketio.Client()

potential_endpoints = [
	'http://10.0.1.6:5000/alert/v1/chat',
	'http://10.0.1.6:5000',
	'http://10.0.1.6:5000/alert/v1/',
	'http://10.0.1.6:5000/chat'
]

endpoint = potential_endpoints[1]

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
	print("Disconnected from server")

# @sio.event
# def my_message(data):
# 	print('message received with ', data)
# 	sio.emit('message', {'msg' : 'This is my automated message'})

@sio.on('status')
def status_update(data):
	print(data['msg'])

@sio.on('message')
def new_message(data):
	print(data['msg'])



# for endpoint in potential_endpoints:
# 	try:
# 		print(f'trying {endpoint} with')
# 		sio.connect(endpoint)
# 		sio.wait()
# 	except:		
# 		try:
# 			sio.disconnect()
# 			print(f'plain {endpoint} failed, trying with namespace /chat')
# 			sio.connect(endpoint, namespaces='/chat')
# 			sio.wait()
# 		except:
# 			sio.disconnect()
# 			print(f'{endpoint} with /chat also failed')
	
# 	sio.disconnect()
# 	time.sleep(5)
			
sio.connect('http://10.0.1.6:5000')
sio.wait()
sio.disconnect()





