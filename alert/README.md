# Alert

A [Socket.IO](https://socket.io) based messaging system to allow for synchrounous communication between compliant clients. Built within the Flask web application framework, with the notable dependencies of [Flask Socket IO](https://flask-socketio.readthedocs.io) for SocketIO features and [Green Unicorn (Gunicorn)](https://gunicorn.org) acting as a WSGI server.

## Expected Message Formats
In version 1, the Alert endpoint does not use any namespaces. For web users, navigation to the http:<domain>/v1 location will return a login form which requests a username and room code. From there, you're presented with a very simple chat window which handles the rest. 

### Events To Emit
For those implementing a new client service, the service handles 3 events you should be aware of: 
* `joined` -> Transmitted when a client successfully joins a room.
* `text` -> Transmitted when a client would like to broadcast a new message to the room.
* `left` -> Transmitted when a client leaves a room.


All 3 events expect a body containing at least 2 keys, these are `name` and `headless`. Clients should pass a user identifier in string form as the value associated with the `name` key and the value `True` alongside the `headless` key [^headless]. These two keys are expected alongside all events. Event specific keys are provided in the table below.

#### Event Specific Keys [V1]
| __event__ | __key__ | __value__                                           | __broadcasted__ | __example__                      |
|-----------|---------|-----------------------------------------------------|-----------------|----------------------------------|
| `joined`  | `room`  | A string identifier for the session room            | False           | D5DB0B29EDE59F622165402CA116CCFF |
| `text`    | `msg`   | A string message to transmit to all connected users | True            | Class ends in 5 minutes          |


### Events To Expect
Similiary, for this implementing a client, they should expect to format and display two types of events:
* `status` -> Indicates a state change within the room (new user, user left)
* `message` -> Contains a new message which has been broadcasted to the room from a user

In both instances, the only key will be `msg` containing a stylized string which contains the users name and either their message or state change. These are separated into two different events to allow for visual styling within your client.


[^headless] : Headless in this context implies outside of a local browser session. Web users interfacing directly with the http://<domain>/v1 endpoint will have their user info stored in the session object. All other clients are expected to pass this information with each message