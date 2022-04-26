# Alert

A [Socket.IO](https://socket.io) based messaging system to allow for synchronous communication between compliant clients. Built within the Flask web application framework, with the notable dependencies of [Flask Socket IO](https://flask-socketio.readthedocs.io) for SocketIO features and [Green Unicorn (Gunicorn)](https://gunicorn.org) acting as a WSGI server.

## Expected Message Formats
In version 1, the Alert endpoint does not use any namespaces. At this time, the Alert service does not offer a web interface for communication and exists only as a backend service. A sample chat client can be found at either [chat.capstone.com](chat.capstone.com) or [chat.capstone.doublel.studio](chat.capstone.doublel.studio) depending on your deployment method. 

### Events To Emit
For those implementing a new client service, the service handles 3 events you should be aware of: 
* `joined` -> Transmitted when a client successfully joins a room.
* `text` -> Transmitted when a client would like to broadcast a new message to the room.
* `left` -> Transmitted when a client leaves a room.


All 3 events expect a body containing at least 1 key:` name`. Clients should pass a user identifier in string form as the value associated with the `name` key. Event specific keys are provided in the table below.

#### Event Specific Keys [V2]
| __event__ | __key__ | __value__                                           | __broadcasted__ | __example__                      |
|-----------|---------|-----------------------------------------------------|-----------------|----------------------------------|
| `joined`  | `room`  | A string identifier for the session room            | False           | D5DB0B29EDE59F622165402CA116CCFF |
| `text`    | `msg`   | A string message to transmit to all connected users | True            | Class ends in 5 minutes          |


### Events To Expect
Similarly, for this implementing a client, they should expect to format and display two types of events:
* `status` -> Indicates a state change within the room (new user, user left)
* `message` -> Contains a new message which has been broadcasted to the room from a user

Both events will contain a `name` field to allow clients to display the name either inline with the message, or elsewhere in the interface. `status` will contain a `state` key representing the new state (left, joined), while `message` will contain a `msg` key containing the contents of a user's message.

__An example client can be found in the test/socketio_test directory__

